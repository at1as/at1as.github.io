# Agent handoff — Kurzweil outcomes v0.3

## What this release does

This is an evidence-and-data update for the existing site, not a redesign brief. Replace the 50 v0.2 canonical records **by stable K001–K050 IDs**, add K051–K084, and retain the original 88-row intake and the prior assessment history. Do not append all 84 to the old 50. The new dataset has 84 source-matched forecast/version records, 34 of them new. All 68 past-due reference forecasts have deadline and current outcome assessments. Fourteen are future-dated; two have no usable deadline but have current judgments.

**Assessment complete is not the same as every attribution detail proven.** A source-matched author adaptation, an original wager, and a retrospective quotation have different attribution strengths. The original book editions have not been independently collated. Conditional assessments of unresolved legacy attributions are deliberately separate from the author-accuracy denominator.

## Import these files

- `predictions.canonical.v0.3.json`: canonical records and metadata; source of truth for the site.
- `sources.v0.3.json`: 98 used source references and evidence caveats.
- `legacy-reconciliation.v0.3.json`: all 88 original IDs, existing route history and completed outcome dispositions. Includes 46 explicit conditional assessments for materially different or unresolved imports; other rows point to the assessed, source-matched canonical criteria.
- `metrics.v0.3.json`: independently calculated expectations for testing, not a substitute for deriving filtered metrics.
- `source-coverage.v0.3.json`: truthful incremental coverage; do not mark a whole book or the 147-item corpus complete.
- `changes.v0.3.csv`: old-to-new verdicts and newly added records.

Human-review formats: `kurzweil_outcomes_v0_3.xlsx`, `verification-supplement.v0.3.docx`, `verification-dossiers.v0.3.md`, and the CSV versions. The long dossiers contain every judgment and all linked evidence; the short Word supplement is not the full evidence ledger.

## Necessary UI changes

Use `assessment.verdict` for the default reference badge, not attribution confidence or the presence of an exact first-achievement year. Add separate columns or toggles for **At original deadline** and **By review date**. A forecast can be not fulfilled in 2009, fulfilled by review and correctly labeled LATE.

Display attribution and timing as separate metadata: `source_verification.state`, `attribution_confidence`, `outcome_confidence`, `timing_confidence`, and `timing.kind`. Do not turn a completed outcome back into UNREVIEWED because the original book page has not been collated or the precise first occurrence is unknown.

Each record has `interpretations.reference`, `.strict` and `.broader`, each with its own criterion, deadline result, review result, explanation, verdict, evidence and metric eligibility. Label strict as **Strict / alternative reading**, because some entries test a different population or deadline rather than a uniformly harsher standard. Default to **Reference (stated reasonable reading)**. Expose the scope changes next to broader outcomes: many are directional successes achieved by another mechanism or at lower adoption. They are not equivalent to full original-claim hits.

Three stronger-than-source comparisons (K041, K064, K083) live in `non_scoring_comparators`, not the strict score. They illustrate why demanding universal diagnosis, perfect records or complete biological understanding would overstate what the forecast required.

For uncertain legacy wording, display `conditional_outcome` with **Attribution unresolved — outcome conditional on this wording**. Do not relabel such rows as confirmed Kurzweil forecasts. Do not add them to aggregate author accuracy or sum them with their related canonical records. Some imports contain multiple targets: render `component_assessments` instead of forcing one verdict/date on the sentence.

## Metrics and denominator rules

Reference mature cohort: 68 records; 25 fully fulfilled by their deadline; 36 fully realized by the review date (25 on time plus 11 late). These are **36.8% on-time and 52.9% full realization in this selected subset**, not lifetime accuracy. Partial receives no arbitrary half-point in the primary rates. The all-record status distribution is 26 CORRECT, 11 LATE, 17 PARTIAL, 16 WRONG and 14 PENDING; the extra CORRECT and PARTIAL are the two undated records, outside the 68.

All views use one count per canonical forecast/version. Never count a source citation, tag, alternate interpretation, or legacy alias as another prediction. Version-sensitive and theme/family groupings must be labeled; they are not the same counting unit.

K036 is a material deadline-window case: the reference uses 2025 for “mid-2020s,” whereas the strict/alternative view allows through December 2026 and is still PENDING on 15 October 2026. Reference and broader native cohorts have 68 records; strict has 67. `common_cohort_excluding_deadline_boundary` supplies an equal 67-record comparison. Prefer that for a mode-comparison chart. Do not silently compare percentages with different populations.

Future early achievements under broader readings can have a CORRECT badge with an EARLY qualifier but remain outside deadline-based rates until the target cohort matures. Two undated claims are scored for present realization without on-time credit.

## Timing and drift

`timing.first_full_achievement_year` is nullable. `documented_by_year` is an upper bound, not automatically a first event. `achievement_interval_years` and `drift_range_years` support bounded plots. `EDITORIAL_ERA_BOUND` explicitly labels approximate market-period judgments; do not turn those into exact dates. Render a separate “known by” series, interval/range marks, or an event timeline. Do not leave all timing information blank simply because exact-first dates are unavailable.

For a still-unfulfilled prediction, show “overdue; not fully realized as of 2026-10-15,” not a fabricated completed delay. A late realization must retain the original at-deadline miss.

“By review” means **the full criterion has occurred by the cutoff**. A historical product being discontinued does not undo a capability milestone. Adoption criteria refer to the population and metric explicitly named. Source observation years (e.g. 2025 Internet use, 2021 road deaths) are not silently changed to 2026.

## Evidence handling

Use actual URLs from the source catalogue. Source page/section locators are retained in `prediction_sources`. Do not invent verbatim book quotes; most normalized claims are editorial paraphrases. Author self-grades are attribution/locator material, not independent outcome evidence. Commercial launch releases establish availability but not reliability, clinical efficacy, universal penetration or a majority market share. Use the attached notes before making stronger claims.

The original files stay immutable. Preserve v0.2 scores in record history, not as competing live verdicts. Import dates and enum values explicitly; expand old front-end validators to accept `EDITORIAL_ASSESSMENT_COMPLETE` and the separated fields.

## Acceptance checks

Run `python validate_v03.py` in this folder. Then test that the UI displays 84 canonical records, 34 new IDs, 68 eligible reference forecasts, 14 future and two undated records. Verify the reference subset has 25 on-time and 36 fully realized entries. Every count should drill down to exactly its contributing IDs. Strict native eligibility is 67; the equal-mode comparison cohort is 67. Confirm no raw legacy aliases or stronger-than-source comparators affect these totals.

The automated test validates IDs, coverage, source references, denominators and outcome consistency. It is not a claim that editorial judgments cannot be contested or that every URL currently returns HTTP 200.
