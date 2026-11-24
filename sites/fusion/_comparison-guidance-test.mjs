import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { comparisonSelections, comparisonClaims, comparisonAssessment } from './comparison-content.js';
import { learningScenarios, matchingLesson, targetsPerDay } from './learning-guide.js';
import { balance, readScenario } from './model.js';
import { approaches } from './diagrams.js';
import { atlasFamilyId, atlasFamilies } from './atlas-metadata.js';
import { getEntityReactorOptions } from './reactor-content.js';

const snapshot = JSON.parse(readFileSync(new URL('./data.json', import.meta.url)));
const byId = Object.fromEntries(snapshot.entities.map(e => [e.canonicalId, e]));
const profiles = snapshot.approachRiskProfiles.profiles;
const sources = new Set(snapshot.sources.map(s => s.id));
assert.deepEqual(Object.keys(comparisonSelections).sort(), Object.keys(byId).sort());
for (const entity of snapshot.entities) {
  const original = JSON.stringify(entity);
  for (let column = 0; column < 3; column++) {
    const claims = comparisonClaims(entity, column);
    assert.deepEqual(claims.map(c => c.id), comparisonSelections[entity.canonicalId][column], `${entity.id}: every selection must resolve`);
    for (const claim of claims) {
      assert.equal(claim.category === 'Announced target', column > 0, claim.id);
      assert.ok(claim.sourceIds.length, `${claim.id}: preserve provenance`);
      assert.ok(claim.sourceIds.every(id => sources.has(id)));
      assert.ok(entity.claims.includes(claim), 'preserve the original claim, including qualifiers and date role');
    }
  }
  for (const theme of snapshot.riskThemes) {
    const { notes, context } = comparisonAssessment(entity, theme.id, profiles);
    assert.ok(notes.every(note => entity.assessment.includes(note)));
    if (context) assert.ok(context.source_ids.every(id => sources.has(id)));
    if (!entity.roles.includes('developer') && entity.canonicalId !== 'step') {
      assert.ok(!context, `${entity.id} must not inherit commercial-plant requirements`);
    }
  }
  assert.equal(JSON.stringify(entity), original);
}
assert.equal(comparisonClaims(byId.type_one, 0)[0].category, 'Model or design');
assert.equal(comparisonClaims(byId.nif, 0)[0].id, 'nif_evidence_01', 'select the record shot, not the latest update');
const claimText = claim => claim.displayText || claim.text;
assert.match(claimText(comparisonClaims(byId.helion, 1)[0]), /earlier net-electricity formulation has been discontinued/);
assert.match(claimText(comparisonClaims(byId.pacific_fusion, 1)[0]), /not a net-electric definition/);
const cfsElectrical = comparisonAssessment(byId.cfs, 'electrical_balance', profiles);
assert.equal(cfsElectrical.notes.length, 0);
assert.ok(cfsElectrical.context, 'an absent company assessment can use explicitly labeled approach context');
assert.ok(comparisonAssessment(byId.helion, 'electrical_balance', profiles).notes.length);
assert.ok(comparisonAssessment(byId.step, 'electrical_balance', profiles).context);
assert.equal(comparisonAssessment(byId.cfs, 'electrical_balance', []).context, undefined);

// Both selectors must place every explorer design under its reviewed atlas family.
const explorerFamilies = new Map(approaches.map(design => [design.id, design.family]));
const reviewedFamilies = new Map(snapshot.approaches.map(design => [
  getEntityReactorOptions({ approachId: design.id }).id, atlasFamilyId(design.family),
]));
assert.deepEqual(explorerFamilies, reviewedFamilies);
assert.ok([...explorerFamilies.values()].every(id => atlasFamilies.some(family => family.id === id)));
const { loss, surplus } = learningScenarios;
assert.deepEqual(Object.keys(loss).filter(key => loss[key] !== surplus[key]), ['driver']);
assert.equal(balance(loss).fusion, 500);
assert.equal(balance(surplus).fusion, 500);
assert.equal(balance(loss).net, -50);
assert.equal(balance(surplus).net, 50);
assert.equal(loss.gain, surplus.gain);
assert.equal(matchingLesson(loss), 'loss');
assert.equal(matchingLesson(surplus), 'surplus');
assert.equal(matchingLesson({ ...loss, gain: 10.1 }), '');
assert.equal(matchingLesson({ ...loss, mode: 'pulsed' }), '');
for (const scenario of [loss, surplus]) {
  assert.deepEqual(readScenario(new URLSearchParams(scenario)), scenario, 'scenario links retain the worked example');
}
assert.equal(targetsPerDay(10), 864000);
assert.equal(targetsPerDay(0), 0);
assert.equal(targetsPerDay(0.5), 43200);
console.log('PASS: all 42 curated comparisons, evidence/target separation, source and qualifier preservation, scoped assessment fallback, grouped explorer designs, paired power examples and target throughput.');
