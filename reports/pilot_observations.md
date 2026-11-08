# Pilot reading: observations and next collection decision

Date: 4 November 2026. This is a feasibility/reading note, not a final cross-app ranking.

## Verified dataset

The export contains 450 successful, unique review records: 150 per app. No duplicate app-review IDs, invalid scores, missing IDs, invalid dates, blank review text, or per-app error rows were found. An untouched copy and SHA-256 fingerprint are retained in the project.

Observed date coverage in Asia/Kolkata:

- Netflix: 2-3 November 2026 (about 12.5 hours between earliest and latest UTC timestamps).
- Prime Video: 1-3 November 2026 (about 40 hours).
- JioHotstar: 1-3 November 2026 (about 28 hours).

All records fall outside the previously proposed May-October window. The file does not provide the Apify run ID, actual input settings, start time, charge, or completeness information.

## Quality findings

- 169/450 texts (37.6%) contain three words or fewer. This is not a deletion rule: a short price opinion or Romanised Hindi complaint can still be informative.
- App version is missing for 80/450 reviews (17.8%).
- Developer replies are returned for 11 reviews, all on JioHotstar. Two reply timestamps precede their review timestamps; response-time analysis would need investigation of edited reviews and source behaviour.
- No Devanagari text was detected, but the reading sample includes Romanised Hindi, Spanish, and another non-English text requiring language review. Script detection is not language detection.
- Reviews mention markets outside India. Neither the retrieval locale nor references in a review establish reviewer residence. A confirmed India-only sample cannot be claimed.
- Repeated exact text occurs across distinct IDs. Those records remain included: generic phrases repeat naturally, and repetition alone is not proof of spam.

## What reading 59 reviews revealed

The sample takes up to four nonblank reviews per app and star rating, selected by deterministic ID hash. Netflix has only three two-star reviews, yielding 59 rather than 60 rows. It deliberately overrepresents smaller rating groups for coding. Theme counts in it must not be presented as population or full-pilot prevalence.

1. **Programme reactions and technical app problems need separate labels.** Some sampled JioHotstar reviews react to Bigg Boss eliminations or perceived fairness. One five-star review explicitly says not to download the app for that reason. These are customer-experience signals, but they do not establish playback or engineering defects. The underlying programme events have not been independently verified.
2. **Ratings and text can disagree.** A one-star review praises quality; four-star reviews include price and ad concerns. A low-star-only collection would miss problems, while sentiment inferred directly from stars would mislabel some records.
3. **Paid-value expectations deserve further investigation.** Sampled Prime Video reviews discuss ads and extra content charges despite a subscription. Sampled Netflix reviews discuss affordability, and some JioHotstar reviews discuss paid access to shows. These are hypotheses for broader coding, not evidence that any provider breached its terms. Specific plan, region and entitlements are usually unverified.
4. **Ad interruptions during seeking are a more specific candidate than generic dislike of ads.** Sampled Prime Video and JioHotstar reviews describe ads when fast-forwarding, rewinding or revisiting an episode. Confirm the pattern in a larger, comparable period before prioritising a product change.
5. **One source can contain other service complaints.** A Prime Video review also complains about priority delivery. Keep video-experience and broader membership complaints distinct rather than automatically attributing both to the streaming app.

Single-coder annotations and source IDs are saved in `data/processed/pilot_manual_sample_annotated.json`. Uncertain and untranslated text is explicitly marked. No automated sentiment or population-level theme estimates have been produced.

## Recommendation for the next step

Use this pilot to finalise the codebook, including generic feedback, programme reactions, uncertain language, positive features, and multi-issue reviews. Then annotate the remaining pilot records with an independent audit of a subset if possible. Preserve counts before and after each eligibility decision.

Before scaling, confirm the Apify run's actual locale, sort order, cap and completion details. Define a shared recent historical window, with retrieval checked against its boundaries. A 150-newest cap produces unequal short periods; merely increasing to the same count per app does not solve the coverage problem. Choose between a common recent window and the original six-month plan after checking the required review depth and budget. Do not spend on another run or claim historical completeness based on this export alone.

For the final study, compare the results with and without programme-reaction reviews, report missing language/plan/device information, and separate observed associations from causal explanations.
