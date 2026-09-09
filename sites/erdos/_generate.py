#!/usr/bin/env python3
"""Generate the static Erdős diagram. Requires Python 3 and the local D3 / Node renderer.

  python3 sites/erdos/_generate.py                 # render saved snapshot
  python3 sites/erdos/_generate.py --refresh       # refresh upstream history and latest counts
  python3 sites/erdos/_generate.py --readme FILE   # import a saved upstream README
"""

import argparse
from datetime import datetime, timezone
from html import escape
import json
from pathlib import Path
import re
import subprocess
from string import Template
from urllib.parse import parse_qs, urlencode, urlparse

import yaml

HERE = Path(__file__).resolve().parent
SOURCE = "https://github.com/teorth/erdosproblems"
RAW = "https://raw.githubusercontent.com/teorth/erdosproblems/main/README.md"
TABLE = "https://teorth.github.io/erdosproblems/"
RESOLVED = [("proved", "Proved", "green", "proof"),
            ("disproved", "Disproved", "orange", "disproof"),
            ("solved", "Otherwise solved", "purple", "solution")]
OPEN = [("open", "Completely open"), ("decidable", "Decidable"),
        ("falsifiable", "Falsifiable"), ("verifiable", "Verifiable"),
        ("not provable", "Not provable in ZFC"),
        ("not disprovable", "Not disprovable in ZFC"),
        ("independent", "Independent of ZFC")]


def number(pattern, text):
    match = re.search(pattern, text)
    if not match:
        raise ValueError(f"Upstream summary changed; could not find {pattern!r}")
    return int(match[1].replace(",", ""))


def parse_readme(text):
    # Read the auto-generated summary, never the much larger problem table.
    summary = text.split("<!-- TABLE:START -->", 1)[1].split("\n|", 1)[0]
    counts = {}
    for count, query in re.findall(r"\[([\d,]+)\]\(https://teorth\.github\.io/erdosproblems/\?([^)]*)\)", summary):
        fields = parse_qs(query.replace("\\&", "&"))
        counts[tuple(sorted((key, values[0]) for key, values in fields.items()))] = int(count.replace(",", ""))

    def get(**query):
        key = tuple(sorted(query.items()))
        if key not in counts:
            raise ValueError(f"Upstream summary changed; missing {query}")
        return counts[key]

    # Upstream omits links on some zero-valued entries.
    def special(key, phrase):
        if (("oeis", key),) in counts:
            return get(oeis=key)
        return number(phrase, summary)

    data = {
        "as_of": datetime.now(timezone.utc).date().isoformat(),
        "source": RAW,
        "total": number(r"There are ([\d,]+) problems in total", summary),
        "statuses": {key: get(status=key) for key, *_ in RESOLVED + OPEN},
        "lean": {key: get(status=key, formal="Lean") for key, *_ in RESOLVED},
        "attributes": {
            "prize": get(prize="yes"), "statements": get(formalized="yes"),
            "solutions": get(formal="Lean"), "oeis_linked": get(oeis="linked"),
            "oeis_distinct": number(r"linked to ([\d,]+) distinct", summary),
            "oeis_links": number(r"total of ([\d,]+) links created", summary),
            "oeis_new": number(r"- ([\d,]+) of these OEIS sequences were added", summary),
            "oeis_possible": get(oeis="possible"),
            "oeis_unlinked": number(r"- ([\d,]+) of these problems are not currently linked", summary),
            "oeis_inprogress": special("inprogress", r"- ([\d,]+) have a related sequence whose generation"),
            "oeis_submitted": special("submitted", r"- ([\d,]+) have a related sequence currently being submitted"),
            "ambiguous": number(r"- ([\d,]+) have ambiguous statements", summary),
            "literature": number(r"- ([\d,]+) have a literature review requested", summary),
        },
    }
    validate(data)
    return data


def validate(data):
    expected_statuses = {key for key, *_ in RESOLVED + OPEN}
    if set(data["statuses"]) != expected_statuses:
        raise ValueError("Status categories changed; update the diagram before refreshing.")
    values = [data["total"], *data["statuses"].values(), *data["lean"].values(), *data["attributes"].values()]
    if any(type(n) is not int or n < 0 for n in values):
        raise ValueError("All counts must be nonnegative integers.")
    if data["total"] <= 0 or sum(data["statuses"].values()) != data["total"]:
        raise ValueError("Status counts do not sum to the total; keeping the previous snapshot.")
    for key, *_ in RESOLVED:
        if data["lean"][key] > data["statuses"][key]:
            raise ValueError(f"Lean count exceeds {key} count.")
    if sum(data["lean"].values()) > data["attributes"]["solutions"]:
        raise ValueError("Resolved Lean solutions exceed all Lean solutions.")
    for key in ("prize", "statements", "solutions", "oeis_linked", "oeis_possible", "ambiguous", "literature", "oeis_inprogress", "oeis_submitted"):
        if data["attributes"][key] > data["total"]:
            raise ValueError(f"Attribute {key} exceeds total problems.")
    datetime.strptime(data["as_of"], "%Y-%m-%d")


def link(**query):
    return TABLE + ("?" + urlencode(query) if query else "")


def diagram(data):
    try:
        result = subprocess.run(
            ['node', str(HERE / '_chart' / 'render.cjs')],
            input=json.dumps(data), text=True, capture_output=True, check=True)
    except FileNotFoundError as error:
        raise RuntimeError('Install Node.js to generate the D3 Sankey diagram.') from error
    except subprocess.CalledProcessError as error:
        raise RuntimeError(
            'D3 rendering failed. Run: npm ci --prefix sites/erdos/_chart\n' + error.stderr
        ) from error
    return result.stdout


def cards(data):
    a = data["attributes"]
    extra = a["solutions"] - sum(data["lean"].values())
    resolved_lean = sum(data["lean"].values())
    definitions = [
        ("Monetary prize", "prize", "gold", link(prize="yes"), "problems carry a monetary prize."),
        ("Statements formalized in Lean", "statements", "blue", link(formalized="yes"),
         'problems have statements formalized in <a href="https://lean-lang.org/">Lean</a> in the <a href="https://github.com/google-deepmind/formal-conjectures">Formal Conjectures Repository</a>.'),
        ("Solutions formalized in Lean", "solutions", "green", link(formal="Lean"),
         f'problems have a solution formalized in Lean.<p>This includes <strong data-derived="extra-lean">{extra:,}</strong> outside the <span data-derived="resolved-lean">{resolved_lean:,}</span> in the three resolved categories. A formalized solution can retain an informal status such as “open” until reviewed by a human.</p>'),
        ("Linked to OEIS", "oeis_linked", "purple", link(oeis="linked"),
         f'problems link to <strong data-attribute="oeis_distinct">{a["oeis_distinct"]:,}</strong> distinct <a href="https://oeis.org/">OEIS</a> sequences, with <strong data-attribute="oeis_links">{a["oeis_links"]:,}</strong> links in total.<p><strong data-attribute="oeis_new">{a["oeis_new"]:,}</strong> sequences were added since this database began (A387000 onwards).</p>'),
        ("Potentially related to an OEIS sequence not already listed", "oeis_possible", "purple", link(oeis="possible"),
         f'problems may relate to an unlisted OEIS sequence.<p>Of these, <strong data-attribute="oeis_unlinked">{a["oeis_unlinked"]:,}</strong> have no existing OEIS link.</p>'),
        ("Related sequence generation in progress", "oeis_inprogress", "gray", link(oeis="inprogress"),
         'with a related sequence being generated.'),
        ("Related sequences being submitted to OEIS", "oeis_submitted", "gray", None, ''),
        ("Literature reviews requested", "literature", "gray", None, ''),
        ("Ambiguous statements", "ambiguous", "gray", None, 'problems have ambiguous statements.'),
    ]
    output = []
    for title, key, color, href, description in definitions:
        heading = f'<a href="{escape(href, quote=True)}">{title}</a>' if href else title
        output.append(f'<article class="metric {color}"><h3>{heading}</h3><div class="metric-body"><strong class="metric-value" data-attribute="{key}">{a[key]:,}</strong><div class="metric-description">{description}</div></div></article>')
    return '\n'.join(output)


def table(data):
    def cell(value, denominator):
        percent = f'{100 * value / denominator:.1f}%' if denominator else '—'
        return f'<span class="table-count">{value:,}</span> <span class="percentage">({percent})</span>'

    rows = []
    for key, label, *_ in RESOLVED + OPEN:
        count = data["statuses"][key]
        lean = data["lean"].get(key)
        yes, no = (cell(lean, count), cell(count - lean, count)) if lean is not None else ('—', '—')
        rows.append(f'<tr data-status="{key}"><th scope="row"><a href="{escape(link(status=key), quote=True)}">{label}</a></th><td>{cell(count, data["total"])}</td><td>{yes}</td><td>{no}</td></tr>')
    return '\n'.join(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group()
    source.add_argument('--refresh', action='store_true')
    source.add_argument('--readme', type=Path)
    source.add_argument('--history-repo', type=Path, help='Read an existing local bare upstream clone without fetching')
    args = parser.parse_args()
    history_path = HERE / 'history.json'
    history = None
    if args.refresh or args.history_repo:
        from _history import collect
        history = collect(args.history_repo)
        data = history['snapshots'][-1]
    elif args.readme:
        if history_path.exists():
            raise ValueError('Use --refresh to update the history and latest snapshot together.')
        data = parse_readme(args.readme.read_text(encoding='utf-8'))
    elif history_path.exists():
        history = json.loads(history_path.read_text(encoding='utf-8'))
        data = history['snapshots'][-1].copy()
        data.pop('geometry', None)
    else:
        data = json.loads((HERE / 'snapshot.json').read_text(encoding='utf-8'))
    validate(data)
    if history:
        for snapshot in history['snapshots']:
            validate(snapshot)
        # Compute all layouts with the same D3 renderer and one shared width scale.
        result = subprocess.run(['node', str(HERE / '_chart' / 'render.cjs'), '--history'],
                                input=json.dumps(history), text=True, capture_output=True, check=True)
        history = json.loads(result.stdout)
    svg = diagram(data)
    site = yaml.safe_load((HERE.parent.parent / '_config.yml').read_text(encoding='utf-8'))
    site_home = site['url'].rstrip('/') + site.get('baseurl', '').rstrip('/') + '/'
    canonical = site_home + 'sites/erdos/'
    analytics_id = site.get('google_analytics') or ''
    if analytics_id and not re.fullmatch(r'G-[A-Z0-9]+', analytics_id):
        raise ValueError('google_analytics must be a GA4 measurement ID or empty.')
    page_title = 'Erdős Problems Sankey & History | Jason Willems'
    description = (f'Explore {data["total"]:,} Erdős problems in an interactive Sankey diagram. '
                   'Replay the database’s history and compare solved, open, and Lean-formalized problems.')
    structured_data = {
        '@context': 'https://schema.org', '@type': 'WebPage', '@id': canonical + '#webpage',
        'url': canonical, 'name': page_title, 'description': description, 'inLanguage': 'en',
        'author': {'@type': 'Person', 'name': 'Jason Willems', 'url': site_home},
        'isPartOf': {'@type': 'WebSite', 'name': 'Jason Willems', 'url': site_home},
        'about': {'@type': 'Thing', 'name': 'Erdős problems', 'url': 'https://www.erdosproblems.com/'},
        'isBasedOn': data['source'], 'citation': SOURCE,
    }
    analytics_config = {'measurementId': analytics_id, 'hostname': urlparse(site_home).hostname,
                        'pageTitle': page_title}
    def script_json(value):
        return json.dumps(value, ensure_ascii=False).replace('<', '\\u003c')
    releases = json.loads((HERE / 'model-releases.json').read_text(encoding='utf-8'))
    release_ids = set()
    for release in releases:
        datetime.strptime(release['date'], '%Y-%m-%d')
        if release['id'] in release_ids or not release['source'].startswith('https://'):
            raise ValueError('Model releases require unique IDs and HTTPS sources.')
        release_ids.add(release['id'])
    date = datetime.strptime(data['as_of'], '%Y-%m-%d').strftime('%B %d, %Y').replace(' 0', ' ')
    page = Template((HERE / '_template.html').read_text(encoding='utf-8')).substitute(
        total=f'{data["total"]:,}', date=date, iso_date=data['as_of'],
        diagram=svg, cards=cards(data), rows=table(data),
        releases=script_json(releases), structured_data=script_json(structured_data),
        analytics_config=script_json(analytics_config), site_home=escape(site_home, quote=True),
        canonical=escape(canonical, quote=True), page_title=escape(page_title, quote=True),
        description=escape(description, quote=True),
        source_url=escape(data['source'], quote=True))
    # Parse and validate everything before replacing any generated output.
    outputs = [('index.html', page), ('diagram.svg', svg + '\n'),
               ('snapshot.json', json.dumps(data, indent=2, ensure_ascii=False) + '\n')]
    if history:
        outputs.append(('history.json', json.dumps(history, separators=(',', ':'), ensure_ascii=False) + '\n'))
        from _insights import build, matches
        from _trends import render as render_trends
        insights_path = HERE / 'insights.json'
        insights = json.loads(insights_path.read_text()) if insights_path.exists() else None
        if args.refresh or args.history_repo:
            insights = build(history, args.history_repo or HERE / '_cache/upstream.git')
        if insights is None or not matches(insights, history):
            raise ValueError('Run --refresh or --history-repo to build matching problem-level trends.')
        outputs.extend([
            ('insights.json', json.dumps(insights, separators=(',', ':')) + '\n'),
            ('trends/index.html', render_trends(insights, releases, site_home, analytics_id)),
            ('d3.min.js', (HERE / '_chart/node_modules/d3/dist/d3.min.js').read_text()),
            ('D3-LICENSE.txt', (HERE / '_chart/node_modules/d3/LICENSE').read_text()),
        ])
    for filename, content in outputs:
        destination = HERE / filename
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_suffix(destination.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(destination)
    print(f'Generated {data["total"]:,} problems, snapshot {data["as_of"]}' +
          (f', {len(history["snapshots"])} historical dates.' if history else '.'))


if __name__ == '__main__':
    main()
