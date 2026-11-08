# Pilot collection

## Purpose

Check whether the source returns usable reviews for all three apps before choosing a full collection size, budget, or final research hypothesis.

Candidate Actor: [apihq/google-play-reviews-scraper](https://apify.com/apihq/google-play-reviews-scraper).

Its documented input and output were reviewed on 4 November 2026. The Actor has not been run for this project; advertised fields and reliability remain to be tested.

## Run the pilot

1. Open the Actor in an Apify account.
2. Switch the input editor to JSON and paste `collection/apify_pilot.json`.
3. Check the live Pricing tab and set a maximum charge in Run Limits before starting. The documented rate at preparation was USD 0.08 per 1,000 delivered reviews: approximately USD 0.036 for 450 reviews at that rate. This is an estimate from the listing, not a verified invoice or guarantee of account-level costs.
4. Run the Actor. Keep its run ID, start/completion time, input, status, and reported charge.
5. Export the complete dataset as JSON, including any error rows. Save it under `data/raw/` with a dated filename, for example `pilot_en_2026-11-04.json` if collected that day. Preserve the raw export locally; perform cleaning on a separate copy.
6. Keep the raw run metadata so pagination gaps, partial runs, and later changes can be traced.

An execution marked successful is not proof of a complete dataset: the documented output can include per-app `success: false` records.

## Inspect before proceeding

For each app, report:

- Returned rows, successful review rows, and errors by code.
- Unique review IDs and duplicate counts.
- Earliest/latest timestamps and counts per calendar date.
- Counts by star rating, including how many contain substantive text.
- Missing or invalid IDs, text, scores, dates, and app versions.
- Observed languages, including Hindi and mixed-language text despite English retrieval settings.
- Developer-reply availability and timestamp anomalies. A reply before a review timestamp can reflect an edited review or source behaviour; do not silently treat the difference as a valid response time.

Read up to 20 reviews per app, distributed across the rating groups present, to assess whether text supports identifying a task, an expectation, and a reported problem. Record how the sample was selected. This is a coding/quality exercise, not a prevalence estimate.

## Full collection decision

The proposed historical window is 1 May through 31 October 2026, using Asia/Kolkata calendar boundaries. Finalise or revise it only after testing retrieval depth and coverage.

This Actor's documented input has no date-range filter. A capped newest-first pull may not reach the historical window. Do not claim six-month coverage from the pilot or assume increasing the cap guarantees exhaustive history. Establish sufficient coverage, switch collection strategy if needed, or transparently narrow to a shared recent window.

Do not filter to low ratings for the primary dataset. Positive and neutral reviews provide context and a denominator. If more than one locale is collected later, retain provenance and deduplicate by app and review ID before merging.

Full collection size and spend are deliberately unset until the pilot is inspected.
