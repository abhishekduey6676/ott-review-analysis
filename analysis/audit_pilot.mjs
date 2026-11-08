import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const source = process.argv[2];
if (!source) throw new Error('Usage: node analysis/audit_pilot.mjs <source JSON>');
const bytes = fs.readFileSync(source);
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const sourceHash = hash(bytes);
const rows = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
if (!Array.isArray(rows) || !rows.every(r => r && typeof r === 'object' && !Array.isArray(r))) {
  throw new Error('Expected an array of review/error objects.');
}
for (const dir of ['data/raw', 'data/processed', 'reports']) fs.mkdirSync(path.join(root, dir), { recursive: true });
const raw = path.join(root, 'data/raw', path.basename(source));
if (fs.existsSync(raw) && hash(fs.readFileSync(raw)) !== sourceHash) throw new Error('Existing raw file has different contents.');
if (!fs.existsSync(raw)) fs.writeFileSync(raw, bytes);
const date = d => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  return ['year', 'month', 'day'].map(k => parts.find(p => p.type === k).value).join('-');
};
const validDate = s => typeof s === 'string' && s.trim() && Number.isFinite(Date.parse(s));
const present = x => x !== undefined && x !== null && String(x).trim() !== '';
const countBy = (items, fn) => items.reduce((a, r) => { const k = fn(r); a[k] = (a[k] || 0) + 1; return a; }, {});
const seen = new Set();
const duplicateRows = [];
const prepared = [];
const errors = rows.filter(r => r.success !== true);
for (const r of rows.filter(r => r.success === true)) {
  const key = present(r.app_id) && present(r.review_id) ? `${r.app_id}|${r.review_id}` : null;
  if (key && seen.has(key)) { duplicateRows.push({ app_id: r.app_id, review_id: r.review_id }); continue; }
  if (key) seen.add(key);
  const text = typeof r.text === 'string' ? r.text : '';
  const d = validDate(r.posted_at) ? new Date(r.posted_at) : null;
  const replyDate = validDate(r.reply_posted_at) ? new Date(r.reply_posted_at) : null;
  prepared.push({
    app_id: r.app_id ?? null, review_id: r.review_id ?? null, score: r.score ?? null,
    text, posted_at: r.posted_at ?? null, review_date_ist: d ? date(d) : null,
    app_version: r.app_version ?? null, thumbs_up: r.thumbs_up ?? null,
    reply_text: r.reply_text ?? null, reply_posted_at: r.reply_posted_at ?? null,
    url: r.url ?? null, text_length: text.trim().length,
    word_count: text.trim() ? text.trim().split(/\s+/u).length : 0,
    contains_devanagari: /[\u0900-\u097f]/u.test(text),
    reply_before_review: Boolean(d && replyDate && replyDate < d),
    source_file: path.basename(raw)
  });
}
const names = { 'com.netflix.mediaclient': 'Netflix', 'com.amazon.avod.thirdpartyclient': 'Prime Video', 'in.startv.hotstar': 'JioHotstar' };
const stats = Object.entries(names).map(([id, name]) => {
  const group = prepared.filter(r => r.app_id === id);
  const dates = group.map(r => r.posted_at).filter(validDate).sort((a,b) => Date.parse(a)-Date.parse(b));
  const exactTextCounts = countBy(group.filter(r => r.text.trim()), r => r.text.trim().toLowerCase());
  return {
    app_id: id, app_name: name, returned_rows: rows.filter(r => r.app_id === id).length,
    successful_rows: rows.filter(r => r.app_id === id && r.success === true).length,
    unique_reviews: group.length, duplicate_id_rows: duplicateRows.filter(r => r.app_id === id).length,
    errors: errors.filter(r => r.app_id === id).length,
    earliest_utc: dates[0] ?? null, latest_utc: dates.at(-1) ?? null,
    earliest_ist_date: dates.length ? date(new Date(dates[0])) : null,
    latest_ist_date: dates.length ? date(new Date(dates.at(-1))) : null,
    ratings: countBy(group, r => String(r.score)),
    invalid_scores: group.filter(r => !Number.isInteger(r.score) || r.score < 1 || r.score > 5).length,
    missing_ids: group.filter(r => !present(r.review_id)).length,
    missing_or_invalid_dates: group.filter(r => !validDate(r.posted_at)).length,
    blank_text: group.filter(r => !r.text.trim()).length,
    short_text_le_3_words: group.filter(r => r.word_count > 0 && r.word_count <= 3).length,
    missing_versions: group.filter(r => !present(r.app_version)).length,
    reply_present: group.filter(r => present(r.reply_text)).length,
    reply_before_review: group.filter(r => r.reply_before_review).length,
    devanagari_text: group.filter(r => r.contains_devanagari).length,
    repeated_exact_text_extra_rows: Object.values(exactTextCounts).reduce((n, c) => n + Math.max(0, c-1), 0),
    per_ist_date: countBy(group, r => r.review_date_ist ?? 'INVALID'),
    in_proposed_may_oct_window: group.filter(r => r.review_date_ist && r.review_date_ist >= '2026-05-01' && r.review_date_ist <= '2026-10-31').length
  };
});
const manualSample = [];
for (const id of Object.keys(names)) for (let score = 1; score <= 5; score++) {
  manualSample.push(...prepared.filter(r => r.app_id === id && r.score === score && r.text.trim())
    .sort((a,b) => hash(a.review_id ?? a.text).localeCompare(hash(b.review_id ?? b.text)))
    .slice(0,4).map(r => ({...r, app_name: names[id], manual_text_quality: null, manual_language: null, manual_themes: [], evidence_note: null })));
}
const report = {
  source_file: path.basename(raw), source_sha256: sourceHash,
  audited_at_utc: new Date().toISOString(), export_filename_is_not_verified_collection_time: true,
  run_id: null, collection_input_verified: false, notes: [
    'Input settings, run ID, cost and completeness are not included in this export and have not been verified.',
    'Date ranges describe observed rows only; they do not establish exhaustive retrieval.',
    'Short text is a screening measure, not a substantive-content classification.',
    'Devanagari detection is a script flag, not language identification; Hinglish may use Latin script.',
    'Repeated text from distinct review IDs is retained; repetition alone does not establish fraud.'
  ], total_rows: rows.length, error_rows: errors.length,
  duplicate_id_rows: duplicateRows.length, unique_successful_reviews: prepared.length,
  unexpected_app_ids: [...new Set(rows.map(r => r.app_id))].filter(id => !Object.hasOwn(names,id)),
  error_codes: countBy(errors, r => r.code ?? 'UNSPECIFIED'), apps: stats,
  manual_sample_method: 'Within each app and rating, sort by SHA-256(review_id) and take up to four nonblank reviews. Disproportionate coding sample, not an estimate of theme frequency.',
  manual_sample_rows: manualSample.length
};
const save = (file, obj) => fs.writeFileSync(path.join(root,file), JSON.stringify(obj,null,2)+'\n');
save('data/processed/pilot_reviews.json', prepared);
save('data/processed/pilot_manual_sample.json', manualSample);
save('reports/pilot_quality.json', report);
const lines = ['# Pilot data-quality report', '', `Source: \`${report.source_file}\``, '', `SHA-256: \`${sourceHash}\``, '',
  `Rows: **${rows.length}**. Successful unique reviews: **${prepared.length}**. Error rows: **${errors.length}**. Duplicate review-ID rows: **${duplicateRows.length}**.`, '',
  '| App | Reviews | Observed dates (Asia/Kolkata) | Ratings 1 / 2 / 3 / 4 / 5 | Blank text | Text <=3 words | Missing version | Replies |',
  '| --- | ---: | --- | --- | ---: | ---: | ---: | ---: |'];
for (const s of stats) lines.push(`| ${s.app_name} | ${s.unique_reviews} | ${s.earliest_ist_date} to ${s.latest_ist_date} | ${[1,2,3,4,5].map(v=>s.ratings[v]??0).join(' / ')} | ${s.blank_text} | ${s.short_text_le_3_words} | ${s.missing_versions} | ${s.reply_present} |`);
lines.push('', '## Interpretation and next step', '',
  '- These are separate recent-review slices. Compare observed date ranges before making cross-app or time-trend claims.',
  `- Only ${stats.reduce((n,s)=>n+s.in_proposed_may_oct_window,0)} records fall within the provisional 1 May-31 October 2026 study window. The pilot is not a six-month sample.`,
  '- Confirm actual collection settings and run metadata in Apify. Do not infer reviewer residence from the filename or storefront settings.',
  '- Read the reproducible coding sample before freezing themes. Generic positive/negative feedback and explicitly described task problems need different treatment.',
  '- Version and reply missingness limit release/response analysis. Reply presence is not resolution.',
  '- No population-level failure, churn, or customer-satisfaction rates can be inferred from these self-selected reviews.', '',
  '## Audit notes', '', ...report.notes.map(n=>`- ${n}`), '',
  '## Reproduce', '', 'Run `node analysis/audit_pilot.mjs <source JSON path>`. Only the initial raw copy preserves reviewer metadata; analytical outputs omit names and photos.', '',
  `Manual reading sample: ${manualSample.length} rows, selected as follows: ${report.manual_sample_method}`, '');
fs.writeFileSync(path.join(root,'reports/pilot_quality.md'),lines.join('\n'));
console.log(JSON.stringify(report,null,2));
