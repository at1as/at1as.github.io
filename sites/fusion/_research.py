"""Apply reviewed corrections without modifying the archived research handoff."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def research_data():
    original = (ROOT / '_handoff/data/fusion_atlas.json').read_bytes()
    corrections = json.loads((ROOT / '_corrections.json').read_text())
    assert hashlib.sha256(original).hexdigest() == corrections['base_sha256'], 'Review corrections against the new handoff'
    data = json.loads(original)
    entities = {e['id']: e for e in data['entities']}
    for entity_id, edit in corrections['entities'].items():
        entity = entities[entity_id]
        assert edit['expected'].keys() == edit['replace'].keys()
        for field, expected in edit['expected'].items():
            assert entity.get(field) == expected, f'Review stale correction: {entity_id}.{field}'
        entity.update(edit['replace'])
    data['sources'].extend(corrections['sources'])
    data['meta']['counts']['sources'] = len(data['sources'])
    data['meta']['corrections_reviewed_at'] = corrections['reviewed_at']
    data['meta']['corrections_scope'] = corrections['scope']
    data['meta']['original_sha256'] = corrections['base_sha256']
    return data


def canonical_bytes():
    return (json.dumps(research_data(), ensure_ascii=False, indent=2) + '\n').encode()
