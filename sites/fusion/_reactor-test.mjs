import assert from "node:assert/strict";
import { Box3, Vector3 } from "./assets/vendor/three.module.min.js";
import { readFileSync } from "node:fs";
import { buildReactor } from "./reactor-geometry.js";
import {
  getReactorContent,
  getEntityReactorOptions,
  getInfrastructureContent,
} from "./reactor-content.js";
import { approaches } from "./diagrams.js";
const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url)));
const sources = new Set(data.sources.map((s) => s.id));
let cases = 0,
  models = 0,
  infrastructure = 0;
function validate(id, options = {}) {
  const model = buildReactor(id, options),
    content = getReactorContent(id, options);
  const ids = new Set(content.parts.map((p) => p.id));
  assert.equal(ids.size, content.parts.length, `${id}: duplicate system`);
  assert.deepEqual(
    new Set(model.parts.map((p) => p.id)),
    ids,
    `${id}: geometry/content mismatch`,
  );
  assert.equal(
    content.defaultPart,
    null,
    `${id}: new configurations must start with no selected component`,
  );
  if (options.experimental)
    assert.ok(
      !ids.has("blanket"),
      `${id}: research device must not get a plant blanket`,
    );
  for (const p of content.parts) {
    assert.ok(p.description && p.challenge && p.role);
    for (const related of p.connectsTo)
      assert.ok(ids.has(related), `${id}: broken connection ${related}`);
    for (const source of p.sourceIds)
      assert.ok(sources.has(source), `${id}: unknown source ${source}`);
  }
  const before = model.parts.map((p) => p.object.position.clone());
  model.update(0);
  model.update(3.14);
  model.parts.forEach((p, i) =>
    assert.ok(
      p.object.position.equals(before[i]),
      `${id}: animation moved component group`,
    ),
  );
  model.root.updateMatrixWorld(true);
  const centers = model.parts.map((p) => {
    const bounds = new Box3();
    p.object.traverse((mesh) => {
      if (mesh.isMesh && !mesh.userData.tracer)
        bounds.union(new Box3().setFromObject(mesh));
    });
    return bounds.getCenter(new Vector3());
  });
  for (let i = 0; i < centers.length; i++)
    for (let j = i + 1; j < centers.length; j++) {
      let previous = centers[i].distanceTo(centers[j]);
      for (const fraction of [0.01, 0.25, 0.5, 0.75, 1]) {
        const a = centers[i]
          .clone()
          .addScaledVector(model.parts[i].explode, fraction);
        const b = centers[j]
          .clone()
          .addScaledVector(model.parts[j].explode, fraction);
        const distance = a.distanceTo(b);
        assert.ok(
          distance + 1e-7 >= previous,
          `${id}: separating ${model.parts[i].id}/${model.parts[j].id} moved them closer`,
        );
        previous = distance;
      }
    }
  const geometries = new Set(),
    materials = new Set();
  model.root.traverse((o) => {
    if (!o.isMesh) return;
    assert.ok(ids.has(o.userData.partId), `${id}: unselectable mesh`);
    geometries.add(o.geometry);
    for (const m of Array.isArray(o.material) ? o.material : [o.material])
      materials.add(m);
    for (const v of o.geometry.attributes.position.array)
      assert.ok(Number.isFinite(v), `${id}: nonfinite vertex`);
  });
  let freedGeometry = 0,
    freedMaterials = 0;
  for (const g of geometries)
    g.addEventListener("dispose", () => freedGeometry++);
  for (const m of materials)
    m.addEventListener("dispose", () => freedMaterials++);
  model.dispose();
  assert.equal(freedGeometry, geometries.size, `${id}: geometry leak`);
  assert.equal(freedMaterials, materials.size, `${id}: material leak`);
  assert.equal(model.root.children.length, 0);
  cases++;
}
for (const a of approaches) validate(a.id);
validate("direct-laser", { fastIgnition: true });
for (const e of data.entities) {
  const options = getEntityReactorOptions(e);
  if (options) {
    validate(options.id, options);
    models++;
  } else {
    const c = getInfrastructureContent(e);
    assert.ok(c?.stages.length);
    assert.ok(c.stages.every((s) => s.name && s.text));
    infrastructure++;
  }
}
const thea = data.entities.find((e) => e.canonicalId === "thea");
assert.equal(getEntityReactorOptions(thea).variant, "planar_coil_stellarator");
const generalFusion = data.entities.find(
  (e) => e.canonicalId === "general_fusion",
);
const lm26Options = getEntityReactorOptions(generalFusion);
const lm26 = buildReactor(lm26Options.id, lm26Options);
assert.equal(
  lm26.parts.find((p) => p.id === "drivers").object.userData.driverType,
  "theta-pinch",
);
assert.ok(!lm26.parts.some((p) => p.id === "blanket"));
assert.equal(
  getReactorContent(lm26Options.id, lm26Options).parts.find(
    (p) => p.id === "drivers",
  ).name,
  "Theta-pinch compression coils",
);
lm26.dispose();
console.log(
  `PASS: ${cases} 3D configurations, ${models} organization models, ${infrastructure} infrastructure views; part/source/connection integrity, experimental exclusions, animation boundaries, noncontracting assembly separation and disposal.`,
);
