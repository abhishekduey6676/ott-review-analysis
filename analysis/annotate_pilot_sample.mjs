import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const sample = JSON.parse(fs.readFileSync(path.join(root,'data/processed/pilot_manual_sample.json'),'utf8'));
// Human reading of the deterministic 59-row sample. Indices are guarded by IDs.
// Columns: index, ID prefix, text quality, observed language, themes, evidence note.
const annotations = [
 [0,'f4245ffb','uncertain','English',['content_availability'],'Possibly requests The Notebook; wording too brief to confirm.'],
 [1,'f23a2e2a','substantive','English',['playback_failure','downloads','paid_value_expectation'],'Reports indefinite loading including downloads; attributes this to update, unverified.'],
 [2,'9a216605','generic','English',[],'Generic negative opinion without a task or reason.'],
 [3,'247e1b91','generic','English',[],'Generic negative opinion.'],
 [4,'6a7f6f53','needs_language_review','non-English (unverified)',[],'Requires language/translation validation before thematic use.'],
 [5,'00ea39c8','substantive','English',['content_availability'],'Explicitly mentions Nigerian library; does not establish reviewer residence.'],
 [6,'7d514392','uncertain','English',['unexplained_error'],'Numeric code query; cannot establish meaning or blocked task.'],
 [7,'3c3074dc','specific_brief','English',['price_affordability'],'Clear price opinion despite one word.'],
 [8,'de0edb23','substantive','English',['content_availability'],'Positive overall with unavailable-title concern.'],
 [9,'778a85e8','generic','English',[],'Generic neutral opinion.'],
 [10,'cfdbf9d5','specific_brief','English',['price_affordability'],'Clear price opinion despite one word.'],
 [11,'173b65e1','uncertain','nonverbal',[],'Emoji only.'],
 [12,'f1c68aca','substantive','English',['price_affordability','positive_experience'],'Four-star review explicitly calls fees expensive.'],
 [13,'9e5d1975','substantive','English',['subtitle_language'],'Requests Tamil subtitles, without a specific title.'],
 [14,'fa588aca','substantive','English',['price_affordability','positive_experience'],'Reports concern about affordability while praising service.'],
 [15,'4df2fcd3','generic','English',[],'Generic praise.'],
 [16,'3d042988','generic','English',[],'Generic praise.'],
 [17,'7649a850','generic','English',[],'General entertainment praise without a feature or workflow.'],
 [18,'29f6c500','generic','English',[],'General catalogue praise.'],
 [19,'c14a04ea','substantive','English',['ad_interruption','seeking_navigation'],'Describes ads while revisiting/fast-forwarding an episode. Sarcasm is negative.'],
 [20,'d5b03f68','substantive','English',['ad_interruption','paid_value_expectation'],'Paid subscription expected to mean uninterrupted viewing; plan unknown.'],
 [21,'a68ba72f','substantive','English',['additional_content_charges','paid_value_expectation','content_discovery'],'Reports rental results despite subscribing; magnitude is user claim.'],
 [22,'33e5482e','uncertain','English',['connectivity_or_playback_unclear'],'Reception wording does not isolate app versus connection issue.'],
 [23,'c6edd0bd','substantive','English',['playback_failure','workaround_reinstall'],'Video stops while audio continues; repeated reinstall reported.'],
 [24,'3d812595','substantive','English',['app_stability'],'Reports app stopping/exiting.'],
 [25,'eef959e8','substantive','English',['ad_interruption','paid_value_expectation','cross_service_complaint'],'Also mentions delivery: preserve separate from video-app experience.'],
 [26,'388b7c81','needs_language_review','Spanish',['ad_interruption','additional_content_charges','cancellation_settings'],'Themes are provisional pending translation check; reported reduced use is not measured churn.'],
 [27,'8ffb67ad','substantive','English',['additional_content_charges'],'Reports film rental fees.'],
 [28,'9dcb4fc8','substantive','English',['additional_content_charges','paid_value_expectation'],'Extra charge while trying to watch with a child.'],
 [29,'4ba90cb8','substantive','English',['positive_content_value'],'Praises free dramas; entitlement not independently checked.'],
 [30,'3061844a','substantive','English',['additional_content_charges'],'General paywall concern; exact plan and affected titles unknown.'],
 [31,'94d567ef','generic','English',[],'Generic praise.'],
 [32,'91d88b3f','substantive','English',['casting_device_support'],'Requests casting to TCL Roku TV; whether unsupported or failing is unclear.'],
 [33,'5a4ce7f9','substantive','English',['ad_interruption','paid_value_expectation'],'Four-star review reports ads and upgrade expectation.'],
 [34,'2f86dc53','substantive','English',['ad_interruption','paid_value_expectation'],'Four-star rating accompanies explicitly negative ad experience.'],
 [35,'c3dcfd1e','generic','English',[],'Generic praise.'],
 [36,'1d7d4c6b','generic','English',[],'Generic praise.'],
 [37,'73df196d','substantive','English',['positive_content_value','positive_multidevice'],'Explicitly praises titles and device/account access; not a verified policy statement.'],
 [38,'2f9fb37e','generic','English',[],'Generic praise.'],
 [39,'e1c5a89a','substantive_content_reaction','English',['show_outcome_reaction','uninstall_intention'],'Unfair elimination claim concerns programme outcome; uninstall statement is not measured churn.'],
 [40,'8bcdf5cc','specific_brief','English',['positive_quality'],'Positive quality statement with one-star rating; do not silently correct score.'],
 [41,'4796b591','substantive_content_reaction','English',['show_outcome_reaction'],'Programme dissatisfaction without explicit technical app issue.'],
 [42,'03b1b88f','substantive_content_reaction','English',['show_outcome_reaction'],'Requests fair/unbiased shows; no explicit app malfunction.'],
 [43,'b968990c','substantive','English',['content_availability','device_specific_access'],'Reports removed/missing episodes and phone/TV difference.'],
 [44,'c50bdb83','substantive','English',['player_controls','live_sports'],'Requests fit-to-screen zoom during live sports.'],
 [45,'e03977f4','substantive','English',['content_availability','paid_value_expectation'],'Unspecified show unavailable despite subscription.'],
 [46,'f61e4cc9','substantive','English',['ad_interruption','seeking_navigation'],'Ads reportedly triggered by forward/rewind.'],
 [47,'1181a406','uncertain','undetermined',[],'Single token without interpretable product context.'],
 [48,'3e2d70cd','uncertain','English',['ad_interruption'],'Mixed fragment; ad concern tentative, low confidence.'],
 [49,'a6a72612','generic','English',[],'Generic praise.'],
 [50,'f0db468e','uncertain','nonverbal',[],'Emoji only.'],
 [51,'017bff34','uncertain','English',['price_affordability'],'Likely high-price opinion but ambiguous spelling; not high-confidence evidence.'],
 [52,'76d97c30','uncertain','English',['positive_content_value','pricing_terms_unclear'],'Praises catalogue; payment/free-period statement unclear.'],
 [53,'3945ba7a','needs_language_review','mixed English/Romanised language',[],'Romanised fragment requires review before interpretation.'],
 [54,'35f3a854','specific_brief','Romanised Hindi',['ad_interruption'],'Reports too many ads; translation note: ad jyada aata hai.'],
 [55,'df75299c','generic','English',[],'Generic praise.'],
 [56,'d64a299b','uncertain','undetermined',[],'Ambiguous single token.'],
 [57,'af7fd250','substantive_content_reaction','English',['show_outcome_reaction'],'Five-star rating accompanies do-not-download statement about eviction; preserve disagreement.'],
 [58,'887df5c5','substantive','English',['positive_leisure_value'],'Explicit leisure context after studying.']
];
if (annotations.length !== sample.length) throw new Error('Sample changed; reread before applying annotations.');
for (const [i,prefix,quality,language,themes,note] of annotations) {
  const r=sample[i];
  if (!r.review_id.startsWith(prefix)) throw new Error('Sample order changed.');
  Object.assign(r, {manual_text_quality:quality,manual_language:language,manual_themes:themes,evidence_note:note,
    coding_method:'assistant manual reading; single-coder provisional',codebook_version:'pilot-v0.1',audit_status:'single-coder; not independent validation'});
}
fs.writeFileSync(path.join(root,'data/processed/pilot_manual_sample_annotated.json'),JSON.stringify(sample,null,2)+'\n');
const counts={}; for(const r of sample) counts[r.manual_text_quality]=(counts[r.manual_text_quality]||0)+1;
console.log(JSON.stringify({annotated:sample.length,quality:counts},null,2));
