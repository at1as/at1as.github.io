"""Read source records and join them by Erdős problem number for Trends."""
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
import re
import subprocess
import tarfile
from tempfile import TemporaryFile

import yaml

from _history import git, primitive_states
from _insights import RESOLVED

LOADER = getattr(yaml, 'CBaseLoader', yaml.BaseLoader)
SCHEMA_VERSION = 4
BLOOM_TAO = 'https://github.com/teorth/erdosproblems'
PLASMA = 'https://github.com/plasma-ai/erdos'
PLASMA_CACHE = Path(__file__).with_name('_cache') / 'plasma.git'
PLASMA_ROOT = re.compile(r'erdos-([0-9a-f]{40})')
PLASMA_PAGE = re.compile(r'wiki/(problems/[^/]+/E(\d+))/(_index\.md|claims/(?!_index\.md)[^/]+\.md)')
ONE_SIDED = {'not_provable', 'not_disprovable'}
TERMINAL = RESOLVED | ONE_SIDED | {'independent'}
PLASMA_RESOLVED = RESOLVED | {'independent'}
METRICS = ['resolved', 'lean', 'statements']
GITHUB_REVISION = re.compile(r'^https://github\.com/([^/]+/[^/]+)/(?:blob|tree|commit)/([0-9a-f]{7,40})(?=[/#?]|$)')
GITHUB_ACTIONS_RUN = re.compile(r'^https://github\.com/[^/]+/[^/]+/actions/runs/\d+(?:[/?#]|$)')
BLOOM_TAO_REPRODUCTION = re.compile(r'Proof and reproduction:\s*(https://github\.com/[^\s<>]+)')
ARTIFACT_KINDS = {'formalization': 'lean_proof', 'paper': 'paper', 'preprint': 'preprint'}
# Verified commit expansions for abbreviated revisions in upstream citations.
PROOF_REVISIONS = {
    ('openai/math', 'adc7f1241'): 'adc7f1241b42e322a6451854ab7e4b4c146bf78a',
    ('plby/lean-proofs', '8822f7dd'): '8822f7ddef30fadbd92e1c6ab4ed897af356af5e',
    ('Woett/Lean-files', '9e927dd4'): '9e927dd4bbb4fe17c92e65c2a0b1b6909a5ff5f4',
    ('Larsen-Daniel/Erdos-825', '563482bba218'): '563482bba218acd57c72c83b624da82647f29d9c',
    ('Larsen-Daniel/Erdos-318', '39139e2b'): '39139e2b16b65b478da842365196fa3cc68539dd',
}
# These three Bloom–Tao links name unversioned repositories. Plasma's accepted
# claim records cite these exact revisions of the same proof repositories.
BLOOM_TAO_PROOF_PINS = {
    'https://github.com/jbaelaw/erdos190-lean':
        'https://github.com/jbaelaw/erdos190-lean/tree/1213a40223a398cc56be20f983211ae6df683c77',
    'https://github.com/primateria/erdos608':
        'https://github.com/primateria/erdos608/tree/b50849234b8de6cb5c642b5cb0479cab2e9e9908',
    'https://github.com/beetree/math_erdos_1112':
        'https://github.com/beetree/math_erdos_1112/blob/531f06c6f8d4b432f1cffd43a52f6afcc17d4072/lean/Erdos1112Proof/Final.lean',
}


def unique_rows(rows):
    numbers = Counter(int(row['number']) for row in rows)
    return {int(row['number']): row for row in rows if numbers[int(row['number'])] == 1}


def terminal_date(date, commit, baseline):
    return {('terminal_by' if baseline else 'terminal_on'): date, 'terminal_commit': commit}


def observe_bloom_tao(dates, snapshot, rows, baseline):
    """Track the start of the current terminal period in the saved snapshots."""
    current = {number for number, row in unique_rows(rows).items()
               if primitive_states(row)[0].replace(' ', '_') in TERMINAL}
    for number in dates.keys() - current:
        del dates[number]
    for number in current - dates.keys():
        dates[number] = terminal_date(snapshot['as_of'], snapshot['commit'], baseline)


def metric_state(resolved, lean, statement=False):
    return [metric for metric, present in zip(METRICS, (resolved, lean, statement)) if present]


def append_observation(history, previous, current, date, commit):
    """Store a baseline followed by per-number replacements, including removals."""
    changes = {number: current.get(number) for number in sorted(previous.keys() | current.keys())
               if previous.get(number) != current.get(number)}
    history.append(dict(date=date, commit=commit, changes=changes))
    previous.clear()
    previous.update(current)


def observe_bloom_tao_history(dates, history):
    previous = {}

    def observe(snapshot, rows, baseline):
        observe_bloom_tao(dates, snapshot, rows, baseline)
        current = defaultdict(list)
        for row in rows:
            status, formal = primitive_states(row)
            statement = (row.get('formalized') or {}).get('state', '').lower() == 'yes'
            current[int(row['number'])].append(metric_state(status in RESOLVED, formal == 'lean', statement))
        append_observation(history, previous, current, snapshot['as_of'], snapshot['commit'])

    return observe


def evidence_link(kind, url, scope, *, record_url=None, verification=(), date=None):
    revision = None
    if match := GITHUB_REVISION.match(url):
        revision = PROOF_REVISIONS.get(match.groups(), match[2])
        url = url[:match.start(2)] + revision + url[match.end(2):]
    entry = dict(kind=kind, url=url, scope=scope)
    if revision:
        entry['revision'] = revision
    if record_url:
        entry['record_url'] = record_url
    if verification:
        entry['verification'] = list(verification)
    if date and date != 'null':
        entry['date'] = date
    return entry


def bloom_tao_evidence(formal_status, formal):
    if proof := formal_status.get('url'):
        checked = formal == 'lean'
        return [evidence_link('lean_proof', BLOOM_TAO_PROOF_PINS.get(proof, proof),
                              'full' if checked else 'unspecified', verification=['lean'] if checked else [])]
    if match := BLOOM_TAO_REPRODUCTION.search(formal_status.get('note') or ''):
        return [evidence_link('lean_proof', match[1], 'unspecified')]
    return []


def bloom_tao(repo, snapshot, dates, history):
    rows = yaml.load(git(repo, 'show', f'{snapshot["commit"]}:data/problems.yaml'), Loader=LOADER)
    records = {}
    for number, row in unique_rows(rows).items():
        status, formal = primitive_states(row)
        statement = (row.get('formalized') or {}).get('state', '').lower()
        evidence = bloom_tao_evidence(row.get('formal_status') or {}, formal)
        records[number] = dict(status=status.replace(' ', '_'), lean_statement={'yes': True, 'no': False}.get(statement),
                               lean_solution=formal == 'lean', evidence=evidence, **dates.get(number, {}))
    revision = snapshot['commit']
    return dict(id='bloom-tao', label='Bloom–Tao', date=snapshot['as_of'],
                revision=revision, url=snapshot['source'], repository=BLOOM_TAO,
                repository_created_at='2025-08-31T16:20:38Z', website_url='https://www.erdosproblems.com/',
                policy_url=f'{BLOOM_TAO}/blob/{revision}/CONTRIBUTING.md',
                resolved_statuses=sorted(RESOLVED), metrics=METRICS, history=history,
                license=f'{BLOOM_TAO}/blob/{revision}/LICENSE', license_id='Apache-2.0', license_label='Apache 2.0'), records


def covers_problem(claims, parts):
    """Use Plasma's rules for full claims, named parts, and ZFC independence."""
    if any(claim['scope'] == 'full' for claim in claims):
        return True
    covered = defaultdict(set)
    for claim in claims:
        if claim['scope'] != 'partial' or claim['outcome'] == 'decidable':
            continue
        for part in claim.get('settles') or [None]:
            covered[part].add(claim['outcome'])
    return ONE_SIDED <= covered[None] or bool(parts) and all(
        bool(covered[part] - ONE_SIDED) or ONE_SIDED <= covered[part] for part in parts)


def frontmatter(file):
    if file.readline().strip() != b'---':
        raise ValueError('Expected Plasma page frontmatter')
    lines = []
    for line in file:
        if line.strip() == b'---':
            return yaml.load(b''.join(lines), Loader=LOADER)
        lines.append(line)
    raise ValueError('Unterminated Plasma page frontmatter')


def plasma_claim_evidence(metadata, revision):
    record_url = f'{PLASMA}/blob/{revision}/wiki/{metadata["name"]}.md'
    scope = metadata['scope']
    tags = metadata.get('evidence') or []
    evidence = []
    for link in metadata.get('links') or []:
        url = link['url']
        kind = ARTIFACT_KINDS.get(link['kind'])
        if link['kind'] == 'record' and (url.startswith('https://palomar-registry.org/') or GITHUB_ACTIONS_RUN.match(url)):
            kind = 'verification_record'
        if not kind or not url.startswith(('https://', 'http://')):
            continue
        verification = []
        if kind == 'lean_proof' and 'formalized' in tags:
            verification.append('lean')
        if kind == 'paper' and 'refereed' in tags:
            verification.append('refereed')
        evidence.append(evidence_link(kind, url, scope, record_url=record_url,
                                      verification=verification, date=link.get('date')))
    if not evidence or ('formalized' in tags and not any(entry['kind'] == 'lean_proof' for entry in evidence)):
        verification = ['lean' if tag == 'formalized' else tag for tag in tags]
        evidence.append(evidence_link('claim', record_url, scope, verification=verification,
                                      date=metadata.get('published')))
    return evidence


def read_plasma(archive, *, include_evidence=True):
    root = archive.next()
    match = PLASMA_ROOT.fullmatch(root.name) if root and root.isdir() else None
    if not match:
        raise ValueError('Use a Plasma GitHub source archive pinned to a full commit SHA')
    revision = match[1]
    pages, claims, evidence = {}, defaultdict(list), defaultdict(list)
    for member in archive:
        if not member.isfile() or not member.name.startswith(root.name + '/'):
            continue
        match = PLASMA_PAGE.fullmatch(member.name.removeprefix(root.name + '/'))
        if not match:
            continue
        slug, number, path = match.groups()
        number = int(number)
        with archive.extractfile(member) as file:
            metadata = frontmatter(file)
        if path == '_index.md':
            if number in pages or metadata['name'] != slug:
                raise ValueError(f'Ambiguous Plasma problem #{number}')
            pages[number] = metadata
        else:
            if metadata['name'] != f'{slug}/{path.removesuffix(".md")}':
                raise ValueError(f'Mismatched Plasma claim path for #{number}')
            if metadata['status'] == 'accepted':
                claims[number].append(dict(outcome=metadata['claim'], scope=metadata['scope'],
                    evidence=metadata.get('evidence') or [], settles=metadata.get('settles') or []))
                if include_evidence:
                    evidence[number].extend(plasma_claim_evidence(metadata, revision))
    if not pages or claims.keys() - pages.keys():
        raise ValueError('Incomplete Plasma problem archive')

    records = {}
    for number, page in pages.items():
        status = page['status']
        accepted = claims.get(number, [])
        parts = page.get('parts') or []
        if (status == 'solved') != covers_problem(accepted, parts):
            raise ValueError(f'Plasma status and accepted claims differ for #{number}')
        lean = [claim for claim in accepted if 'formalized' in claim['evidence']]
        if status == 'solved':
            outcome = page['claim']
            status = 'solved' if outcome == 'answered' else outcome
            if status not in PLASMA_RESOLVED:
                raise ValueError(f'Unexpected Plasma outcome for #{number}: {outcome}')
        records[number] = dict(status=status, lean_statement=None, lean_solution=covers_problem(lean, parts))
        if include_evidence:
            records[number]['evidence'] = evidence[number]
    return dict(id='plasma', label='Plasma', date=datetime.fromtimestamp(root.mtime, timezone.utc).date().isoformat(),
                revision=revision, url=f'{PLASMA}/tree/{revision}/wiki/problems', repository=PLASMA,
                repository_created_at='2026-10-08T21:38:12Z', website_url='https://erdosproblems.ai/',
                policy_url=f'{PLASMA}/blob/{revision}/docs/verification.md',
                problem_url='https://erdosproblems.ai/problems/{number}', resolved_statuses=sorted(PLASMA_RESOLVED),
                license=f'{PLASMA}/blob/{revision}/LICENSE-CC-BY-4.0', license_id='CC-BY-4.0',
                license_label='CC BY 4.0'), records


def plasma_resolution_dates(repo, revision):
    """Track when the main branch last moved each problem into solved."""
    log = git(repo, 'log', '--first-parent', '--reverse', '--diff-merges=first-parent',
              '--no-renames', '--no-ext-diff', '--format=%x00%H%x09%cI', '-p', '-U0', revision, '--',
              ':(glob)wiki/problems/*/E*/_index.md')
    dates = {}
    for index, entry in enumerate(log.split('\0')[1:]):
        header, *patch = entry.splitlines()
        commit, timestamp = header.split('\t')
        date = datetime.fromisoformat(timestamp).astimezone(timezone.utc).date().isoformat()
        started, ended = set(), set()
        number = None
        for line in patch:
            if line.startswith('diff --git '):
                match = re.search(r' b/wiki/problems/[^/]+/E(\d+)/_index\.md$', line)
                number = int(match[1]) if match else None
            elif number is not None and line == '+status: solved':
                started.add(number)
            elif number is not None and line == '-status: solved':
                ended.add(number)
        # If the same number is removed and added as solved in a single commit,
        # its page moved folders and the recorded status continued.
        for number in ended - started:
            dates.pop(number, None)
        for number in started:
            dates.setdefault(number, terminal_date(date, commit, baseline=index == 0))
    return dates


def plasma(repo=None):
    if repo is None:
        repo = PLASMA_CACHE
        if repo.exists():
            subprocess.run(['git', f'--git-dir={repo}', 'fetch', '--no-tags', 'origin', 'main:main'], check=True)
        else:
            repo.parent.mkdir(exist_ok=True)
            subprocess.run(['git', 'clone', '--bare', '--single-branch', '--branch', 'main',
                            '--no-tags', PLASMA + '.git', str(repo)], check=True)
    revision, timestamp = git(repo, 'log', '-1', '--format=%H %cI', 'main').split()
    observations = {}
    for line in git(repo, 'log', '--first-parent', '--reverse', '--format=%H %cI', revision, '--', 'wiki/problems').splitlines() + [f'{revision} {timestamp}']:
        commit, timestamp = line.split()
        date = datetime.fromisoformat(timestamp).astimezone(timezone.utc).date().isoformat()
        observations[date] = commit
    history, previous = [], {}
    for date, commit in sorted(observations.items()):
        with TemporaryFile() as download:
            subprocess.run(['git', f'--git-dir={repo}', 'archive', f'--prefix=erdos-{commit}/',
                            commit, 'wiki/problems'], stdout=download, check=True)
            download.seek(0)
            with tarfile.open(fileobj=download, mode='r:') as archive:
                source, records = read_plasma(archive, include_evidence=commit == revision)
        current = {number: [metric_state(record['status'] in PLASMA_RESOLVED, record['lean_solution'])]
                   for number, record in records.items()}
        append_observation(history, previous, current, date, commit)
    if source['revision'] != revision:
        raise ValueError('Plasma observations do not end at the source revision')
    source.update(metrics=METRICS[:2], history=history)
    dates = plasma_resolution_dates(repo, revision)
    if dates.keys() != {number for number, record in records.items() if record['status'] in PLASMA_RESOLVED}:
        raise ValueError('Plasma resolution history does not match the current solved problems')
    for number, date in dates.items():
        records[number].update(date)
    return source, records


# Adapters return source metadata and a dict of normalized records keyed by number.
SECONDARY_SOURCES = {'plasma': plasma}


def collect(repo, snapshot, bloom_tao_dates, bloom_tao_history, previous, *, refresh=False, repositories=None):
    sources = [bloom_tao(repo, snapshot, bloom_tao_dates, bloom_tao_history)]
    saved = {source['id']: source for source in previous.get('sources', [])}
    repositories = repositories or {}
    for key, load in SECONDARY_SOURCES.items():
        if refresh or key in repositories:
            sources.append(load(repositories.get(key)))
        elif key in saved:
            if previous.get('schema_version') != SCHEMA_VERSION:
                raise ValueError('Refresh the secondary sources to update problems.json to the new schema')
            sources.append((saved[key], {row['number']: row['sources'][key]
                                         for row in previous['problems'] if key in row['sources']}))
    by_number = defaultdict(dict)
    for source, records in sources:
        for number, record in records.items():
            by_number[number][source['id']] = record
    return dict(schema_version=SCHEMA_VERSION, sources=[source for source, _ in sources],
                problems=[dict(number=number, sources=records) for number, records in sorted(by_number.items())])
