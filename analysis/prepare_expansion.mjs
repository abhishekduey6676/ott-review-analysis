import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const source=process.argv[2];
if(!source) throw new Error('Usage: node analysis/prepare_expansion.mjs <expansion JSON>');
const bytes=fs.readFileSync(source),raw=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const apps={'com.netflix.mediaclient':'Netflix','com.amazon.avod.thirdpartyclient':'Prime Video','in.startv.hotstar':'JioHotstar'};
const format=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'});
const dateIST=s=>{const p=format.formatToParts(new Date(s));return ['year','month','day'].map(k=>p.find(v=>v.type===k).value).join('-');};
const valid=s=>typeof s==='string'&&s.trim()&&Number.isFinite(Date.parse(s));
const present=x=>x!==null&&x!==undefined&&String(x).trim()!=='';
const countBy=(rs,fn)=>rs.reduce((o,r)=>{const k=fn(r);o[k]=(o[k]||0)+1;return o;},{});
const seen=new Set(),records=[],excluded=[];
for(const r of raw){
 const reason=r.success!==true?'source_error':!apps[r.app_id]?'unknown_app':!present(r.review_id)?'missing_id':!valid(r.posted_at)?'invalid_date':!Number.isInteger(r.score)||r.score<1||r.score>5?'invalid_score':null;
 if(reason){excluded.push({reason,app_id:r.app_id??null,review_id:r.review_id??null});continue;}
 const key=r.app_id+'|'+r.review_id;
 if(seen.has(key)) throw new Error('Duplicate review ID: resolve snapshots before preparation.');seen.add(key);
 const text=typeof r.text==='string'?r.text:'';
 records.push({app_id:r.app_id,app_name:apps[r.app_id],review_id:r.review_id,score:r.score,text,posted_at:r.posted_at,
 review_date_ist:dateIST(r.posted_at),app_version:r.app_version??null,thumbs_up:r.thumbs_up??null,
 reply_text:r.reply_text??null,reply_posted_at:r.reply_posted_at??null,url:r.url??null,
 word_count:text.trim()?text.trim().split(/\s+/u).length:0,contains_devanagari:/[\u0900-\u097f]/u.test(text),
 source_file:path.basename(source),actual_retrieval_country:null,actual_retrieval_language:null});
}
// Fully elapsed IST days shared by all observed app date ranges. Their overlap
// supports provisional comparisons, not a claim of exhaustive retrieval.
const appStats=Object.entries(apps).map(([id,name])=>{
 const rs=records.filter(r=>r.app_id===id),ds=rs.map(r=>r.posted_at).sort((a,b)=>Date.parse(a)-Date.parse(b));
 const reply=rs.filter(r=>present(r.reply_text));
 const repeats=countBy(rs.filter(r=>r.text.trim()),r=>r.text.trim().toLowerCase());
 return {app_id:id,app_name:name,n:rs.length,earliest_utc:ds[0],latest_utc:ds.at(-1),earliest_date_ist:dateIST(ds[0]),latest_date_ist:dateIST(ds.at(-1)),
 rating_counts:countBy(rs,r=>r.score),blank_text:rs.filter(r=>!r.text.trim()).length,short_text_le_3_words:rs.filter(r=>r.word_count>0&&r.word_count<=3).length,
 missing_versions:rs.filter(r=>!present(r.app_version)).length,reply_present:reply.length,
 reply_before_review:reply.filter(r=>valid(r.reply_posted_at)&&Date.parse(r.reply_posted_at)<Date.parse(r.posted_at)).length,
 devanagari_text:rs.filter(r=>r.contains_devanagari).length,
 repeated_exact_text_extra_rows:Object.values(repeats).reduce((n,c)=>n+Math.max(0,c-1),0),per_ist_date:countBy(rs,r=>r.review_date_ist)};
});
const latestStart=appStats.map(s=>s.earliest_date_ist).sort().at(-1);
// Exclude the first observed day to avoid its truncated retrieval boundary.
const next=new Date(latestStart+'T00:00:00Z');next.setUTCDate(next.getUTCDate()+1);
const commonStart=next.toISOString().slice(0,10),commonEnd='2026-10-31';
if(commonStart>commonEnd) throw new Error('No common historical window through October 31.');
const common=records.filter(r=>r.review_date_ist>=commonStart&&r.review_date_ist<=commonEnd);
const sample=[];
for(const id of Object.keys(apps))for(let s=1;s<=5;s++){
 sample.push(...common.filter(r=>r.app_id===id&&r.score===s&&r.text.trim()).sort((a,b)=>digest(a.review_id).localeCompare(digest(b.review_id))).slice(0,20)
 .map(r=>({...r,manual_text_quality:null,manual_language:null,manual_themes:[],evidence_note:null})));
}
const overview={source_file:path.basename(source),source_sha256:digest(bytes),prepared_at_utc:new Date().toISOString(),raw_rows:raw.length,prepared_rows:records.length,excluded,
 common_window_ist:{start:commonStart,end_inclusive:commonEnd,selection:'After latest first observed date through historical cutoff; excludes partial boundary day; provisional pending run metadata.'},
 common_rows:common.length,apps:appStats.map(s=>({...s,common_rows:common.filter(r=>r.app_id===s.app_id).length,
 common_rating_counts:countBy(common.filter(r=>r.app_id===s.app_id),r=>r.score)})),
 coding_sample_rows:sample.length,coding_sample_method:'Up to 20 nonblank common-window reviews per app and star rating, deterministic SHA-256 ID selection. For coding validation, not theme prevalence.',
 note:'No automated language or thematic labels assigned. Locale and run metadata remain unverified. This preparation does not merge the 450-row pilot.'};
for(const d of ['data/processed','reports'])fs.mkdirSync(path.join(root,d),{recursive:true});
const save=(f,v)=>fs.writeFileSync(path.join(root,f),JSON.stringify(v,null,2)+'\n');
save('data/processed/expansion_reviews.json',records);
save('data/processed/common_window_reviews.json',common);
save('data/processed/expansion_coding_sample.json',sample);
save('reports/expansion_quality.json',overview);
const lines=['# Expanded export: quality and analysis readiness','',`Source: \`${path.basename(source)}\``, '',`SHA-256: \`${overview.source_sha256}\``, '',
 `Raw rows: **${raw.length}**. Prepared records: **${records.length}**. Core-field exclusions: **${excluded.length}**. Reviewer names/photos omitted from analytical outputs. The separate coverage audit checks duplicate IDs and source errors.`, '',
 '| App | Reviews | Observed dates (IST) | Missing versions | Blank text | Text <=3 words | Replies | Replies dated before review |',
 '| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |',
 ...appStats.map(s=>`| ${s.app_name} | ${s.n} | ${s.earliest_date_ist} to ${s.latest_date_ist} | ${s.missing_versions} | ${s.blank_text} | ${s.short_text_le_3_words} | ${s.reply_present} | ${s.reply_before_review} |`),'',
 '## Shared analysis window', '',`The provisional shared complete-day window is **${commonStart} through ${commonEnd}, Asia/Kolkata**. It contains **${common.length}** records. The first observed Netflix day is excluded because collection starts partway through it. November rows are preserved outside this historical slice.`, '',
 '| App | Shared-window reviews | Ratings 1 / 2 / 3 / 4 / 5 |','| --- | ---: | --- |',
 ...overview.apps.map(s=>`| ${s.app_name} | ${s.common_rows} | ${[1,2,3,4,5].map(n=>s.common_rating_counts[n]??0).join(' / ')} |`),'',
 'The shared window is a prepared sensitivity/initial-analysis dataset, not a silent replacement for the six-month goal. It does not establish representative or exhaustive review coverage. Do not compare full-export raw rating/theme shares as if the apps covered the same period.', '',
 '## Before thematic conclusions','',
 `- Read and annotate the ${sample.length}-row common-window coding sample, then freeze a codebook. The sample is disproportionately stratified by rating and must not estimate theme prevalence.`,
 '- Validate any classifier on a separate held-out manually read sample. Include generic feedback, non-English/uncertain text, mixed sentiment and programme reactions.',
 '- Date ranges alone cannot establish persistence across several months. The May-October goal remains unmet; no app reaches May.',
 '- Confirm actual run input, time limits, charge, pagination and completion in Apify. The JSON does not establish reviewer residence.',
 '- Do not automatically delete short/repeated text: brief price complaints and generic praise can both be meaningful for different measures.',
 '- Preserve version/reply missingness. Earlier reply dates may reflect edits or source behaviour; do not interpret them as negative response times.',
 '- Retain the pilot separately. Merging it into this snapshot requires checking overlapping IDs and edited records first.', '',
 '## Reproduce','', '`node analysis/prepare_expansion.mjs <expansion JSON>`',''];
fs.writeFileSync(path.join(root,'reports/expansion_quality.md'),lines.join('\n'));
console.log(JSON.stringify({rows:records.length,common_window:overview.common_window_ist,common_rows:common.length,coding_sample:sample.length,apps:overview.apps.map(({per_ist_date,...s})=>s)},null,2));
