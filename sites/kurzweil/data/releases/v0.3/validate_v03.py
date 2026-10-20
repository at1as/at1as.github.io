from pathlib import Path
import json, collections
p=Path(__file__).resolve().parent
d=json.loads((p/'predictions.canonical.v0.3.json').read_text());rs=d['records'];ids={r['id'] for r in rs}
s=json.loads((p/'sources.v0.3.json').read_text());src={z['id'] for z in s['sources']}
l=json.loads((p/'legacy-reconciliation.v0.3.json').read_text())['mapping']
m=json.loads((p/'metrics.v0.3.json').read_text())
assert len(rs)==len(ids)==84
assert all(f'K{i:03}' in ids for i in range(1,85))
assert len(l)==len({z['legacy_id'] for z in l})==88
assert sum(r['is_new_in_v03'] for r in rs)==34
assert all(z['outcome_disposition_complete'] for z in l)
assert all(not z['conditional_outcome'].get('eligible_for_author_accuracy',False) for z in l)
for r in rs:
 a=r['assessment']; assert a['verdict'] not in ('UNREVIEWED','UNSCORABLE')
 assert a['at_review'] in ('FULFILLED','PARTLY_FULFILLED','NOT_FULFILLED')
 assert all(q['source_id'] in src for q in r['prediction_sources']+r['evidence'])
 if a['eligible_for_deadline_metrics']: assert a['at_deadline'] in ('FULFILLED','PARTLY_FULFILLED','NOT_FULFILLED')
 if a['verdict']=='LATE': assert a['at_review']=='FULFILLED' and a['at_deadline']!='FULFILLED' and a['eligible_for_deadline_metrics']
 for v in r['interpretations'].values(): assert all(i in src for i in v['evidence_source_ids'])
for mode in ('reference','strict','broader'):
 cohort=[r for r in rs if r['interpretations'][mode]['eligible_for_deadline_metrics']]
 q=m['views'][mode]
 assert len(cohort)==q['n']
 assert sum(r['interpretations'][mode]['at_deadline']=='FULFILLED' for r in cohort)==q['on_time']
 assert sum(r['interpretations'][mode]['at_review']=='FULFILLED' for r in cohort)==q['fully_realized_by_review']
 assert sum(a[mode]['n'] for a in m['by_category'].values())==q['n']
assert m['views']['reference']['n']==68 and m['views']['reference']['on_time']==25 and m['views']['reference']['fully_realized_by_review']==36
assert m['views']['strict']['n']==67
print('PASS: 84 canonical records, 34 added, all 88 legacy IDs reconciled; source references and all view denominators consistent.')
