#!/usr/bin/env python3
"""Reproducible presentation adapter for the supplied canonical Fusion Atlas.

Native records govern facts, numbers, coordinates, evidence categories and joins.
UI slugs are preserved alongside canonicalId. The original is published verbatim.
Run python3 sites/fusion/_extract.py; no network or third-party dependencies.
"""
import hashlib
import json
import re
import shutil
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent
canonical_bytes = (ROOT / '_handoff/data/fusion_atlas.json').read_bytes()
C = json.loads(canonical_bytes)
report_path = ROOT / '_handoff/01_RESEARCH_REPORT.md'
report = report_path.read_text()
LINK = re.compile(r'\[([^\]]+)\]\((https?://[^\s)]+)\)')


def slug(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def human(text):
    return text.replace('_', ' ') if isinstance(text, str) else text


def clean(text):
    return re.sub(r'\s+', ' ', LINK.sub('', text).replace('**', '')).strip()


def refs(text):
    return list(dict.fromkeys(C['source_aliases'].get(k, k) for k, _ in LINK.findall(text) if re.fullmatch(r'[A-Z][A-Z0-9_]+', k)))


def section(text, heading, level=2):
    m = re.search(r'^' + '#' * level + ' ' + re.escape(heading) + r'\n(.*?)(?=^#{1,' + str(level) + r'} |\Z)', text, re.M | re.S)
    return m.group(1).strip() if m else ''


def headings(text, level):
    return [(m.group(1), m.group(2).strip()) for m in re.finditer(r'^' + '#' * level + r' ([^\n]+)\n(.*?)(?=^#{1,' + str(level) + r'} |\Z)', text, re.M | re.S)]


def rows(text):
    return [[s.strip() for s in x.strip('|').split('|')] for x in text.splitlines()
            if x.startswith('|') and not re.fullmatch(r'[| :\-]+', x)][1:]


def compact_amount(value):
    for magnitude, suffix in ((1e9, 'B'), (1e6, 'M'), (1e3, 'K')):
        if value >= magnitude:
            return f'{value / magnitude:g}{suffix}'
    return f'{value:g}'


entity_ids = {e['id']: slug(e['name']) for e in C['entities']}
entity_names = {e['id']: e['name'] for e in C['entities']}
approaches = {a['id']: a for a in C['approaches']}
categories = {c['id']: c['label'] for c in C['evidence_categories']}
sites = {s['id']: s for s in C['sites']}
claims_by_id = {c['id']: c for c in C['claims']}
risks_by_id = {r['id']: r for r in C['risk_assessments']}


def adapt_site(s):
    return {**s, 'canonicalId': s['id'], 'canonicalRole': s['role'],
            'entityId': entity_ids[s['entity_id']], 'role': re.sub(r'\bR and d\b', 'R&D', s.get('role_label') or human(s['role'])),
            'status': human(s['status']), 'canonicalStatus': s['status'],
            'place': ', '.join(v for v in (s.get('city'), s.get('region'), s.get('country')) if v),
            'latitude': s['lat'], 'longitude': s['lon'], 'precision': s['coordinate_precision'],
            'coordinateNote': s['coordinate_note'], 'physicalSiteId': s['physical_site_id'],
            'relatedEntityIds': [entity_ids[i] for i in s.get('related_entity_ids', [])],
            'sourceIds': s['source_ids']}


def adapt_claim(c):
    t = c['timing']
    return {**c, 'canonicalId': c['id'], 'canonicalCategory': c['category'],
            'entityId': entity_ids[c['entity_id']], 'category': categories[c['category']],
            'kind': c['category'].replace('_', '-'), 'text': c['claim'],
            'date': t.get('display') or t.get('date'), 'dateRole': human(t['role']),
            'datePrecision': t['precision'], 'evidenceType': c['evidence_type'], 'sourceIds': c['source_ids']}


def adapt_funding(f):
    prefixes = {'=': '', '>': 'More than ', '<=': 'Up to ', 'nearly': 'Nearly ', 'approximately': 'Approximately '}
    prefix = prefixes[f['amount_operator']]
    if f['amount_operator'] == '=' and f.get('amount_is_approximate'):
        prefix = 'Approximately '
    label = 'Undisclosed' if f['amount'] is None else prefix + f['currency'] + ' ' + compact_amount(f['amount'])
    return {**f, 'canonicalId': f['id'], 'entityId': entity_ids[f['entity_id']],
            'date': f['announcement_date'] or 'Undated live page', 'amountLabel': label,
            'amountUsd': f['amount_usd'], 'type': human(f['event_type']), 'scope': f['qualifier'],
            'sourceIds': f['source_ids'], 'aggregationNote': human(f['aggregation_policy']),
            'amountOperator': f['amount_operator'], 'usdConversionBasis': f['usd_conversion_basis']}


entities = []
for e in C['entities']:
    joined = list(dict.fromkeys(e['evidence_claim_ids'] + e['target_claim_ids']))
    claims = [adapt_claim(claims_by_id[i]) for i in joined]
    # Actual categories govern; the two ID lists are navigation conveniences.
    targets = [c for c in claims if c['canonicalCategory'] == 'target']
    funding = [adapt_funding(f) for f in C['funding_events'] if f['entity_id'] == e['id']]
    assessment = [{**risks_by_id[i], 'text': risks_by_id[i]['headline'] + '. ' + risks_by_id[i]['interpretation'],
                   'sourceIds': risks_by_id[i]['source_ids']} for i in e['risk_note_ids']]
    for a in assessment:
        headline = a['headline'].rstrip('. ')
        interpretation = a['interpretation'].strip()
        a['displayText'] = interpretation if headline == interpretation.rstrip('. ') else headline + '. ' + interpretation
    role = 'public' if e['sector'] == 'public_project_or_facility' else 'developer' if 'developer' in e['entity_type'] else 'supplier'
    roles = [role] + (['supplier'] if role == 'developer' and 'supplier' in e['entity_type'] else [])
    approach = approaches.get(e.get('approach_id'), {})
    note_strings = [v for v in e.get('research_notes', {}).values() if isinstance(v, str)]
    item = {**e, 'id': entity_ids[e['id']], 'canonicalId': e['id'], 'role': role, 'roles': roles,
            'approach': approach.get('name', 'Enabling systems supplier' if role == 'supplier' else 'Enabling infrastructure'),
            'approachId': e.get('approach_id'), 'variant': human(e.get('approach_variant')) or '',
            'experimentalFuel': e.get('operating_fuel') or '', 'intendedFuel': e.get('intended_fuel') or '',
            'mechanismSteps': e.get('mechanism', []), 'mechanism': ' '.join(e.get('mechanism', [])),
            'locations': [adapt_site(sites[i]) for i in e['site_ids']], 'claims': claims,
            'targets': targets, 'funding': funding, 'assessment': assessment,
            'fundingSummary': e['funding_summary']['display'], 'additionalContext': ' '.join(note_strings),
            'sourceIds': e['source_ids']}
    item['rawMarkdown'] = '\n\n'.join([
        '## ' + e['name'], e['summary'], '**Approach:** ' + item['approach'],
        '**Experimental fuel/status:** ' + item['experimentalFuel'], '**Intended fuel:** ' + item['intendedFuel'],
        '**Mechanism:** ' + item['mechanism'], *['- **' + c['category'] + '.** ' + c['text'] for c in claims],
        '**Financing snapshot:** ' + item['fundingSummary'], *['- ' + a['text'] for a in assessment], item['additionalContext']])
    entities.append(item)

sources = [{**s, 'published': s['published_date'] or 'Undated live page', 'reviewed': s['last_reviewed_at'],
            'type': human(s['source_type']), 'description': s['publisher'] + '. ' + (s['published_date'] or 'Undated live page') + '. ' + human(s['source_type']) + '.',
            'note': s.get('independence_note') or s.get('note') or '', 'urls': [s['url']]}
           for s in C['sources']]
history = [{**h, 'date': h['timing'].get('display') or h['timing'].get('date'), 'dateRole': human(h['timing']['role']),
            'category': 'Target' if h['status'] == 'target' else 'Historical event',
            'text': h['description'], 'sourceIds': h['source_ids']} for h in C['timeline']]
results = [{**r, 'canonicalId': r['id'], 'entityId': entity_ids[r['entity_id']], 'facility': entity_names[r['entity_id']],
            'metricId': r['metric'], 'metric': human(r['metric']), 'valueLabel': str(r.get('reported_display', r['value'])) + ' ' + r['unit'],
            'qualifier': 'approximate' if 'approximately' in str(r.get('reported_display', '')) else 'reported',
            'category': 'Experimental result', 'sourceIds': r['source_ids']} for r in C['records']]
risks = [{**r, 'name': r['label'], 'evidenceNeeded': r['evidence_required'], 'sourceIds': r['source_ids']} for r in C['risk_dimensions']]
risk_themes = [dict(t) for t in C['risk_themes']]
glossary = [{**g, 'distinction': g['do_not_confuse_with'], 'sourceIds': g['source_ids']} for g in C['glossary']]

# Reader-facing edits keep the exact source wording alongside the display copy.
# A changed upstream record requires a fresh editorial review, not a silent override.
copy_overrides = json.loads((ROOT / '_copy.json').read_text())
copy_records = {e['canonicalId']: e for e in entities}
copy_records.update({r['id']: r for e in entities for r in e['claims'] + e['assessment'] + e['funding']})
copy_records.update({r['id']: r for r in history})
copy_records.update({'risk-dimension:' + r['id']: r for r in risks})
copy_records.update({'risk-theme:' + t['id']: t for t in risk_themes})
for edit in copy_overrides:
    record = copy_records[edit['id']]
    field = edit['field']
    assert record[field] == edit['sourceText'], f"Review stale display copy: {edit['id']}.{field}"
    record['display' + field[0].upper() + field[1:]] = edit['displayText']

# Only these explanatory tables use the accompanying narrative; canonical JSON
# has no separate fuel-comparison or gain-definition collection.
fuels = [{'name': name, 'benefits': benefits, 'challenges': challenges, 'label': label,
          'sourceIds': ['PHY_002', 'PHY_006', 'PHY_007'], 'provenance': 'Accompanying research report, section 4'}
         for name, benefits, challenges, label in rows(section(report, '4 A fuel comparison that preserves the tradeoffs'))]
gain_boundaries = [{'name': name, 'definition': definition, 'limitation': limitation, 'provenance': 'Accompanying research report, section 6'}
                   for name, definition, limitation in rows(section(section(report, '6 The gain explainer is the central interactive'), 'Define the denominator', 3))]

data = {'meta': {**C['meta'], 'subtitle': C['meta']['public_title'], 'snapshot': C['meta']['as_of'], 'schemaVersion': 2,
                 'provenance': 'Presentation adapter of the supplied canonical Fusion Atlas snapshot; records, numbers, coordinates and categories come from fusion_atlas.json.',
                 'canonicalFile': 'fusion_atlas.json', 'canonicalSha256': hashlib.sha256(canonical_bytes).hexdigest(),
                 'reportSha256': hashlib.sha256(report.encode()).hexdigest(), 'coordinates': C['meta']['location_policy'],
                 'funding': C['meta']['currency_policy'], 'sourceStatus': C['meta']['source_policy'],
                 'counts': {**C['meta']['counts'], 'companiesAndSuppliers': sum(e['role'] != 'public' for e in entities),
                            'publicPrograms': sum(e['role'] == 'public' for e in entities), 'fundingObservations': len(C['funding_events'])}},
        'entities': entities, 'sites': [adapt_site(s) for s in C['sites']], 'sources': sources,
        'history': history, 'results': results, 'risks': risks, 'glossary': glossary, 'fuels': fuels, 'gainBoundaries': gain_boundaries,
        'approaches': C['approaches'], 'powerBalance': C['power_balance'], 'storyContent': C['story_content'],
        'riskThemes': risk_themes, 'approachRiskProfiles': C['approach_risk_profiles'],
        'evidenceCategories': C['evidence_categories'], 'evidenceStates': C['evidence_states'],
        'qualityNotes': C['quality_notes'], 'sectorContext': C['sector_context'], 'metrics': C['metrics'],
        'amountOperatorLabels': C['amount_operator_labels'], 'sourceAliases': C['source_aliases'],
        'editorialSections': [{'title': title, 'rawMarkdown': body, 'sourceIds': refs(body)} for title, body in headings(report.split('# Appendix A')[0], 2)]}
(ROOT / 'data.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'fusion_atlas.json').write_bytes(canonical_bytes)
shutil.copyfile(report_path, ROOT / '_research.md')
shutil.copyfile(report_path, ROOT / 'research-report.md')
print(json.dumps(data['meta']['counts'], indent=2))
