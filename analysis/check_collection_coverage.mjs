import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const args=process.argv.slice(2);
const labelArg=args.find(x=>x.startsWith('--label='));
const label=labelArg?labelArg.slice(8):'expansion';
if(!/^[a-z0-9-]+$/i.test(label)) throw new Error('Report label must contain only letters, numbers or hyphens.');
const files=args.filter(x=>!x.startsWith('--label='));
if(!files.length) throw new Error('Usage: node analysis/check_collection_coverage.mjs [--label=expansion] <export JSON> [more exports]');
const apps={'com.netflix.mediaclient':'Netflix','com.amazon.avod.thirdpartyclient':'Prime Video','in.startv.hotstar':'JioHotstar'};
const start=Date.parse('2026-05-01T00:00:00+05:30');
const end=Date.parse('2026-11-01T00:00:00+05:30');
const valid=s=>typeof s==='string' && s.trim() && Number.isFinite(Date.parse(s));
const nonempty=x=>x!==null && x!==undefined && String(x).trim()!=='';
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const month=s=>{
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit'}).formatToParts(new Date(s));
 return ['year','month'].map(k=>parts.find(p=>p.type===k).value).join('-');
};
const counts=(rs,fn)=>rs.reduce((o,r)=>{const k=fn(r);o[k]=(o[k]||0)+1;return o;},{});
const seen=new Map(), sources=[], errors=[], malformed=[], conflicts=[];
let duplicateIdRows=0,totalRows=0;
for(const file of files){
 const bytes=fs.readFileSync(file), rows=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));
 if(!Array.isArray(rows)) throw new Error(`${file}: expected a JSON array.`);
 const source={file:path.basename(file),sha256:digest(bytes),rows:rows.length};sources.push(source);totalRows+=rows.length;
 for(const r of rows){
  if(!r||typeof r!=='object'||Array.isArray(r)){malformed.push({file:source.file,reason:'non-object row'});continue;}
  if(r.success!==true){errors.push({app_id:r.app_id??null,code:r.code??'UNSPECIFIED',file:source.file});continue;}
  if(!nonempty(r.app_id)||!nonempty(r.review_id)){malformed.push({file:source.file,reason:'missing app/review ID'});continue;}
  const key=`${r.app_id}|${r.review_id}`,old=seen.get(key);
  if(old){
   duplicateIdRows++;
   if(old.row.text!==r.text||old.row.score!==r.score||old.row.posted_at!==r.posted_at){
    conflicts.push({app_id:r.app_id,review_id:r.review_id,files:[old.file,source.file]});
   }
   // For coverage only, retain the later source review timestamp when available.
   // Conflicts are surfaced; substantive merging requires a snapshot policy.
   if(valid(r.posted_at)&&(!valid(old.row.posted_at)||Date.parse(r.posted_at)>Date.parse(old.row.posted_at))) seen.set(key,{row:r,file:source.file});
  }else seen.set(key,{row:r,file:source.file});
 }
}
const rows=[...seen.values()].map(x=>x.row);
const summary=Object.entries(apps).map(([id,name])=>{
 const rs=rows.filter(r=>r.app_id===id),ds=rs.filter(r=>valid(r.posted_at)).sort((a,b)=>Date.parse(a.posted_at)-Date.parse(b.posted_at));
 const inWindow=ds.filter(r=>Date.parse(r.posted_at)>=start&&Date.parse(r.posted_at)<end);
 const monthly=Object.fromEntries(['2026-05','2026-06','2026-07','2026-08','2026-09','2026-10'].map(m=>[m,0]));
 for(const r of inWindow) monthly[month(r.posted_at)]++;
 return {app_id:id,app_name:name,unique_reviews:rs.length,earliest_utc:ds[0]?.posted_at??null,latest_utc:ds.at(-1)?.posted_at??null,
  target_window_reviews:inWindow.length,target_month_counts:monthly,
  start_boundary_reached:ds.length?Date.parse(ds[0].posted_at)<=start:false,
  missing_target_months:Object.entries(monthly).filter(([,n])=>n===0).map(([m])=>m),
  invalid_dates:rs.filter(r=>!valid(r.posted_at)).length,
  invalid_scores:rs.filter(r=>!Number.isInteger(r.score)||r.score<1||r.score>5).length,
  blank_text:rs.filter(r=>typeof r.text!=='string'||!r.text.trim()).length,
  missing_versions:rs.filter(r=>!nonempty(r.app_version)).length,
  target_ratings:counts(inWindow,r=>r.score),
  errors:errors.filter(r=>r.app_id===id).length};
});
const report={report_label:label,audited_at_utc:new Date().toISOString(),target_window_ist:{start:'2026-05-01',end_inclusive:'2026-10-31'},
 sources,total_rows:totalRows,unique_successful_review_ids:rows.length,duplicate_id_rows:duplicateIdRows,
 conflicting_duplicate_snapshots:conflicts.length,conflicts,error_rows:errors.length,error_codes:counts(errors,r=>r.code),
 malformed_rows:malformed,unexpected_apps:[...new Set(rows.map(r=>r.app_id))].filter(id=>!Object.hasOwn(apps,id)),apps:summary,
 caveats:['Boundary reach and nonempty months do not establish exhaustive pagination or representative coverage.',
 'Country/language settings and run status are not verified by this file. Keep each run input and metadata.',
 'Conflicting duplicate snapshots require an explicit substantive merge policy; this report uses latest review timestamp for coverage only.',
 'Do not combine different language samples for primary rates without assessing overlap and weighting.']};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
const prefix=path.join(root,'reports',`${label}_coverage`);
fs.writeFileSync(prefix+'.json',JSON.stringify(report,null,2)+'\n');
const lines=['# Collection coverage', '',`Target: 1 May-31 October 2026, Asia/Kolkata. Report label: ${label}.`, '',
 `Input rows: ${totalRows}; unique successful IDs: ${rows.length}; duplicate-ID rows: ${duplicateIdRows}; error rows: ${errors.length}; conflicting snapshots: ${conflicts.length}.`, '',
 '| App | Unique IDs | Target-window rows | Earliest timestamp (UTC) | Start boundary reached? | Missing target months |',
 '| --- | ---: | ---: | --- | --- | --- |',
 ...summary.map(s=>`| ${s.app_name} | ${s.unique_reviews} | ${s.target_window_reviews} | ${s.earliest_utc??'unavailable'} | ${s.start_boundary_reached?'Yes; not proof of completeness':'No'} | ${s.missing_target_months.join(', ')||'None'} |`), '',
 '## Interpretation', '',...report.caveats.map(s=>`- ${s}`),'',
 '## Next action', '', summary.every(s=>s.start_boundary_reached)?'Inspect run completion, pagination, monthly counts, language and rating composition before accepting historical coverage.':'Some apps have not reached the target start. Check caps/errors and budget before targeted deeper retrieval; otherwise revise to a shared supported window.',''];
fs.writeFileSync(prefix+'.md',lines.join('\n'));
console.log(JSON.stringify({report:prefix+'.md',total_rows:totalRows,duplicates:duplicateIdRows,errors:errors.length,apps:summary.map(s=>({app:s.app_name,unique:s.unique_reviews,in_target:s.target_window_reviews,start_reached:s.start_boundary_reached}))},null,2));
