# Fusion Atlas implementation specification

## Purpose and fixed content contract

Build an interactive editorial explainer titled **The paths to fusion power** within the existing sites collection. The project name is **Fusion Atlas** and the suggested path is `/sites/fusion/`. Use the supplied research snapshot dated 22 October 2026. The implementation task is to turn the provided content and records into responsive visual explanations. No further research is needed for the initial release.

Read `01_RESEARCH_REPORT.md`, `04_DATA_DICTIONARY.md` and `data/fusion_atlas.json` before building. Treat `data/fusion_atlas.json` as the canonical content source. Individual JSON files in `data/` are convenience views of the same snapshot. Do not hardcode a second collection of facts in components. Source IDs connect records to citations and source drawers. The model examples are deliberately explicit about assumptions.

Preserve unknown values, evidence categories, event types, date precision and qualifications. A publication or financing date is not necessarily an experiment date. A field named `last_reviewed_at` means that a source was reviewed, not that the underlying company result was independently verified. Never upgrade the evidence type based on the source being official.

## Audience and visual direction

The primary reader is curious and technically comfortable but has no plasma-physics background. Provide a clear first read in five to eight minutes, with depth available on demand. The goal is recognition and understanding, not an imitation of a reactor control panel.

Use the existing host site's navigation, typography and shared shell if a repository is provided. Preserve the conventions of the mathematical-frontiers and Kurzweil projects: restrained editorial layout, explicit snapshot dates, direct links to evidence and a useful methodology section. If starting without the host repository, use a light background, dark text, one clear heading family and an ordinary readable body font. A suggested neutral palette is background `#F5F5F2`, text `#14212B`, muted text `#52616C`, magnetic family `#2167A8`, inertial family `#A2472C`, hybrid family `#7758A6`, and neutral/source lines `#89959E`. These are design choices, not scientific categories.

Use original SVG or Canvas diagrams. Scientific schematics need exact labels and editable geometry. Do not use generated raster art to explain fields, reactions or accounting. Do not copy company renderings into the site without a separate rights decision. Logos are unnecessary; the company name and mechanism thumbnail are sufficient.

Family colors must stay consistent across diagrams, filters, cards and map markers. Evidence type needs a separate encoding: solid marker for an experimental observation, outlined marker for a model, dashed marker for a target, and a neutral symbol for unavailable data. Pair every encoding with words. A color alone must never carry the distinction between measured and planned.

## Information architecture

| Section | Reader learns | Main interaction | Default content |
| --- | --- | --- | --- |
| Introduction | The difference between a reaction and an integrated power plant | Step through an energy path | D-T reaction and thermal conversion |
| Brief history | Which questions successive experiments answered | Select a dated milestone | Six to eight key events, expandable |
| Approaches | Why machines have different shapes and tradeoffs | Switch mechanism, scrub stages, compare two | Tokamak, stellarator and laser indirect drive |
| Reading the results | How gain and records should be interpreted | Change accounting boundary; adjust toy model | NIF, ITER, electrical recovery |
| Landscape | Who is building what and where | Filter, map/list, compare up to three | Curated developers, with public/supplier layers optional |
| What remains | Which evidence would reduce the uncertainties | Select a risk theme | Six-theme overview, details on demand |
| Sources and methodology | Where facts and judgments come from | Search sources and download data | Snapshot, scope and definitions |

A compact local navigation can use Learn, Approaches, Results, Landscape and Sources. Keep the first screen legible without animation. The default hero should show a simple annotated machine or energy flow with a visible “Explore the approaches” button. Do not make the funding total the main headline.

## Interaction contracts

### Introductory reaction and energy flow

Create a six-step scene with explicit Back, Next and Play/Pause controls. Scroll may select a scene, but every scene must work through ordinary buttons and keyboard input. The selected step remains readable when motion is disabled.

1. **Fuel:** one deuterium nucleus and one tritium nucleus, with correct proton/neutron counts. Copy: “Many fusion projects use deuterium and tritium, two forms of hydrogen.”
2. **Conditions:** particles sit in a schematic plasma; reveal temperature, density and heat retention as three requirements. Copy: “The fuel must react often enough before energy escapes.”
3. **Reaction:** one helium nucleus and one neutron leave the collision. Show 3.5 MeV and 14.1 MeV, with a 17.6 MeV total. The animation is schematic, not an orbit or cross-section simulation.
4. **Blanket:** neutrons enter a blanket while charged helium can heat the plasma. Copy: “A D-T plant must capture neutron energy and replenish its tritium fuel.”
5. **Conversion:** heat moves to a turbine/generator; a thermal loss branch stays visible. Copy: “Only part of the captured heat becomes electricity.”
6. **Plant boundary:** reveal electricity returning to plant systems and the remainder available for export. Copy: “A useful plant must generate more electricity than all of its systems consume.”

Draw field lines as paths, particle tracks as distinct dashed trails, heat as labelled flow arrows and electricity as a separate color/style. Never depict magnetic fields bending the neutron trajectory. Do not animate a closed fuel cycle with a green “solved” checkmark; it is a requirement of the proposed plant.

The 80% neutron / 20% alpha split describes the initial reaction-energy partition, not the efficiency of electricity generation. Charged-product energy first heats the plasma and can subsequently leave through exhaust and radiation. Keep the assumed heat-capture fraction and heat-to-electric efficiency as separate stages rather than silently discarding or double-counting that energy.

### Mechanism explorer

Each approach has a common layout: name and plain-language mechanism; diagram with stage controls; “What this could simplify”; “What still needs to be demonstrated”; linked experiments and companies; sources. Use the source-backed mechanism and explicit interpretation from `approaches.json`.

Provide a family selector and an advanced “Show all configurations” list. Spherical tokamaks are a tokamak variant; HTS is a technology attribute. FRC variants need separate steps. Suppliers and public materials facilities do not receive invented reactor diagrams.

The default comparison is two approaches side by side at desktop width. On mobile use a labelled swap control or two stacked diagrams; never compress labels until they become unreadable. The scale of every schematic is explicitly “not to scale.” A shared visual footprint is for comparison of mechanisms, not physical reactor dimensions.

### Detailed diagram storyboard

| Approach | Geometry and sequence | Visible components | Scientific constraint |
| --- | --- | --- | --- |
| Tokamak | Torus; energize external coils; induce or drive plasma current; reveal helical field; show heating and exhaust | Plasma, toroidal coils, solenoid, poloidal field contribution, divertor, blanket | A field line is not a rigid wall or an electron orbit; current drive and external fields both matter |
| Spherical tokamak | Same sequence with tight central hole and elongated cross-section | Compact central column, shielding/magnet space, exhaust | Do not claim size alone proves better economics |
| Stellarator | Reveal external magnets; field lines wind around a three-dimensional plasma; add sustained heating | Modular coils or the selected design's planar-coil architecture, plasma surface, exhaust, blanket | Three-dimensional field shaping does not require every coil to be nonplanar; do not impose W7-X geometry on every company |
| Mirror | Long chamber; increase field at both throats; heat plasma; show end-loss particles and possible recovery | End magnets, central plasma, injectors, collectors | Some particles escape; loss reduction and recovery are different tasks |
| Levitated dipole | Float ring in chamber; draw dipole field; plasma surrounds ring; show ring protection | Internal superconducting ring, external support/levitation, shielding, chamber | Magnet is inside the chamber; proposed plant protection is not a demonstrated reactor lifetime |
| Beam-sustained FRC | Form compact FRC; add neutral beams; sustain population and field configuration | FRC separatrix, beam injectors, end regions | Do not reuse the pulsed colliding-plasma animation as the steady mechanism |
| Pulsed FRC | Form two configurations; accelerate/merge; compress; expand and recover; reset | Formation sections, coils, capacitor banks, recovery path | Draw recovered input and fusion contribution as separate annotations |
| Sheared-flow Z-pinch | Establish axial flow and current; show azimuthal magnetic field; pinch; reset | Electrodes, current path, axial velocity variation, plasma | Sheared flow is a stabilization technique, not a generic claim that instabilities are eliminated |
| Magnetized target | Form magnetized plasma; inject into compression chamber; liner moves inward; capture heat; reset | Plasma injector, liner or liquid metal, compression actuator | LM26 test geometry and future commercial geometry require distinct labels |
| Indirect-drive laser | Inject target; lasers heat hohlraum; X-rays ablate/compress capsule; fusion pulse; clear chamber | Laser ports, hohlraum, capsule, blanket, target injector | Do not show lasers hitting the fuel directly in this mode |
| Direct-drive laser | Target injection; symmetric illumination; ablation/compression; optional separate fast-ignition stage; clear chamber | Driver, capsule, optional ignition beam, optics and chamber | Fast ignition is an explicitly selected variant; rep-rate tests are not ignition tests |
| Hybrid direct-drive laser | Initial hohlraum X-ray stage; later direct laser drive; compression and proposed burn | Hohlraum, capsule, two-sided laser access | Xcimer design; not fast ignition or ordinary NIF indirect drive |
| Hybrid fast ignition | Electrical multi-shell compression; separate rapid ignition; proposed heat capture | Fuel-system module, compression driver, ignition stage, partner interfaces | First Light FLARE; do not invent MagLIF premagnetization or reuse its old projectile roadmap |
| Pulsed-power inertial | Charge modules; deliver current; compress target/liner; fusion pulse; replace/reset | Capacitors, transmission lines, liner, fuel, optional preheat | Use generic architecture only; Pacific, Fuse and MagLIF details differ |
| Electrostatic compact | Apply fields; accelerate/confine ions; show intended collision region | Electrodes/fields, ions, magnetic assistance where specified | Schematic is conceptual; small size is not evidence of net gain |

Apply company-specific configuration guards when selecting these storyboards. First Light's FLARE needs separate compression and ignition stages and its current fuel-system/partnered-reactor role; do not automatically depict it as the old projectile concept or ordinary direct-drive laser fusion. Marvel's current near-term fuel is D-T. HB11 belongs with laser proton–boron fast ignition, not electrostatic confinement. Fuse's existing neutron-testing device and proposed MagLIF energy concept require separate labels and evidence records. [ALT_FIRSTLIGHT_TECH](https://firstlightfusion.com/technology/) [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology) [ALT_HB11_TECH](https://hb11.energy/our-technology/) [ALT_FUSE_TEST](https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign) [ALT_FUSE_CONCEPT](https://www.f.energy/apeiron-i-fusion-energy-plant)

Xcimer uses the hybrid direct-drive storyboard. EX-Fusion uses the direct-drive fast-ignition variant described in its Japanese technology page. [PAR_XCIMER_HDD](https://pubs.aip.org/aip/pop/article/31/11/112708/3322685/Hybrid-direct-drive-with-a-two-sided-ultraviolet) [PAR_EXFUSION_TECH](https://ex-fusion.com/technology/knowledge)

Frame timings are presentational. A 500 ms animation does not represent a physical pulse duration. Label “slowed schematic” on pulsed scenes. Hovering a component should expose one sentence and an optional definition; clicking opens the fuller explanation. Never require hover on a touch screen.

### Gain boundaries and calculator

Implement the gain definitions before the sliders. The boundary selector highlights one of: fuel, target/plasma, conversion subsystem, whole plant. A source badge states exactly what each example measures. Include the NIF and ITER anchor examples and the fictional electrical-recovery example from the report.

Keep physical ignition separate from target-energy breakeven: the NIF timeline has an August 2021 physical-ignition result and a December 2022 target-gain-above-one result. The current NIF panel must also distinguish the 7 April 2025 listed maximum from the 20 June 2026 latest listed ignition. Show source-reported uncertainty when supplied; do not derive a statistical success rate from the count of ignition experiments.

For the toy calculator, put a persistent **Illustrative assumptions** label above controls. Use separate modes for a continuously heated plasma and a pulsed target. Read formula definitions and default values from `power_balance.json`. Render net output on a signed axis centered on zero, with gross generation and plant consumption separately labelled. A negative value should say “Net consumption.” A zero should say “Electrical break-even in this simplified model.”

Suggested input ranges are presentational and must not imply physical feasibility: Q or gain 0–100; heating 1–200 MW; delivered target energy 0.1–20 MJ; rate 0.1–20 Hz; driver efficiency 1–100%; thermal efficiency 10–60%; captured fraction 0–100%; auxiliary demand 0–500 MW. Advanced inputs can allow zero for edge-case demonstrations with proper guards. No division by zero or infinity should reach the display.

The auxiliary load excludes the driver demand already counted in the formula. In pulsed mode, driver demand is delivered target energy × repetition rate / driver efficiency, without multiplying by target gain. Reject zero driver efficiency; allow zero capture or zero thermal efficiency to produce zero gross output and the corresponding net consumption. A ratio or breakeven threshold with a zero denominator is unavailable even when net power itself remains well defined. Do not give recovered input-energy credit unless the matching supplied energy is included in the same complete-cycle boundary.

Do not portray zero external heating on a finite-Q slider as a model of ignition. A plasma with finite fusion power and zero external heating has no finite fusion-to-external-heating ratio; that limit requires a different physical model.

Provide Reset and Copy scenario link. Round displayed power to an appropriate precision, but compute from unrounded values. Put “These inputs are coupled in real machines” next to the controls. This is a bookkeeping demonstration, not a plasma simulator.

If showing Inertia's published roadmap accounting, place it in an **Attributed company model** tab. Use the explicit input assumptions and source snapshot in the company record. Do not silently use those values as the general default, and do not merge the older FAQ scenarios with the newer roadmap or target-design simulations. A “Virtual NIF Shot” is a simulation label.

### Records and history

Provide a metric selector with only compatible records in each panel. NIF target gain can form a shot series or a best-record step series; label the selected mode. A record-history line uses a running maximum of comparable measured shots. It does not connect future targets or substitute paper publication dates for experiment dates.

The supplied results are a curated selection, not every attempted shot. Label the chronological view “Selected published shots.” A running maximum is “Best gain among included shots” unless the included points have been checked against the complete published record progression. Do not interpolate shot success rates or imply that every omitted experiment succeeded.

Duration records use separate lanes for the stated regime. A long H-mode discharge, a high-temperature phase and a general plasma discharge should not share an unqualified “world record” line. JET's total fusion energy belongs in MJ; ITER's planned fusion power belongs in MW; proposed electricity uses MWe or explicitly labelled grid MW. Do not convert an energy result into average power unless the duration and interval support it.

The historical timeline can mix event types because it does not imply a numerical performance scale. Each event has a type label and date precision. Separate future targets into a dashed “Announced plans” lane to the right of the snapshot divider. A planned 2030s event should occupy a range, not a fabricated date on January 1.

### Landscape table and entity cards

Default filters: confinement family, intended fuel, country, entity role and evidence type. Search should match names, device names and places. A filter count must state whether it counts organizations or sites. Selecting a public laboratory should explain its research role rather than making it compete for a startup funding rank.

Compact row fields: organization, approach, intended fuel, latest included evidence, announced target, funding display with date, primary location and sources. On mobile show an accessible card/list instead of a horizontally truncated twelve-column table. Keep data downloads available without a filter-dependent surprise.

Expanded card sections:

- How it works, with the mechanism diagram or a link to it.
- Evidence ledger, with each item's category and source.
- Current experimental fuel and intended commercial fuel.
- Company targets, retaining their original scope and date precision.
- Locations, with separate roles and approximate positions.
- Financing, with each event's basis and conditions.
- Remaining questions, with editorial interpretation clearly labelled.

Allow comparison of up to three organizations. Require choosing either an evidence view or a funding view rather than automatically ranking them. The evidence view compares the six themes; the funding view preserves financing categories. An absent value stays “Not established in this record.”

Do not repeat a simulated target in the “Measured” section merely because it originally appeared in an input packet's `demonstrated` list. The normalized `claims` array and its `category` field govern rendering.

### Map

Use a simple geographic map or globe-free projection. One marker represents one location record. Shapes: circle for headquarters/company office; square for experimental facility; outlined diamond for announced power plant; hexagon for enabling, fuel-cycle or materials infrastructure. Use status outlines for operating, construction and planned. Unknown status remains unknown.

Coordinates are approximate city or area centers. Round to two decimals for display, use a modest maximum zoom, and label “Approximate location.” Do not offer turn-by-turn directions or imply exact plant boundaries. Multiple organizations or facilities in a city should cluster; selecting a cluster opens a list. The organization can have more than one marker. Its funding must not be counted once per marker.

Ship a local, attributed low-resolution world outline or use the host's existing licensed map asset. Include the attribution with the source file. The first release must work without an API key. The map must have a synchronized, keyboard-accessible list so it remains usable when WebGL, JavaScript or external tiles are unavailable.

### Financing

The authoritative financing object is an observation, not a transaction ledger with guaranteed cash disbursement. Render `amount`, original `currency`, `event_type`, `announcement_date`, amount qualifier, inclusion notes and source together. `amount_usd` is usable only when the source explicitly reports it, and should retain its approximate basis.

Never sum `cumulative_total` records with rounds, grants or other cumulative totals. A Series G announced at one size and later closed at another is one financing event with a revision, not two new rounds. A public programme allocation that includes a partner contract cannot be added to that same contract to create a sector total. A public cooperation-project budget is not necessarily money on one company's balance sheet.

Default to a table. For an optional chart, require both a currency and a funding-basis filter. Keep recent-round amounts and cumulative totals in separate panels. Commitments and debt are distinct from stated equity. Give valuations and commercial power contracts their own optional panels or leave them as context. Do not infer investor returns, cash runway or success from funding.

### Risk view

Use a matrix of evidence questions with a source-linked explanation. No composite risk number, probability of success, traffic-light verdict on a company, or radial score chart. Selecting a theme explains what evidence would reduce the uncertainty. For a company, show its specific claims and editorial assessment under the theme.

An interpretive label should read “Assessment” and include an `assessment_basis` or rationale. Do not label a row “independently verified” unless the record specifically establishes that. Relevant experiment, subsystem demonstration, model, target and insufficient public evidence are distinct classes. “Not applicable” is available only for a particular requirement; it is never a substitute for missing evidence.

## Data and component architecture

Suggested components: `SnapshotHeader`, `ReactionStepper`, `EnergyBoundaryExplorer`, `ApproachSelector`, `MechanismDiagram`, `RecordChart`, `HistoryTimeline`, `EntityExplorer`, `EntityDetail`, `ComparisonTray`, `SiteMap`, `FundingTable`, `RiskQuestions`, `SourceDrawer`, `Methodology` and `DataDownload`. These are implementation suggestions, not required library choices.

Use stable IDs in URLs. Example state: `?approach=stellarator&compare=cfs,proxima&tab=evidence`. Deep links should restore a readable state and source drawers must have ordinary URL anchors. Filter state can stay in the URL; there is no need for user accounts, a backend database or remote tracking.

Prefer the current repository's stack. If none is available, a static TypeScript frontend or vanilla HTML/CSS/JS implementation is sufficient. The dataset should ship with the build. Do not add a live-news ingestion service or a language-model runtime. Citations can open external pages; core explanations and filters should work offline after local assets load.

Keep numerical units in the data and labels. Do not store a formatted `$1B` string as the only quantitative representation. Preserve original source wording where its qualifier matters, but use the curated concise display text for rows.

## Accessibility and performance

All interactive controls require visible labels, keyboard operation, focus indication and sensible reading order. All diagrams need a short description and a longer text explanation matching the selected stage. Provide native tables for numerical charts and source lists. Respect `prefers-reduced-motion`; no motion is required to receive the explanation. Avoid flashing particle effects.

At a 390 px viewport, the narrative and primary controls must fit without horizontal page scrolling. At desktop width, the approach diagram and explanation can occupy two columns. The comparison tray must not cover the source link or reading controls. Text must remain legible at 200% zoom. Tooltips should never be the only place a scientific qualification appears.

Load the explainer and content first. Lazy-load the map and advanced comparison views. Avoid a large 3D engine for a small schematic. Static SVG with controlled animation will be easier to understand, inspect and maintain.

## Editorial acceptance criteria

The initial build is acceptable only if all of the following are true:

1. NIF target gain never appears as net plant electricity.
2. ITER's 500 MW is always identified as planned fusion power, and ITER is never shown as an electricity generator.
3. Helion Polaris is not labelled as an already demonstrated net-electric machine.
4. Realta's recovered input-power demonstration is not labelled as large-scale fusion-born or net electricity.
5. Inertia models and manufacturing results remain distinct from experimentally demonstrated target gain and a working target factory.
6. A commercial target never turns into an achievement merely because its date is earlier than the current date.
7. Operating fuel and intended commercial fuel remain distinguishable.
8. Cumulative financing is not added to rounds; conditional commitments, loans, public budgets and valuations keep their types.
9. Unknown values remain null or explicitly unknown; they do not render as zero.
10. HQ and planned plant sites use different roles and marker shapes; approximate locations are labelled.
11. Every quantitative or project-specific assertion in a card has a traceable source.
12. Company and programme targets retain date precision; “early 2030s” is not an exact year.
13. WEST heating energy is not charted as fusion yield; KSTAR regimes remain separate.
14. A simulation or peer-reviewed design is not automatically labelled an experiment.
15. Negative net output and undefined ratios display correctly in the calculator.
16. Sources, data and methodology are accessible on mobile and with the keyboard.
17. The snapshot date and curated scope are visible without opening a modal.
18. The page supplies useful content before any interactive control is used.

## Delivery sequence

First implement the data loader and citation system, then the short introduction and three core diagrams. Add all approach variants through the shared diagram interface. Implement the gain explainer and the three worked accounting examples. Then add entity cards, comparison, the funding table and map. Finish with the risk questions, timeline, accessible fallback tables and data downloads.

Run `python3 scripts/validate_data.py` against the handoff before implementation and after any data changes. Use the model's supplied numerical examples to verify the calculator. Inspect the completed page on mobile and desktop. Report any unresolved data qualification faithfully; do not remove a qualification to make a layout cleaner.

The research is already supplied. If a field is missing, the intended initial behavior is to display the specified unknown state. The implementation should be complete and reviewable before any publishing step. Do not publish to a live site until the user authorizes publication in the implementation session.
