# Evidence supplement v0.2 — integrate into the existing site

Snapshot: **2026-10-14**. This is a data/research release, not a redesign brief and not a claim that the complete audit is finished.

## Read first

The earlier 88-row file is a **lead inventory containing duplicates, altered scopes, unsupported dates and erroneous paraphrases**. Do not convert its legacy grades into official verdicts. This package retains that input unchanged and supplies a disposition for every original ID.

This release contains **50 curated forecast/version records**: 34 have an editorial assessment (including future and unscorable claims), while 16 remain unreviewed. Only **13** are eligible for the default deadline-based subset statistics. There is also one explicitly qualified, interpretation-dependent LATE hardware assessment, excluded from default statistics. These are AI-assisted source-backed editorial judgments, not human peer review.

The 50 records are **not** the deduplicated lifetime total or simply “88 minus duplicates”: some old leads have been split, some remain quarantined, and some related/newly sourced versions have been added. A related 2029 version never silently repairs an unlocated 2019 version.

## Files

- `predictions.canonical.v0.2.json`: canonical records, source references, criteria, rationale, qualifiers and legacy relations. Authoritative machine-readable output of this release.
- `predictions.reviewed.v0.2.csv`: flattened view of the same 50 records. This is NOT a positional replacement for the old 88-row CSV.
- `legacy-reconciliation.v0.2.json` / `.csv`: all 88 original IDs, dispositions, links and reasons. All automatic redirects are false.
- `sources.v0.2.json` / `.csv`: 32 source entries with real URLs, source types, dates and provenance limitations.
- `source-coverage.v0.2.json` / `.csv`: what has actually been examined and what remains to extract.
- `metrics.snapshot.v0.2.json`: computed release totals and explicit exclusions. Not a lifetime-accuracy claim.
- `verification-supplement.docx`: readable editorial handoff.
- `verification-dossiers.md`: detailed evidence notes for all 50 canonical records, plus links and limitations.
- `validate_data.py`: dependency-free package integrity checks.
- `kurzweil_prediction_intake_v0_1.csv`: unchanged original input for auditability.

## Integration instructions for the coding agent

1. **Keep the existing pages and design.** Load the new canonical data alongside the preserved intake rather than redesigning the website or continuing to show only an empty intake dashboard.
2. Join source references through `sources.v0.2.json`; display their URLs as real source links. The original edition has NOT been independently checked when a source says author retrospective, archive republication or article mirror. Show that distinction in the detail view.
3. Join all legacy IDs through `legacy-reconciliation`. A `canonical_ids` link can mean a RELATED VERSION, not a duplicate. Do not automatically redirect one-to-many, ambiguous or quarantined rows. Keep old routes available as research-history pages with an explanation.
4. Render the approved `assessment.verdict`, its explanation and the separate `at_deadline` / `at_review` values. Do not infer CORRECT or WRONG from dates alone. Show a qualifier on K033: **LATE — hardware proxy; approximately 3–4 years**. Keep its aggregate exclusion visible.
5. Treat `TEXT_CONFIRMED_IN_LISTED_SOURCE` as source confirmation, not completed outcome review. `SOURCE_CONFIRMED` records remain UNREVIEWED; secondary-attribution PENDING records remain visibly provisional.
6. Use `eligible_for_deadline_metrics` for this release’s strict subset. Exclude PENDING, UNSCORABLE, UNREVIEWED and the interpretation-dependent K033. Keep partials as a separate bucket, with no fractional credit. Recompute when curated records change; do not retain stale snapshot numbers.
7. **Do not put “Kurzweil was 15.4% accurate” on the home page.** This selected subset is not representative. Prefer “13 due forecasts assessed” and outcome counts. Any available rate must say **strict on-time rate within this selected reviewed subset (n=13)**. Category counts are too small for a defensible accuracy ranking. The original 147-item 2009 corpus is a sensible bounded next audit population.
8. Full realization by review is **unknown for nine members of the 13-record eligible cohort**. `eventual_realization_rate` is therefore null. Do not turn those unknowns into permanent failures. You may display a clearly labeled documented lower bound or simply withhold that percentage.
9. There are **no exact drift observations** in the default release. K033 supplies an optional, qualified interval marker. `full_achievement_documented_by_year` means “at least by,” not “first occurred in.” Do not convert by-2008 evidence into a fabricated first-year date or exact drift point. Chess has a confirmed 1997 outcome but an unresolved original deadline.
10. Replace the misleading “verified / 88” display with separate counts: **88 original leads reconciled; 50 curated forecast/version records; 34 editorial assessments; 13 due-and-eligible assessments**. The denominators describe different populations and must not be conflated.
11. Keep all 13 original categories, including a zero-record Manufacturing & materials category. This release’s canonical records happen to occupy 12 categories; that is not a reason to shrink the taxonomy.
12. Use 2026-10-14 consistently as this data snapshot. Do not make the date imply fresh annual review merely because the website rebuilt.
13. Preserve an immutable copy of v0.1 and the v0.2 release. Subsequent corrections should produce a versioned change log, rather than overwriting original prediction dates or previous editorial decisions.

## Key model details

`publication.forecast_year` is an attributed year with a separate provenance/status field; it is not always a checked first publication date. `target.deadline_year` is nullable. “Early 2030s” navigation intervals are marked editorial and are not used as exact deadlines in the default statistics. Original wording is not silently replaced by an arbitrary January/December date.

All claim descriptions are **editorial paraphrases**, not verified verbatim quotations. Do not surround them with quotation marks or manufacture quote text. Source locators refer to printed PDF pages/numbered predictions or named transcript sections. The PDF’s viewer page number is different from the printed page number.

Review states: `ASSESSED`, `SOURCE_CONFIRMED`, `ATTRIBUTION_UNRESOLVED`.
Verdicts: `CORRECT`, `LATE`, `PARTIAL`, `WRONG_MISSED`, `PENDING`, `UNSCORABLE`, `UNREVIEWED`.
An intrinsic ambiguous criterion may be UNSCORABLE; merely failing to locate evidence is not a reason to declare the author’s forecast unscorable or false.

## Validation

Run from any directory:

```sh
python /path/to/kurzweil_verification_v0_2/validate_data.py
```

No third-party Python packages are required. The script checks original-input hash, all 88 mappings, unique IDs/slugs, source-reference integrity, future exclusions, eligible counts, category totals, interval timing and incomplete-current-outcome handling. It does NOT assert that a URL will remain accessible forever or that these editorial judgments are beyond dispute.

## Publication gate

The existing scorecard/detail pages can now show real source-backed assessments. A headline whole-career accuracy percentage must wait for a defined, adequately extracted corpus. The most consequential next work is primary-edition verification and completing all 147 statements in the 2009 corpus, not inventing more charts or filling remaining cells from the previous summaries.
