import assert from "node:assert/strict";
import {
  massBeforeU,
  massAfterU,
  massDifferenceU,
  reactionEnergyMeV,
} from "./reaction-physics.js";
import { balance, defaults, readScenario, targetCost } from "./model.js";
import { approaches, renderMachine } from "./diagrams.js";
import { torusPoint, torusPointVisible } from "./schematic-torus.js";
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
  "PASS: 7 supplied power examples, negative/zero/invalid cases, scenario bounds, target costs, 60 distinct diagram states, and D–T mass/energy conversion.",
);
