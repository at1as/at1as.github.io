#!/usr/bin/env python3
"""Run the supplied canonical validator and verify the UI adapter is lossless."""
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path
from _research import canonical_bytes

ROOT = Path(__file__).resolve().parent
subprocess.run([sys.executable, str(ROOT / '_handoff/scripts/validate_data.py'),
                str(ROOT / '_handoff/data/fusion_atlas.json'), '--strict-warnings'], check=True)
original = (ROOT / '_handoff/data/fusion_atlas.json').read_bytes()
published = (ROOT / 'fusion_atlas.json').read_bytes()
assert published == canonical_bytes(), 'Public download must reproduce the reviewed corrections'
canonical = json.loads(published)
# Keep historical events/publications bounded by the original research cutoff.
# Only source-access/review dates may extend to the targeted correction review.
spec = importlib.util.spec_from_file_location('handoff_validator', ROOT / '_handoff/scripts/validate_data.py')
handoff = importlib.util.module_from_spec(spec)
spec.loader.exec_module(handoff)


class CorrectedValidator(handoff.Validator):
    def check_date(self, value, path, precision=None, nullable=False, historical=True):
        review = path.rsplit('.', 1)[-1] in {'accessed_at', 'last_reviewed_at'}
        bounds = super().check_date(value, path, precision, nullable, historical and not review)
        if bounds and review:
            self.check(bounds[0] <= handoff.date_bounds(canonical['meta']['corrections_reviewed_at'])[0], path, 'Review date exceeds the corrections review')
        return bounds


validation = CorrectedValidator(canonical).run()
assert not validation.errors and not validation.warnings, '\n'.join(validation.errors + validation.warnings)
data = json.loads((ROOT / '_data-full.json').read_text())
runtime = json.loads((ROOT / 'data.json').read_text())
assert data['meta']['canonicalSha256'] == hashlib.sha256(published).hexdigest()
assert runtime['meta']['canonicalSha256'] == data['meta']['canonicalSha256']
assert data['meta']['original_sha256'] == hashlib.sha256(original).hexdigest()
assert data['meta']['snapshot'] == canonical['meta']['as_of']
report = (ROOT / '_handoff/01_RESEARCH_REPORT.md').read_bytes()
assert (ROOT / 'research-report.md').read_text() == re.sub(r'\br\s+and\s+d\b', 'R&D', report.decode(), flags=re.I)
assert (ROOT / '_research.md').read_bytes() == report
assert 'missingCompanionDataset' not in data['meta']
sources = {s['id']: s for s in data['sources']}
entities = {e['canonicalId']: e for e in data['entities']}
sites = {s['canonicalId']: s for s in data['sites']}
claims = {c['canonicalId']: c for e in data['entities'] for c in e['claims']}
funding = {f['canonicalId']: f for e in data['entities'] for f in e['funding']}
results = {r['canonicalId']: r for r in data['results']}
assert len(entities) == len(canonical['entities'])
assert len(sites) == len(canonical['sites'])
assert len(claims) == len(canonical['claims'])
assert len(funding) == len(canonical['funding_events'])
assert len(results) == len(canonical['records'])
assert len(sources) == len(canonical['sources'])


def check_refs(node):
    if isinstance(node, dict):
        for ref in node.get('sourceIds', []):
            assert ref in sources, ref
        for value in node.values():
            check_refs(value)
    elif isinstance(node, list):
        for value in node:
            check_refs(value)


check_refs(data)
for e in canonical['entities']:
    a = entities[e['id']]
    assert a['summary'] == e['summary']
    assert a['experimentalFuel'] == (e.get('operating_fuel') or '')
    assert a['intendedFuel'] == (e.get('intended_fuel') or '')
    assert a['approachId'] == e.get('approach_id')
    assert a['mechanismSteps'] == e.get('mechanism', [])
    assert [s['id'] for s in a['locations']] == e['site_ids']
    assert a['targets'] == [c for c in a['claims'] if c['canonicalCategory'] == 'target']
    assert a['fundingSummarySourceIds'] == e['funding_summary'].get('source_ids', [])
    if e['sector'] == 'public_project_or_facility':
        assert set(e['fuel_contexts']) == {'experimental', 'planned_research', 'commercial'}
        for context in e['fuel_contexts'].values():
            assert context['text'] and context['status']
            assert set(context['fuel_ids']) <= {'H', 'D-D', 'D-T', 'D-He3', 'p-B11'}
            if context['fuel_ids']:
                assert context['source_ids'], e['id']
for c in canonical['claims']:
    a = claims[c['id']]
    assert a['text'] == c['claim'] and a['canonicalCategory'] == c['category']
    for field in ['timing', 'details', 'independent_verification', 'evidence_type']:
        assert a[field] == c[field], (c['id'], field)
for f in canonical['funding_events']:
    a = funding[f['id']]
    for field, value in f.items():
        assert a[field] == value, (f['id'], field)
    assert a['scope'] == f['qualifier']
    assert a['amountUsd'] == f['amount_usd']
    if f['amount'] is None:
        assert a['amountLabel'] == 'Undisclosed'
    elif f['amount_operator'] == '=' and f.get('amount_is_approximate'):
        assert a['amountLabel'].startswith('Approximately '), f['id']
for s in canonical['sites']:
    a = sites[s['id']]
    assert a['latitude'] == s['lat'] and a['longitude'] == s['lon']
    assert a['canonicalRole'] == s['role'] and a['canonicalStatus'] == s['status']
    assert a['coordinateNote'] == s['coordinate_note'] and a['approximate'] == s['approximate']
    assert a['related_entity_ids'] == s['related_entity_ids']
for r in canonical['records']:
    a = results[r['id']]
    for field in ['value', 'unit', 'boundary', 'date', 'source_ids']:
        assert a[field] == r[field], (r['id'], field)
    assert a['metricId'] == r['metric']
for s in canonical['sources']:
    for field, value in s.items():
        assert sources[s['id']][field] == value, (s['id'], field)
assert data['powerBalance'] == canonical['power_balance']
assert data['storyContent'] == canonical['story_content']
assert data['approaches'] == canonical['approaches']

copy_records = {**entities, **claims, **funding, **{r['id']: r for e in data['entities'] for r in e['assessment']}, **{r['id']: r for r in data['history']}}
copy_records.update({'risk-dimension:' + r['id']: r for r in data['risks']})
copy_records.update({'risk-theme:' + t['id']: t for t in data['riskThemes']})
# Editorial display fields must not replace the underlying engineering evidence.
for key, adapted in [('risk_dimensions', data['risks']), ('risk_themes', data['riskThemes'])]:
    by_id = {r['id']: r for r in adapted}
    for record in canonical[key]:
        for field, value in record.items():
            assert by_id[record['id']][field] == value, (record['id'], field)
for edit in json.loads((ROOT / '_copy.json').read_text()):
    record = copy_records[edit['id']]
    field = edit['field']
    assert record[field] == edit['sourceText'], edit['id']
    assert record['display' + field[0].upper() + field[1:]] == edit['displayText'], edit['id']
for entity in data['entities']:
    for risk in entity['assessment']:
        assert '..' not in risk['displayText'], risk['id']

# Shared sites and hybrid organization roles must survive adapter grouping.
assert entities['realta']['locations'][-1]['id'] == entities['wham']['locations'][0]['id']
assert entities['tokamak_energy']['roles'] == ['developer', 'supplier']
assert entities['kyoto_fusioneering']['role'] == 'supplier'
# The newest included NIF shot must not become the running record.
nif = [r for r in data['results'] if r['entity_id'] == 'nif']
assert max(nif, key=lambda r: r['value'])['date'] == '2025-04-07'
assert max(nif, key=lambda r: r['date'])['value'] == 3.8
assert results['nif_2026_latest']['driver_energy_mj'] is None
# Verify the lean runtime bundle mirrors the full record without shipping internal notes.
for key in ('rawMarkdown', 'research_notes', 'additionalContext'):
    assert all(key not in e for e in runtime['entities']), f'runtime data.json must omit {key}'
for key in ('editorialSections', 'storyContent', 'powerBalance', 'qualityNotes'):
    assert key not in runtime, f'runtime data.json must omit {key}'
assert len(runtime['entities']) == len(data['entities'])
assert len(runtime['sites']) == len(data['sites'])
assert len(runtime['sources']) == len(data['sources'])
assert len(runtime['results']) == len(data['results'])
assert sum(len(e['claims']) for e in runtime['entities']) == len(claims)
assert sum(len(e['funding']) for e in runtime['entities']) == len(funding)
check_refs(runtime)

print(f"Adapter PASS: {len(entities)} entities, {len(sites)} site-role records, {len(claims)} claims, {len(funding)} funding observations, {len(sources)} sources; canonical values and qualifications retained.")
