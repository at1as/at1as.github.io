import unittest
from pathlib import Path
from unittest.mock import patch

from _generate import parse_summary
from _history import count_rows, primitive_states, verify_summary


class SummaryFormatTest(unittest.TestCase):
    summary = (Path(__file__).parent / '_fixtures/summary.md').read_text()

    def test_statistics_page_counts_and_source(self):
        data = parse_summary(self.summary)
        self.assertEqual(data['total'], 1221)
        self.assertEqual(data['statuses'], {
            'proved': 336, 'disproved': 139, 'solved': 101, 'open': 593,
            'decidable': 8, 'falsifiable': 25, 'verifiable': 7,
            'not provable': 3, 'not disprovable': 6, 'independent': 3,
        })
        self.assertEqual(data['lean'], {'proved': 183, 'disproved': 97, 'solved': 33})
        self.assertEqual(data['attributes']['statements'], 864)
        self.assertEqual(data['attributes']['solutions'], 317)
        self.assertEqual(data['attributes']['oeis_submitted'], 0)
        self.assertTrue(data['source'].endswith('/STATISTICS.md'))

    def legacy_readme(self):
        return self.summary.replace('STATS:', 'TABLE:').replace('&', '\\&').replace(
            '<!-- TABLE:END -->', '\n| # | Status |\n| [999](https://teorth.github.io/erdosproblems/?status=proved) | proved |\n<!-- TABLE:END -->')

    def test_legacy_inline_counts_ignore_problem_table(self):
        current, legacy = parse_summary(self.summary), parse_summary(self.legacy_readme())
        for key in ('total', 'statuses', 'lean', 'attributes'):
            self.assertEqual(current[key], legacy[key])
        self.assertTrue(legacy['source'].endswith('/README.md'))

    def test_relocated_or_malformed_summary_has_actionable_error(self):
        for text in ('See [Summary statistics](STATISTICS.md).\n<!-- TABLE:START -->\n| # | Status |\n<!-- TABLE:END -->',
                     self.summary.replace('<!-- STATS:END -->', '')):
            with self.assertRaisesRegex(ValueError, 'use STATISTICS.md'):
                parse_summary(text)

    def test_refresh_uses_statistics_when_present_and_legacy_readme_otherwise(self):
        for path, content in [('STATISTICS.md', self.summary), ('README.md', self.legacy_readme())]:
            def read(repo, *args):
                if args[0] == 'ls-tree':
                    return 'README.md\n' + ('STATISTICS.md\n' if path == 'STATISTICS.md' else '')
                self.assertEqual(args, ('show', 'head:' + path))
                return content
            with patch('_history.git', side_effect=read):
                source = verify_summary('repo', 'head', parse_summary(self.summary))
            self.assertEqual(source, f'https://github.com/teorth/erdosproblems/blob/head/{path}')

    def test_refresh_rejects_stale_summary(self):
        snapshot = parse_summary(self.summary)
        snapshot['attributes']['statements'] = 865
        with patch('_history.git', side_effect=['README.md\nSTATISTICS.md\n', self.summary]):
            with self.assertRaisesRegex(ValueError, 'attributes do not match STATISTICS.md'):
                verify_summary('repo', 'head', snapshot)


class HistoryCountsTest(unittest.TestCase):
    def test_current_and_legacy_statuses_and_overlapping_attributes(self):
        rows = [
            {'number': '1', 'status': {'state': 'proved (Lean)'}, 'prize': '$100',
             'formalized': {'state': 'yes'}, 'oeis': ['A387001', 'possible']},
            {'number': '2', 'status': {'state': 'disproved'}, 'oeis': ['A387001', 'A123456']},
            {'number': '3', 'status': {'state': 'solved'}, 'informal_status': {'state': 'independent'},
             'formal_status': {'state': 'unformalized'}, 'comments': 'ambiguous statement'},
            {'number': '4', 'informal_status': {'state': 'open'}, 'formal_status': {'state': 'Lean'},
             'oeis': ['possible', 'in progress', 'submitted'], 'comments': 'literature review sought'},
        ]
        s = count_rows(rows, 'a' * 40, '2026-09-09T00:00:00+00:00')
        self.assertEqual(s['total'], 4)
        self.assertEqual(s['statuses']['independent'], 1)
        self.assertEqual(s['statuses']['solved'], 0)
        self.assertEqual(s['lean'], {'proved': 1, 'disproved': 0, 'solved': 0})
        self.assertEqual(s['attributes'], {
            'prize': 1, 'statements': 1, 'solutions': 2, 'oeis_linked': 2,
            'oeis_distinct': 2, 'oeis_links': 3, 'oeis_new': 1, 'oeis_possible': 2,
            'oeis_unlinked': 1, 'oeis_inprogress': 1, 'oeis_submitted': 1,
            'ambiguous': 1, 'literature': 1,
        })

    def test_invalid_status_is_not_silently_recategorized(self):
        with self.assertRaisesRegex(ValueError, 'Unrecognized status'):
            count_rows([{'number': '1', 'status': {'state': 'proven'}}], 'a' * 40, '2026-09-09T00:00:00+00:00')

    def test_duplicate_rows_are_counted_as_in_upstream_readme_and_disclosed(self):
        row = {'number': '1', 'status': {'state': 'open'}}
        s = count_rows([row, row], 'a' * 40, '2026-09-09T00:00:00+00:00')
        self.assertEqual(s['total'], 2)
        self.assertEqual(s['statuses']['open'], 2)
        self.assertEqual(s['duplicate_problem_numbers'], ['1'])

    def test_primitive_fields_override_stale_combined_status(self):
        self.assertEqual(primitive_states({'status': {'state': 'proved (Lean)'},
            'informal_status': {'state': 'open'}, 'formal_status': {'state': 'unformalized'}}), ('open', 'unformalized'))


if __name__ == '__main__':
    unittest.main()
