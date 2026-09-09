"""Build a crawlable Trends page, including its default D3 SVG charts."""
from datetime import date, timedelta
from html import escape
import json
from pathlib import Path
import subprocess
from string import Template

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
    title = 'Erdős Problem Trends — Solution Rates & Lean Progress | Jason Willems'
    description = 'Explore how Erdős problem statuses change over time: resolution rates, database additions, Lean formalization, and model release timelines.'
    canonical = site_home + 'sites/erdos/trends/'
    structured = {'@context':'https://schema.org','@type':'WebPage','url':canonical,'name':title,'description':description,
                  'author':{'@type':'Person','name':'Jason Willems','url':site_home},
                  'isBasedOn':'https://github.com/teorth/erdosproblems',
                  'isPartOf':{'@type':'WebSite','name':'Jason Willems','url':site_home}}
    script_json = lambda obj: json.dumps(obj,ensure_ascii=False).replace('<','\\u003c')
    month_options = ''.join(f'<option value="{r["date"][:7]}"'+(' selected' if r['date'].startswith(charts['peak']) else '')+f'>{r["date"][:7]}</option>' for r in charts['months'])
    release_options = ''.join(f'<option value="{r["id"]}"'+(' selected' if r['id']==selected else '')+f'>{escape(r["name"])}</option>' for r in releases)
    monthly_rows = ''.join(f'<tr><th scope="row">{r["date"][:7]}'+(' (partial)' if r['partial'] else '')+f'</th><td>{r["gained"]}</td><td>{r["added"]}</td><td>{r["lost"]}</td><td>{r["removed"]}</td><td>{r["unmatched"]}</td><td><strong>{r["net"]:+}</strong></td></tr>' for r in charts['months'])
    gains = sum(len(i['changes']['resolved']['gained']) for i in data['intervals'])
    added = sum(len(i['changes']['resolved']['added']) for i in data['intervals'])
    coverage = last['resolved_lean']/last['resolved']*100
    backlog, old_backlog = last['resolved']-last['resolved_lean'], first['resolved']-first['resolved_lean']
    values = dict(title=escape(title),description=escape(description,quote=True),canonical=canonical,site_home=site_home,
                  structured_data=script_json(structured), releases=script_json(releases),
                  analytics_config=script_json(dict(measurementId=analytics_id,hostname=site_home.split('/')[2],pageTitle=title)),
                  first_date=first['date'],last_date=last['date'],resolved=f'{last["resolved"]:,}',resolved_delta=f'{last["resolved"]-first["resolved"]:+,}',
                  gains=gains,added=added,coverage=f'{coverage:.1f}%',old_coverage=f'{first["resolved_lean"]/first["resolved"]*100:.1f}%',
                  backlog=backlog,backlog_delta=f'{backlog-old_backlog:+}',
                  first_share=f'{first["resolved"]/first["total"]*100:.1f}%',last_share=f'{last["resolved"]/last["total"]*100:.1f}%',
                  total_delta=last['total']-first['total'],first_open=first['total']-first['resolved'],last_open=last['total']-last['resolved'],
                  month_options=month_options,release_options=release_options,monthly_rows=monthly_rows,
                  **{key:charts[key] for key in ['pace','composition','formal','pace_readout','composition_readout','formal_readout']})
    return Template((HERE / '_trends_template.html').read_text()).substitute(values)
