#!/usr/bin/env python3
"""Render the static, searchable source tables and embed curated data. No network."""
from html import escape
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'data.json').read_text())
labels = {'published': 'Published result', 'construction': 'Published construction',
          'preprint': 'Preprint', 'report': 'Author report', 'conjecture': 'Conjecture · unproved'}


def value(problem, milestone):
    if problem['kind'] == 'range':
        return f"{milestone['lower']}–{milestone['value']}"
    if problem['kind'] == 'floor':
        return f"> 10^{milestone['value']}"
    return milestone.get('display', str(milestone['value']))


tables = []
for problem in data['problems']:
    rows = []
    for milestone in problem['milestones']:
        links = f'<a href="{escape(milestone["url"])}" target="_blank" rel="noopener">Primary source ↗</a>'
        if milestone.get('supportUrl'):
            links += f' · <a href="{escape(milestone["supportUrl"])}" target="_blank" rel="noopener">Supporting source ↗</a>'
        ai = ('<span class="table-note">AI contribution: ' + escape(milestone['ai']) + '</span>') if milestone.get('ai') else ''
        rows.append(f'<tr><td><time datetime="{milestone["date"]}">{escape(milestone["label"])}</time></td><td>{escape(value(problem,milestone))}</td><td>{labels[milestone["status"]]}<span class="table-note">{escape(milestone["who"])}</span></td><td>{escape(milestone["detail"])}<br>{links}{ai}</td></tr>')
    regions = problem.get('zeroFreeRegions', [])
    region_table = ''
    if regions:
        region_rows = []
        for region in regions:
            n, d = region['numerator'], region['denominator']
            bound = 'β = ½' if n * 2 == d else f'{d-n}/{d} ≤ β ≤ {n}/{d}'
            ai = ('<span class="table-note">AI contribution: ' + escape(region['ai']) + '</span>') if region.get('ai') else ''
            region_rows.append(f'<tr><td><time datetime="{region["date"]}">{escape(region["dateLabel"])}</time></td><td>{escape(bound)}</td><td>{labels[region["status"]]}<span class="table-note">{escape(region["who"])}</span></td><td>{escape(region["detail"])}<br><a href="{escape(region["url"])}" target="_blank" rel="noopener">Source ↗</a>{ai}</td></tr>')
        region_table = f'<h3 class="source-subtitle">Zero-free region comparisons</h3><p class="source-comparison-note">Ordered by strength, not publication date. These bounds describe horizontal position, not a proportion of zeros. Full RH is an unproved reference.</p><div class="source-table-wrap" tabindex="0" role="region" aria-label="Zero-free regions source table"><table><caption class="visually-hidden">Riemann zero-free regions: reported bounds and the conjectured limit</caption><thead><tr><th scope="col">Date</th><th scope="col">Permitted location</th><th scope="col">Evidence &amp; attribution</th><th scope="col">Context &amp; source</th></tr></thead><tbody>{"".join(region_rows)}</tbody></table></div>'
    qualifier = f' · {len(regions)} region comparisons' if regions else ''
    tables.append(f'<details id="sources-{problem["id"]}"><summary>{escape(problem["name"])} · {len(rows)} milestones{qualifier}</summary><div class="source-table-wrap" tabindex="0" role="region" aria-label="{escape(problem["name"])} source table"><table><caption class="visually-hidden">{escape(problem["name"])}: all included milestones and sources</caption><thead><tr><th scope="col">Date</th><th scope="col">Value</th><th scope="col">Evidence &amp; attribution</th><th scope="col">Context &amp; source</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div>{region_table}</details>')

html = (ROOT / '_template.html').read_text()
html = html.replace('__DATA__', json.dumps(data, ensure_ascii=False).replace('<', '\\u003c'))
html = html.replace('__TABLES__', '\n'.join(tables))
html = html.replace('__UPDATED__', escape(data['updated']))
initial = json.loads(subprocess.check_output(['node', str(ROOT / '_render.cjs')], text=True))
for key, value in initial.items():
    html = html.replace(f'__{key}__', value)
(ROOT / 'index.html').write_text(html)
print(f'Rendered {len(data["problems"])} frontiers / {sum(len(p["milestones"]) for p in data["problems"])} sourced milestones.')
