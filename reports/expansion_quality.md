# Expanded export: quality and analysis readiness

Source: `dataset_google-play-reviews-scraper-task_2026-11-03_20-24-19-116.json`

SHA-256: `f7b4e7142b6a5ed941525ee96b98d1010cbbae2532174fa37c5421730e86dc9b`

Raw rows: **30000**. Prepared records: **30000**. Core-field exclusions: **0**. Reviewer names/photos omitted from analytical outputs. The separate coverage audit checks duplicate IDs and source errors.

| App | Reviews | Observed dates (IST) | Missing versions | Blank text | Text <=3 words | Replies | Replies dated before review |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| Netflix | 10000 | 2026-10-02 to 2026-11-03 | 1821 | 1 | 4228 | 0 | 0 |
| Prime Video | 10000 | 2026-07-19 to 2026-11-03 | 1266 | 0 | 3078 | 0 | 0 |
| JioHotstar | 10000 | 2026-08-09 to 2026-11-03 | 3020 | 0 | 3901 | 631 | 70 |

## Shared analysis window

The provisional shared complete-day window is **2026-10-03 through 2026-10-31, Asia/Kolkata**. It contains **15289** records. The first observed Netflix day is excluded because collection starts partway through it. November rows are preserved outside this historical slice.

| App | Shared-window reviews | Ratings 1 / 2 / 3 / 4 / 5 |
| --- | ---: | --- |
| Netflix | 9244 | 1099 / 273 / 447 / 863 / 6562 |
| Prime Video | 2530 | 1098 / 221 / 180 / 170 / 861 |
| JioHotstar | 3515 | 1821 / 158 / 149 / 173 / 1214 |

The shared window is a prepared sensitivity/initial-analysis dataset, not a silent replacement for the six-month goal. It does not establish representative or exhaustive review coverage. Do not compare full-export raw rating/theme shares as if the apps covered the same period.

## Before thematic conclusions

- Read and annotate the 300-row common-window coding sample, then freeze a codebook. The sample is disproportionately stratified by rating and must not estimate theme prevalence.
- Validate any classifier on a separate held-out manually read sample. Include generic feedback, non-English/uncertain text, mixed sentiment and programme reactions.
- Date ranges alone cannot establish persistence across several months. The May-October goal remains unmet; no app reaches May.
- Confirm actual run input, time limits, charge, pagination and completion in Apify. The JSON does not establish reviewer residence.
- Do not automatically delete short/repeated text: brief price complaints and generic praise can both be meaningful for different measures.
- Preserve version/reply missingness. Earlier reply dates may reflect edits or source behaviour; do not interpret them as negative response times.
- Retain the pilot separately. Merging it into this snapshot requires checking overlapping IDs and edited records first.

## Reproduce

`node analysis/prepare_expansion.mjs <expansion JSON>`
