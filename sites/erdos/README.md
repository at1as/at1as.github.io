# Erdős problems Sankey and history

Subsite at `/sites/erdos/`, published by the repository's existing Jekyll / GitHub Pages workflow. It includes a compact date slider, date picker, play/pause, and 1× / 2× / 4× / 8× / 16× / 32× playback. Every selection updates the diagram, problem count, browser title, attribute cards, text table, source revision, and SVG download. In the table, problem counts show their percentage of all problems; Lean columns show their percentage within that status. Percentages are rounded to one decimal place; an empty status has no within-status percentage.

The **Trends & rates** view at `/sites/erdos/trends/` adds a D3 rate chart with model-release references, monthly change decomposition, problem-level evidence, the Lean formalization backlog, and equal-window comparisons around releases. Its default charts, monthly totals, and recent problem records are generated as HTML/SVG so they remain available without browser JavaScript.

The visible **What changed** section defaults to the latest rate window and reports both transition counts and distinct problem counts. Clicking/tapping a rate point, pressing Enter after inspecting with the arrow keys, or using **View these changes** shows the exact gains behind that point, with links to current problem pages and immutable revision comparisons. Monthly selections include gains, losses, additions, and removals. **Methodology** opens the readable counting explanation at `/sites/erdos/trends/#methodology`; raw JSON and the visualization source have separate links.

Both views share the page container, header, tabs, source link, and responsive spacing. `_shared.py` renders `_navigation.html` and `_explorer_header.html` for both routes; their common layout lives in `styles.css`. Navigation and first-party assets carry content versions so cached pages cannot bring back an older interface when switching views. Canonical URLs remain unversioned. The snapshot table is always visible beneath the Sankey.

[D3 Sankey](https://github.com/d3/d3-sankey) computes all layouts at generation time using one shared count-to-pixel scale. Browser JavaScript animates those precomputed layouts. All chart assets and historical data are served locally; the visualization needs no CDN, live GitHub requests, API credentials, or application server. The production page also loads Google Analytics. Without JavaScript, the latest diagram, cards, table, and SVG download remain available.

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

`history.json`, `snapshot.json`, `index.html`, `diagram.svg`, `insights.json`, `trends/index.html`, and the local `d3.min.js` / license copy are generated. Edit `_template.html` and `styles.css` for the snapshot page, `timeline.js` for its controls, `_history.py` for extraction, and `_chart/render.cjs` for Sankey configuration. The Trends view uses `_trends_template.html`, `trends.css`, `trends.js`, and `trends-charts.js`. Jekyll ignores the underscore-prefixed tools and dependency directory. Git ignores cached upstream data and `node_modules`.

Both refresh commands rebuild the problem-level transition data from the same selected commits. Offline generation reuses `insights.json` only if its commit sequence matches the saved history; a mismatch requires `--refresh` or `--history-repo`. The generator validates all counts and renders both views before replacing output files.

## What the trend charts measure

`_insights.py` matches problem numbers across each pair of saved snapshots. For resolved status, Lean solutions, and Lean statements, it separates four types of change: an existing entry gains or loses the property, and a qualifying entry is added or removed. A switch from proved to disproved remains within the resolved group and is not a gain. Lean status can change independently of informal resolution. Duplicate IDs in either snapshot are excluded from identity matching; any residual count change is shown as an unmatched-row adjustment. All five components reconcile to the aggregate change for every interval and every monthly total.

- **Pace:** existing-entry gains divided by elapsed calendar days. For a selected trailing window, the baseline is the last saved snapshot on or before the intended start; the readout and evidence section show the actual boundaries, duration, and event count. Initial points without a full trailing window are omitted. No interpolation invents extra events. Widely spaced snapshots are shaded; these can include unchanged days as well as skipped revisions, rather than necessarily missing observations.
- **Monthly composition:** events are assigned to the first saved snapshot observing them. The first and last months are marked partial. Selecting a bar exposes the underlying problem numbers, observation intervals, and source revision comparisons. Counts are transition events, so a problem can contribute more than once after losing and regaining a status.
- **Formalization backlog:** resolved total minus Lean solutions within the resolved group. Coverage uses the resolved total as denominator; it excludes Lean solutions whose informal status is unresolved.
- **Release windows:** gains first observed in `[release − 30 days, release)` and `[release, release + 30 days)`. A window extending beyond available history has no rate or multiplier. A zero preceding count has no multiplier. Different releases’ windows overlap.

These are rates of **recorded database changes**, not verified discovery dates or model contributions. Additions, corrections, missing snapshots, and transitions that appear and disappear between snapshots limit interpretation. Model release dates provide context; the status data does not consistently record which model helped. `trends-data.js` contains the calculations shared by the browser, the static renderer, and tests.

## Model release annotations

`model-releases.json` contains a curated selection of public Claude releases and OpenAI API releases, each with an official source. Dates are verified as of September 9, 2026. Fable 5 uses its initial June 9 launch date; its annotation also links the subsequent access interruption and July 1 return. These markers provide context and do not attribute problem solutions to any model.

Hover or keyboard-focus a marker for its model and date; select it to pause playback and show the first recorded snapshot on or after release. If there is a gap, the annotation identifies the actual snapshot shown. During playback, the annotation follows the latest listed release on or before the selected snapshot. Nearby hit targets alternate below and above the slider, with stems connecting each marker to its exact position on the axis. Drag the slider, use its native keyboard controls, or choose a date from the picker to navigate.

Because the slider steps through recorded snapshots, marker positions interpolate between the surrounding snapshot indices, rather than treating the whole slider as a uniform calendar scale. Releases outside the saved history are omitted. To add or correct a release, edit `model-releases.json`, include an official date source, and rerun `_generate.py`; the list is embedded in the page, with no extra network request at runtime.

## Discovery and analytics

Both generated pages include descriptive titles, descriptions, canonical URLs, Open Graph and Twitter summary metadata, and WebPage JSON-LD with author and upstream source attribution. The charts and data tables are present in the initial HTML. The root `sitemap.xml` explicitly includes `/sites/erdos/` and `/sites/erdos/trends/`, because these static pages are not part of Jekyll’s `site.html_pages`; `robots.txt` already allows them and advertises that sitemap.

The generator reads the production URL and GA4 measurement ID from the root `_config.yml`. Rerun it after changing those settings. `analytics.js` loads the [Google tag](https://developers.google.com/tag-platform/gtagjs) on the HTTPS production hostname (with or without `www`) only, so localhost and preview hosts do not affect reporting. It sends the [default pageview](https://developers.google.com/analytics/devguides/collection/ga4/views) once, retains campaign parameters, and uses a stable page title. Moving the slider or playing the timeline does not send additional pageviews.

The prominent header and footer links back to Jason’s site, plus the breadcrumb, send a `site_visit` event with `link_location` and `link_url`. Navigation does not wait on analytics. Automated tests simulate the tag queue without sending test traffic to Google. After publishing, GA4 Realtime or Tag Assistant can confirm receipt in the property; local tests cannot verify Google’s account-side processing.

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
python3 -B sites/erdos/_insights_test.py
npm test --prefix sites/erdos/_chart
bundle exec ruby -E UTF-8 -S jekyll build
```

Tests cover historical counting rules, legacy/primitive status migration, overlaps, invalid states, duplicate rows, conservation and common scale across every saved date, controls, pause/replay/end behavior, reduced motion, selected-date export, failed-load recovery, release placement across date gaps, release selection, marker hit-target separation, SEO metadata, analytics initialization, preview exclusion, and links back to the main site.

Trend checks also reconcile every interval/month to the Sankey source, distinguish imports from state changes, exercise duplicate IDs, verify elapsed-time rates and release-window boundaries, and run the actual D3 renderer and interactive controls in JSDOM. D3 is pinned to 7.9.0 and its ISC license is copied alongside the local browser bundle.

## Attribution

Data: **Erdős problems database contributors**, maintained by **Thomas Bloom and Terence Tao**, following upstream [CITATIONS.cff](https://github.com/teorth/erdosproblems/blob/main/CITATIONS.cff). Source repository license: [Apache 2.0](https://github.com/teorth/erdosproblems/blob/main/LICENSE).

Visualization by Jason Willems; composition based on the reference image he supplied. This is an independent visualization, not an official project page. D3 Sankey and its dependencies retain their licenses through their pinned npm packages. Attribution and the selected source/date are also embedded in downloaded SVG metadata.
