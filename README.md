# What gets in the way of watching?

A product management case study using Google Play reviews to find where the streaming experience breaks down and decide what a product team should investigate first.

**Start here:** [PowerPoint with speaker notes](presentation/OTT-review-case-study.pptx) · [Written case study and charts](reports/analysis/OTT_case_study.md) · [Explore the aggregate results with SQL](analysis/portfolio_queries.sql)

**Main finding:** About 22% of nonblank October reviews for Prime Video and JioHotstar mentioned ads, versus about 2% for Netflix. The difference persisted after applying the same mix of star ratings. Reading individual examples surfaced separate questions about plan expectations, interruption frequency, and playback recovery. These are signals from sampled reviews, not rates of affected subscribers.

**Research question:** Where does the OTT app experience fall short of customer expectations, and which reported problems deserve investigation first?

**Working scope:** Netflix, Prime Video, and JioHotstar; Android reviews retrieved using the India storefront and English language settings.

**Status:** Analysis complete for the observed 3-31 October 2026 comparison (15,289 reviews, from a 30,000-review export). The case study answers the five research questions, reports sensitivity and coding limitations, and recommends targeted investigations. The six-month collection goal remains unmet.

## Project files

- [Study design](docs/study_design.md): research questions, sampling, analysis, and deliverables.
- [Data dictionary](docs/data_dictionary.md): source fields and proposed analytical variables.
- [Pilot collection instructions](docs/pilot_collection.md): a small collection before scaling.
- [Apify pilot input](collection/apify_pilot.json): up to 150 newest reviews per app, across all ratings.
- [Pilot quality report](reports/pilot_quality.md): observed coverage, missingness, ratings and provenance limitations.
- [Pilot reading observations](reports/pilot_observations.md): early candidate themes and the next collection decision.
- [Reproducible audit](analysis/audit_pilot.mjs): local JSON audit and de-identified analytical export.
- [Expanded collection plan](docs/expanded_collection.md): first expansion up to 30,000 reviews, language probe, six-month coverage gate and supporting product evidence.
- [Expansion input](collection/apify_expansion_en.json) and [Hindi probe](collection/apify_language_probe_hi.json): separate runs with documented retrieval settings.
- [Expanded export audit](reports/expansion_quality.md) and [historical coverage](reports/expansion_coverage.md): verified 30,000-row snapshot, unequal date ranges and shared-window preparation.
- [Expansion preparation script](analysis/prepare_expansion.mjs): de-identified analytical JSON and reproducible 300-review coding sample.
- [OTT analysis and portfolio case study](reports/analysis/OTT_case_study.md): findings, six charts, recommendations, and limitations.
- [Aggregate SQLite data](reports/analysis/ott_summary.sqlite) and [portfolio SQL queries](analysis/portfolio_queries.sql): run the comparisons, rating checks, and sensitivity analyses without downloading individual reviews.
- [Reproducible Python analysis](analysis/run_analysis.py): rebuild the analysis using a local Google Play review export.

## Reproduce or explore

- **Explore published results:** Open `reports/analysis/ott_summary.sqlite` in a SQLite viewer and run `analysis/portfolio_queries.sql`. The summary database can also be rebuilt from the included aggregate JSON with `python analysis/build_summary_db.py`.
- **Rerun on local inputs:** Follow the [collection and preparation steps](docs/expanded_collection.md) to place and prepare a local export, install `requirements-analysis.txt`, then run `python analysis/run_analysis.py`. A new export can cover a different period, so the original analysis window must be checked before reuse. The raw exports, processed review text, individual audit cases, and full local database are excluded from the repository.

## First milestone

Completed: quality/coverage audit, October comparison, within-app temporal analysis, and a small manual diagnostic check of lexical topic rules. The October study is not a replacement for the six-month target. No Hindi-probe export or run metadata has been supplied.

The pilot checks feasibility. Its newest-review samples are not the final six-month study and may cover different dates across apps.

## What the finished project should demonstrate

1. A reproducible dataset with documented coverage and cleaning decisions.
2. Exploratory charts that reveal patterns rather than assume a particular problem.
3. A focused investigation of two or three candidate problems, including competing explanations.
4. An evidence-supported problem statement and product recommendation.
5. A concise portfolio case study supported by queries or a notebook and a data dictionary.

## Sources

- [Netflix on Google Play](https://play.google.com/store/apps/details?id=com.netflix.mediaclient&hl=en_IN)
- [Prime Video on Google Play](https://play.google.com/store/apps/details?id=com.amazon.avod.thirdpartyclient&hl=en_IN)
- [JioHotstar on Google Play](https://play.google.com/store/apps/details?id=in.startv.hotstar&hl=en_IN)
- [Candidate Apify scraper documentation](https://apify.com/apihq/google-play-reviews-scraper)

Country and language are retrieval settings, not verified reviewer residence or detected review language. Public reviews describe self-selected reported experiences, not all customer experiences.
