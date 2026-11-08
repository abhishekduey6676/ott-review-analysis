# Data dictionary

Source schema: [candidate Apify Actor](https://apify.com/apihq/google-play-reviews-scraper), reviewed 4 November 2026. A 450-row user-supplied pilot has been audited; see `reports/pilot_quality.md`. Its actual run input and run ID are not available in the export.

## Source fields

| Field | Documented meaning | Handling |
| --- | --- | --- |
| `success` | Review versus per-app error row | Errors retained in collection audit, excluded from review analysis |
| `review_id` | Source review identifier | Deduplicate within app; flag missing values |
| `app_id` | Android package | Join to verified app registry in study design |
| `score` | 1-5 star rating | Validate integer range |
| `text` | Review body, possibly empty | Preserve original; record text eligibility separately |
| `posted_at` | Source review timestamp | Parse UTC and retain original; derive Asia/Kolkata date for study windows; source edits can affect interpretation |
| `app_version` | Version associated with review, when exposed | Nullable; no imputation of release date |
| `thumbs_up` | Helpful-vote count at collection | Not an affected-customer count |
| `reply_text` | Returned developer reply, when present | Nullable; no inference of resolution |
| `reply_posted_at` | Returned reply timestamp | Audit missing and anomalous chronology |
| `url` | Review permalink | Traceability for manual evidence checks |
| `criteria` | Optional feature-specific ratings | Inspect availability and semantics before use |
| `code`, `error`, `request_id`, `status_code` | Error metadata on failed rows | Collection audit only |
| `user_name`, `user_image` | Public reviewer name/photo | Omit from analytical/public outputs |

## Collection metadata to add

| Field | Meaning |
| --- | --- |
| `run_id`, `collected_at_utc` | Collection provenance; do not substitute review timestamp |
| `requested_country`, `requested_language` | Retrieval settings, not confirmed residence/language |
| `sort`, `max_reviews_requested` | Sampling configuration |
| `source_file` | Raw-export filename |

## Derived variables to finalise after pilot

| Field | Meaning |
| --- | --- |
| `app_name` | Human-readable verified app name |
| `review_date_ist`, `review_month` | Time-slice variables derived consistently |
| `detected_language`, `language_status` | Observed text language, mixed/uncertain status |
| `included`, `exclusion_reason` | Reproducible eligibility decisions |
| `text_quality` | Substantive, generic, empty, irrelevant, or uncertain |
| `themes` | Multi-label categories supported by text |
| `journey` | Task or stage described; unknown allowed |
| `sentiment_toward_theme` | Positive, negative, mixed or uncertain; keep separate from overall star rating |
| `reported_context` | Live/on-demand, device, plan, paid status only when explicit; otherwise unknown |
| `reported_consequence` | Task blocked, degraded experience, inconvenience, or unknown; explicit evidence required |
| `evidence_excerpt` | Short passage supporting interpretation, checked against source |
| `coding_method`, `codebook_version`, `audit_status` | Classification provenance and manual review status |

Provisional single-coder labels exist for the 59-row reading sample in `pilot_manual_sample_annotated.json`; they are not final full-dataset labels or independently validated results. The pilot determines the final codebook. Audit-derived fields and collection provenance are defined in `analysis/audit_pilot.mjs`.
