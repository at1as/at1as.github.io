#!/usr/bin/env python3
"""Run locally (no third-party dependencies): python3 validate_corpus.py"""
import json
from pathlib import Path
from collections import Counter
from urllib.parse import urlparse

root=Path(__file__).resolve().parent
data=root.parents[1]/'sites'/'model-names'/'data'

def read(name):
    directory = root if name in {'boundary_cases.json', 'holdout_candidates.json'} else data
    return json.loads((directory/name).read_text(encoding='utf-8'))

ladders=read('ladders.json')['ladders']
questions=read('questions.json')['questions']
boundary_export=read('boundary_cases.json')
boundary=boundary_export['cases']
holdouts=read('holdout_candidates.json')
round_ids=read('starter_round.json')['question_ids']
featured=read('featured_questions.json')['questions']
categories={c['id'] for c in read('ladders.json')['meta']['categories']}

assert len(ladders)>=30 and len(questions)>=50
ladder_ids=[x['id'] for x in ladders]
qids=[x['id'] for x in questions]
assert len(set(ladder_ids))==len(ladder_ids),'duplicate ladder ids'
assert len(set(qids))==len(qids),'duplicate question ids'
assert all(c in categories for c in (x['category'] for x in ladders))
ladder_map={x['id']:x for x in ladders}

for ladder in ladders:
    assert ladder['status']=='ready',ladder['id']
    assert ladder['verified_as_of']=='2026-11-21'
    assert ladder['source_urls'],ladder['id']
    tiers=ladder['low_to_high']
    assert len(tiers)>=2 and len(set(n['label'] for n in tiers))==len(tiers),ladder['id']
    assert [n['tier'] for n in tiers]==list(range(len(tiers))),ladder['id']
    assert all(n['id']==f"{ladder['id']}:{i}" for i,n in enumerate(tiers))
    assert len(ladder['caveat'])>=15 and len(ladder['scope'])>=15, ladder['id']
    for u in ladder['source_urls']:
        assert urlparse(u).scheme=='https' and urlparse(u).netloc, (ladder['id'],u)

pairs=[]
for q in questions:
    ladder=ladder_map[q['ladder_id']]
    assert q['category']==ladder['category'] and q['brand']==ladder['brand'],q['id']
    opts=q['options']
    assert len(opts)==2 and len(set(opts))==2,q['id']
    assert q['answer'] in opts and q['higher_than'] in opts and q['answer'] != q['higher_than'],q['id']
    positions={n['label']:n['tier'] for n in ladder['low_to_high']}
    assert positions[q['answer']]>positions[q['higher_than']],q['id']
    assert q['answer_node_id']==f"{ladder['id']}:{positions[q['answer']]}",q['id']
    assert 1<=q['difficulty']<=5 and 1<=q['surprise']<=5
    assert q['source_urls']==ladder['source_urls'],q['id']
    assert len(q['explanation'])>=40, q['id']
    assert len(q['question'])>=15
    pairkey=(q['ladder_id'],frozenset(opts))
    assert pairkey not in pairs,('duplicate exact pairing',q['id'])
    pairs.append(pairkey)

assert len(set(round_ids))==len(round_ids)
assert all(x in set(qids) for x in round_ids)
assert all(q['featured'] for q in questions if q['id'] in round_ids)
assert featured == [q for q in questions if q['featured']], 'featured export differs from questions'
assert boundary_export['meta']['playable_as_binary'] is False
assert holdouts['meta']['playable'] is False
assert all(x['review_status']=='editorially_curated' for x in questions)
assert all(x['verdict'] for x in boundary)
assert all(x['source_urls'] for x in boundary)
assert not any(x['id'] in ladder_ids for x in boundary)

print('VALID:')
print(f"{len(ladders)} ladders, {len(questions)} curated binary questions, {len(featured)} featured, {len(boundary)} quarantined non-ladders, {len(holdouts['candidates'])} holdouts")
for k,v in Counter(x['category'] for x in ladders).items():
    print(f'  {k}: {v} ladders')
print('Starter round:',', '.join(round_ids))
