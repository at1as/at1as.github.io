#!/usr/bin/env python3
"""Validate this self-contained evidence package. No third-party packages required."""
import csv, hashlib, json
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parent

def load(name):
    with (ROOT/name).open(encoding='utf-8') as f:return json.load(f)

def main():
    data=load('predictions.canonical.v0.2.json'); records=data['records']
    sources=load('sources.v0.2.json')['sources']
    mapping=load('legacy-reconciliation.v0.2.json')['mapping']
    metrics=load('metrics.snapshot.v0.2.json')
    raw=ROOT/'kurzweil_prediction_intake_v0_1.csv'
    with raw.open(encoding='utf-8-sig',newline='') as f: legacy=list(csv.DictReader(f))
    ids={r['id'] for r in records}; sids={s['id'] for s in sources}
    assert len(ids)==len(records),'Duplicate canonical IDs'
    assert len({r['slug'] for r in records})==len(records),'Duplicate slugs'
    assert len(sids)==len(sources),'Duplicate source IDs'
    assert len(mapping)==len(legacy)==88,'Legacy row count differs'
    assert {r['legacy_id'] for r in mapping}=={r['Record ID'] for r in legacy},'Not every original ID has a disposition'
    assert hashlib.sha256(raw.read_bytes()).hexdigest()==data['legacy_input_sha256'],'Original input altered'
    for m in mapping:
        assert set(m['canonical_ids'])<=ids, m['legacy_id']
        assert set(m['source_ids'])<=sids, m['legacy_id']
        assert not m['automatic_redirect'],'No redirects approved in this supplement'
    eligible=[]
    for r in records:
        a=r['assessment']; t=r['target']
        refs=r['prediction_sources']+r['evidence']
        assert all(x['source_id'] in sids and x['locator'] for x in refs),r['id']
        assert a['as_of']==data['as_of']==metrics['as_of']
        assert r['original_quote'] is None,'No unverified quotation marks should be generated'
        if a['verdict']=='PENDING':
            assert not a['eligible_for_deadline_metrics']
            assert a['at_deadline']=='NOT_DUE'
            assert t['deadline_year'] is None or t['deadline_year']>2026
        if a['verdict']=='CORRECT':
            assert a['at_deadline']=='FULFILLED' and r['evidence'],r['id']
        if a['eligible_for_deadline_metrics']:
            eligible.append(r)
            assert a['review_state']=='ASSESSED'
            assert a['verdict'] in {'CORRECT','LATE','PARTIAL','WRONG_MISSED'}
            assert t['deadline_year'] is not None and t['deadline_year']<2026
            assert r['prediction_sources'] and r['evidence']
        if a['drift_years'] is not None:
            assert a['first_full_achievement_year'] is not None and t['deadline_year'] is not None
            assert a['drift_years']==a['first_full_achievement_year']-t['deadline_year']
        if a['drift_range_years'] is not None:
            assert a['drift_range_years'][0]<=a['drift_range_years'][1]
            assert a['drift_years'] is None,'Do not collapse intervals into invented exact points'
        if a['verdict']=='UNREVIEWED': assert not a['eligible_for_deadline_metrics']
    assert len(eligible)==metrics['default_deadline_eligible_n']
    assert dict(Counter(r['assessment']['verdict'] for r in records))==metrics['verdict_counts_all_curated']
    assert dict(Counter(r['assessment']['verdict'] for r in eligible))==metrics['default_deadline_verdict_counts']
    current_unknown=sum(r['assessment']['at_review']=='FULL_FULFILLMENT_NOT_ESTABLISHED' for r in eligible)
    assert current_unknown==metrics['current_full_realization_unknown_n']
    if current_unknown:assert metrics['eventual_realization_rate'] is None
    assert metrics['strict_on_time_rate_reviewed_subset_only']==sum(r['assessment']['verdict']=='CORRECT' for r in eligible)/len(eligible)
    assert sum(c['curated_n'] for c in metrics['categories'])==len(records)
    print(f'PASS — {len(records)} canonical records; {len(mapping)} original IDs reconciled; {len(sources)} source records; {len(eligible)} default deadline-eligible assessments.')
    print('Checks: unique IDs/slugs, immutable import hash, complete mapping, evidence references, eligibility, future exclusions, interval handling, unknown-current-outcome handling, and category totals.')
if __name__=='__main__':main()
