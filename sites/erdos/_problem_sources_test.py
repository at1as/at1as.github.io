import os
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import unittest

from _problem_sources import (bloom_tao_evidence, covers_problem, observe_bloom_tao,
                              plasma_claim_evidence, plasma_resolution_dates)


class ProblemSourceTests(unittest.TestCase):
    def test_bloom_tao_reproduction_note_retains_link_without_upgrading_lean_scope(self):
        pin = 'c' * 40
        link = f'https://github.com/author/proof/blob/{pin}/README.md'
        [proof] = bloom_tao_evidence({'note': f'One part is formalized. Proof and reproduction: {link}'}, 'unformalized')
        self.assertEqual(proof, {'kind': 'lean_proof', 'url': link, 'scope': 'unspecified', 'revision': pin})

    def test_claim_evidence_keeps_artifact_and_catalog_revisions_separate(self):
        claim = dict(name='problems/analysis/E0001/claims/accepted', scope='partial',
                     evidence=['formalized', 'refereed'], links=[
                         dict(kind='formalization', url='https://github.com/openai/math/blob/adc7f1241/lean/Example.lean',
                              date='2026-09-24'),
                         dict(kind='paper', url='https://doi.org/10.1234/example'),
                         dict(kind='discussion', url='https://example.com/forum'),
                     ])
        lean, paper = plasma_claim_evidence(claim, 'b' * 40)
        self.assertEqual(lean['kind'], 'lean_proof')
        self.assertEqual(lean['scope'], 'partial')
        self.assertEqual(lean['revision'], 'adc7f1241b42e322a6451854ab7e4b4c146bf78a')
        self.assertTrue(lean['url'].endswith(f"/blob/{lean['revision']}/lean/Example.lean"))
        self.assertIn('/blob/' + 'b' * 40 + '/wiki/', lean['record_url'])
        self.assertEqual(lean['date'], '2026-09-24')
        self.assertEqual(lean['verification'], ['lean'])
        self.assertNotIn('revision', paper)
        self.assertEqual(paper['verification'], ['refereed'])

    def test_claim_without_a_proof_artifact_retains_its_pinned_record(self):
        claim = dict(name='problems/analysis/E0001/claims/accepted', scope='conditional', evidence=['formalized'])
        [record] = plasma_claim_evidence(claim, 'b' * 40)
        self.assertEqual(record['kind'], 'claim')
        self.assertEqual(record['scope'], 'conditional')
        self.assertEqual(record['revision'], 'b' * 40)
        self.assertEqual(record['verification'], ['lean'])

    def test_lean_claims_must_cover_every_part(self):
        first = dict(scope='partial', outcome='proved', settles=['first'])
        second = dict(scope='partial', outcome='disproved', settles=['second'])
        parts = ['first', 'second']
        self.assertFalse(covers_problem([first], parts))
        self.assertFalse(covers_problem([first, dict(second, scope='conditional')], parts))
        self.assertTrue(covers_problem([first, second], parts))

    def test_bloom_tao_distinguishes_baseline_and_first_observed_terminal_dates(self):
        dates = {}
        for day, first, second in [('03', 'proved', 'open'), ('04', 'proved', 'not provable'),
                                   ('05', 'disproved', 'independent')]:
            observe_bloom_tao(dates, dict(as_of='2025-09-' + day, commit=day), [
                dict(number='1', informal_status=dict(state=first)),
                dict(number='2', informal_status=dict(state=second)),
            ], baseline=day == '03')
        self.assertEqual(dates, {1: {'terminal_by': '2025-09-03', 'terminal_commit': '03'},
                                 2: {'terminal_on': '2025-09-04', 'terminal_commit': '04'}})

    def test_plasma_dates_survive_moves_and_restart_when_a_problem_is_resolved_again(self):
        with TemporaryDirectory() as directory:
            repo = Path(directory)
            subprocess.run(['git', 'init', '-q', str(repo)], check=True)
            page = repo / 'wiki/problems/analysis/E0001/_index.md'
            page.parent.mkdir(parents=True)
            other = page.parent.with_name('E0002') / page.name
            other.parent.mkdir()

            def commit(day):
                env = dict(os.environ, GIT_AUTHOR_NAME='Test', GIT_AUTHOR_EMAIL='test@example.com',
                           GIT_COMMITTER_NAME='Test', GIT_COMMITTER_EMAIL='test@example.com',
                           GIT_AUTHOR_DATE=day + 'T12:00:00Z', GIT_COMMITTER_DATE=day + 'T12:00:00Z')
                subprocess.run(['git', '-C', directory, 'add', '.'], check=True)
                subprocess.run(['git', '-C', directory, 'commit', '-qm', day], env=env, check=True)
                return subprocess.check_output(['git', '-C', directory, 'rev-parse', 'HEAD'], text=True).strip()

            page.write_text('---\nstatus: solved\n---\n')
            other.write_text(page.read_text())
            first = commit('2026-09-04')
            moved = repo / 'wiki/problems/polynomials/E0001/_index.md'
            moved.parent.mkdir(parents=True)
            page.rename(moved)
            commit('2026-09-05')
            other.write_text('---\nstatus: claimed\n---\n')
            commit('2026-09-06')
            other.write_text(moved.read_text())
            latest = commit('2026-09-07')
            self.assertEqual(plasma_resolution_dates(repo / '.git', latest), {
                1: {'terminal_by': '2026-09-04', 'terminal_commit': first},
                2: {'terminal_on': '2026-09-07', 'terminal_commit': latest},
            })


if __name__ == '__main__':
    unittest.main()
