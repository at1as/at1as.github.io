"""Reconstruct current-category counts from the upstream default-branch history.

Only data is read from upstream; none of its scripts are executed.
"""
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
import re
import subprocess

import yaml

from _generate import RESOLVED, OPEN, validate

REPOSITORY = 'https://github.com/teorth/erdosproblems'
# Before this date, the database was being imported and "solved" was a broad
# bucket. September 1–2 also contain the invalid status "solprovedved".
FIRST_DATE = '2025-09-03'


def git(repo, *args):
    return subprocess.check_output(['git', '--git-dir=' + str(repo), *args], text=True)


def primitive_states(row):
    legacy = (row.get('status') or {}).get('state', '').strip()
    match = re.fullmatch(r'(.*?)\s*\(([^()]+)\)', legacy)
    informal, formal = (match[1].strip(), match[2].strip()) if match else (legacy, 'unformalized')
    informal = (row.get('informal_status') or {}).get('state', informal)
    formal = (row.get('formal_status') or {}).get('state', formal)
    return informal.lower(), formal.lower()


def count_rows(rows, commit, timestamp):
    statuses = {key: 0 for key, *_ in RESOLVED + OPEN}
    lean = {key: 0 for key, *_ in RESOLVED}
    attrs = {key: 0 for key in (
        'prize', 'statements', 'solutions', 'oeis_linked', 'oeis_distinct',
        'oeis_links', 'oeis_new', 'oeis_possible', 'oeis_unlinked',
        'oeis_inprogress', 'oeis_submitted', 'ambiguous', 'literature')}
    seen_ids, seen_oeis, duplicates = set(), set(), set()
    if not isinstance(rows, list) or not rows:
        raise ValueError('Expected a nonempty problem list')
    for row in rows:
        number = str(row.get('number', ''))
        if not number:
            raise ValueError('Missing problem number')
        if number in seen_ids:
            # The upstream README counts rows, not unique problem IDs. Preserve
            # that behavior rather than silently changing historical totals.
            duplicates.add(number)
        seen_ids.add(number)
        informal, formal = primitive_states(row)
        if informal not in statuses:
            raise ValueError(f'Unrecognized status {informal!r} for problem {number}')
        statuses[informal] += 1
        if formal == 'lean':
            attrs['solutions'] += 1
            if informal in lean:
                lean[informal] += 1
        attrs['prize'] += row.get('prize', 'no') != 'no'
        attrs['statements'] += (row.get('formalized') or {}).get('state', '').lower() == 'yes'
        attrs['ambiguous'] += row.get('comments', '?') == 'ambiguous statement'
        attrs['literature'] += row.get('comments', '?') == 'literature review sought'
        entries = row.get('oeis', [])
        if not isinstance(entries, list) or not all(isinstance(entry, str) for entry in entries):
            raise ValueError(f'Invalid OEIS list for problem {number}')
        ids = [entry for entry in entries if re.fullmatch(r'A\d{6}', entry)]
        possible = any('possible' in entry for entry in entries)
        attrs['oeis_linked'] += bool(ids)
        attrs['oeis_links'] += len(ids)
        attrs['oeis_possible'] += possible
        attrs['oeis_unlinked'] += possible and not ids
        attrs['oeis_inprogress'] += any('in progress' in entry for entry in entries)
        attrs['oeis_submitted'] += any('submitted' in entry for entry in entries)
        seen_oeis.update(ids)
    attrs['oeis_distinct'] = len(seen_oeis)
    attrs['oeis_new'] = sum(code >= 'A387000' for code in seen_oeis)
    date = datetime.fromisoformat(timestamp).astimezone(timezone.utc).date().isoformat()
    result = dict(as_of=date, recorded_at=timestamp, commit=commit,
                  source=f'{REPOSITORY}/blob/{commit}/data/problems.yaml',
                  total=len(rows), statuses=statuses, lean=lean, attributes=attrs)
    if duplicates:
        result['duplicate_problem_numbers'] = sorted(duplicates)
    validate(result)
    return result


def collect(repo=None):
    if repo is None:
        repo = Path(__file__).parent / '_cache' / 'upstream.git'
        repo.parent.mkdir(exist_ok=True)
        if repo.exists():
            subprocess.run(['git', '--git-dir=' + str(repo), 'fetch', 'origin', 'main:main'], check=True)
        else:
            subprocess.run(['git', 'clone', '--bare', '--single-branch', '--branch', 'main',
                            REPOSITORY + '.git', str(repo)], check=True)
    repo = Path(repo).resolve()
    head = git(repo, 'rev-parse', 'main').strip()
    by_day = defaultdict(list)
    for line in git(repo, 'log', '--first-parent', '--format=%H %cI', head,
                    '--', 'data/problems.yaml').splitlines():
        commit, timestamp = line.split()
        date = datetime.fromisoformat(timestamp).astimezone(timezone.utc).date().isoformat()
        if date >= FIRST_DATE:
            by_day[date].append((commit, timestamp))
    snapshots, omitted = [], []
    # CBaseLoader preserves strings (including YAML 1.2's unquoted "yes"), is
    # fast, and never constructs arbitrary Python objects.
    loader = getattr(yaml, 'CBaseLoader', yaml.BaseLoader)
    for date, revisions in sorted(by_day.items()):
        for commit, timestamp in revisions:
            try:
                rows = yaml.load(git(repo, 'show', commit + ':data/problems.yaml'), Loader=loader)
                snapshot = count_rows(rows, commit, timestamp)
            except (yaml.YAMLError, ValueError, TypeError, AttributeError) as error:
                omitted.append(dict(date=date, commit=commit, reason=str(error).splitlines()[0]))
                continue
            snapshots.append(snapshot)
            break  # Latest valid data revision for this UTC date.
    if not snapshots:
        raise ValueError('No compatible historical snapshots found')
    # Never silently serve an older final snapshot if the latest data is invalid.
    latest_data_commit = git(repo, 'log', '-1', '--format=%H', head, '--', 'data/problems.yaml').strip()
    if snapshots[-1]['commit'] != latest_data_commit:
        raise ValueError('Latest upstream data is invalid; keeping the existing published history')
    return dict(schema_version=1, repository=REPOSITORY, source_head=head,
                retrieved_at=datetime.now(timezone.utc).isoformat(),
                sampling='Latest valid data revision per recorded UTC date, on the main branch first-parent history.',
                categories='Current README categories, counted from primitive statuses or their legacy combined representation. Independent remains separate from solved.',
                start_note='Starts after the initial import and status-category cleanup, on 2025-09-03.',
                omitted_revisions=omitted, snapshots=snapshots)
