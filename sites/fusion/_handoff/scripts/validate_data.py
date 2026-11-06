#!/usr/bin/env python3
"""Validate the Fusion Atlas snapshot using only the Python standard library.

Usage: python3 scripts/validate_data.py [path/to/fusion_atlas.json]
Exit 0 means structural/editorial checks passed, not independent verification
of the underlying science. The validator never edits data or accesses a network.
"""

import argparse
import ast
import calendar
import json
import math
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


CORE_ARRAYS = (
    "approaches", "entities", "sites", "claims", "funding_events", "timeline",
    "records", "risk_dimensions", "risk_assessments", "glossary", "sources",
)
TIME_ROLES = {
    "event_date", "reported_at", "reported_by", "publication_date",
    "target_window", "target_date", "undated_live_page", "campaign_end_month",
}
PRECISIONS = {
    "day", "month", "year", "approximate_year", "range", "decade",
    "decade_part", "decade_boundary", "year_part", "fiscal_year", "quarter",
    "not_specified", "unspecified", "unknown", "not_applicable",
    "undated_live_page",
}
UNKNOWN_PRECISIONS = {
    "not_specified", "unspecified", "unknown", "not_applicable",
    "undated_live_page",
}
CLAIM_CATEGORIES = {
    "experimental_result", "model_or_design", "predecessor_evidence",
    "engineering_progress", "reported_status", "organization_event", "target",
}
FALLBACK_THEMES = {
    "plasma_and_fuel_physics", "electrical_balance", "sustained_operation",
    "fuel_cycle", "materials_and_maintenance", "delivery_and_economics",
}


def finite_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def date_bounds(value):
    """Return earliest/latest possible day and precision; never invent a display date."""
    if not isinstance(value, str):
        raise ValueError("date must be a string")
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        day = date.fromisoformat(value)
        return day, day, "day"
    if re.fullmatch(r"\d{4}-\d{2}", value):
        year, month = map(int, value.split("-"))
        return date(year, month, 1), date(year, month, calendar.monthrange(year, month)[1]), "month"
    if re.fullmatch(r"\d{4}", value):
        year = int(value)
        return date(year, 1, 1), date(year, 12, 31), "year"
    if re.fullmatch(r"\d{4}-Q[1-4]", value):
        year, quarter = int(value[:4]), int(value[-1])
        month = quarter * 3
        return date(year, month - 2, 1), date(year, month, calendar.monthrange(year, month)[1]), "quarter"
    raise ValueError("expected YYYY, YYYY-MM, YYYY-MM-DD or YYYY-Qn; fuzzy wording belongs in timing.display")


def normalized_url(value):
    parts = urlsplit(value)
    if parts.scheme.lower() not in {"http", "https"} or not parts.hostname:
        raise ValueError("source URL must be absolute HTTP(S)")
    if parts.username or parts.password:
        raise ValueError("source URL must not include credentials")
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path.rstrip("/"), parts.query, ""))


def arithmetic(expression, variables):
    """Evaluate only arithmetic nodes; no eval(), calls, attributes or subscripts."""
    expression = expression.split(";", 1)[0].strip()
    if "=" in expression:
        expression = expression.split("=", 1)[1].strip()
    node = ast.parse(expression, mode="eval")

    def visit(item):
        if isinstance(item, ast.Expression):
            return visit(item.body)
        if isinstance(item, ast.Constant) and finite_number(item.value):
            return item.value
        if isinstance(item, ast.Name) and item.id in variables and finite_number(variables[item.id]):
            return variables[item.id]
        if isinstance(item, ast.UnaryOp) and isinstance(item.op, (ast.UAdd, ast.USub)):
            value = visit(item.operand)
            return value if isinstance(item.op, ast.UAdd) else -value
        if isinstance(item, ast.BinOp):
            left, right = visit(item.left), visit(item.right)
            if isinstance(item.op, ast.Add):
                return left + right
            if isinstance(item.op, ast.Sub):
                return left - right
            if isinstance(item.op, ast.Mult):
                return left * right
            if isinstance(item.op, ast.Div):
                return left / right
        raise ValueError("unsupported expression or unknown variable")

    result = visit(node)
    if not finite_number(result):
        raise ValueError("formula produced a non-finite result")
    return result


class Validator:
    def __init__(self, data):
        self.data = data
        self.errors = []
        self.warnings = []
        self.index = {}
        self.snapshot = None
        self.aliases = {}

    def error(self, path, message):
        self.errors.append(f"{path}: {message}")

    def warning(self, path, message):
        self.warnings.append(f"{path}: {message}")

    def check(self, condition, path, message):
        if not condition:
            self.error(path, message)
        return bool(condition)

    def check_date(self, value, path, precision=None, nullable=False, historical=True):
        if value is None:
            if not nullable:
                self.error(path, "date is required")
            return None
        try:
            low, high, actual_precision = date_bounds(value)
        except (ValueError, TypeError) as exc:
            self.error(path, str(exc))
            return None
        expected = "year" if precision == "approximate_year" else precision
        if expected in {"day", "month", "year", "quarter"}:
            self.check(actual_precision == expected, path, f"date precision is {actual_precision}, declared {precision}")
        if historical and self.snapshot:
            self.check(low <= self.snapshot, path, "historical/report/source date is after the research snapshot")
        return low, high, actual_precision

    def check_timing(self, timing, path, category=None):
        if not self.check(isinstance(timing, dict), path, "timing must be an object"):
            return
        role, precision, value = timing.get("role"), timing.get("precision"), timing.get("date")
        self.check(role in TIME_ROLES, path + ".role", "unknown or missing timing role")
        self.check(precision in PRECISIONS, path + ".precision", "unknown or missing date precision")
        self.check(isinstance(timing.get("display"), str) and bool(timing["display"].strip()), path + ".display", "original date wording is required")
        is_target = role in {"target_window", "target_date"}
        if category == "target":
            self.check(is_target, path, "target claim must retain a target timing role")
        elif category is not None:
            self.check(not is_target, path, "non-target claim must not use a target timing role")
        if precision in {"day", "month", "year", "approximate_year", "quarter"}:
            self.check_date(value, path + ".date", precision, historical=not is_target)
        elif value is not None:
            self.error(path + ".date", "fuzzy/unknown timing must not acquire an exact calendar date")
        if role == "undated_live_page":
            self.check(value is None, path, "undated live page cannot carry a publication date")
        start, end = timing.get("start_year"), timing.get("end_year")
        self.check((start is None) == (end is None), path, "year-range bounds must both be null or both be present")
        if start is not None and end is not None:
            valid = all(isinstance(x, int) and not isinstance(x, bool) and 1 <= x <= 9999 for x in (start, end))
            if self.check(valid, path, "year-range bounds must be integer years"):
                self.check(start <= end, path, "range starts after it ends")
                if not is_target and self.snapshot:
                    self.check(start <= self.snapshot.year, path, "historical range starts after snapshot")
            self.check(precision in {"range", "decade", "decade_part", "decade_boundary", "year_part", "fiscal_year"}, path, "range bounds require a range-like precision")

    def build_indexes(self):
        if not self.check(isinstance(self.data, dict), "$", "top-level JSON must be an object"):
            return
        for section in CORE_ARRAYS:
            self.check(isinstance(self.data.get(section), list), section, "required array is missing")
        for section, rows in self.data.items():
            if not isinstance(rows, list) or section == "evidence_states":
                continue
            # Future optional arrays of strings are allowed; object arrays use stable IDs.
            if rows and not any(isinstance(row, dict) for row in rows):
                continue
            lookup = {}
            for number, row in enumerate(rows):
                path = f"{section}[{number}]"
                if not self.check(isinstance(row, dict), path, "record must be an object"):
                    continue
                item_id = row.get("id")
                if not self.check(isinstance(item_id, str) and bool(item_id) and not re.search(r"\s", item_id), path, "stable nonempty ID is required"):
                    continue
                self.check(item_id not in lookup, path, f"duplicate ID {item_id!r} in {section}")
                lookup[item_id] = row
            self.index[section] = lookup
        meta = self.data.get("meta", {})
        if not self.check(isinstance(meta, dict), "meta", "metadata must be an object"):
            return
        bounds = self.check_date(meta.get("as_of"), "meta.as_of", "day", historical=False)
        if bounds:
            self.snapshot = bounds[0]
        self.check(isinstance(meta.get("timezone"), str) and bool(meta["timezone"]), "meta.timezone", "snapshot timezone is required")
        for section, declared_count in meta.get("counts", {}).items():
            if section in self.data and isinstance(self.data[section], list):
                self.check(declared_count == len(self.data[section]), f"meta.counts.{section}", "count differs from actual array length")
        if "risk_themes" not in self.index:
            labels = self.data.get("approach_risk_profiles", {}).get("theme_labels", {})
            self.index["risk_themes"] = {key: {} for key in (labels or FALLBACK_THEMES)}
            self.warning("risk_themes", "optional theme registry absent; validating against profile labels or documented theme IDs")

    def reference(self, value, target, path, nullable=False):
        if value is None and nullable:
            return
        if not self.check(isinstance(value, str), path, f"reference to {target} must be a string"):
            return
        if target == "sources" and value in self.aliases and self.aliases[value] != value:
            self.error(path, f"use canonical source ID {self.aliases[value]!r}, not alias {value!r}")
        self.check(value in self.index.get(target, {}), path, f"unresolved {target} reference {value!r}")

    def walk(self, obj, path="$"):
        if isinstance(obj, float) and not math.isfinite(obj):
            self.error(path, "non-finite numeric value")
        if isinstance(obj, list):
            # Nested story collections have local ID namespaces.
            ids = [row.get("id") for row in obj if isinstance(row, dict) and "id" in row]
            if ids:
                if self.check(all(isinstance(value, str) for value in ids), path, "nested IDs must be strings"):
                    self.check(len(ids) == len(set(ids)), path, "duplicate IDs in nested collection")
            for number, item in enumerate(obj):
                self.walk(item, f"{path}[{number}]")
            return
        if not isinstance(obj, dict):
            return
        singular = {
            "source_id": "sources", "entity_id": "entities", "approach_id": "approaches",
            "site_id": "sites", "claim_id": "claims", "risk_note_id": "risk_assessments",
            "risk_assessment_id": "risk_assessments", "funding_event_id": "funding_events",
            "record_id": "records",
            "latest_cumulative_event_id": "funding_events", "latest_round_event_id": "funding_events",
            "latest_funding_event_id": "funding_events", "theme_id": "risk_themes",
            "dimension_id": "risk_dimensions", "metric_id": "metrics",
        }
        plural = {
            "source_ids": "sources", "additional_source_ids": "sources", "supplemental_source_ids": "sources",
            "entity_ids": "entities", "related_entity_ids": "entities",
            "approach_ids": "approaches", "site_ids": "sites", "claim_ids": "claims",
            "evidence_claim_ids": "claims", "target_claim_ids": "claims", "supporting_claim_ids": "claims",
            "risk_note_ids": "risk_assessments", "risk_assessment_ids": "risk_assessments",
            "record_ids": "records", "related_record_ids": "records",
            "funding_event_ids": "funding_events", "overlap_event_ids": "funding_events",
            "theme_ids": "risk_themes", "dimension_ids": "risk_dimensions", "metric_ids": "metrics",
        }
        for key, value in obj.items():
            here = f"{path}.{key}"
            if key in singular:
                self.reference(value, singular[key], here, nullable=key in {"entity_id", "approach_id", "latest_cumulative_event_id", "latest_round_event_id", "latest_funding_event_id"})
            elif key in plural:
                if self.check(isinstance(value, list), here, "reference collection must be an array"):
                    if all(isinstance(item, str) for item in value):
                        self.check(len(value) == len(set(value)), here, "duplicate references")
                    for number, item in enumerate(value):
                        self.reference(item, plural[key], f"{here}[{number}]")
            elif key in {"supersedes", "superseded_by"} and ".funding_events[" in path:
                for number, item in enumerate(value if isinstance(value, list) else [value]):
                    self.reference(item, "funding_events", f"{here}[{number}]", nullable=True)
            if key in {"as_of", "accessed_at", "last_reviewed_at", "source_checked_at", "snapshot_date"}:
                self.check_date(value, here, "day")
            if key == "published_date":
                self.check_date(value, here, nullable=True)
            if key == "timing":
                self.check_timing(value, here, obj.get("category"))
            if key in {"overall_risk_score", "success_probability", "completion_percentage", "completion_percent"} and value is not None:
                self.error(here, "aggregate risk/probability/completion scores are outside this evidence contract")
            self.walk(value, here)

    def check_sources(self):
        self.aliases = self.data.get("source_aliases", {})
        if not self.check(isinstance(self.aliases, dict), "source_aliases", "alias map must be an object"):
            self.aliases = {}
        for alias, canonical in self.aliases.items():
            self.check(isinstance(alias, str) and bool(alias), "source_aliases", "alias must be a nonempty string")
            if not self.check(isinstance(canonical, str), f"source_aliases.{alias}", "canonical target must be a string"):
                continue
            self.check(canonical in self.index.get("sources", {}), f"source_aliases.{alias}", "alias target must be a canonical source ID, not another alias")
            if alias in self.index.get("sources", {}):
                self.check(alias == canonical, f"source_aliases.{alias}", "canonical source ID cannot alias a different source")
        seen = {}
        for item_id, source in self.index.get("sources", {}).items():
            path = f"sources[{item_id}]"
            for field in ("title", "publisher", "source_type"):
                self.check(isinstance(source.get(field), str) and bool(source[field].strip()), path + "." + field, "nonempty source metadata is required")
            try:
                url = normalized_url(source.get("url", ""))
                self.check(url not in seen, path + ".url", f"duplicate canonical URL also used by {seen.get(url)!r}; consolidate with aliases")
                seen[url] = item_id
            except (TypeError, ValueError) as exc:
                self.error(path + ".url", str(exc))
            for alias in source.get("aliases", []):
                self.check(self.aliases.get(alias) == item_id, path + ".aliases", f"alias {alias!r} is not mapped back to this source")

    def check_entities_and_sites(self):
        for item_id, entity in self.index.get("entities", {}).items():
            path = f"entities[{item_id}]"
            approach = self.index.get("approaches", {}).get(entity.get("approach_id"))
            if approach and entity.get("family") is not None:
                self.check(entity["family"] == approach.get("family"), path + ".family", "family differs from selected approach")
            relations = (("site_ids", "sites"), ("evidence_claim_ids", "claims"), ("target_claim_ids", "claims"), ("risk_note_ids", "risk_assessments"))
            for field, section in relations:
                for ref in entity.get(field, []):
                    record = self.index.get(section, {}).get(ref)
                    if record:
                        allowed = {record.get("entity_id"), *record.get("related_entity_ids", [])}
                        self.check(item_id in allowed, path + "." + field, f"{ref!r} belongs to an unrelated entity")
            summary = entity.get("funding_summary", {})
            if isinstance(summary, dict):
                for field, refs in summary.items():
                    if field in {"funding_event_ids", "latest_round_event_id", "latest_cumulative_event_id", "latest_funding_event_id"}:
                        for ref in refs if isinstance(refs, list) else [refs]:
                            record = self.index.get("funding_events", {}).get(ref)
                            if record:
                                self.check(record.get("entity_id") == item_id or item_id in record.get("related_entity_ids", []), path + ".funding_summary", "funding reference belongs to an unrelated entity")
        for item_id, site in self.index.get("sites", {}).items():
            path = f"sites[{item_id}]"
            latitude, longitude = site.get("lat"), site.get("lon")
            self.check((latitude is None) == (longitude is None), path, "coordinates must both be known or both null")
            if latitude is not None and longitude is not None:
                self.check(finite_number(latitude) and -90 <= latitude <= 90, path + ".lat", "latitude must be finite and between -90 and 90")
                self.check(finite_number(longitude) and -180 <= longitude <= 180, path + ".lon", "longitude must be finite and between -180 and 180")
                self.check(bool(site.get("coordinate_precision")), path, "coordinate precision is required")
                if any(word in str(site.get("coordinate_precision", "")) for word in ("city", "locality", "area", "approximate")):
                    self.check(site.get("approximate") is True, path, "coarse coordinates must be explicitly approximate")
            if "physical_site_id" in site:
                self.check(isinstance(site["physical_site_id"], str) and bool(site["physical_site_id"]), path + ".physical_site_id", "grouping ID must be a nonempty string; it need not be unique")

    def check_claims_and_records(self):
        categories = set(self.index.get("evidence_categories", {})) or CLAIM_CATEGORIES
        for item_id, claim in self.index.get("claims", {}).items():
            path = f"claims[{item_id}]"
            category, kind = claim.get("category"), str(claim.get("evidence_type", "")).lower()
            self.check(category in categories, path + ".category", "unrecognized evidence category")
            self.check(bool(kind), path + ".evidence_type", "evidence subtype is required")
            self.check(bool(claim.get("source_ids")), path, "claim must cite at least one source")
            if category == "experimental_result":
                self.check(not any(word in kind for word in ("model", "simulation", "design", "target", "aspiration", "predecessor")), path, "modeled/planned/predecessor evidence cannot be an experimental result")
                self.check(claim.get("details", {}).get("is_experimental_measurement") is not False, path, "experimental category contradicts explicit non-measurement flag")
            if category == "predecessor_evidence":
                self.check(claim.get("details", {}).get("attributable_to_company") is not True, path, "predecessor evidence must not become the company's own experiment")
        for item_id, record in self.index.get("records", {}).items():
            path = f"records[{item_id}]"
            kind = str(record.get("evidence_type", "")).lower()
            self.check(any(word in kind for word in ("experiment", "measurement", "measured", "observed")), path, "measured record series requires empirical evidence_type")
            self.check(not any(word in kind for word in ("model", "simulat", "design", "target", "planned", "forecast")), path, "models or targets must not enter the measured record series")
            self.check(not any(word in str(record.get("measurement_type", "")).lower() for word in ("model", "simulat", "forecast")), path, "measurement_type contradicts a measured record")
            self.check(record.get("category") not in {"target", "model_or_design"}, path, "non-measured category in experimental record series")
            self.check(record.get("is_experimental_measurement") is not False, path, "record explicitly disclaims experimental measurement")
            self.check(finite_number(record.get("value")), path + ".value", "plotted record requires a finite value; omit unavailable values from this series")
            self.check(bool(record.get("unit")) and bool(record.get("boundary")), path, "unit and measurement boundary are required")
            self.check_date(record.get("date"), path + ".date")
            self.check(bool(record.get("date_role")), path + ".date_role", "event/campaign/report date role is required")
            if self.index.get("metrics"):
                self.reference(record.get("metric"), "metrics", path + ".metric")
            for ref in record.get("claim_ids", []):
                linked = self.index.get("claims", {}).get(ref, {})
                self.check(linked.get("category") not in {"target", "model_or_design", "predecessor_evidence"}, path, "measured record links to a non-measured claim")
            numerator, denominator = record.get("fusion_energy_mj"), record.get("driver_energy_mj")
            if record.get("metric") == "target_gain" and numerator is not None and denominator is not None:
                if self.check(finite_number(numerator) and finite_number(denominator) and denominator > 0, path, "gain energy fields must be finite with positive driver energy"):
                    display = str(record.get("reported_display", record.get("value")))
                    decimals = len(display.split(".")[-1]) if re.fullmatch(r"\d+\.\d+", display) else 8
                    tolerance = max(0.5 * 10 ** -decimals, 1e-9)
                    self.close(record.get("value"), numerator / denominator, path + ".value", tolerance)
        for item_id, event in self.index.get("timeline", {}).items():
            is_target = event.get("status") in {"target", "planned", "announced_target", "company_target", "program_target"}
            target_role = event.get("timing", {}).get("role") in {"target_window", "target_date"}
            self.check(is_target == target_role, f"timeline[{item_id}].timing", "timeline status and target/non-target timing role disagree")

    def check_funding(self):
        for item_id, event in self.index.get("funding_events", {}).items():
            path = f"funding_events[{item_id}]"
            for field in ("amount", "amount_usd"):
                value = event.get(field)
                self.check(value is None or (finite_number(value) and value >= 0), path + "." + field, "amount must be null or a finite nonnegative number")
            amount, usd, currency = event.get("amount"), event.get("amount_usd"), event.get("currency")
            self.check(currency is None or (isinstance(currency, str) and bool(re.fullmatch(r"[A-Z]{3}", currency))), path + ".currency", "currency must be null or a three-letter code")
            if amount is not None:
                self.check(currency is not None, path, "known amount requires original currency")
            if amount is None:
                self.check(usd is None, path, "unknown native amount must not become a known USD amount")
            if currency == "USD" and usd is not None and finite_number(amount) and finite_number(usd):
                self.close(usd, amount, path + ".amount_usd")
            if currency not in {None, "USD"} and usd is not None:
                self.check(event.get("usd_conversion_basis") in {"source_supplied_approximation", "source_reported", "source_supplied"}, path, "foreign-currency USD amount requires a source-supplied conversion basis")
            precision = event.get("date_precision", event.get("announcement_date_precision"))
            self.check(precision in PRECISIONS, path + ".date_precision", "funding date precision is required")
            when = event.get("announcement_date")
            if when is None:
                self.check(precision in UNKNOWN_PRECISIONS, path, "unknown announcement date must retain unknown precision")
            else:
                self.check_date(when, path + ".announcement_date", precision)
            if event.get("original_agreement_date"):
                self.check_date(event["original_agreement_date"], path + ".original_agreement_date")
            self.check(isinstance(event.get("includes_prior"), bool), path + ".includes_prior", "overlap flag must be boolean")
            self.check(bool(event.get("event_type")) and bool(event.get("qualifier")), path, "event type and financial qualification are required")
            labels = self.data.get("amount_operator_labels")
            if isinstance(labels, dict):
                self.check(event.get("amount_operator") in labels, path + ".amount_operator", "amount qualifier must have a defined display label")
            self.check(bool(event.get("source_ids")), path, "financial observation requires sources")
            for field, reverse in (("supersedes", "superseded_by"), ("superseded_by", "supersedes")):
                refs = event.get(field)
                for ref in refs if isinstance(refs, list) else ([refs] if refs else []):
                    self.check(ref != item_id, path + "." + field, "event cannot supersede itself")
                    other = self.index.get("funding_events", {}).get(ref)
                    if other:
                        self.check(event.get("entity_id") == other.get("entity_id"), path, "revision references a different entity")
                        back = other.get(reverse)
                        self.check(item_id in (back if isinstance(back, list) else [back]), path, "revision link must be reciprocal")
            if event.get("event_type") == "cash_balance_snapshot":
                self.check(event.get("exclude_from_funding_total") is True or event.get("exclude_from_totals") is True, path, "cash balance must be excluded from capital-raised totals")

    def check_risk_and_optional(self):
        for item_id, item in self.index.get("risk_assessments", {}).items():
            path = f"risk_assessments[{item_id}]"
            self.check(item.get("is_interpretive") is True, path, "risk assessment must be labeled interpretation")
            self.check(item.get("is_probability") is False, path, "risk interpretation must not be a probability")
            self.check(bool(item.get("interpretation")) and bool(item.get("theme_ids")), path, "risk interpretation and thematic placement are required")
        packet = self.data.get("approach_risk_profiles")
        if packet is not None:
            if not self.check(isinstance(packet, dict), "approach_risk_profiles", "profile packet must be an object"):
                return
            expected_themes = set(self.index.get("risk_themes", {}))
            seen = set()
            for number, profile in enumerate(packet.get("profiles", [])):
                path = f"approach_risk_profiles.profiles[{number}]"
                approach = profile.get("approach_id")
                self.check(approach not in seen, path, "duplicate profile for approach")
                seen.add(approach)
                self.check(set(profile.get("themes", {})) == expected_themes, path + ".themes", "profile must cover the canonical qualitative themes")
                for theme, cell in profile.get("themes", {}).items():
                    self.check(isinstance(cell, dict) and bool(cell.get("interpretation")) and bool(cell.get("source_ids")), path + ".themes." + theme, "theme cell requires interpretation and sources")
            missing = set(self.index.get("approaches", {})) - seen
            if missing:
                self.warning("approach_risk_profiles", "no architecture profile for: " + ", ".join(sorted(missing)))
        states = self.data.get("evidence_states", [])
        if all(isinstance(value, str) for value in states):
            self.check(len(states) == len(set(states)), "evidence_states", "duplicate evidence-state labels")

    def close(self, actual, expected, path, tolerance=1e-9):
        if self.check(finite_number(actual), path, "expected a finite numerical result"):
            self.check(math.isclose(actual, expected, rel_tol=1e-10, abs_tol=tolerance), path, f"arithmetic mismatch: stored {actual!r}, calculated {expected:.12g}")

    def model_outputs(self, inputs, pulsed=False):
        eta = inputs["eta_driver"]
        if not finite_number(eta) or eta <= 0 or eta > 1:
            raise ValueError("driver efficiency must be in (0, 1]")
        for key in ("eta_electric", "capture_fraction"):
            if not finite_number(inputs[key]) or not 0 <= inputs[key] <= 1:
                raise ValueError(f"{key} must be between 0 and 1")
        names = ("E_driver_delivered_MJ", "target_gain", "repetition_Hz") if pulsed else ("P_heating_delivered_MW", "Q_plasma")
        for key in (*names, "P_aux_MWe"):
            if not finite_number(inputs[key]) or inputs[key] < 0:
                raise ValueError(f"{key} must be finite and nonnegative")
        heating = inputs["E_driver_delivered_MJ"] * inputs["repetition_Hz"] if pulsed else inputs["P_heating_delivered_MW"]
        gain = inputs["target_gain"] if pulsed else inputs["Q_plasma"]
        fusion = heating * gain
        gross = inputs["eta_electric"] * inputs["capture_fraction"] * fusion
        driver = heating / eta
        output = {"P_fusion_MW": fusion, "P_gross_MWe": gross, "P_driver_MWe": driver, "P_net_MWe": gross - driver - inputs["P_aux_MWe"]}
        if pulsed:
            output["targets_per_operating_day"] = inputs["repetition_Hz"] * 86400
            if output["P_net_MWe"] > 0:
                output["target_cost_USD_per_MWh_if_target_cost_1USD"] = 3600 * inputs["repetition_Hz"] / output["P_net_MWe"]
        else:
            if driver + inputs["P_aux_MWe"] > 0:
                output["Q_electric_site_definition"] = gross / (driver + inputs["P_aux_MWe"])
            if heating > 0 and inputs["eta_electric"] * inputs["capture_fraction"] > 0:
                output["Q_plasma_for_zero_net"] = (1 / eta + inputs["P_aux_MWe"] / heating) / (inputs["eta_electric"] * inputs["capture_fraction"])
        return output

    def validate_attributed_model(self, model, path):
        if not isinstance(model, dict):
            self.error(path, "attributed model must be an object")
            return
        self.check("model" in str(model.get("evidence_type", "")), path, "attributed calculation must retain a model evidence type")
        for number, example in enumerate(model.get("examples", [])):
            here = f"{path}.examples[{number}]"
            values = {**model, **example}
            try:
                for key in ("laser_energy_MJ", "repetition_Hz", "other_energy_per_shot_MJ", "target_gain"):
                    if not finite_number(values[key]) or values[key] < 0:
                        raise ValueError(f"{key} must be finite and nonnegative")
                if not 0 < values["laser_efficiency"] <= 1 or not 0 <= values["thermal_efficiency"] <= 1:
                    raise ValueError("invalid efficiency")
                expected = values["repetition_Hz"] * (values["thermal_efficiency"] * values["target_gain"] * values["laser_energy_MJ"] - values["laser_energy_MJ"] / values["laser_efficiency"] - values["other_energy_per_shot_MJ"])
                # Calculated company examples are intentionally stored to four decimal places.
                self.close(example.get("calculated_net_MW"), expected, here + ".calculated_net_MW", 0.000051)
                self.close(arithmetic(model["formula"], values), expected, here + ".formula")
                if "company_rounded_net_MW" in example:
                    self.check(finite_number(example["company_rounded_net_MW"]), here, "company-rounded output must be finite; it is not forced to equal exact arithmetic")
            except (KeyError, TypeError, ValueError, ZeroDivisionError, SyntaxError) as exc:
                self.error(here, f"invalid attributed-model inputs/formula: {exc}")

    def check_power_balance(self):
        balance = self.data.get("power_balance")
        if not self.check(isinstance(balance, dict), "power_balance", "power-accounting object is required"):
            return
        for key, formula_key, pulsed, sensitivity_key in (
            ("thermal_default_teaching_case", "thermal_formulas", False, "thermal_sensitivity_case"),
            ("icf_teaching_case", "icf_formulas", True, "icf_sensitivity_case"),
        ):
            path = "power_balance." + key
            case = balance.get(key, {})
            try:
                expected = self.model_outputs(case, pulsed)
                for output_key, value in case.get("outputs", {}).items():
                    if output_key in expected:
                        self.close(value, expected[output_key], path + ".outputs." + output_key)
                    else:
                        self.error(path + ".outputs." + output_key, "unknown output or undefined at these inputs")
                for required in ("P_fusion_MW", "P_gross_MWe", "P_driver_MWe", "P_net_MWe"):
                    self.check(required in case.get("outputs", {}), path, "missing worked output " + required)
                context = {**case, **expected, "target_cost_USD": 1}
                for output_key, expression in balance.get(formula_key, {}).items():
                    answer = expected.get(output_key)
                    if output_key == "target_cost_USD_per_MWh":
                        answer = expected.get("target_cost_USD_per_MWh_if_target_cost_1USD")
                    if answer is None:
                        self.error("power_balance." + formula_key + "." + output_key, "formula output is unknown or undefined in supplied teaching case")
                    else:
                        self.close(arithmetic(expression, context), answer, "power_balance." + formula_key + "." + output_key)
                sensitivity = balance.get(sensitivity_key)
                if sensitivity:
                    changed = dict(case)
                    overrides = sensitivity.get("overrides", sensitivity.get("inputs"))
                    if overrides is not None:
                        changed.update(overrides)
                    else:
                        match = re.search(r"(\w+)\s+from\s+([0-9.eE+-]+)\s+to\s+([0-9.eE+-]+)", sensitivity.get("change", ""))
                        if not match:
                            raise ValueError("sensitivity case needs machine-readable overrides or a parseable 'field from x to y' change")
                        field, old, new = match.groups()
                        self.close(case.get(field), float(old), "power_balance." + sensitivity_key + ".change")
                        changed[field] = float(new)
                    self.close(sensitivity.get("P_net_MWe"), self.model_outputs(changed, pulsed)["P_net_MWe"], "power_balance." + sensitivity_key + ".P_net_MWe")
            except (KeyError, TypeError, ValueError, ZeroDivisionError, SyntaxError) as exc:
                self.error(path, f"invalid teaching-model inputs/formula: {exc}")
        recovery = balance.get("direct_recovery_accounting", {}).get("example", {})
        if recovery:
            try:
                expected = recovery["return_MJ"] - recovery["draw_MJ"] - recovery["auxiliary_MJ"]
                self.close(recovery.get("net_MJ"), expected, "power_balance.direct_recovery_accounting.example.net_MJ")
                context = {"E_electric_returned": recovery["return_MJ"], "E_electric_supplied": recovery["draw_MJ"], "E_auxiliary": recovery["auxiliary_MJ"]}
                self.close(arithmetic(balance["direct_recovery_accounting"]["formula"], context), expected, "power_balance.direct_recovery_accounting.formula")
            except (TypeError, KeyError, ValueError, SyntaxError, ZeroDivisionError) as exc:
                self.error("power_balance.direct_recovery_accounting", str(exc))
        split = balance.get("reaction_energy_split")
        if split:
            try:
                self.close(split["total_MeV"], split["alpha_MeV"] + split["neutron_MeV"], "power_balance.reaction_energy_split.total_MeV")
            except (TypeError, KeyError) as exc:
                self.error("power_balance.reaction_energy_split", str(exc))
        attributed = balance.get("inertia_attributed_model")
        if attributed is not None:
            self.validate_attributed_model(attributed, "power_balance.inertia_attributed_model")
        for item_id, entity in self.index.get("entities", {}).items():
            models = entity.get("company_models", {})
            if isinstance(models, dict) and "phase1_power_balance" in models:
                self.validate_attributed_model(models["phase1_power_balance"], f"entities[{item_id}].company_models.phase1_power_balance")
                if item_id == "inertia" and attributed is not None:
                    self.check(models["phase1_power_balance"] == attributed, f"entities[{item_id}].company_models", "company model copy differs from canonical power_balance model")
            if item_id == "inertia" and "faq_scenarios" in models and "inertia_faq_version" in balance:
                self.check(models["faq_scenarios"] == balance["inertia_faq_version"], f"entities[{item_id}].company_models", "FAQ scenario copies disagree; do not fit them to the newer model")

    def run(self):
        self.build_indexes()
        if not isinstance(self.data, dict):
            return self
        self.check_sources()
        self.walk(self.data)
        self.check_entities_and_sites()
        self.check_claims_and_records()
        self.check_funding()
        self.check_risk_and_optional()
        self.check_power_balance()
        return self


def reject_constant(value):
    raise ValueError(f"non-standard JSON constant {value}")


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON object key {key!r}")
        result[key] = value
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", nargs="?", type=Path, default=Path(__file__).resolve().parents[1] / "data" / "fusion_atlas.json")
    parser.add_argument("--strict-warnings", action="store_true", help="return nonzero for editorial warnings as well as errors")
    args = parser.parse_args(argv)
    try:
        data = json.loads(args.path.read_text(encoding="utf-8"), parse_constant=reject_constant, object_pairs_hook=unique_object)
    except (OSError, ValueError) as exc:
        print(f"FAIL: could not read valid JSON from {args.path}: {exc}", file=sys.stderr)
        return 2
    try:
        result = Validator(data).run()
    except (KeyError, TypeError, ValueError, AttributeError) as exc:
        print(f"FAIL: malformed data structure prevented further validation: {exc}", file=sys.stderr)
        return 2
    for message in result.errors:
        print("ERROR " + message)
    for message in result.warnings:
        print("WARNING " + message)
    if result.errors or (args.strict_warnings and result.warnings):
        print(f"FAIL: {len(result.errors)} error(s), {len(result.warnings)} warning(s). Data was not modified.")
        return 1
    print(f"PASS: {args.path}")
    print("Checked IDs/references, canonical sources and URL uniqueness, dates/snapshot, financial nulls and amounts, site roles/coordinates, evidence separation, optional risk content, and power-model arithmetic.")
    print(f"Warnings: {len(result.warnings)}. This is data validation, not independent verification of source claims.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
