# The frontiers of mathematics

Standalone static explorer at `/sites/math-frontiers/`, hosted by this repository’s Jekyll/GitHub Pages workflow. No application framework, build dependencies, CDN assets, or runtime API calls. Source of truth lives here.

## Edit and verify

- `data.json`: curated milestones, sources, evidence status, dates, explanatory text, and optional AI attribution.
- `_template.html`: page structure and metadata.
- `styles.css`, `explorer.js`, `model.js`, `view.js`: responsive presentation, interactions, and shared chart calculations.
- `index.html`: generated HTML with the initial explorer and all source tables available without JavaScript. `_render.cjs` uses the shared `view.js` functions at build time so the first paint reserves the same space as the interactive chart. Node.js is needed for generation; no npm packages are required.

From the repository root:

```sh
python3 sites/math-frontiers/_generate.py
node sites/math-frontiers/_test.cjs
JEKYLL_ENV=production bundle exec ruby -E UTF-8 -S jekyll build
make check-seo
```

Preview with `make serve`, then visit `/sites/math-frontiers/`. Direct links select a story, for example `/sites/math-frontiers/#matrix`. The downloaded JSON includes all milestones regardless of UI filters.

Chart markers, overview dots, milestone cards, and Hadamard cells show their values on hover without changing the selected result. Chart markers and the order buttons also show this information on keyboard focus; Enter or Space selects a chart marker. Escape dismisses a tooltip. Matrix bounds retain every recorded decimal place in the tooltip and cards.

**Highlight AI contributions** defaults to on. A visitor’s explicit on/off choice is saved in local storage under `math-frontiers:highlight-ai` and restored before the first render on subsequent visits. If storage is unavailable, the toggle still works for the current page. AI contributions are drawn as a purple outer ring around the evidence-colored marker so published (green), preprint/report (amber), and Lean-verified (blue) statuses remain distinct.

The header’s `Updated YYYY-MM-DD` label comes from `data.json`’s `updated` field. Set it when content changes; rebuilding alone must not advance it. `reviewed` records the collection’s source-review cutoff. An individual problem can record a later review. The header’s **More from Jason** link uses the production homepage, matching the other subsites.

The Riemann hypothesis card contains the critical-line proportion timeline and a zero-free-region diagram. Arrow keys, Home, and End switch its tabs. The region controls compare the 11/12 and 7/8 preprints with the full Riemann Hypothesis proof announced on November 20, 2026. The Lean and Mathlib communities certified the proof on November 21. Full RH places all nontrivial zeros on the critical line, a strip of width zero at β = ½, so the proportion timeline steps to 100% on the announcement date and the overview card headlines `100%` and `β = ½`. The proof appears in both views and stays visible when preprints are excluded. Both views retain their earlier milestones, with sources in the static tables and JSON download.

Matrix multiplication is modeled as a two-sided range between the lower bound (floor) and upper bound (ceiling) on the exponent ω. Through October 2026, upper bounds descended from log₂ 7 (1969) to 2.371339 (2024 published), 2.371177 (August 2026 preprint), and 2.25 (9/4, October 2026 preprint) against the trivial floor of 2. OpenAI’s November 24, 2026 preprint reports a matching lower bound ω ≥ 9/4 in formal arithmetic circuits, closing the band at 2.25 while peer review and full formalization remain ongoing. The plateau zoom focuses on the 2014–2026 laser-method cluster (`2.371–2.373`) and automatically returns to full range if a milestone outside that window is selected.

## Editorial conventions

This is a selected, source-checked history. The collection review dates to October 20, 2026; Riemann was reviewed on November 21 and matrix multiplication on November 26. Preserve source URLs and evidence labels when updating values.

Charts use real calendar positions and step changes, never interpolated bounds. The slider advances through selected milestones, not uniformly spaced years. `published` and `construction` reflect publication status at review, even when the plotted date is an earlier preprint. The odd-perfect-number series explicitly uses publication years, plus a dated 2014 unpublished presentation. A manuscript date is not a priority judgment.

Recent reports can be excluded globally, and problem takeaways and footnotes adapt so hidden preprints are not cited as plotted. AI annotations concern a specific documented contribution, not all computation. The 186 prime-gap preprint has conditional Lean formalization; the 67.25% critical-line proportion is not a percentage of RH solved; the November 24 matrix lower-bound preprint remains an unrefereed preprint whose per-size gate bound is unformalized. The 10^2200 odd-perfect-number extension stays outside the timeline because its announcement date was not verified. Hadamard’s 2026 cells mark reported constructions; this project has not checked all the matrices.

The source tables and narrative retain these qualifications. Do not replace them with a generic percentage-complete score, extrapolated solution date, or an implication that finite verification settles an infinite conjecture.
