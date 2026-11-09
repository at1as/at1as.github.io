import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  sortAtlasRows, fundingSortValues, evidenceSortValues, mapSiteCounts, isMappedSite,
} from "./atlas-exploration.js";

const rows = [
  { id: "unknown", entity: { name: "Unknown" }, amount: null, date: "Undated live page" },
  { id: "billion", entity: { name: "beta" }, amount: 1e9, date: "2026-09", amountLabel: "More than USD 1B" },
  { id: "million", entity: { name: "Alpha" }, amount: 175e6, date: "2026-06-04", amountLabel: "Up to USD 175M" },
  { id: "same", entity: { name: "Alpha" }, amount: 175e6, date: "2026-06-04", amountLabel: "USD 175M" },
  { id: "zero", entity: { name: "Gamma" }, amount: 0, date: "2025" },
];
const original = JSON.stringify(rows), ids = list => list.map(row => row.id);
assert.deepEqual(ids(sortAtlasRows(rows)), ids(rows), "initial view retains curated order");
assert.deepEqual(ids(sortAtlasRows(rows, fundingSortValues.amount)), ["zero", "million", "same", "billion", "unknown"]);
assert.deepEqual(ids(sortAtlasRows(rows, fundingSortValues.amount, "descending")), ["billion", "million", "same", "zero", "unknown"]);
assert.deepEqual(ids(sortAtlasRows(rows, fundingSortValues.date, "descending")), ["billion", "million", "same", "zero", "unknown"]);
assert.deepEqual(ids(sortAtlasRows(rows, fundingSortValues.organization)), ["million", "same", "billion", "zero", "unknown"]);
assert.equal(JSON.stringify(rows), original, "sorting must preserve qualifiers, date precision and source records");
const entities = [{ id: "b", approach: "Tokamak" }, { id: "missing", approach: null }, { id: "a", approach: "Stellarator" }];
assert.deepEqual(ids(sortAtlasRows(entities, evidenceSortValues.approach)), ["a", "b", "missing"]);
assert.deepEqual(ids(sortAtlasRows(entities, evidenceSortValues.approach, "descending")), ["b", "a", "missing"]);

const sites = [
  { id: "hq", marker_shape: "circle", latitude: 0, longitude: 0, status: "operating" },
  { id: "lab", marker_shape: "square", latitude: 0, longitude: 0, status: "under construction" },
  { id: "plant", marker_shape: "outlined_diamond", latitude: 4, longitude: 5, status: "planned" },
  { id: "supplier", marker_shape: "hexagon", latitude: 4, longitude: 5, status: "operating" },
  { id: "unmapped", marker_shape: "outlined_diamond", latitude: null, longitude: null, status: "planned" },
];
assert.deepEqual(mapSiteCounts(sites), { circle: 1, square: 1, diamond: 1, hexagon: 1, planned: 2 });
assert.deepEqual(mapSiteCounts(sites.slice(0, 2)), { circle: 1, square: 1, diamond: 0, hexagon: 0, planned: 1 }, "co-located records count separately");
assert.deepEqual(mapSiteCounts([]), { circle: 0, square: 0, diamond: 0, hexagon: 0, planned: 0 });
const snapshot = JSON.parse(readFileSync(new URL("./data.json", import.meta.url)));
const counts = mapSiteCounts(snapshot.sites);
assert.equal(counts.circle + counts.square + counts.diamond + counts.hexagon, snapshot.sites.filter(isMappedSite).length);
assert.equal(snapshot.sites.length - snapshot.sites.filter(isMappedSite).length, 3);
for (const entity of snapshot.entities) {
  const matching = snapshot.sites.filter(site => site.entityId === entity.id || site.relatedEntityIds?.includes(entity.id));
  const c = mapSiteCounts(matching);
  assert.equal(c.circle + c.square + c.diamond + c.hexagon, matching.filter(isMappedSite).length);
}
console.log("PASS: numeric and chronological sorting, unknowns last, stable ties, source preservation, filtered map counts, shared locations and unmapped records.");
