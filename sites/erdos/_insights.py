"""Separate observed state changes from additions/removals in saved snapshots."""
from collections import Counter
from datetime import date
from pathlib import Path
import yaml

from _history import git, primitive_states

METRICS = ('resolved', 'lean', 'statements')
RESOLVED = {'proved', 'disproved', 'solved'}


def flags(row):
    informal, formal = primitive_states(row)
    return dict(resolved=informal in RESOLVED, lean=formal == 'lean',
                statements=(row.get('formalized') or {}).get('state', '').lower() == 'yes')


def compare(before, after):
    counts = [Counter(str(row['number']) for row in rows) for rows in (before, after)]
    ambiguous = {number for count in counts for number, n in count.items() if n > 1}
    maps = [{str(row['number']): flags(row) for row in rows if str(row['number']) not in ambiguous}
            for rows in (before, after)]
    result = {metric: dict(gained=[], lost=[], added=[], removed=[], unmatched=0) for metric in METRICS}
    for number in sorted(maps[0].keys() | maps[1].keys(), key=int):
        old, new = maps[0].get(number), maps[1].get(number)
        for metric in METRICS:
            kind = None
            if old is None and new[metric]:
                kind = 'added'
            elif new is None and old[metric]:
                kind = 'removed'
            elif old is not None and new is not None:
                if not old[metric] and new[metric]:
                    kind = 'gained'
                elif old[metric] and not new[metric]:
                    kind = 'lost'
            if kind:
                result[metric][kind].append(number)
    for metric in METRICS:
        actual = sum(flags(row)[metric] for row in after) - sum(flags(row)[metric] for row in before)
        r = result[metric]
        matched = len(r['gained']) + len(r['added']) - len(r['lost']) - len(r['removed'])
        r['unmatched'] = actual - matched
        if not ambiguous and r['unmatched']:
            raise ValueError('Unexplained transition count')
    return result, sorted(ambiguous, key=int)


def build(history, repo):
    from _history import count_rows
    points, intervals = [], []
    previous_rows = previous_snapshot = None
    loader = getattr(yaml, 'CBaseLoader', yaml.BaseLoader)
    for snapshot in history['snapshots']:
        rows = yaml.load(git(repo, 'show', snapshot['commit'] + ':data/problems.yaml'), Loader=loader)
        verified = count_rows(rows, snapshot['commit'], snapshot['recorded_at'])
        for key in ('total', 'statuses', 'lean', 'attributes'):
            if verified[key] != snapshot[key]:
                raise ValueError('Trend source does not match the saved Sankey history')
        points.append(dict(date=snapshot['as_of'], commit=snapshot['commit'], total=snapshot['total'],
                           resolved=sum(snapshot['statuses'][key] for key in RESOLVED),
                           resolved_lean=sum(snapshot['lean'].values()), lean=snapshot['attributes']['solutions'],
                           statements=snapshot['attributes']['statements']))
        if previous_rows is not None:
            changes, duplicates = compare(previous_rows, rows)
            intervals.append(dict(start=previous_snapshot['as_of'], end=snapshot['as_of'],
                                  days=(date.fromisoformat(snapshot['as_of']) - date.fromisoformat(previous_snapshot['as_of'])).days,
                                  before=previous_snapshot['commit'], after=snapshot['commit'],
                                  changes=changes, ambiguous_ids=duplicates))
        previous_rows, previous_snapshot = rows, snapshot
    return dict(schema_version=1, repository=history['repository'], points=points, intervals=intervals,
                method='Changes between saved daily snapshots, matched by problem number. Changes are assigned to the first snapshot observing them, not to a claimed discovery date. Additions and removals are separate. Duplicate IDs are excluded from identity matching and reconciled as unmatched rows.')


def matches(data, history):
    return data.get('schema_version') == 1 and [p['commit'] for p in data['points']] == [s['commit'] for s in history['snapshots']]
