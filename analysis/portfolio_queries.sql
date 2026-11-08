-- Run against reports/analysis/ott_summary.sqlite (published aggregates)
-- or reports/analysis/ott_analysis.sqlite (full local analysis).
-- All cross-app comparison queries use the shared October window.

-- 1. Coverage, star mix and text quality; the unit is an observed review.
SELECT app_name, n, nonblank, median_words, short_le3, missing_versions,
       ROUND(mean_rating, 2) AS mean_stars,
       ROUND(low_rating_pct, 1) AS pct_1_or_2_stars
FROM shared_quality ORDER BY app_name;

-- 2. October ad counts and an explicit recomputation of the percentage.
SELECT app_name, denominator AS text_reviews, n AS ad_flags,
       ROUND(100.0 * n / denominator, 2) AS pct_with_ad_flag
FROM theme_summary WHERE theme = 'ads' ORDER BY app_name;

-- 3. Topic share and descriptive low-star association with named denominators.
SELECT app_name, theme, n, denominator, ROUND(share_pct, 2) AS pct_text_reviews,
       low_rating_n, ROUND(low_rating_pct, 1) AS pct_low_with_flag,
       ROUND(other_low_rating_pct, 1) AS pct_low_without_flag, high_rating_n
FROM theme_summary ORDER BY app_name, n DESC;

-- 4. Four complete week bins, plus separate individual history below.
SELECT app_name, period, theme, n, denominator, ROUND(share_pct, 2) AS pct_text_reviews
FROM weekly_themes
WHERE theme IN ('ads', 'technical_friction', 'programme_reaction')
ORDER BY app_name, period, theme;

-- Month endpoints can be partial. Use this for within-app context only.
SELECT app_name, month, n, denominator, ROUND(share_pct, 2) AS pct_text_reviews
FROM within_app_monthly_themes WHERE theme = 'ads' ORDER BY app_name, month;

-- 5. Co-occurrences suggest contexts for review; they don't validate causality.
SELECT app_name, context, n, denominator, ROUND(share_pct, 2) AS pct_text_reviews
FROM context_cooccurrence ORDER BY app_name, context;

-- 6. Change the text denominator or apply a common star mix.
SELECT app_name, scenario, theme, n, denominator, ROUND(share_pct, 2) AS pct_text_reviews
FROM sensitivity WHERE theme IN ('ads','technical_friction','programme_reaction')
ORDER BY app_name, theme, scenario;

SELECT app_name, theme, ROUND(observed_pct, 2) AS observed_pct,
       ROUND(standardized_pct, 2) AS pooled_star_mix_pct
FROM rating_standardization WHERE theme IN ('ads','technical_friction')
ORDER BY app_name, theme;

-- 7. Single-coder diagnostic audit; support is small and no positive cases
-- means recall is unavailable, not zero. This is not independent validation.
SELECT theme, evaluated_reviews, manual_positive, true_positive,
       false_positive, false_negative, precision, recall
FROM classification_metrics ORDER BY theme;
