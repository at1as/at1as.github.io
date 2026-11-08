import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  massBeforeU,
  massAfterU,
  massDifferenceU,
  reactionEnergyMeV,
} from "./reaction-physics.js";
import { balance, defaults, readScenario, targetCost } from "./model.js";
import { approaches, renderMachine } from "./diagrams.js";
import { torusPoint, torusPointVisible } from "./schematic-torus.js";
import { renderGainDiagram } from "./gain-diagram.js";
import {
  atlasFamilies, atlasFamilyId, matchesApproach, readApproachFilters,
  sourceTypeLabel, claimSourceLabels,
} from "./atlas-metadata.js";
const snapshot = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
const sources = new Map(snapshot.sources.map(s => [s.id, s]));
for (const source of snapshot.sources) {
  assert.notEqual(sourceTypeLabel(source), "Source type not recorded", source.id);
  if (source.source_type.startsWith("company_")) {
    assert.ok(sourceTypeLabel(source).startsWith("Company"), "a company summary must not become a peer-reviewed source");
  }
}
assert.equal(sourceTypeLabel(), "Source type not recorded");
assert.deepEqual(claimSourceLabels({ sourceIds: ["MAG_TAE_NATURE"] }, sources), ["Peer-reviewed paper"]);
assert.deepEqual(claimSourceLabels({ sourceIds: ["MAG_THEA_CANIS"] }, sources), ["Preprint"]);
assert.deepEqual(claimSourceLabels({ sourceIds: ["MAG_PROXIMA_PAPER"] }, sources), ["Company source"]);
assert.deepEqual(claimSourceLabels({ sourceIds: ["MAG_TAE_NATURE", "MAG_THEA_CANIS", "MAG_TAE_NATURE"] }, sources), ["Peer-reviewed paper", "Preprint"]);
const configurations = snapshot.approaches.map(a => ({ ...a, family: atlasFamilyId(a.family) }));
for (const entity of snapshot.entities) {
  assert.ok(atlasFamilies.some(f => f.id === atlasFamilyId(entity.family)), entity.id);
  assert.ok(matchesApproach(entity, "", ""));
  if (entity.approachId) {
    const choice = configurations.find(c => c.id === entity.approachId);
    assert.ok(matchesApproach(entity, choice.family, choice.id));
  }
}
const designFilters = query => readApproachFilters(new URLSearchParams(query), configurations);
assert.deepEqual(designFilters("family=approach:stellarator"), { family: "magnetic", configuration: "stellarator" });
assert.deepEqual(designFilters("family=magnetic_pulsed"), { family: "magnetic", configuration: "z_pinch" });
assert.deepEqual(designFilters("family=inertial&configuration=tokamak"), { family: "magnetic", configuration: "tokamak" });
assert.deepEqual(designFilters("family=missing&configuration=missing"), { family: "", configuration: "" });
assert.deepEqual(snapshot.entities.filter(e => matchesApproach(e, "enabling_systems", "")).map(e => e.id), ["kyoto-fusioneering", "ifmif-dones", "craft"]);
assert.ok(matchesApproach(snapshot.entities.find(e => e.id === "zap-energy"), "magnetic", "z_pinch"));
assert.ok(!matchesApproach(snapshot.entities[0], "inertial", "tokamak"));
// The highlighted routes must match the accounting boundary, including in
// the vertical phone layout. Plant electricity is not fuel or plasma input.
const gainRoutes = [
  [["absorbed"], ["fusion"]],
  [["delivered"], ["fusion"]],
  [["delivered"], ["fusion"]],
  [["electricity"], ["returned"]],
  [["aux", "electricity"], ["gross"]],
];
for (const [index, [inputs, outputs]] of gainRoutes.entries()) {
  const diagram = renderGainDiagram(index);
  assert.ok(!/NaN|undefined/.test(diagram));
  const ids = [...diagram.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, "responsive diagrams must have unique SVG references");
  for (const match of diagram.matchAll(/url\(#([^)]*)\)/g)) assert.ok(ids.includes(match[1]));
  const scenes = [...diagram.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(m => m[0]);
  assert.equal(scenes.length, 2);
  for (const scene of scenes) {
    const routes = [...scene.matchAll(/data-energy-flow="([^"]+)" data-count="([^"]+)"/g)];
    assert.deepEqual(routes.filter(m => m[2] === "input").map(m => m[1]).sort(), inputs);
    assert.deepEqual(routes.filter(m => m[2] === "output").map(m => m[1]).sort(), outputs);
    assert.ok(routes.some(m => m[1] === "return"), "show recirculating plant use in every view");
    assert.ok(routes.some(m => m[1] === "aux"), "show auxiliary plant loads in every view");
    assert.ok(routes.some(m => m[1] === "export"), "show the grid in the broader context");
    if (index === 3) {
      assert.ok(routes.some(m => m[1] === "recycled"));
      assert.ok(routes.some(m => m[1] === "fusion-contribution"));
      assert.ok(!routes.some(m => m[1] === "gross"), "recovery must not imply thermal generation");
    }
  }
}
const heroTorus = { R: 146, r: 42, h: 48, stellarator: false };
assert.equal(
  torusPointVisible(torusPoint(Math.PI / 2, 0, heroTorus, 1.025), heroTorus),
  true,
  "near outer surface is visible",
);
assert.equal(
  torusPointVisible(
    torusPoint(Math.PI / 2, Math.PI, heroTorus, 1.025),
    heroTorus,
  ),
  false,
  "near inner surface is hidden by the torus",
);
assert.equal(
  torusPointVisible(torusPoint(3.4, 3.4, heroTorus, 1.025), heroTorus),
  false,
  "a front-facing far surface can still be occluded by the near torus",
);
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} ≠ ${b}`);
assert.ok(massAfterU < massBeforeU);
close(massDifferenceU, 0.018882833325);
assert.ok(reactionEnergyMeV > 17.58 && reactionEnergyMeV < 17.6);
assert.equal(reactionEnergyMeV.toFixed(1), "17.6");
close(balance(defaults.continuous).net, 50);
close(balance({ ...defaults.continuous, driver: 0.25 }).net, -50);
close(balance(defaults.pulsed).net, 600);
close(balance({ ...defaults.pulsed, driver: 0.1 }).net, 100);
close(balance({ ...defaults.inertia, rate: 1 }).net, 24.16666666666667);
close(balance(defaults.inertia).net, 241.66666666666663);
close(balance({ ...defaults.inertia, gain: 40 }).net, 916.6666666666666);
close(
  balance({ ...defaults.inertia, gain: 40, driver: 0.15 }).net,
  1083.3333333333333,
);
assert.ok(balance({ ...defaults.continuous, driver: 0 }).error);
for (const key of ["capture", "thermal"]) {
  const r = balance({ ...defaults.continuous, [key]: 0 });
  close(r.gross, 0);
  close(r.net, -150);
  assert.equal(r.threshold, null);
}
assert.equal(
  balance({ ...defaults.continuous, heating: 0, aux: 0 }).ratio,
  null,
);
assert.equal(balance({ ...defaults.continuous, heating: 0 }).threshold, null);
assert.equal(targetCost(10, 1, 0), null);
close(targetCost(10, 1, 500), 72);
close(targetCost(10, 1, 1500), 24);
assert.equal(readScenario(new URLSearchParams("driver=0")).driver, 0.01);
assert.equal(readScenario(new URLSearchParams("gain=NaN")).gain, 10);
assert.equal(readScenario(new URLSearchParams("gain=999")).gain, 100);
assert.equal(readScenario(new URLSearchParams("mode=inertia&aux=500")).aux, 50);
assert.equal(readScenario(new URLSearchParams("gain=&thermal= ")).gain, 10);
assert.equal(readScenario(new URLSearchParams("gain=&thermal= ")).thermal, 0.4);
assert.equal(
  readScenario(new URLSearchParams("driver=.333&gain=10.26")).driver,
  0.33,
);
assert.equal(
  readScenario(new URLSearchParams("driver=.333&gain=10.26")).gain,
  10.3,
);
assert.equal(
  readScenario(new URLSearchParams("mode=unknown")).mode,
  "continuous",
);
assert.ok(balance({ ...defaults.continuous, mode: "unknown" }).error);
assert.equal(approaches.length, 15);
for (const a of approaches) {
  const frames = a.stages.map((_, i) => renderMachine(a.id, i));
  assert.equal(new Set(frames).size, a.stages.length);
  for (const f of frames) {
    assert.ok(f.includes('viewBox="0 0 760 470"'));
    assert.ok(!/NaN|undefined/.test(f));
  }
}
console.log(
  "PASS: source provenance, linked approach filters, 5 gain boundaries in both layouts, 7 supplied power examples, negative/zero/invalid cases, scenario bounds, target costs, 60 diagram states, and D–T mass/energy conversion.",
);
