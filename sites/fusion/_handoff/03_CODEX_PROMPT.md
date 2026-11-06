# Codex implementation prompt — Fusion Atlas

Use the following prompt in a later Codex implementation session with the `fusion_atlas_codex_handoff` folder and, if available, the existing website repository.

---

## Build request

Build **Fusion Atlas**, an interactive editorial explainer with the public title **The paths to fusion power**, for the **BLog Visualizations** collection at `jasonwillems.com/sites/`. The suggested route is `/sites/fusion/`; follow the host repository's routing conventions. Produce complete source code and a working local preview. Publication is a separate step requiring authorization in this implementation session.

The supplied handoff is the research and content package. Your main task is to build the visual components, interactions and responsive presentation. The first version does not require a new research pass. Use the snapshot date from the dataset, retain intentional unknowns, and implement the complete experience described in the build specification. Make reasonable design and implementation decisions without stopping for routine clarification.

## Read before implementation

Read these files in the handoff folder:

1. `01_RESEARCH_REPORT.md` for the scientific explanation, editorial decisions and interpretation.
2. `02_BUILD_SPEC.md` for the layouts, storyboards, interactions and acceptance criteria.
3. `04_DATA_DICTIONARY.md` for the schema, units, relationships and missing-value conventions.
4. `data/fusion_atlas.json` for the canonical structured content.
5. `scripts/validate_data.py` for the supplied data checks.

The other JSON files in `data/` are convenience views of the same snapshot. Do not create an independently maintained second set of company facts inside UI components. Derive displayed totals and filter counts from the data.

The structured dataset governs numerical and entity fields; the report explains their meaning; the build specification governs behavior and presentation. If you encounter a conflict, retain the more explicit qualification and record the discrepancy. Never silently turn a model or target into an experimental result. A missing value is an intentional unknown unless the package identifies it as an error.

## Implementation sequence

### 1. Inspect the host and establish a runnable build

Inspect the available repository, its instructions, shared navigation, visual conventions, build commands and route structure. Preserve unrelated work. Reuse its stack and dependencies where practical. If the host repository is absent, build a self-contained static implementation using a simple frontend stack, with clear integration instructions for `/sites/fusion/`.

The first release should require no database, user account, API key or runtime language-model service. Ship the content with the build. Use stable asset paths that work under the intended subdirectory, including on refresh and direct navigation. Make the project runnable before expanding its interactions.

### 2. Build the content and citation layer

Load the canonical dataset through a small typed adapter. Preserve source IDs, claim categories, original units and currencies, approximate values, event types, date precision, location roles and nulls. Resolve each cited source to an ordinary usable link and an accessible source drawer.

Render observed experiments, component tests, inferred quantities, simulations, predecessor evidence, agreements and future targets with their correct labels. Source review is not independent verification of the underlying result. Public-research results belong to the named institution and device; company lineage does not transfer ownership of those experiments.

Run the supplied validator from the handoff root:

```bash
python3 scripts/validate_data.py
```

If you move the content into the app, keep a documented validation command for the shipped copy and maintain consistency with the canonical snapshot.

### 3. Create the editorial shell and first readable experience

Use the existing BLog Visualizations shell if available. Otherwise follow the restrained visual direction in the build specification: readable typography, generous space, clear section hierarchy and limited color. Put the snapshot date and curated scope in the opening view.

Build the main sections: introductory energy flow, light history, approach explorer, gain and results explanation, company and site landscape, remaining uncertainties, and sources/methodology. Start with useful static content, then layer interactions over it. The reader should understand the central explanation without playing an animation.

Use progressive disclosure. Keep the first reading approachable and let a reader open the detailed evidence, company comparisons, accounting assumptions and sources when interested. Put scientific qualifications next to the claims they limit; they must survive small screens and screenshots.

### 4. Implement original mechanism diagrams

Use original **SVG and CSS** for the scientific diagrams, with Canvas only where it has a clear performance or interaction benefit. Keep geometry, labels and animation states editable. Follow the supplied storyboards and company-specific configuration guards; do not substitute decorative generated images or copied company renderings.

Implement explicit stage controls, Back/Next, and Play/Pause where motion helps. Distinguish field lines, particle paths, heat and electricity through labels and visual treatment. Label conceptual diagrams “not to scale” and pulsed sequences as slowed schematics. Their display timing is not physical time.

Keep relevant variants distinct: conventional and spherical tokamaks; stellarator architectures; beam-sustained and pulsed FRCs; sheared-flow Z-pinch; mechanical magnetized-target systems; laser indirect drive; direct drive and fast ignition; pulsed-power inertial approaches; and electrostatic configurations. Use the actual record when selecting a company's diagram. Suppliers and enabling facilities need an explanatory role, not an invented reactor.

Every stage needs a matching text description. Respect reduced-motion settings by selecting a static state or using immediate transitions. No essential concept may depend on animated particles, hover or color alone.

### 5. Build gain boundaries and the calculator

Explain the accounting boundary before presenting controls. Separate fuel gain, target or plasma gain, electrical recovery, gross electricity and net electricity. Preserve the source's denominator, interval and units. Keep physical ignition distinct from target-energy breakeven and net electric output.

Implement the formulas and numerical examples supplied in the data and report. The teaching model for a continuously heated plasma is:

```text
fusion_MW = Q * delivered_heating_MW
gross_electric_MW = thermal_efficiency * captured_fraction * fusion_MW
driver_electric_MW = delivered_heating_MW / driver_efficiency
net_electric_MW = gross_electric_MW - driver_electric_MW - auxiliary_MW
```

The pulsed-target form is:

```text
fusion_MW = target_energy_MJ * target_gain * repetition_Hz
gross_electric_MW = thermal_efficiency * captured_fraction * fusion_MW
driver_electric_MW = target_energy_MJ * repetition_Hz / driver_efficiency
net_electric_MW = gross_electric_MW - driver_electric_MW - auxiliary_MW
```

These are educational accounting models with stated omissions. Inputs are coupled in real machines; a slider setting is not a claim of physical feasibility. Auxiliary demand excludes the driver already counted. Compute with unrounded values and round only for display.

Show negative output on a signed axis as net consumption. Reject zero driver efficiency. Zero capture or thermal efficiency may produce zero gross generation with valid net consumption. Undefined ratios must display as unavailable, never as infinity or a misleading zero. Do not give recovered-energy credit without including its matching input over the same complete cycle.

Keep Inertia's published assumptions in a separate **Attributed company model** tab. Use its structured inputs and checked examples. The older FAQ scenarios, newer power-accounting illustration and target simulations are separate source snapshots. A “Virtual NIF Shot” remains a simulation. An optional target-cost calculation is a partial cost component, not a levelized electricity price.

### 6. Build the landscape, map and funding views

Implement searchable, filterable entity cards and a readable table, with comparison as specified in the build document. Include the mechanism, evidence ledger, operating versus intended fuel, announced targets, locations, financing and source-linked remaining questions. Distinguish organizations from sites in filter counts.

Render headquarters, operating experiments, factories, enabling facilities and proposed plants with different roles and status labels. Use approximate coordinates at their supplied precision. Do not assign a company's future plant to its headquarters because a specific plant site is unknown. Provide a synchronized accessible site list. Use a locally shipped, attributed map outline or the host's licensed asset; the map must not depend on an API key.

Funding should default to a table. Optional charts require compatible currency and accounting-basis filters. Never add cumulative totals to their constituent rounds. Preserve commitments, grants, loans, public project budgets, valuations, cash balances and other financial types. A revised round is not two rounds. An unknown amount stays unknown. A company's capital must not be counted again for each of its map markers.

### 7. Complete history, uncertainty and source access

Keep incompatible performance metrics in separate panels. A curated shot sequence is not the complete experimental history; do not infer success rates from it. A future milestone stays a target after its date passes unless a reviewed result changes its category. Preserve date ranges and distinctions between the event date, publication date and source-review date.

Present uncertainty through the supplied evidence questions and dimension-specific assessments. Expose the rationale and relevant sources. Do not invent an overall risk score, company league table, probability of success or percentage of completion. A missing public result is not a failed experiment.

Make methodology, source search and data downloads easy to find. Support deep links to entities and useful filter states. External citations should remain ordinary links even if a richer source drawer is available.

### 8. Verify the implementation meaningfully

Run the supplied data validator and the repository's relevant build checks. Verify the calculator against the provided worked examples, including negative output and undefined denominators. Check that source links resolve from rendered claims and that filtering does not lose evidence labels or source qualifications.

Review mobile and desktop layouts, keyboard navigation, visible focus, touch interactions, text zoom, reduced motion, diagram descriptions, table fallbacks and direct-route loading. Avoid horizontal page overflow on narrow screens. Test the source drawer and map/list without hover. Verify empty states and intentional unknowns.

Use the build specification's editorial acceptance criteria as the completion gate. In particular, no NIF target gain may appear as net grid electricity; no planned plant may appear operating; no modeled gain may appear measured; and no manufacturing milestone may imply a working target factory.

### 9. Deliver a complete reviewable result

Finish the implementation and provide the source, local preview instructions, build/test results and a concise account of the main design decisions. Include representative screenshots if the environment supports them, and identify any real unresolved limitation. Leave no fake quantitative placeholders or silently invented data.

The required outcome is a working, reviewable visualization. Do not stop at a plan or a static mockup when the supplied content supports the requested interactions. Complete authorized local work before asking about any later publication step.

## Optional later refresh

A research refresh is separate from this first implementation. If explicitly requested later, update the source record first, then the affected claim and derived views, preserving historical evidence and the snapshot date. Do not introduce live-news ingestion or silently replace this curated dataset during the initial build.
