# Fusion Atlas data dictionary

## 1. Content authority and general rules

`data/fusion_atlas.json` is the canonical structured snapshot. The other JSON files in `data/` are convenience views of its sections. Read the snapshot from `meta.as_of` and `meta.timezone`; do not substitute the browser's current date. The report explains the evidence, and the build specification defines its presentation.

`schema/types.ts` supplies TypeScript interfaces for the implementation. Use those types alongside this dictionary and the validator; the actual JSON remains the content source. Standalone views such as `data/entities.json`, `data/sites.json`, `data/claims.json`, `data/funding_events.json`, `data/approaches.json`, `data/sources.json`, `data/power_balance.json` and the optional story/risk views can be imported by individual components. They are extracted sections of the same snapshot, not independent datasets to combine or edit separately.

IDs are stable strings, unique within their own collection. An approach and a glossary entry may legitimately use the same string because their namespaces differ. Resolve a reference against its named collection. Array order is not a risk ranking, a chronological guarantee or an instruction to sum values.

JSON `null` means not supplied or not established within the record's scope. It is different from numerical zero, an empty string, a failed experiment and “not applicable.” Preserve the accompanying note. Quantities retain their source units, accounting boundary, qualifier and date. A formatted display string is not the sole numerical representation.

The records distinguish source review from independent verification. A primary company page establishes what the company reports; it does not by itself establish independent replication. An experiment, component test, inferred quantity, model, design, agreement and announced target must retain their distinctions throughout the interface.

## 2. Top-level sections

| Section | Shape | Purpose |
| --- | --- | --- |
| `meta` | Object | Title, schema version, snapshot, timezone, scope and editorial policies; dynamic collection counts |
| `approaches` | Array of objects with `id` | Mechanism catalog and diagram guidance |
| `entities` | Array of objects with `id` | Companies, public programmes, experiments, suppliers and enabling organizations/projects |
| `sites` | Array of objects with `id` | Location-role records linked to entities; more than one record may share a physical location |
| `claims` | Array of objects with `id` | Evidence and target statements with categories, timing and provenance |
| `funding_events` | Array of objects with `id` | Financial observations with amounts, currencies, types and overlap qualifications |
| `timeline` | Array of objects with `id` | Selected historical events and future targets |
| `records` | Array of objects with `id` | Selected empirical quantitative observations suitable for metric-specific charts |
| `metrics` | Array of objects with `id` | Definitions, units, compatible comparison groups and guardrails for chart metrics |
| `risk_dimensions` | Array of objects with `id` | Detailed questions and evidence that would address them |
| `risk_themes` | Array of objects with `id` | Reader-facing themes grouping detailed dimensions |
| `risk_assessments` | Array of objects with `id` | Entity-specific editorial interpretations linked to themes and sources |
| `approach_risk_profiles` | Object | Architecture-level qualitative profiles, source references and classification guidance |
| `evidence_categories` | Array of objects with `id` | Canonical claim-category labels and meanings |
| `evidence_states` | Array of strings | Qualitative evidence-state vocabulary; not numerical scores |
| `glossary` | Array of objects with `id` | Definitions and common confusions |
| `power_balance` | Object | Teaching formulas, worked cases, limitations and separately attributed company models |
| `sector_context` | Array of objects with `id` | Dated industry/public-funding context with its own cohort and scope |
| `amount_operator_labels` | Object keyed by operator | Display prefixes and explanations for qualified financial amounts |
| `quality_notes` | Array of objects with `id` | Scope limitations, conflicts, exclusions and presentation constraints |
| `sources` | Array of objects with `id` | Canonical source registry with unique URLs and review metadata |
| `source_aliases` | Object mapping string to string | Original or duplicate source IDs mapped directly to canonical source IDs |
| `story_content` | Object | Ready-to-use public copy, chapters, tooltips, labels and interface strings |

Optional sections can be added without hardcoded collection counts. If present, their references must still resolve. `meta.counts` is derived metadata, not the source of truth for the array contents.

## 3. Approaches

Each `approaches` record provides `id`, `name`, `family`, `mechanism`, ordered `diagram_steps`, `proposed_advantage`, `key_open_challenge`, `diagram_guardrail`, `examples`, `source_ids` and, where supplied, an interpretation label. Some advantages and challenges are explicitly editorial interpretations of the mechanism.

`family` is a broad grouping for navigation and consistent color. The approach ID and its variant determine the actual diagram. HTS is a technology attribute, not a competing confinement family. `examples` contains readable names, not foreign-key IDs.

| Approach ID | Diagram meaning | Important distinction |
| --- | --- | --- |
| `tokamak` | Toroidal confinement using external fields and substantial plasma current | Plasma gain and magnet performance are different evidence |
| `spherical_tokamak` | Tokamak with a tight central hole | Central-column constraints remain visible |
| `stellarator` | Externally shaped three-dimensional confinement field | Use the selected design's coil architecture; not every coil must be nonplanar |
| `magnetic_mirror` | Elongated plasma with strong end fields | End losses and energy recovery are distinct |
| `beam_frc` | Beam-sustained field-reversed configuration | Do not reuse the pulsed compression sequence |
| `pulsed_frc` | Formation, acceleration/merger, compression and recovery cycle | Recovered input and fusion contributions have separate boundaries |
| `z_pinch` | Current-driven pinch with sheared-flow stabilization | It is not an imploding disposable target |
| `magnetized_target` | Mechanical compression of a magnetized plasma | Experimental liner and intended commercial wall may differ |
| `laser_indirect` | Laser energy produces X-rays in a hohlraum before capsule compression | Show the intermediate radiation stage |
| `laser_direct` | Laser illumination drives target compression | Select a separate fast-ignition stage only when the record specifies it |
| `pulsed_power_inertial` | Electrical pulses compress a target or liner | Preheat, premagnetization and target geometry are design-specific |
| `levitated_dipole` | Plasma around an internal levitated magnetic ring | Ring protection and cooling are part of the intended plant |
| `electrostatic` | Electrostatic ion confinement with magnetic assistance where specified | High voltage and small size do not establish gain |
| `hybrid_direct_drive` | An initial indirect-drive stage followed by direct laser drive | This is not fast ignition or a magnetic-inertial hybrid merely because it uses “hybrid” |
| `hybrid_fast_ignition` | Separate compression and rapid ignition stages in an engineered fuel system | Do not infer an unspecified ignition driver, premagnetization or historical projectile architecture |

Read the current `family` value from the approach record rather than maintaining a second classification table in UI code. `approach_risk_profiles.normalization_recommendations` documents source-backed choices for designs whose older descriptions can mislead.

## 4. Entities and their references

| Field | Type | Meaning |
| --- | --- | --- |
| `id`, `name` | String | Stable key and readable name |
| `entity_type`, `sector` | String | Organization/project role; does not imply commercial maturity |
| `approach_id` | String or null | Reference to `approaches`; null is valid for enabling facilities and suppliers |
| `approach_variant` | String or null | More specific architecture description |
| `family` | String or null | Broad grouping consistent with the referenced approach |
| `summary`, `mechanism` | String; array of strings | Curated explanatory copy and ordered conceptual steps |
| `operating_fuel` | String or null | Experimental fuel or current development context |
| `intended_fuel` | String or null | Attributed intended commercial fuel; can differ from operating fuel |
| `intended_fuel_ids` | Optional array of strings | Filter tags such as `D-T`, `D-He3`, `p-B11`; detailed prose remains authoritative about near-term versus later choices |
| `site_ids` | Array of strings | References to `sites` |
| `evidence_claim_ids`, `target_claim_ids` | Arrays of strings | References to `claims`; the referenced claim's `category` governs rendering |
| `risk_note_ids` | Array of strings | References to `risk_assessments` |
| `funding_summary` | Object | Concise display, selected financial-event references and qualifiers |
| `company_models` | Optional object | Attributed model scenarios and version notes; never measured performance by default |
| `research_notes` | Object | Additional caveats, conflicts or interpretation constraints |
| `source_ids`, `as_of` | Array; date string | Canonical sources and reviewed snapshot status |
| `net_electricity_evidence_status`, `net_electricity_note` | Strings | What reviewed public evidence establishes; not a claim about unpublished work |

Public project records may also have `operator`, `role` or `status`. These are descriptive fields, not automatically references to another entity. Use `entity_id` or `related_entity_ids` where a structured relationship exists.

`funding_summary` is a summary, not a complete transaction ledger. Depending on source coverage, it may use `latest_cumulative_event_id`, `latest_round_event_id` or `funding_event_ids`. Resolve those to `funding_events` for the amount's precise basis. Do not turn the summary's anchor amount into an unqualified ranked bar.

The names `evidence_claim_ids` and `target_claim_ids` are navigation conveniences. For example, a design scenario can appear in a target-oriented list while retaining `category: model_or_design`. Never infer that a record was measured from its ID or the list containing it.

## 5. Sites and shared facilities

A site record includes `id`, `entity_id`, `related_entity_ids`, `physical_site_id`, `name`, `role`, `role_label`, `marker_shape`, `status`, location text, `lat`, `lon`, `coordinate_precision`, `approximate`, `coordinate_note`, `source_ids` and `as_of`. The optional display fields `role_label` and `marker_shape` provide ready-to-use map presentation without requiring the builder to infer a role from the site's name.

`entity_id` is the primary associated entity. `related_entity_ids` permits a partner or company to reference the same facility. WHAM and Realta, for example, can point to one site record without duplicating the facility. Entity-site validation permits either the primary or an explicitly related entity.

`physical_site_id` groups location-role records for clustering. An experiment and a proposed plant at the same campus can have separate site IDs and a shared physical-site ID. The grouping is not a verified parcel register. Do not equate the number of site-role records with the number of unique physical facilities.

Latitude and longitude are finite numbers within geographic bounds, or both null when unavailable. Current coordinates are approximate city/locality/research-area points. A precise-looking decimal does not make them surveyed facility coordinates. Retain `approximate: true` and its note; use modest map zoom and do not offer parcel or navigation claims.

`role` and `status` answer different questions: what the place represents, and its stated condition. A headquarters is not an operating fusion experiment. A proposed plant is not operating because an office at the same city is operating. Company funding is attached to the entity and must not be repeated in totals for each site marker.

## 6. Claims, evidence categories and timing

A claim contains `id`, `entity_id`, `category`, `claim`, `evidence_type`, `timing`, `as_of`, `source_ids`, `independent_verification` and `details`.

| `category` | Meaning |
| --- | --- |
| `experimental_result` | A source reports measured behavior; the subtype and claim specify whether it is a plasma, component or other experiment |
| `model_or_design` | Calculation, simulation or design publication |
| `predecessor_evidence` | Related experimental heritage belonging to another facility or institution |
| `engineering_progress` | Construction, integration or engineering progress within a stated scope |
| `reported_status` | Source-reported project condition with its limits |
| `organization_event` | Corporate, strategy, agreement or similar event |
| `target` | Attributed future objective, with original timing and scope |

`evidence_type` is a finer-grained provenance/scope label. An experimental-result category does not mean the full plant achieved gain. `details` can preserve measurement boundaries, modeled quantities, uncertainty, explicit non-measurement flags, attribution flags and `related_record_ids` linking to `records`. Preserve those qualifiers in expanded cards and relevant tooltips.

### Timing object

| Field | Meaning |
| --- | --- |
| `display` | Human-readable source date or window; preferred text for the interface |
| `role` | What the date refers to |
| `precision` | Exact day, month, year, approximate year, range, fiscal period, vague period or unknown |
| `date` | `YYYY-MM-DD`, `YYYY-MM`, `YYYY` or a supported quarter when the source actually provides that precision; otherwise null |
| `start_year`, `end_year` | Optional plotting bounds, both present or both null; not newly precise deadlines |
| `note` | Clarification about source wording or the date's interpretation |

Timing roles include `event_date`, `reported_at`, `reported_by`, `publication_date`, `target_window`, `target_date`, `undated_live_page` and `campaign_end_month` where applicable.

An **event date** says when an event happened. A **reported/publication date** says when a source described it. A **target window** says when an outcome is intended. An **undated live page** has no established publication date. None of those should be replaced with the date the source was accessed.

Supported precision values include `day`, `month`, `year`, `approximate_year`, `range`, `year_part`, `decade`, `decade_part`, `decade_boundary`, `fiscal_year`, `quarter`, `unspecified`, `not_specified`, `unknown`, `not_applicable` and `undated_live_page`. Fuzzy windows can retain only `display`, with null dates and bounds. “Early 2030s” must not become a fabricated January deadline. A fiscal year is not silently interpreted as a calendar year.

`as_of` is the review snapshot. Historical/event/report/publication dates cannot start after the snapshot, while targets may be later. A target whose stated date is now past still remains a target until reviewed evidence changes its category. For partial dates, validation compares their earliest possible date with the cutoff; it does not invent a particular day for display.

## 7. Quantitative records, metrics and timeline

`records` is reserved for selected empirical numerical observations. Each record supplies `id`, `entity_id`, `date`, `date_role`, `metric`, `value`, `unit`, `boundary`, `measurement_type`, `evidence_type`, `source_ids` and `as_of`. It may also supply energies, powers, duration, temperature, uncertainty, fuel, `reported_display` and explanatory date notes.

The precision of a record's `date` is inherent in its string. `campaign_end_month` is not an exact shot date. Missing supporting quantities stay null: an unspecified driver energy must not be back-calculated from an approximate gain and then presented as a reported measurement.

`metric` resolves to `metrics.id`. Metric definitions provide the compatible comparison group and scientific guardrails. A target-gain series, plasma-gain result, integrated fusion energy, specified temperature duration and general plasma duration are different panels. Never compare their values on a single normalized progress axis.

Use the stored exact or source-rounded `value` for plotting and `reported_display` where it preserves a qualifier. The validator permits explicitly rounded gain ratios but catches disagreements beyond the displayed precision when numerator and denominator are supplied. It does not manufacture missing ratios.

The records are a curated selection. Label a chronological view accordingly. A running maximum is the best among the included comparable records, not necessarily a complete record history. Do not infer shot success rates or assume omitted experiments succeeded.

`timeline` is broader: it can include scientific, corporate, funding, regulatory and target events. Its `timing` and `status` must agree about whether an event is a target. The timeline can mix event types because it does not assign them one numerical performance score.

## 8. Financial observations, nulls and amount overlaps

`funding_events` describes disclosed financial observations, not a guaranteed cash-disbursement ledger.

| Field | Type and interpretation |
| --- | --- |
| `id`, `entity_id` | Event ID and reference to the associated entity |
| `event_type` | Round, cumulative total, conditional commitment, grant, debt facility, public budget, government equity award, proposed merger, cash-balance snapshot or another explicitly documented class |
| `announcement_date`, `date_precision` | Native disclosure date and its precision; both must retain an unknown state where the date is unestablished |
| `amount` | Finite nonnegative number or null; native-currency amount or qualified anchor |
| `currency` | Three-letter currency code, or null when no amount/currency was disclosed |
| `amount_usd` | Source-supplied USD amount, same-currency amount, or null; no reconstructed exchange rate |
| `usd_conversion_basis` | `same_currency`, `source_supplied_approximation`, `not_converted`, or an explicitly documented equivalent |
| `amount_operator` | Operator resolved through `amount_operator_labels`; determines the visible qualifier |
| `amount_is_approximate` | Optional additional approximation flag |
| `qualifier` | Material conditions, scope, category composition and ambiguity |
| `includes_prior` | Whether the observation includes earlier financing; does not identify a complete set of transactions by itself |
| `accounting_basis`, `funding_scope` | Category/scope descriptions where available |
| `supersedes`, `superseded_by` | References to revised observations of the same financing event |
| `cash_received_status`, `cash_received_verified` | What the sources establish about receipt; not automatically inferred from “raised” |
| `aggregation_policy` | Normally requires an explicit non-overlap review before any addition |
| `exclude_from_totals`, `exclude_from_funding_total`, related exclusion flags | Preserve specific restrictions on summation or private-equity comparisons |
| `source_ids`, `as_of` | Canonical sources and review snapshot |

The amount operators currently define reported amount (`=`), lower bound (`>`), ceiling (`<=`), `nearly` and `approximately`. A greater-than amount is a lower-bound anchor; a ceiling may not have been drawn; “nearly” is not an exact close. Keep the prefix visible. Null amounts take precedence over formatting: an undisclosed round with currency USD must still say unknown, not `$0`.

### Overlap and revision rules

There is no computed `amount_overlaps` dollar total. Overlap is expressed through `includes_prior`, revision references, scope fields, exclusion flags and qualifiers. An optional future `overlap_event_ids` list may explicitly name related financial observations; the validator checks those references when present.

A cumulative total usually includes earlier rounds. An initial round announcement and its final close can describe one revised event. A public programme budget can include a partner award. A cash balance can include new financing proceeds while also reflecting prior cash and spending. None of these pairs should be added automatically.

The reciprocal `supersedes`/`superseded_by` links preserve revised announcements. A cash-balance snapshot must be excluded from capital-raised totals. A proposed merger with null funding is not assigned its headline valuation as cash. An undrawn credit facility is not interchangeable with equity or disbursed grant proceeds.

For a comparison chart, first select compatible accounting scope and currency. Do not infer cash runway, return on investment or technical success from a financial observation. `sector_context` uses separate survey/programme scopes and must not be added to company events without a separate reconciliation.

## 9. Risk themes, dimensions and profiles

`risk_themes` defines the reader-facing themes: plasma and fuel physics, electrical balance, sustained/repeated operation, fuel cycle, materials/maintenance, and delivery/economics. Each theme's `dimension_ids` links to detailed `risk_dimensions` questions.

A risk dimension supplies a question, the evidence needed to address it, an interpretation, applicability and sources. An entity's `risk_assessments` supplies `headline`, `interpretation`, `theme_ids`, `original_dimension`, any source-status wording, sources and `as_of`. `is_interpretive` is true and `is_probability` is false.

`approach_risk_profiles` provides broader architecture-level interpretation. Its `profiles` array is keyed by `approach_id`; each profile includes `scope_note` and a `themes` object keyed by the canonical theme IDs. A theme cell contains an `interpretation` and `source_ids`. Some profiles include diagram sequences or guardrails. `theme_labels` provides matching copy, and `additional_source_ids` points to sources already merged into the canonical registry.

`normalization_recommendations` preserves specific source-backed classification choices using `entity_id`, `approach_id`, `family`, `subtype`, display wording, source links and diagram guidance. It is explanatory metadata, not an alternative entity registry.

The `evidence_states` vocabulary includes relevant-condition demonstration, partial demonstration, modeled, announced target, not publicly established and not applicable. These are qualitative categories, not equally spaced scores. A raw `source_evidence_status` is retained context and should not be automatically converted into one of these states or a red/green company verdict.

Do not count favorable words, sources, demonstrated components or resolved themes to manufacture an overall risk rating. Architecture interpretation does not establish that every company using that architecture has passed the same requirement. Fuel, conversion path and implementation can change the relevant questions.

## 10. Power balance and signed outputs

`power_balance` contains named teaching cases, formula strings, expected outputs, sensitivity cases, assumptions/limitations, a full-cycle electrical-recovery example and separately attributed company models.

The continuous teaching case uses delivered heating in MW, plasma Q, electric-to-heating efficiency, capture fraction, heat-to-electric efficiency and non-driver auxiliary electrical demand. The pulsed case uses delivered target energy in MJ, target gain and repetition in Hz. MJ multiplied by Hz is MW.

Driver demand is delivered heating divided by driver efficiency, or delivered target energy multiplied by repetition divided by driver efficiency. It is **not** multiplied by fusion gain. Gross electrical generation follows capture and conversion. Net output subtracts driver demand and other loads without counting the driver twice.

Efficiencies and capture are dimensionless fractions. Driver efficiency must be greater than zero. Zero capture or zero thermal conversion can produce valid zero gross generation and negative net output. A gain ratio or threshold with a zero denominator is unavailable even when net power is well-defined.

Signed outputs are intentional. Negative net MW or net MJ mean consumption over the declared boundary; do not clamp them to zero. A positive target-gain number can coexist with negative plant electricity. A finite-Q slider at zero external heating is not a physical model of an ignited plasma producing finite power.

The optional target-cost calculation is `3600 × repetition_Hz × target_cost_USD / P_net_MWe`, defined only for positive net power. It describes one operating-cost component, not full electricity cost or LCOE.

### Attributed company models

`inertia_attributed_model` contains the source's explicit inputs, formula and examples. `calculated_net_MW` is arithmetic using the supplied assumptions; `company_rounded_net_MW` preserves the company's rough illustration. They need not be identical. Calculated examples stored to four decimal places are validated within their rounding precision; company-rounded outputs are not forced to equal them.

`inertia_faq_version` preserves a different set of source scenarios. Do not fit them into a universal interpolation or force them to agree with the newer accounting illustration. The corresponding `entities[].company_models` fields retain the same model and version data for card access; validation checks their consistency.

Formula strings document the accounting. The validator uses explicit numerical calculations and a restricted arithmetic parser for the supplied expressions; it does not execute arbitrary code from the dataset. A passing arithmetic check does not validate the physical feasibility of the inputs or the completeness of a plant design.

## 11. Sources, aliases and public copy

A source provides `id`, `url`, `title`, `publisher`, `published_date`, `accessed_at`, `last_reviewed_at`, `access_timezone`, `source_type`, supported `claims`, and optional page/access/provenance notes. Publication dates may be partial or null. Access and review dates describe this research pass, not continuous monitoring or the date an experiment occurred.

The `sources` array uses unique canonical URLs. When earlier research packets cited the same page under different IDs, `source_aliases` maps each original ID directly to the canonical one. Canonical IDs may map to themselves. `sources[].aliases` lists old IDs retained for that page.

All structured `source_ids` arrays use canonical IDs. Resolve aliases when reading older prose references; do not leave alias IDs in newly normalized data. An alias is not a second source or independent corroboration. URL deduplication retains the actual query string while normalizing host/scheme case, a terminal slash and page fragments for duplicate detection.

`story_content` supplies public copy: hero text, ordered chapters, paragraph sources, glossary tooltips, evidence/provenance/funding labels and interface strings. Its nested IDs have local namespaces. These label IDs are presentation vocabulary and are not automatically the same strings as `claims.category` or `evidence_type`. Choose the presentation label that preserves the record's meaning.

`quality_notes` records conflicts, limitations and intentional exclusions. It is part of the content contract, not disposable implementation commentary. The source registry supplies references, not permission to reproduce entire publications or reuse their artwork.

## 12. Validation and maintenance

Run from any directory using the script's location, or from the handoff root:

```bash
python3 scripts/validate_data.py
python3 scripts/validate_data.py data/fusion_atlas.json --strict-warnings
```

The default data path is resolved relative to the script, so the first command works when invoked through its full path elsewhere. The optional path validates another snapshot. Exit code 0 is a pass, 1 is a validation failure, and 2 means the file or structure could not be processed. The script uses only the Python standard library, makes no network requests and never edits the data.

Checks cover ID uniqueness; source/entity/site/claim/record/approach/risk/funding references; shared-site ownership; canonical aliases and duplicate URLs; date precision and the snapshot boundary; finite nonnegative financial amounts and intentional nulls; currency-conversion basis; revision links and cash-balance exclusions; coordinate bounds and approximate labels; measured-series separation; optional risk/profile/story content; dynamic metadata counts; and teaching/attributed-model arithmetic.

Checks do not certify the truth of a source, make a complete company census, validate every scientific assumption or reconcile undisclosed private financial overlaps. Future updates should change the source, then the claim, then derived views, while retaining necessary history and qualifiers. Regenerate convenience files from the canonical dataset and rerun validation before shipping the changed snapshot.
