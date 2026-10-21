# The frontiers of mathematics

Standalone static explorer at `/sites/math-frontiers/`, hosted by this repository’s Jekyll/GitHub Pages workflow. No application framework, build dependencies, CDN assets, or runtime API calls. Source of truth lives here.

## Edit and verify

- `data.json`: curated milestones, sources, evidence status, dates, explanatory text, and optional AI attribution.
- `_template.html`: page structure and metadata.
- `styles.css`, `explorer.js`, `model.js`: responsive presentation, interactions, and shared chart calculations.
- `index.html`: generated HTML with all source tables available without JavaScript.

From the repository root:

```sh
python3 sites/math-frontiers/_generate.py
node sites/math-frontiers/_test.cjs
JEKYLL_ENV=production bundle exec ruby -E UTF-8 -S jekyll build
make check-seo
```

Preview with `make serve`, then visit `/sites/math-frontiers/`. Direct links select a story, for example `/sites/math-frontiers/#ramsey`. The downloaded JSON includes all milestones regardless of UI filters.

Chart markers, overview dots, milestone cards, and Hadamard cells show their values on hover without changing the selected result. Chart markers and the order buttons also show this information on keyboard focus; Enter or Space selects a chart marker. Escape dismisses a tooltip. Matrix bounds retain every recorded decimal place in the tooltip.

The header’s `Updated YYYY-MM-DD` label comes from `data.json`’s `updated` field. Set it when content changes; rebuilding alone must not advance it. `reviewed` separately records the source-review cutoff. The header’s **More from Jason** link uses the production homepage, matching the other subsites.

The six overview cards group mathematical problems. The Riemann hypothesis card contains two views: the critical-line proportion timeline and a zero-free-region diagram. Arrow keys, Home, and End switch its tabs. The region controls compare 11/12, 7/8, and full RH by strength, not chronology. Limits are stored as integer fractions in `zeroFreeRegions`; their symmetric left boundaries are derived from those fractions. The diagram depicts permitted locations at every height, without inventing individual zeros. Every boundary has a hover/focus label. Full RH is always labeled as an unproved conjecture. Excluding preprints disables the two reported region bounds and leaves RH only as a conjectured reference. Region sources also appear in the static source tables and JSON download.

## Editorial conventions

This is a selected, source-checked history, not an exhaustive live record tracker. The review date is October 20, 2026. Mathematical validity is not independently certified by this project. Preserve source URLs and evidence labels when updating values.

Charts use real calendar positions and step changes, never interpolated bounds. The slider advances through selected milestones, not uniformly spaced years. `published` and `construction` reflect publication status at review, even when the plotted date is an earlier preprint. The odd-perfect-number series explicitly uses publication years, plus a dated 2014 unpublished presentation. A manuscript date is not a priority judgment.

Recent reports can be excluded globally. AI annotations concern a specific documented contribution, not all computation. The 186 prime-gap preprint has conditional Lean formalization; the 67.25% critical-line proportion is not a percentage of RH solved. The 10^2200 odd-perfect-number extension stays outside the timeline because its announcement date was not verified. Hadamard’s 2026 cells mark reported constructions; this project has not checked all the matrices.

The source tables and narrative retain these qualifications. Do not replace them with a generic percentage-complete score, extrapolated solution date, or an implication that finite verification settles an infinite conjecture.
