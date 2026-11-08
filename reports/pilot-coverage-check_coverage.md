# Collection coverage

Target: 1 May-31 October 2026, Asia/Kolkata. Report label: pilot-coverage-check.

Input rows: 450; unique successful IDs: 450; duplicate-ID rows: 0; error rows: 0; conflicting snapshots: 0.

| App | Unique IDs | Target-window rows | Earliest timestamp (UTC) | Start boundary reached? | Missing target months |
| --- | ---: | ---: | --- | --- | --- |
| Netflix | 150 | 0 | 2026-11-02T07:24:24.000Z | No | 2026-05, 2026-06, 2026-07, 2026-08, 2026-09, 2026-10 |
| Prime Video | 150 | 0 | 2026-11-01T03:40:52.000Z | No | 2026-05, 2026-06, 2026-07, 2026-08, 2026-09, 2026-10 |
| JioHotstar | 150 | 0 | 2026-11-01T15:28:39.000Z | No | 2026-05, 2026-06, 2026-07, 2026-08, 2026-09, 2026-10 |

## Interpretation

- Boundary reach and nonempty months do not establish exhaustive pagination or representative coverage.
- Country/language settings and run status are not verified by this file. Keep each run input and metadata.
- Conflicting duplicate snapshots require an explicit substantive merge policy; this report uses latest review timestamp for coverage only.
- Do not combine different language samples for primary rates without assessing overlap and weighting.

## Next action

Some apps have not reached the target start. Check caps/errors and budget before targeted deeper retrieval; otherwise revise to a shared supported window.
