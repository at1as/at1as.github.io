# Erdős problems Sankey and history

Subsite at `/sites/erdos/`, published by the repository's existing Jekyll / GitHub Pages workflow. It includes a compact date slider, date picker, play/pause, and 1× / 2× / 4× / 8× / 16× playback. Every selection updates the diagram, title, attribute cards, text table, source revision, and SVG download. In the table, problem counts show their percentage of all problems; Lean columns show their percentage within that status. Percentages are rounded to one decimal place; an empty status has no within-status percentage.

[D3 Sankey](https://github.com/d3/d3-sankey) computes all layouts at generation time using one shared count-to-pixel scale. Browser JavaScript animates those precomputed layouts. All assets and historical data are served locally; no CDN, live GitHub requests, API credentials, or server is needed in production. Without JavaScript, the latest diagram, cards, table, and SVG download remain available.

## Update the data

Requirements: Git, Node.js, Python 3, and PyYAML. Install generator/test dependencies once, from the repository root (use a Python virtual environment if needed):

```sh
python3 -m pip install -r sites/erdos/_requirements.txt
npm ci --ignore-scripts --prefix sites/erdos/_chart
```

Refresh all historical snapshots and the latest page together:

```sh
python3 sites/erdos/_generate.py --refresh
```

The first run clones the public upstream repository into the ignored `sites/erdos/_cache/upstream.git`; subsequent runs fetch new history. It reads data only and never executes upstream scripts. Review and publish the generated files through the normal GitHub Pages workflow. No scheduled task is enabled.

To rebuild from the saved history without network access:

```sh
python3 sites/erdos/_generate.py
```

To import from an existing local bare clone:

```sh
python3 sites/erdos/_generate.py --history-repo /path/to/erdosproblems.git
```

`history.json`, `snapshot.json`, `index.html`, and `diagram.svg` are generated. Edit `_template.html` and `styles.css` for the page, `timeline.js` for the controls, `_history.py` for extraction, and `_chart/render.cjs` for D3 configuration. Jekyll ignores the underscore-prefixed tools and dependency directory. Git ignores cached upstream data and `node_modules`.

## Model release annotations

`model-releases.json` contains a curated selection of public Claude releases and OpenAI API releases, each with an official source. Dates are verified as of September 9, 2026. Fable 5 uses its initial June 9 launch date; its annotation also links the subsequent access interruption and July 1 return. These markers provide context and do not attribute problem solutions to any model.

Hover or keyboard-focus a marker for its model and date; select it to pause playback and show the first recorded snapshot on or after release. If there is a gap, the annotation identifies the actual snapshot shown. During playback, the annotation follows the latest listed release on or before the selected snapshot. Nearby hit targets alternate below and above the slider, with stems connecting each marker to its exact position on the axis. Drag the slider, use its native keyboard controls, or choose a date from the picker to navigate.

Because the slider steps through recorded snapshots, marker positions interpolate between the surrounding snapshot indices, rather than treating the whole slider as a uniform calendar scale. Releases outside the saved history are omitted. To add or correct a release, edit `model-releases.json`, include an official date source, and rerun `_generate.py`; the list is embedded in the page, with no extra network request at runtime.

## Source consistency and historical coverage

The source is always [`teorth/erdosproblems`](https://github.com/teorth/erdosproblems). History is reconstructed from `data/problems.yaml` along the `main` branch's first-parent history. Each slider step is the latest valid data revision on a recorded UTC date, with an immutable commit URL and its timestamp. The slider advances through **recorded snapshots**, not uniformly spaced calendar days. It does not invent values for missing dates. Playback interpolates chart geometry between snapshots; displayed counts remain actual recorded integers.

Coverage begins **September 3, 2025**, after the initial import and broad “solved” category were replaced by the more detailed status categories. The preceding two days also contain the invalid status `solprovedved`. As of September 9, 2026, 256 usable dates are included. The number of database entries changes over time, so changes reflect additions and corrections as well as mathematical progress.

Counting follows the current upstream `scripts/generate_readme.py` and `primitive_states` logic from `scripts/derive_status.py`:

- Prefer `informal_status.state` and `formal_status.state`; fall back to splitting historical combined states such as `proved (Lean)`.
- Keep proved, disproved, otherwise solved, and the seven unresolved categories separate. In particular, **independent is not added to otherwise solved**. The upstream `statistics_history.csv` uses a different grouping and lacks some required breakdowns, so it is not used.
- Count Lean solutions by formal status; statement formalization by `formalized.state == yes`. Lean solutions outside the resolved categories remain visible as an overlapping attribute.
- Use the same prize, OEIS, comment, multiplicity, and A387000 threshold rules as the current README generator. Count every source row as that generator does; historical duplicate problem IDs are disclosed in `duplicate_problem_numbers`, not silently deduplicated.
- Reject unknown status labels and malformed YAML. Try an earlier valid data revision from the same date, otherwise omit the date. `omitted_revisions` records every rejection. For example, some January/February 2026 revisions use the invalid state `proven`; it is not silently mapped to `proved`.
- Require each displayed status partition to sum to its total and each Lean subdivision to fit its parent. If the newest upstream data cannot be validated, stop without replacing the saved history.

`history.json` records the source branch head, retrieval time, sampling rule, omitted revisions, per-snapshot source commits, and all raw aggregate counts. “Source revision” opens the historical YAML. Category links intentionally open today's interactive database and may show different counts.

## Validation

```sh
python3 -B sites/erdos/_history_test.py
npm test --prefix sites/erdos/_chart
bundle exec ruby -E UTF-8 -S jekyll build
```

Tests cover historical counting rules, legacy/primitive status migration, overlaps, invalid states, duplicate rows, conservation and common scale across every saved date, controls, pause/replay/end behavior, reduced motion, selected-date export, failed-load recovery, release placement across date gaps, release selection, and marker hit-target separation.

## Attribution

Data: **Erdős problems database contributors**, maintained by **Thomas Bloom and Terence Tao**, following upstream [CITATIONS.cff](https://github.com/teorth/erdosproblems/blob/main/CITATIONS.cff). Source repository license: [Apache 2.0](https://github.com/teorth/erdosproblems/blob/main/LICENSE).

Visualization by Jason Willems; composition based on the reference image he supplied. This is an independent visualization, not an official project page. D3 Sankey and its dependencies retain their licenses through their pinned npm packages. Attribution and the selected source/date are also embedded in downloaded SVG metadata.
