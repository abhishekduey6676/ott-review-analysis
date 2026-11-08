"""Reproducible descriptive analysis. Run with project-local matplotlib on PYTHONPATH.
Text flags are auditable lexical screens, not validated population prevalence.
"""
import json, re, sqlite3, hashlib
from pathlib import Path
from collections import Counter
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'reports'/'analysis'; OUT.mkdir(parents=True,exist_ok=True)
CHARTS=OUT/'charts'; CHARTS.mkdir(exist_ok=True)
APPS=['Netflix','Prime Video','JioHotstar']
COLORS=['#4c78a8','#f28e2b','#59a14f']
RULES={
 'ads':r'\b(?:ads?|adverts?|advertis\w*|commercials?)\b|\b(?:many|much|over)\s+adds\b|\badd\s+(?:bahut|bohot|jyada)',
 'extra_content_charges':r'\b(?:rent(?:al|als|ing|ed)?|paywall\w*|pay\s+extra|extra\s+(?:pay\w*|charg\w*|money)|additional\s+(?:subscr\w*|charg\w*)|paid content|buy(?:ing)?\s+(?:movies?|films?|stuff)|cost you money)\b',
 'affordability':r'\b(?:expensive|costly|unaffordable|overpriced|price\s+(?:increase|hike|keeps)|pricing plans|save money|reduce.{0,15}(?:price|cost)|high\s+(?:price|cost)|more.{0,15}than.{0,10}worth)\b',
 'technical_friction':r'\b(?:crash\w*|glitch\w*|buffer\w*|lag(?:ging|gy|s)?|stutter\w*|freez\w*|bug(?:s)?|re-?install\w*|black screen|not (?:work\w*|play\w*|load\w*|open\w*)|(?:can.?t|cannot|won.?t|doesn.?t|don.?t|unable to)\s+(?:even\s+)?(?:play|watch|open|load)|keeps\s+(?:load\w*|stop\w*)|video stops|only audio|poor quality|brightness problem|endless loading|breaks the stream)\b',
 'account_access':r'\b(?:log\s?in|sign\s?in|otp|password|household|account sharing|sharing policy|same wifi|own email|one email|profile.{0,30}email)\b',
 'catalogue_gaps':r'\b(?:missing|not available|unavailable|removed|remove shows|no variety|catalog(?:ue)?.{0,20}limited|more (?:regional|movies|shows)|wider selection|(?:don.?t|doesn.?t) have.{0,30}(?:movies?|shows?|series|seasons?|episodes?|titles?)|set a reminder|stream.{0,30}back|all movies in|give us the show|other streaming channels|content gets less)\b',
 'language_subtitles':r'\b(?:subtitles?|dubb\w*|mother tongue|language|(?:in|more|need|want).{0,20}(?:tamil|telugu|hindi|malayalam|kannada|bengali))\b',
 'programme_reaction':r'\bbigg?\s*boss\b|\b(?:evict\w*|eliminat\w*|woke|veerappan|insaf)\b|\b(?:show|story|series|programme|season)\b.{0,60}\b(?:scripted|bias\w*|unfair|agenda)\b|\b(?:scripted|bias\w*|unfair)\b.{0,60}\b(?:show|story|series|programme|season)\b',
 'discovery_controls':r'\b(?:search|recommend\w*|fast forward|rewind|double tap|fit.{0,5}screen|zoom|resume|last played|continue watching|landscape|can.?t read|upcoming|cast(?:ing)?|roku|chromecast|not interested|re-?download|download(?:ing|s)?|white light|too much sound)\b',
 'support_billing':r'\b(?:customer (?:care|service|support)|refund\w*|payment error|debited|charged twice|responses|replies|support team|cancel\w*|recharge)\b',
 'live_context':r'\b(?:live|cricket|sports?|nba|cycling|football|match(?:es)?)\b'
}
PAT={k:re.compile(v,re.I) for k,v in RULES.items()}
json.dump({'version':'lexical-v2','meaning':'Topic/candidate-friction mentions, not automatically negative or substantive; English-heavy with a few Romanised Hindi expressions.',
 'rules':RULES,'development':'Pilot reading and 100 hash-sampled development reviews; no statistical model fitted. V2 narrows catalogue phrases and requires show context for ambiguous programme words after the audit and evidence check.',
 'denominator':'All nonblank text reviews in the specified app/window. Different from earlier proposed substantive-only denominator, which cannot yet be reliably assigned.'},open(OUT/'codebook.json','w',encoding='utf8'),ensure_ascii=False,indent=2)
d=pd.DataFrame(json.load(open(ROOT/'data/processed/expansion_reviews.json',encoding='utf8')))
d['text']=d.text.fillna(''); d['nonblank']=d.text.str.strip().ne('')
d['detail_5plus']=d.word_count.ge(5)
d['non_latin_script']=d.text.map(lambda s: bool(re.search(r'[\u0900-\u0dff\u0400-\u04ff\u4e00-\u9fff\u0600-\u06ff]',s)))
for key,p in PAT.items(): d[key]=d.text.map(lambda t:bool(p.search(t)))
d['any_flag']=d[list(RULES)].any(axis=1)
d['paid_context']=d.text.str.contains(r'\b(?:paid|paying|subscribed|subscription|premium|member(?:ship)?)\b',case=False,regex=True)
d['seeking_context']=d.text.str.contains(r'fast.?forward|rewind|double tap|seek|resume|continue watching|last played',case=False,regex=True)
d['explicit_blockage']=d.text.str.contains(r'\b(?:can.?t|cannot|unable to|won.?t|doesn.?t|don.?t)\s+(?:even\s+)?(?:watch|play|open|login|log in|load)|keeps loading|only audio|black screen|endless loading',case=False,regex=True)
d['negated_technical']=d.text.str.contains(r'\bno\s+(?:lag|buffer\w*|glitch\w*|crash\w*|problems?)\b|never had any problems',case=False,regex=True)
d['month']=d.review_date_ist.str[:7]
shared=d[d.review_date_ist.between('2026-10-03','2026-10-31')].copy()
shared['period']=shared.review_date_ist.map(lambda x: ['Oct 03-09','Oct 10-16','Oct 17-23','Oct 24-30'][min((int(x[-2:])-3)//7,3)] if int(x[-2:])<=30 else 'Oct 31 (partial week)')
shared['low_rating']=shared.score.le(2)

def aggregate(frame,keys):
 out=[]
 for group,g in frame.groupby(keys,sort=False):
  if not isinstance(group,tuple):group=(group,)
  den=int(g.nonblank.sum())
  for theme in RULES:
   hit=g[g[theme]&g.nonblank]; other=g[~g[theme]&g.nonblank]
   out.append(dict(zip(keys,group),theme=theme,n=int(len(hit)),denominator=den,share_pct=100*len(hit)/den if den else None,
    low_rating_n=int(hit.score.le(2).sum()),low_rating_pct=100*hit.score.le(2).mean() if len(hit) else None,
    other_low_rating_pct=100*other.score.le(2).mean() if len(other) else None,
    high_rating_n=int(hit.score.ge(4).sum()),blockage_n=int(hit.explicit_blockage.sum()),paid_context_n=int(hit.paid_context.sum())))
 return pd.DataFrame(out)
themes=aggregate(shared,['app_name'])
weekly=aggregate(shared[shared.period!='Oct 31 (partial week)'],['app_name','period'])
monthly=aggregate(d,['app_name','month'])
daily=shared.groupby(['app_name','review_date_ist']).agg(n=('review_id','size'),mean_rating=('score','mean'),low_rating_n=('low_rating','sum')).reset_index()
quality=[]
for app,g in shared.groupby('app_name'):
 quality.append({'app_name':app,'n':len(g),'nonblank':int(g.nonblank.sum()),'median_words':float(g.word_count.median()),
 'short_le3':int(g.word_count.between(1,3).sum()),'missing_versions':int(g.app_version.isna().sum()),'non_latin_script':int(g.non_latin_script.sum()),
 'unflagged':int((~g.any_flag).sum()),'mean_rating':float(g.score.mean()),'low_rating_pct':float(g.score.le(2).mean()*100),'high_rating_pct':float(g.score.ge(4).mean()*100),
 'replies':int(g.reply_text.notna().sum())})
quality=pd.DataFrame(quality)
sens=[]
for name,subset in [('all_nonblank',shared[shared.nonblank]),('five_plus_words',shared[shared.detail_5plus]),
 ('without_programme_mentions',shared[~shared.programme_reaction&shared.nonblank]),
 ('collapsed_identical_text',shared[shared.nonblank].assign(normalized_text=lambda f:f.text.str.strip().str.lower()).drop_duplicates(['app_id','normalized_text'])),
 ('without_detected_nonlatin_script',shared[shared.nonblank&~shared.non_latin_script])]:
 a=aggregate(subset,['app_name']);a['scenario']=name;sens.append(a)
sens=pd.concat(sens,ignore_index=True)
contexts=[]
for app,g in shared.groupby('app_name'):
 for name,mask in [('ads_and_paid',g.ads&g.paid_context),('ads_and_seeking',g.ads&g.seeking_context),('ads_and_technical',g.ads&g.technical_friction),('technical_and_blocked',g.technical_friction&g.explicit_blockage),('programme_and_low_rating',g.programme_reaction&g.low_rating)]:
  h=g[mask];contexts.append({'app_name':app,'context':name,'n':len(h),'denominator':int(g.nonblank.sum()),'share_pct':100*len(h)/g.nonblank.sum()})
contexts=pd.DataFrame(contexts)
# Descriptive standardisation: compare each app under the pooled star mix.
# This controls only the arithmetic mix, not differences in who reviews or why.
pooled=shared[shared.nonblank].score.value_counts(normalize=True).sort_index()
standardized=[]
for app,g in shared[shared.nonblank].groupby('app_name'):
 for t in RULES:
  rates=g.groupby('score')[t].mean().reindex(pooled.index)
  standardized.append({'app_name':app,'theme':t,'observed_n':int(g[t].sum()),'denominator':len(g),
   'observed_pct':100*g[t].mean(),'standardized_pct':100*(rates*pooled).sum() if rates.notna().all() else None})
standardized=pd.DataFrame(standardized)
# 20 review cases disjoint from the 100-case development reading. Findings from
# this audit informed v2; final metrics are diagnostic, not independent validation.
# All were from the same original 300-row stratified coding sample.
sample=json.load(open(ROOT/'data/processed/expansion_coding_sample.json',encoding='utf8'))
gold={1:['technical_friction','discovery_controls','affordability'],11:['account_access','technical_friction'],31:['affordability'],41:[],61:['catalogue_gaps'],71:['discovery_controls'],91:[],101:['technical_friction'],121:['ads','extra_content_charges'],131:[],151:['ads'],161:None,181:[],191:[],211:['discovery_controls'],221:['technical_friction','ads','discovery_controls'],241:[],251:[],271:[],281:[]}
audit=[]
for i,labels in gold.items():
 r=sample[i];pred=[k for k,p in PAT.items() if p.search(r['text'])]
 audit.append({'sample_index':i,'review_id':r['review_id'],'app_name':r['app_name'],'score':r['score'],'text':r['text'],'manual_labels':labels,'predicted_labels':pred,'status':'untranslated Tamil; excluded from accuracy' if labels is None else 'single-coder diagnostic reading; used in rule revision'})
metrics=[]
for t in RULES:
 rows=[r for r in audit if r['manual_labels'] is not None]
 tp=sum(t in r['manual_labels'] and t in r['predicted_labels'] for r in rows)
 fp=sum(t not in r['manual_labels'] and t in r['predicted_labels'] for r in rows)
 fn=sum(t in r['manual_labels'] and t not in r['predicted_labels'] for r in rows)
 metrics.append({'theme':t,'evaluated_reviews':len(rows),'manual_positive':tp+fn,'true_positive':tp,'false_positive':fp,'false_negative':fn,'precision':tp/(tp+fp) if tp+fp else None,'recall':tp/(tp+fn) if tp+fn else None})
metrics=pd.DataFrame(metrics)
json.dump(audit,open(OUT/'classification_audit.json','w',encoding='utf8'),ensure_ascii=False,indent=2)
# Reproducible evidence selection: hash-ordered, not helpful-vote-ranked.
evidence=[]
for app,g in shared.groupby('app_name'):
 for t in RULES:
  h=g[g[t]&g.word_count.ge(6)].copy();h['key']=h.review_id.map(lambda s:hashlib.sha256(s.encode()).hexdigest())
  for _,r in h.sort_values('key').head(6).iterrows():
   evidence.append({k:r[k] for k in ['app_name','review_id','score','review_date_ist','text','url']}|{'theme':t})
json.dump(evidence,open(OUT/'evidence_candidates.json','w',encoding='utf8'),ensure_ascii=False,indent=2)
tables={'theme_summary':themes,'weekly_themes':weekly,'within_app_monthly_themes':monthly,'daily_coverage':daily,'shared_quality':quality,'sensitivity':sens,'context_cooccurrence':contexts,'classification_metrics':metrics,'rating_standardization':standardized}
for name,f in tables.items():f.to_json(OUT/(name+'.json'),orient='records',indent=2,force_ascii=False)
db=sqlite3.connect(OUT/'ott_analysis.sqlite')
cols=['app_id','app_name','review_id','score','text','posted_at','review_date_ist','month','word_count','app_version','url','nonblank','detail_5plus','any_flag','non_latin_script','paid_context','seeking_context','explicit_blockage','negated_technical']+list(RULES)
d[cols].to_sql('reviews',db,if_exists='replace',index=False)
for name,f in tables.items():f.to_sql(name,db,if_exists='replace',index=False)
db.close()
# Charts: common calendar window and consistent denominators.
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,'axes.spines.right':False,'figure.facecolor':'white','savefig.facecolor':'white'})
def save(name):plt.savefig(CHARTS/(name+'.png'),dpi=170,bbox_inches='tight');plt.close()
fig,ax=plt.subplots(figsize=(10,4));bottom=np.zeros(3)
for score,c in zip(range(1,6),['#c44e52','#dd8452','#ccb974','#64b5cd','#55a868']):
 v=[100*shared[shared.app_name==a].score.eq(score).mean() for a in APPS];ax.barh(APPS,v,left=bottom,color=c,label=f'{score} star' if score==1 else f'{score} stars');bottom+=v
ax.set(xlabel='Share of observed reviews (%)',title='Ratings describe the review sample, not all subscribers');ax.legend(ncol=5,loc='upper center',bbox_to_anchor=(.5,-.18));save('01_ratings')
matrix=themes.pivot(index='theme',columns='app_name',values='share_pct').reindex(columns=APPS)
fig,ax=plt.subplots(figsize=(9,6));im=ax.imshow(matrix.values,cmap='Blues',vmin=0,vmax=max(matrix.max()),aspect='auto');ax.set_xticks(range(3),APPS);ax.set_yticks(range(len(matrix)),['additional payment' if x=='extra_content_charges' else x.replace('_',' ') for x in matrix.index]);
for i in range(len(matrix)):
 for j in range(3):ax.text(j,i,f'{matrix.iloc[i,j]:.1f}%',ha='center',va='center',color='white' if matrix.iloc[i,j]>matrix.max().max()*.55 else '#222')
ax.set_title('Lexical topic screens: share of nonblank reviews\n3-31 October 2026; multiple flags allowed');fig.colorbar(im,ax=ax,label='% of nonblank reviews');save('02_topics')
fig,axs=plt.subplots(1,3,figsize=(13,3.7),sharey=True)
periods=['Oct 03-09','Oct 10-16','Oct 17-23','Oct 24-30']
for ax,app in zip(axs,APPS):
 for t,c in zip(['ads','technical_friction','programme_reaction'],COLORS):
  h=weekly[(weekly.app_name==app)&(weekly.theme==t)].set_index('period').reindex(periods);ax.plot(range(4),h.share_pct,marker='o',label=t.replace('_',' '),color=c)
 ax.set_title(app);ax.set_xticks(range(4),['3-9','10-16','17-23','24-30']);ax.set_xlabel('October, complete 7-day bins');ax.grid(alpha=.15)
axs[0].set_ylabel('% of nonblank reviews');axs[-1].legend(fontsize=8);fig.suptitle('Persistence within October; not a release-effect estimate',y=1.05);save('03_weekly_patterns')
fig,ax=plt.subplots(figsize=(10,4));w=.25;x=np.arange(3)
for k,(t,c) in enumerate(zip(['ads','technical_friction','programme_reaction'],COLORS)):
 h=themes[themes.theme==t].set_index('app_name').reindex(APPS);ax.bar(x+(k-1)*w,h.low_rating_pct.where(h.n>=20),width=w,label=t.replace('_',' '),color=c)
ax.set_xticks(x,APPS);ax.set(ylabel='% rated 1-2 stars within flagged reviews',title='Rating association does not establish cause\nCells with fewer than 20 flagged reviews omitted');ax.legend(fontsize=8);save('04_rating_associations')
fig,ax=plt.subplots(figsize=(10,4));calendar_months=sorted(d.month.unique());positions=np.arange(len(calendar_months))
for app,c in zip(APPS,COLORS):
 h=d[d.app_name==app].groupby('month').size().reindex(calendar_months);ax.plot(positions,h.values,marker='o',label=app,color=c)
ax.set_xticks(positions,calendar_months)
ax.set(ylabel='Returned reviews',xlabel='Calendar month (IST)',title='Retrieval coverage differs; boundary months are partial');ax.legend();ax.grid(alpha=.15);save('05_coverage')
fig,axs=plt.subplots(1,3,figsize=(13,3.5),sharey=True)
for ax,app in zip(axs,APPS):
 h=sens[(sens.app_name==app)&sens.theme.isin(['ads','technical_friction','programme_reaction'])]
 for t,c in zip(['ads','technical_friction','programme_reaction'],COLORS):
  v=h[h.theme==t].set_index('scenario').reindex(['all_nonblank','five_plus_words','collapsed_identical_text']);ax.plot(range(3),v.share_pct,marker='o',label=t.replace('_',' '),color=c)
 ax.set_title(app);ax.set_xticks(range(3),['All text','5+ words','Exact-text\ncollapsed']);ax.grid(alpha=.15)
axs[0].set_ylabel('% within each sensitivity denominator');axs[-1].legend(fontsize=7);fig.suptitle('Text eligibility changes measured topic shares',y=1.05);save('06_sensitivity')
def json_records(frame):return json.loads(frame.to_json(orient='records'))
summary={'scope':'3-31 October 2026 IST','shared_rows':len(shared),'quality':json_records(quality),'topics':json_records(themes),'contexts':json_records(contexts),
 'validation':json_records(metrics),'weekly':json_records(weekly),'limits':'Lexical counts are exploratory screens. Single-coder 19-review diagnostic audit informed rule revisions and does not establish independent accuracy or multilingual coverage.'}
json.dump(summary,open(OUT/'results.json','w',encoding='utf8'),ensure_ascii=False,indent=2,allow_nan=False)
print(json.dumps({'shared':len(shared),'quality':quality.to_dict('records'),'top_topics':{a:themes[themes.app_name==a].sort_values('n',ascending=False).head(5).to_dict('records') for a in APPS},'contexts':contexts.to_dict('records'),'validation':metrics.to_dict('records')},indent=2))
