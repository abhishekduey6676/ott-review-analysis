# Study design

Prepared: 4 November 2026. Domain: OTT / streaming apps.

Expansion decision: retain the three-app Android scope, request up to 10,000 English-locale reviews per app in the first larger retrieval, and audit whether it reaches the shared historical target. A separate 200-per-app Hindi-locale probe checks additional language coverage. See `docs/expanded_collection.md`; counts are retrieval caps, not sufficient evidence of historical completeness. No expansion run has been executed here.

## Objective

Discover a specific, evidence-supported customer problem through exploratory analysis, then explain which product investigation or improvement deserves attention. The primary portfolio signals are analytical skill, problem identification, and product judgment.

No app is assumed to be best, and no particular complaint is assumed to dominate.

## Scope

| App | Android package |
| --- | --- |
| Netflix | `com.netflix.mediaclient` |
| Prime Video | `com.amazon.avod.thirdpartyclient` |
| JioHotstar | `in.startv.hotstar` |

- Source: public Google Play reviews; India storefront and English retrieval settings for the pilot.
- Geography: an India-oriented collection configuration, not a verified sample of Indian residents. No city-level conclusions from this dataset.
- Primary sample: all available star ratings under the selected collection method. Do not balance rating groups when estimating theme shares.
- Proposed full time window: 1 May to 31 October 2026, pending feasibility. Use a shared supported window across apps if the original window is impractical.
- Unit of analysis: an app-review record. It is not a unique customer, a viewing session, or a verified incident. A review can describe a TV, casting, or other device experience even when posted on Google Play.
- Supporting evidence: dated official help pages, relevant plan terms and release information, collected after candidate themes emerge. Current documentation cannot automatically explain historical experiences.

## Research questions

1. Which tasks, expectations, positives, and problems appear in substantive reviews?
2. How do theme shares and associated ratings vary across apps and comparable time periods?
3. Which reported problems persist rather than appear in a short burst?
4. Are themes related to content, pricing expectations, live viewing, or technical usability? Keep distinct contexts separate where reviews explicitly identify them.
5. What evidence supports each candidate problem, and what plausible alternatives weaken the interpretation?

## Workflow

### 1. Establish coverage and prepare the data

Retain source provenance and run errors. Separate failed requests from reviews. Validate scores, dates and identifiers; deduplicate by `(app_id, review_id)`. Record inclusion/exclusion reasons.

Preserve meaningful language, negation and emojis in analytical text. Detect language separately from the requested language. Do not silently discard Hindi or mixed-language reviews. Decide translation/exclusion rules after the pilot and record their effect on sample composition.

Remove reviewer names and image URLs from the analytical dataset. Retain review source links for evidence checks. Treat generic, empty and irrelevant text as explicit categories rather than silently excluding low-information feedback.

### 2. Explore before choosing a problem

Build coverage tables and rating distributions, inspect review activity by week/month, and read a balanced coding sample. Generate candidate themes from the text, checking positives as well as complaints.

Starting prompts may include playback, navigation, downloads, casting, login, billing, ads, content access and language/subtitles. These are provisional reading prompts, not final labels or findings. Add unexpected themes and record taxonomy revisions.

Use multi-label annotation: a review can mention more than one task or problem. Keep a separate `no_specific_problem` label. Freeze the initial full-study codebook after the pilot and before comparing app outcomes; document later changes and rerun affected analysis consistently.

If a model assists classification, manually audit an independent stratified sample and report error patterns, especially negation, mixed languages and multiple issues. Do not use a scraper's generated sentiment summary as ground truth.

### 3. Investigate two or three candidate problems

For each candidate, compare theme shares, ratings, temporal persistence, stated task blockage, contexts and counterexamples. Include numerator and denominator in every comparison. Check whether generic text exclusions, language choices, short spikes, or one app dominate a finding.

Use full-period rates alongside comparable time slices. Independently normalising each app is necessary; equal raw complaint counts are not comparable evidence of experience quality. If uncertainty intervals are used, explain their assumptions and that they do not correct the self-selection of public reviewers.

App-version analysis is exploratory. Version may be missing or self-reported; first observed review date is not a verified rollout date. Temporal association is not proof that an update caused a problem.

### 4. Formulate and prioritise the problem

Write the strongest supported problem as:

> When [context], reviewers report difficulty completing [task], because of [reported friction]. Evidence consists of [counts, proportions, timeline and representative examples]. [Mechanism or customer group] remains uncertain.

Evaluate frequency within the observed sample, persistence, explicitly reported consequences, and evidence confidence separately. A blocked task is not interchangeable with a cosmetic complaint. Report unknown consequences as unknown. Avoid a single arbitrary weighted score that hides judgment.

Compare live-event and on-demand contexts where explicitly stated, and do not assume plan, device, paid status, age, or geography when absent. Product offerings and user expectations differ, so do not create a universal best-app leaderboard.

## Core measures

| Measure | Definition / interpretation |
| --- | --- |
| Coverage | Review counts by app, date, rating and observed language; report missing fields separately |
| Theme share | Distinct reviews with a theme divided by all substantive included text reviews in the same app/time slice; multi-label shares can exceed 100% in total |
| Complaint mix | Reviews mentioning a problem divided by reviews with any specific problem; label this different denominator explicitly |
| Low-rating association | Proportion rated 1-2 stars among theme reviews, compared with other substantive reviews; descriptive association |
| Persistence | Presence and counts/shares across weeks or months with sufficient observed coverage; suppress unstable low-count comparisons |
| Task blockage | Count/share of theme reviews explicitly reporting inability to complete a task, supported by text |
| Reply coverage | Share of theme reviews with a returned developer reply; does not establish issue resolution |

Helpful votes can assist selecting evidence for manual reading but are not counts of affected users. More comments or reviews do not measure app usage or active customers.

## Outputs

1. Coverage/quality report and reproducible cleaning decisions.
2. Analysis notebook or SQL queries with source and dictionary references.
3. Four to six purposeful charts: coverage, theme composition, temporal patterns and focused comparisons.
4. A problem-investigation brief with counterevidence, uncertainty and a prioritised recommendation.
5. A concise portfolio case study: question, discovery, investigation, identified problem, implications, limitations.

## Boundaries on conclusions

The study cannot establish population-level failure rates, actual churn, retention, willingness to pay, revenue impact, or causal effects of releases. A customer saying they intend to cancel is a reported intention, not measured churn. A developer reply does not prove a fix.

The OTT topic positions the case toward consumer subscriptions, media and customer experience. It is not itself evidence of enterprise SaaS product expertise, although the analytical methods transfer.
