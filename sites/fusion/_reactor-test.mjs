import assert from "node:assert/strict";
import { Box3, Vector3 } from "./assets/vendor/three.module.min.js";
import { readFileSync } from "node:fs";
import { buildReactor, applyReactorLayers } from "./reactor-geometry.js";
import { loopFieldDirection } from "./reactor-fields.js";
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
  // Hiding hardware must also remove solid equipment in mixed systems such as
  // heating injectors, laser drivers and exhaust collectors, leaving paths.
  applyReactorLayers(model, {
    structure: false,
    field: true,
    plasma: true,
    flow: true,
  });
  model.root.traverse((mesh) => {
    if (!mesh.isMesh) return;
    if (mesh.material.isMeshStandardMaterial)
      assert.equal(
        mesh.visible,
        false,
        `${id}/${mesh.userData.partId}: equipment survived Hardware off`,
      );
    else
      assert.equal(
        mesh.visible,
        true,
        `${id}: Hardware off hid a field, fuel or energy path`,
      );
  });
  // Conversely, hiding energy paths must retain the solid equipment.
  applyReactorLayers(model, {
    structure: true,
    field: true,
    plasma: true,
    flow: false,
  });
  model.root.traverse((mesh) => {
    if (mesh.isMesh && mesh.material.isMeshStandardMaterial)
      assert.equal(mesh.visible, true, `${id}: Energy paths off hid equipment`);
  });
  applyReactorLayers(model, {
    structure: true,
    field: true,
    plasma: true,
    flow: true,
  });
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
  // A periodic skin must meet itself: finite vertices alone do not catch a seam.
  model.root.traverse((mesh) => {
    const grid = mesh.geometry?.userData.surfaceGrid;
    if (!grid?.periodic) return;
    const vertices = mesh.geometry.attributes.position;
    for (let j = 0; j <= grid.cross; j++) {
      const first = new Vector3().fromBufferAttribute(vertices, j);
      const last = new Vector3().fromBufferAttribute(
        vertices,
        grid.longitudinal * (grid.cross + 1) + j,
      );
      assert.ok(
        first.distanceTo(last) < 1e-5,
        `${id}: open seam in ${mesh.userData.partId}`,
      );
    }
  });
  const group = (partId) => model.parts.find((p) => p.id === partId)?.object;
  const paths = (partId) =>
    group(partId)
      ?.children.filter((m) => m.geometry.type === "TubeGeometry")
      .map((m) => m.geometry.parameters.path) || [];
  if (["tokamak", "spherical", "stellarator"].includes(id)) {
    assert.ok(paths("coils").length);
    for (const path of paths("coils"))
      assert.ok(path.closed, `${id}: open magnet winding`);
  }
  if (id === "spherical") {
    const plasmaBounds = new Box3().setFromObject(group("plasma"));
    const divertorBounds = new Box3();
    for (const mesh of group("exhaust").children.filter(
      (m) => m.geometry.type === "TubeGeometry",
    ))
      divertorBounds.union(new Box3().setFromObject(mesh));
    assert.ok(
      divertorBounds.max.y < plasmaBounds.min.y - 0.1,
      "spherical: divertor intersects confined plasma",
    );
  }
  if (id === "dipole") {
    for (const path of paths("field")) {
      assert.ok(path.closed, "dipole: flux line terminates in the chamber");
      for (const p of path.getPoints(180))
        assert.ok(
          Math.hypot(Math.hypot(p.x, p.z) - 1.05, p.y) > 0.28,
          "dipole: flux line crosses ring housing",
        );
    }
    group("plasma").traverse((mesh) => {
      const vertices = mesh.geometry?.attributes.position;
      if (!vertices) return;
      for (let i = 0; i < vertices.count; i++) {
        const p = new Vector3().fromBufferAttribute(vertices, i);
        assert.ok(
          Math.hypot(Math.hypot(p.x, p.z) - 1.05, p.y) > 0.28,
          "dipole: plasma intersects ring housing",
        );
      }
    });
  }
  if (id === "beam-frc" || id === "pulsed-frc") {
    const fieldPaths = paths("field");
    assert.ok(
      fieldPaths.some((p) => p.closed) && fieldPaths.some((p) => !p.closed),
      `${id}: missing closed core or open external field`,
    );
    for (const path of fieldPaths.filter((p) => p.closed)) {
      assert.ok(
        path.getTangent(0).x * path.getTangent(0.5).x < -0.9,
        `${id}: axial field must reverse between outer and inner legs`,
      );
      for (const p of path.getPoints(100))
        assert.ok(
          Math.hypot(p.y, p.z) > 0.08,
          `${id}: closed flux surface collapses onto axis`,
        );
    }
  }
  if (
    id === "z-pinch" ||
    ["direct-laser", "indirect-laser", "hybrid-laser"].includes(id)
  ) {
    for (let time = 0; time < 7; time += 0.11) {
      model.update(time);
      for (const partId of id === "z-pinch"
        ? ["plasma"]
        : ["drivers", "hohlraum"]) {
        group(partId)?.traverse((mesh) => {
          if (!mesh.userData.tracer) return;
          if (id === "z-pinch")
            assert.ok(
              Math.hypot(mesh.position.y, mesh.position.z) +
                mesh.geometry.parameters.radius <=
                0.13,
              "Z-pinch: shear tracer lies outside plasma column",
            );
          else
            assert.ok(
              mesh.position.length() >= 0.37,
              `${id}: drive path continues inside the capsule`,
            );
        });
      }
    }
  }
  if (id === "electrostatic") {
    assert.ok(
      paths("field").every((p) => !p.closed),
      "electrostatic: magnetic lines must pass along chamber, not orbit cathode",
    );
    const arrows = group("field").children.filter(
      (m) => m.geometry.type === "ConeGeometry",
    );
    assert.ok(arrows.length);
    for (const arrow of arrows)
      assert.ok(
        new Vector3(0, 1, 0)
          .applyQuaternion(arrow.quaternion)
          .dot(arrow.position) < 0,
        "electrostatic: electric field must point toward negative cathode",
      );
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
assert.ok(
  loopFieldDirection(0, 0).y > 0.99,
  "Dipole field points through the ring bore",
);
assert.ok(
  loopFieldDirection(2.2, 0).y < -0.99,
  "Dipole field returns outside the ring",
);
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
for (const mesh of lm26.parts.find((p) => p.id === "plasma").object.children) {
  const vertices = mesh.geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++)
    assert.ok(
      Math.hypot(vertices.getX(i), vertices.getZ(i)) > 0.3,
      "LM26: toroidal plasma must leave space for the central shaft",
    );
}
lm26.dispose();
console.log(
  `PASS: ${cases} 3D configurations, ${models} organization models, ${infrastructure} infrastructure views; part/source/connection integrity, experimental exclusions, animation boundaries, noncontracting assembly separation, closed surfaces/coils, field topology, target-path boundaries and disposal.`,
);
