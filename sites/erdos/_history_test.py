import unittest

from _history import count_rows, primitive_states


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
