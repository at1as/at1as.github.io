# Fusion Atlas — research and Codex handoff

This package is a comprehensive research and implementation handoff for **The paths to fusion power**, an interactive explainer proposed for the **BLog Visualizations** collection at `jasonwillems.com/sites/`.

It supplies the explanation, company and public-project records, mechanisms, financial observations, locations, evidence distinctions, source links, illustrative calculations and build requirements. The website is a later implementation task. The package does not itself create or publish a site.

The research snapshot is **22 October 2026, America/Los_Angeles**. Use the metadata in the canonical dataset for the displayed snapshot and the source register for individual publication and review dates. The collection is curated across important approaches and comparison cases; it is not a census or an investment ranking.

## Start here

For reading, open `01_RESEARCH_REPORT.md` or the included PDF edition of the research report. The report explains the physics, the important distinctions behind gain claims, the comparison framework and the practical implications for the visualization.

For building, give Codex this entire folder, plus the existing website repository if available, and use `03_CODEX_PROMPT.md`. Codex should read the report, build specification, dictionary and canonical dataset before implementation. No further research is required for the initial version; unresolved values already have intentional unknown states.

The proposed route is `/sites/fusion/`, subject to the host repository's conventions. The expected implementation deliverable is complete source and a working local preview. Live publication is a separate authorization in the implementation session.

## Package guide

| File or folder | Purpose |
| --- | --- |
| `01_RESEARCH_REPORT.md` | Scientific and editorial narrative, interpretations, examples and source references |
| `02_BUILD_SPEC.md` | Visual storyboards, layouts, interaction contracts, accessibility requirements and acceptance criteria |
| `03_CODEX_PROMPT.md` | Ready-to-use implementation instructions with a concrete delivery sequence |
| `04_DATA_DICTIONARY.md` | Field definitions, units, relationships, evidence categories and missing-value rules |
| `data/fusion_atlas.json` | Canonical structured snapshot for the application |
| Other JSON files in `data/` | Convenience views of the canonical snapshot for particular components |
| `schema/types.ts` | TypeScript data contracts for the implementation |
| `manifest.json` | File checksums, snapshot counts and validation summary |
| `scripts/validate_data.py` | Checks for the handoff's structural and numerical consistency |
| `Fusion_Atlas_Research_and_Codex_Handoff.pdf` | Portable reading and review edition; the Markdown and JSON remain the implementation sources |

Keep the folder together. Source IDs join narrative claims and structured records to the source register. Convenience JSON views should not become competing manually edited datasets.

## What is ready for Codex

The handoff supplies content for a short introductory explanation and a deeper explorer. The build specification describes original mechanism diagrams, an energy-accounting interactive, a selected history and results view, company cards, a site map and list, funding comparisons, dimension-specific uncertainty explanations, and source access.

Codex should spend its effort on clear diagrams, responsive layout, controls, accessible alternatives and reliable data presentation. It should not invent company descriptions, fill gaps with guesses, derive probabilities of success, or independently reinterpret financial headlines to make every chart complete.

The intended visual language uses editable SVG/CSS diagrams and restrained charting. Original schematics avoid the need to reuse company artwork. Scientific diagrams must preserve the mechanism and the accounting boundary; an attractive image is not a substitute for correct labels.

## How to interpret the data

**Evidence types matter.** An experiment, a component test, an inference, a simulation, predecessor research, an agreement and a future target are different records. A peer-reviewed design may substantiate a model without demonstrating a built machine. Reviewing an official source establishes what that source reports; it does not automatically independently verify the underlying result.

**Gain needs a denominator.** Target or plasma gain is not net electricity. Recovered electrical energy is not necessarily fusion-born energy. A temperature, pressure, laser-power or pulse-duration milestone cannot substitute for a whole-plant power balance. The calculator explains accounting assumptions and does not predict plasma behavior or commercial success.

**Financing needs a basis.** A round, a cumulative total, a conditional commitment, a grant, a loan, a public cooperation-project budget, a valuation and a cash balance must keep their types. Do not add cumulative totals to earlier rounds. Original currency and disclosure date remain part of the observation; unknown funding is not zero.

**Places need roles.** Company headquarters, research devices, factories, partner facilities and announced plants are separate locations. Coordinates are approximate city or area positions, not surveyed facility boundaries. A company's funding should not be counted again at every facility.

**Uncertainty needs explanation.** The packet offers source-linked questions and assessments by dimension. It deliberately does not supply a composite risk ranking, percentage of completion or calibrated success probability. Missing public evidence is an information gap, not a recorded failure.

## Validate the handoff

From the `fusion_atlas_codex_handoff` folder, run:

```bash
python3 scripts/validate_data.py
```

Use the data dictionary to interpret any reported issue. Run the validator before implementation and after any factual data edits. The implementation should also verify the supplied calculator examples and the editorial acceptance criteria in `02_BUILD_SPEC.md`.

Data validation is separate from scientific verification. Passing a schema check does not turn a company assertion into an independently established fact. The same distinction applies to a successful website build: the app must retain each claim's provenance and qualification.

## Remaining limits are intentional

Private-company disclosures are uneven. Some pages lack publication dates, some cumulative financial totals mix categories, some plant sites are unspecified, and some claimed gain boundaries are incomplete. The records preserve those limits rather than manufacturing uniformity.

A roadmap is attributed to its publisher. The passage of time does not automatically make a planned milestone achieved or failed. Publication dates, experimental dates and source-review dates remain distinct. Conflicting source vintages should remain inspectable where they affect interpretation.

The package includes source references rather than a complete reproduction of every underlying publication. Source links support review; the curated explanation and structured data support the first build without additional research.

## Optional future updates

Refresh the content when explicitly requested or when a material new result warrants an editorial update. Examples include a measured gain or conversion result, a changed fuel or architecture, a revised financing close, a new facility status, or a changed programme target.

Update the source record, then the claim, then any derived view. Preserve earlier evidence and source versions where they explain a change. Recalculate affected examples, rerun validation and update the snapshot metadata. A refresh should improve the evidence trail, not silently replace qualifications with stronger language.

The first implementation can proceed from this package as supplied. Its completion standard is a readable, source-transparent, accessible visualization that keeps observed results, modeled possibilities and announced plans distinguishable throughout.
