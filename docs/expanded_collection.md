# Expanded data collection

Prepared 4 November 2026. Status: inputs and quality gate ready; no expansion run has been executed here.

## What makes this study more extensive

The first 450 reviews span roughly one to two days per app, include generic comments and multiple languages, and do not reach the proposed historical window. We need temporal coverage, language transparency, supporting product evidence and reproducible quality checks as well as more rows.

Keep the three Android apps. Adding more platforms now would increase product-model differences before resolving coverage. Keep positive/neutral ratings, programme reactions and generic comments; code them explicitly. Do not collect only complaints or keyword matches for the primary comparison.

## Stage 1: larger English-locale retrieval

Actor: [apihq/google-play-reviews-scraper](https://apify.com/apihq/google-play-reviews-scraper).

Use `collection/apify_expansion_en.json`: up to **10,000 newest reviews per app**, at most **30,000 returned review rows**, country `in`, language `en`.

This is a first retrieval cap, not a statistical sample-size justification or a promise of six-month coverage. Google Play can return multiple observed languages and reviews referencing other markets. The same settings across apps do not make their audiences comparable or verify India-only residence.

The planned historical target remains **1 May through 31 October 2026**, Asia/Kolkata. Collect newer reviews as a retrieval side-effect, preserve them, and keep them outside that fixed primary historical analysis. The fixed window prevents fresh runs from quietly changing the comparison period.

### Cost estimate and run controls

The listing checked on 4 November 2026 advertises USD 0.08 per 1,000 delivered reviews. At that rate, 30,000 rows imply **USD 2.40**, and the 600-row language probe implies **USD 0.048**. These are listing-based estimates, not an invoice or a guarantee of full-history retrieval. Check the live Pricing tab and account restrictions before running.

For this first expansion, a suggested Run Limits maximum charge is USD 3 for the English run and USD 0.25 for the language probe. These are guardrails for manual execution, not encoded Actor input fields. A capped/stopped run must be recorded as partial. If live pricing differs, reassess the requested count against the intended spend. Further runs are not automatically included in this estimate.

### Execution and export

1. Open the same Actor, switch to JSON input, and paste the English expansion file.
2. Record actual input, run ID, start/end time, status, charge and stopping reason using a copy of `collection/run_metadata_template.json`. Save the actual input with the export.
3. Set the spending cap in Run Limits and run it.
4. Export the full dataset as JSON, including error rows. Save under `data/raw/` with its original distinct filename. Never overwrite the pilot export.
5. Run the local coverage checker described below. Do not immediately repeat the job or increase every app's cap.

## Stage 2: Hindi-locale feasibility probe

Use `collection/apify_language_probe_hi.json`: up to 200 newest reviews per app, at most 600 total. It checks whether a second retrieval setting adds useful Hindi or mixed-language material, changes themes, or repeats the same review IDs.

Run separately and retain its own run metadata. Keep this auxiliary dataset separate from the English primary denominator while assessing overlap, dates and languages. It is not a representative Hindi-language population sample, and a smaller language-specific cap must not be pooled as if it carried the same sampling weight.

Inspect detected/observed language, IDs and text manually. Romanised Hindi may occur in either retrieval setting. Broader regional-language runs should follow demonstrated relevance and audited translation capability rather than an unbounded `all` setting.

## Coverage gate: how far back did we get?

Run:

```
node analysis/check_collection_coverage.mjs "<path to English expansion JSON>"
```

For multiple exports from the same primary sampling configuration, pass each as a separate argument. Do not include the Hindi probe in this primary coverage calculation; audit it separately under a distinct report name using `--label=hi-probe`.

The checker writes `reports/expansion_coverage.json` and `reports/expansion_coverage.md`, preserving the existing pilot outputs. It reports errors, duplicate IDs, invalid core fields, dated counts, records in the target window, and the historical boundary reached per app. It also surfaces changed snapshots under the same review ID.

### Decisions after inspecting output

- **All apps reach the start boundary:** inspect monthly coverage, source warnings and pagination before accepting the six-month comparison. Reaching a date alone does not establish an exhaustive history.
- **Only some apps reach it:** target deeper retrieval at the incomplete app(s). The current Actor has no documented date filter or continuation input, so a larger newest-first pull may re-bill overlapping reviews. Never treat re-collected IDs as new customers. A candidate replacement Actor's pagination/date semantics must be validated on a small overlapping sample before switching.
- **None reaches it within a reasonable budget:** choose a shorter shared window and document the scope change before comparing themes. Do not use different six-month substitutes for different apps.
- **A cap, time limit, or error stops a run:** preserve partial rows and record the failure. Evaluate source behaviour before paying for a repeat.

Count needed rows from actual date coverage. The pilot's one-day arrival rates are too unstable to project six months of reviews reliably.

## Stage 3: supporting evidence

After candidate problems are established, collect dated official evidence for each app: plan/ad conditions, extra-charge content distinctions, download/casting support, account/household restrictions and relevant release statements.

Each captured claim needs app, page URL, retrieval date, applicable plan/market if stated, exact relevant passage and the claim's effective date if known. Current help text cannot be assumed to describe a May 2026 experience. Public release notes can be incomplete; a version first appearing in reviews is not a verified rollout date.

Supporting documents are a different evidence type from customer reports. They help interpret expectations but cannot verify an individual review's entitlement or account status.

## Analysis readiness

Before a substantive comparison, document source coverage per app/month/rating, the final inclusion/language rules, and a manually checked coding guide. Keep programme reactions, app-function problems, subscription expectations and generic feedback distinct. Identify mixed-issue and cross-service comments.

Report theme shares for each app and comparable period; run sensitivity checks with/without programme reactions and uncertain text. If months have very different observed review volumes, show both pooled shares and equally weighted monthly summaries, labelled as different estimands. Do not label either as all-user prevalence.

Review volume, ratings, and customer language cannot establish true failure rates, churn or the number of affected users. More data does not remove public-review selection bias.

## Sources checked

- [Current Actor and input/output documentation](https://apify.com/apihq/google-play-reviews-scraper)
- [Alternative Actor with advertised date cutoff](https://apify.com/theagents/googleplay-reviews): not selected for immediate use; different schema and free-plan restrictions require testing.
- [Alternative Actor with advertised pagination](https://apify.com/neatrat/google-play-store-reviews-scraper): not selected for immediate use; pagination semantics, locale settings and account limits need verification.
