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

const { matchesFuel, selectedSites, readFundingState, fundingURLState, hasFundingFilters } = await import('./atlas-exploration.js');
const byId = Object.fromEntries(snapshot.entities.map(e => [e.canonicalId, e]));
assert.deepEqual(snapshot.entities.filter(e => e.role === 'public' && matchesFuel(e, 'D-T')).map(e => e.canonicalId),
  ['nif', 'jet', 'iter', 'omega', 'step', 'best']);
assert.ok(matchesFuel(byId.nif, 'D-T'), 'NIF must remain visible under its experimental fuel');
assert.ok(matchesFuel(byId.iter, 'D-T'), 'planned research fuel is searchable without implying operation');
assert.ok(!matchesFuel(byId.w7x, 'D-T'));
assert.ok(matchesFuel(byId.w7x, 'H') && matchesFuel(byId.w7x, 'D-D'));
assert.ok(!matchesFuel(byId.ifmif_dones, 'D-D'), 'accelerated deuterons are not a D–D fusion-fuel cycle');
assert.ok(!matchesFuel(byId.craft, 'D-T'), 'infrastructure must not inherit a generic reactor fuel');
assert.ok(matchesFuel(byId.helion, 'D-T') && matchesFuel(byId.helion, 'D-He3'), 'experimental and intended fuels differ');
for (const e of snapshot.entities.filter(e => e.role === 'public')) {
  assert.ok(e.experimentalFuel && e.intendedFuel);
  assert.equal(e.fuel_contexts.commercial.text, e.intendedFuel);
  assert.equal(e.fuel_contexts.experimental.text, e.experimentalFuel);
}
const germanEntities = snapshot.entities.filter(e => e.locations.some(site => site.country === 'Germany'));
const germany = selectedSites(snapshot.sites, germanEntities, 'Germany');
assert.ok(germany.length > 0);
assert.ok(germany.every(site => site.country === 'Germany'));
assert.ok(selectedSites(snapshot.sites, germanEntities).length > germany.length, 'regression fixture includes those organizations’ overseas sites');
assert.deepEqual(ids(germany), ids(selectedSites(snapshot.sites, snapshot.entities, 'Germany')));
assert.equal(new Set(ids(germany)).size, germany.length);
assert.equal(selectedSites(snapshot.sites, [], 'Germany').length, 0);
assert.equal(selectedSites(snapshot.sites, [byId.realta]).filter(s => s.relatedEntityIds?.includes(byId.realta.id)).length > 0, true, 'shared facility joins survive');
const observations = snapshot.entities.flatMap(e => e.funding);
const originalState = { filters: { currency: 'USD', type: observations.find(f => f.currency === 'USD').type }, sort: { key: 'amount', direction: 'descending' } };
const url = new URLSearchParams(fundingURLState(originalState.filters, originalState.sort));
assert.deepEqual(readFundingState(url, observations), originalState);
assert.ok(hasFundingFilters({ currency: 'USD', type: '' }), 'currency alone enables Clear filters');
assert.ok(hasFundingFilters({ currency: '', type: originalState.filters.type }), 'accounting basis alone enables Clear filters');
assert.ok(!hasFundingFilters({ currency: '', type: '' }));
assert.deepEqual(readFundingState(new URLSearchParams(), observations), { filters: { currency: '', type: '' }, sort: { key: '', direction: 'ascending' } });
assert.equal(readFundingState(new URLSearchParams('fundCurrency=FAKE&fundType=FAKE&fundSort=amount&fundDirection=descending'), observations).sort.key, '');
assert.equal(readFundingState(new URLSearchParams('fundSort=__proto__'), observations).sort.key, '');
assert.equal(readFundingState(new URLSearchParams('fundSort=date&fundDirection=invalid'), observations).sort.direction, 'ascending');
assert.equal(fundingURLState({ currency: '', type: '' }, originalState.sort).fundSort, '', 'mixed currencies cannot retain amount sorting');
assert.deepEqual(byId.helical_fusion.fundingSummarySourceIds, ['MAG_HELICAL_FUND_JP', 'MAG_HELICAL_FUND_EN']);
assert.match(byId.helical_fusion.fundingSummaryNote, /13.15B/);
assert.match(byId.helical_fusion.fundingSummaryNote, /13.05B/);
assert.ok(byId.energy_singularity.fundingSummarySourceIds.includes('MAG_FIA_2026'));
assert.ok(byId.tae.fundingSummarySourceIds.includes('MAG_TAE_DEBT'));
assert.ok(byId.nt_tao.fundingSummarySourceIds.includes('MAG_FIA_2026'));
for (const e of snapshot.entities.filter(e => /[0-9]/.test(e.fundingSummary))) assert.ok(e.fundingSummarySourceIds.length, e.canonicalId);
const iter2036 = snapshot.history.find(c => c.id === 'phy_target_iter2036');
assert.match(iter2036.displayText, /deuterium–deuterium research in 2036/);
assert.match(iter2036.displayText, /2039/);
console.log(`PASS: all public fuel contexts, actual-country site filtering (${germany.length} German records), financing URL round-trip/invalid inputs, Clear filters, explicit summary citations and ITER baseline.`);
