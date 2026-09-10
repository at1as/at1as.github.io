"""Build a crawlable Trends page, including its default D3 SVG charts."""
from datetime import date, timedelta
from html import escape
import json
from pathlib import Path
import subprocess
from string import Template
from _shared import chrome, version_assets

HERE = Path(__file__).parent


def render(data, releases, site_home, analytics_id):
    first, last = data['points'][0], data['points'][-1]
    eligible = [r for r in releases if date.fromisoformat(r['date']) + timedelta(days=30) <= date.fromisoformat(last['date'])
                and date.fromisoformat(r['date']) - timedelta(days=30) >= date.fromisoformat(first['date'])]
    selected = (eligible or releases)[-1]['id']
    result = subprocess.run(['node', str(HERE / '_chart/trends-render.cjs')],
                            input=json.dumps(dict(data=data,releases=releases,selected=selected)),
                            capture_output=True, text=True, check=True)
    charts = json.loads(result.stdout)
    title = 'Erdős problems in the AI era — Trends & Rates | Jason Willems'
    description = 'Explore recorded resolutions and formalized proofs over time, alongside AI model releases'
    canonical = site_home + 'sites/erdos/trends/'
    structured = {'@context':'https://schema.org','@type':'WebPage','url':canonical,'name':title,'description':description,
                  'author':{'@type':'Person','name':'Jason Willems','url':site_home},
                  'isBasedOn':'https://github.com/teorth/erdosproblems',
                  'isPartOf':{'@type':'WebSite','name':'Jason Willems','url':site_home}}
    script_json = lambda obj: json.dumps(obj,ensure_ascii=False).replace('<','\\u003c')
    month_options = ''.join(f'<option value="{r["date"][:7]}">{r["date"][:7]}</option>' for r in charts['months'])
    release_options = ''.join(f'<option value="{r["id"]}"'+(' selected' if r['id']==selected else '')+f'>{escape(r["name"])}</option>' for r in releases)
    monthly_rows = ''.join(f'<tr><th scope="row">{r["date"][:7]}'+(' (partial)' if r['partial'] else '')+f'</th><td>{r["gained"]}</td><td>{r["added"]}</td><td>{r["lost"]}</td><td>{r["removed"]}</td><td>{r["unmatched"]}</td><td><strong>{r["net"]:+}</strong></td></tr>' for r in charts['months'])
    gains = sum(len(i['changes']['resolved']['gained']) for i in data['intervals'])
    distinct_gains = len({n for i in data['intervals'] for n in i['changes']['resolved']['gained']})
    added = sum(len(i['changes']['resolved']['added']) for i in data['intervals'])
    lost = sum(len(i['changes']['resolved']['lost']) for i in data['intervals'])
    removed = sum(len(i['changes']['resolved']['removed']) for i in data['intervals'])
    unmatched = sum(i['changes']['resolved']['unmatched'] for i in data['intervals'])
    reconciliation = (f'<strong>{first["resolved"]:,}</strong> initially resolved + {gains:,} changes to resolved '
                      f'+ {added:,} added as already resolved − {lost:,} changes back to unresolved − {removed:,} removed from the database'
                      + (f' {unmatched:+,} unmatched changes' if unmatched else '')
                      + f' = <strong>{last["resolved"]:,}</strong> currently resolved. New database entries can describe old results.')
    coverage = last['resolved_lean']/last['resolved']*100
    backlog, old_backlog = last['resolved']-last['resolved_lean'], first['resolved']-first['resolved_lean']
    date_label = lambda value: date.fromisoformat(value).strftime('%b %d, %Y').replace(' 0', ' ')
    recent = charts['recent']
    records = charts['events']
    record_rows = ''.join(
        f'<tr><th scope="row"><a href="https://www.erdosproblems.com/{r["number"]}">#{r["number"]}</a></th>'
        f'<td>{r["end"]}</td><td>Marked resolved</td><td>{r["start"]} → {r["end"]}</td>'
        f'<td><a href="https://github.com/teorth/erdosproblems/compare/{r["before"]}...{r["after"]}">View revisions ↗</a></td></tr>'
        for r in records) or '<tr><td colspan="5">No changes in this period</td></tr>'
    records_count = f'{len(records)} changes across {len({r["number"] for r in records})} distinct problems'
    records_scope = f'Changes to resolved between the snapshots on {date_label(recent["start"])} and {date_label(recent["date"])} ({recent["days"]} days)'
    values = dict(**chrome(site_home, 'trends'),
                  title=escape(title),description=escape(description,quote=True),canonical=canonical,site_home=site_home,
                  structured_data=script_json(structured), releases=script_json(releases),
                  analytics_config=script_json(dict(measurementId=analytics_id,hostname=site_home.split('/')[2],pageTitle=title)),
                  first_date=first['date'],last_date=last['date'],resolved=f'{last["resolved"]:,}',resolved_delta=f'{last["resolved"]-first["resolved"]:+,}',
                  first_date_label=date_label(first['date']),last_date_label=date_label(last['date']),
                  gains=gains,distinct_gains=distinct_gains,reconciliation=reconciliation,
                  record_rows=record_rows,records_count=records_count,records_scope=records_scope,
                  coverage=f'{coverage:.1f}%',old_coverage=f'{first["resolved_lean"]/first["resolved"]*100:.1f}%',
                  backlog=backlog,backlog_change=f'{abs(backlog-old_backlog):,} '+('fewer' if backlog<old_backlog else 'more'),
                  first_share=f'{first["resolved"]/first["total"]*100:.1f}%',last_share=f'{last["resolved"]/last["total"]*100:.1f}%',
                  total_delta=last['total']-first['total'],first_open=first['total']-first['resolved'],last_open=last['total']-last['resolved'],
                  month_options=month_options,release_options=release_options,monthly_rows=monthly_rows,
                  **{f'pace_{key}':escape(value) for key,value in charts['pace_text'].items()},
                  **{key:charts[key] for key in ['pace','composition','formal','pace_readout','composition_readout','formal_readout']})
    return version_assets(Template((HERE / '_trends_template.html').read_text()).substitute(values))
