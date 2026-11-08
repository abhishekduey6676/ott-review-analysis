# Pilot data-quality report

Source: `dataset_google-play-reviews-scraper_2026-11-03_19-58-38-834.json`

SHA-256: `34c280262e754403853cd9aca5b4b15789ec274c7fe905940ba1c54bdc0db063`

Rows: **450**. Successful unique reviews: **450**. Error rows: **0**. Duplicate review-ID rows: **0**.

| App | Reviews | Observed dates (Asia/Kolkata) | Ratings 1 / 2 / 3 / 4 / 5 | Blank text | Text <=3 words | Missing version | Replies |
| --- | ---: | --- | --- | ---: | ---: | ---: | ---: |
| Netflix | 150 | 2026-11-02 to 2026-11-03 | 29 / 3 / 15 / 23 / 80 | 0 | 73 | 23 | 0 |
| Prime Video | 150 | 2026-11-01 to 2026-11-03 | 67 / 8 / 12 / 9 / 54 | 0 | 51 | 16 | 0 |
| JioHotstar | 150 | 2026-11-01 to 2026-11-03 | 92 / 8 / 6 / 8 / 36 | 0 | 45 | 41 | 11 |

## Interpretation and next step

- These are separate recent-review slices. Compare observed date ranges before making cross-app or time-trend claims.
- Only 0 records fall within the provisional 1 May-31 October 2026 study window. The pilot is not a six-month sample.
- Confirm actual collection settings and run metadata in Apify. Do not infer reviewer residence from the filename or storefront settings.
- Read the reproducible coding sample before freezing themes. Generic positive/negative feedback and explicitly described task problems need different treatment.
- Version and reply missingness limit release/response analysis. Reply presence is not resolution.
- No population-level failure, churn, or customer-satisfaction rates can be inferred from these self-selected reviews.

## Audit notes

- Input settings, run ID, cost and completeness are not included in this export and have not been verified.
- Date ranges describe observed rows only; they do not establish exhaustive retrieval.
- Short text is a screening measure, not a substantive-content classification.
- Devanagari detection is a script flag, not language identification; Hinglish may use Latin script.
- Repeated text from distinct review IDs is retained; repetition alone does not establish fraud.

## Reproduce

Run `node analysis/audit_pilot.mjs <source JSON path>`. Only the initial raw copy preserves reviewer metadata; analytical outputs omit names and photos.

Manual reading sample: 59 rows, selected as follows: Within each app and rating, sort by SHA-256(review_id) and take up to four nonblank reviews. Disproportionate coding sample, not an estimate of theme frequency.
