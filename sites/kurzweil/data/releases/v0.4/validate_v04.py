from pathlib import Path
import json

p = Path(__file__).resolve().parent
d = json.loads((p / "predictions.canonical.v0.4.json").read_text("utf-8"))
rs = d["records"]
ids = {r["id"] for r in rs}
s = json.loads((p / "sources.v0.4.json").read_text("utf-8"))
src = {z["id"] for z in s["sources"]}
l = json.loads((p / "legacy-reconciliation.v0.4.json").read_text("utf-8"))["mapping"]
m = json.loads((p / "metrics.v0.4.json").read_text("utf-8"))

assert d["schema_version"] == "0.4"
assert len(rs) == len(ids) == 81
assert not ({"K015", "K025", "K077"} & ids)
assert len(l) == len({z["legacy_id"] for z in l}) == 88
assert all(z["outcome_disposition_complete"] for z in l)
assert all(not z["conditional_outcome"].get("eligible_for_author_accuracy", False) for z in l)
assert all(cid in ids for z in l for cid in z["canonical_ids"])

order = {"WRONG": 0, "PARTIAL": 1, "LATE": 2, "CORRECT": 3, "PENDING": -1}
for r in rs:
    a = r["assessment"]
    assert a["verdict"] not in ("UNREVIEWED", "UNSCORABLE")
    assert a["at_review"] in ("FULFILLED", "PARTLY_FULFILLED", "NOT_FULFILLED")
    assert all(q["source_id"] in src for q in r["prediction_sources"] + r["evidence"])
    if a["eligible_for_deadline_metrics"]:
        assert a["at_deadline"] in ("FULFILLED", "PARTLY_FULFILLED", "NOT_FULFILLED")
    if a["verdict"] == "LATE":
        assert a["at_review"] == "FULFILLED" and a["at_deadline"] != "FULFILLED" and a["eligible_for_deadline_metrics"]
    for v in r["interpretations"].values():
        assert all(i in src for i in v["evidence_source_ids"])
    sv = r["interpretations"]["strict"]["verdict"]
    rv = r["interpretations"]["reference"]["verdict"]
    bv = r["interpretations"]["broader"]["verdict"]
    assert order[sv] <= order[rv] <= order[bv], f"Non-monotonic verdicts on {r['id']}"

for mode in ("reference", "strict", "broader"):
    cohort = [r for r in rs if r["interpretations"][mode]["eligible_for_deadline_metrics"]]
    q = m["views"][mode]
    assert len(cohort) == q["n"] == 64
    assert sum(r["interpretations"][mode]["at_deadline"] == "FULFILLED" for r in cohort) == q["on_time"]
    assert sum(r["interpretations"][mode]["at_review"] == "FULFILLED" for r in cohort) == q["fully_realized_by_review"]
    assert sum(a[mode]["n"] for a in m["by_category"].values()) == q["n"]

assert m["views"]["strict"]["on_time"] == 6 and m["views"]["strict"]["fully_realized_by_review"] == 14
assert m["views"]["reference"]["on_time"] == 22 and m["views"]["reference"]["fully_realized_by_review"] == 33
assert m["views"]["broader"]["on_time"] == 26 and m["views"]["broader"]["fully_realized_by_review"] == 45
print("PASS: 81 canonical records (3 consolidated from v0.3), all 88 legacy IDs reconciled; unified 64-record due cohort across all 3 readings.")
