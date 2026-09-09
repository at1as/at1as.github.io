import unittest
from _insights import compare


def row(number, status='open', lean=False, statement=False):
    return dict(number=str(number), informal_status={'state':status},
                formal_status={'state':'Lean' if lean else 'unformalized'},
                formalized={'state':'yes' if statement else 'no'})


class TransitionTests(unittest.TestCase):
    def test_distinguishes_transitions_additions_removals_and_losses(self):
        a=[row(1),row(2,'proved'),row(3,'solved'),row(4,'independent')]
        b=[row(1,'proved'),row(2),row(4,'independent'),row(5,'disproved')]
        changes,duplicates=compare(a,b)
        self.assertEqual(changes['resolved'],dict(gained=['1'],lost=['2'],added=['5'],removed=['3'],unmatched=0))
        self.assertEqual(duplicates,[])

    def test_formalization_is_independent_of_informal_resolution(self):
        a=[row(1),row(2,'proved',True,True)]
        b=[row(1,lean=True,statement=True),row(2,'proved')]
        c,_=compare(a,b)
        self.assertEqual(c['lean']['gained'],['1'])
        self.assertEqual(c['lean']['lost'],['2'])
        self.assertEqual(c['statements']['gained'],['1'])
        self.assertEqual(c['resolved']['gained'],[])

    def test_duplicate_ids_are_reconciled_without_fabricating_identity(self):
        a=[row(1,'proved'),row(1),row(2)]
        b=[row(1,'proved'),row(2,'proved')]
        c,duplicates=compare(a,b)
        self.assertEqual(duplicates,['1'])
        self.assertEqual(c['resolved']['gained'],['2'])
        self.assertEqual(c['resolved']['unmatched'],0)
        c,_=compare([row(1,'proved'),row(1,'proved')],[row(1,'proved')])
        self.assertEqual(c['resolved']['unmatched'],-1)
        self.assertEqual(c['resolved']['removed'],[])

    def test_legacy_lean_and_resolved_category_changes_do_not_create_gains(self):
        a=[{'number':'1','status':{'state':'proved (Lean)'}}]
        b=[row(1,'disproved',True)]
        c,_=compare(a,b)
        for metric in ['resolved','lean']:
            self.assertEqual(c[metric]['gained'],[])
            self.assertEqual(c[metric]['lost'],[])


if __name__=='__main__': unittest.main()
