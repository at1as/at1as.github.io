/**
 * Original, deliberately schematic cutaway models for the Fusion Atlas.
 * Dimensions, field-line pitch and target sizes are illustrative, not engineering CAD.
 * Each selectable component owns its meshes; the viewer controls transforms and layers.
 */
import * as THREE from "./assets/vendor/three.module.min.js";
import { dipoleLoop } from "./reactor-fields.js";

const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const PALETTE = {
  steel: 0x7895ad,
  dark: 0x233748,
  silver: 0xc4d2db,
  magnet: 0x4c86ac,
  copper: 0xc78a5d,
  plasma: 0xff9860,
  core: 0xffd9a0,
  field: 0x74bde4,
  electric: 0xc7a2ed,
  energy: 0xa0e4cd,
  blanket: 0xbba374,
  wall: 0x354a5c,
};

export function buildReactor(id, options = {}) {
  const root = new THREE.Group();
  root.name = `Fusion concept: ${id}`;
  const parts = [],
    tracers = [],
    geometries = new Set(),
    materials = new Set();
  const mat = (key, settings = {}) => {
    const material = new THREE.MeshStandardMaterial({
      color: PALETTE[key],
      metalness: 0.55,
      roughness: 0.38,
      ...settings,
    });
    materials.add(material);
    return material;
  };
  const luminous = (key, opacity = 1) => {
    const material = new THREE.MeshBasicMaterial({
      color: PALETTE[key],
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity >= 1,
    });
    materials.add(material);
    return material;
  };
  const M = {
    steel: mat("steel"),
    dark: mat("dark"),
    silver: mat("silver", { side: THREE.DoubleSide }),
    magnet: mat("magnet"),
    copper: mat("copper", { side: THREE.DoubleSide }),
    blanket: mat("blanket", { side: THREE.DoubleSide }),
    wall: mat("wall", { side: THREE.DoubleSide }),
    field: luminous("field", 0.63),
    electric: luminous("electric", 0.85),
    energy: luminous("energy", 0.9),
    plasma: luminous("plasma", 0.38),
    hot: luminous("core", 0.8),
    laser: luminous("energy", 0.68),
    xray: luminous("core", 0.48),
    ghost: mat("steel", {
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  };
  // A selectable system can contain both equipment and an energy path.
  // Assign display layers to meshes so hiding hardware also hides injectors,
  // laser housings and exhaust collectors without hiding the paths they carry.
  for (const key of ["field", "electric"]) M[key].userData.layer = "field";
  for (const key of ["energy", "laser", "xray"]) M[key].userData.layer = "flow";
  M.plasma.userData.layer = "plasma";
  function part(partId, anchor, explode, layer = "structure") {
    const object = new THREE.Group();
    object.name = partId;
    object.userData.partId = partId;
    object.userData.layer = layer;
    root.add(object);
    parts.push({
      id: partId,
      object,
      anchor: V(...anchor),
      explode: V(...explode),
      layer,
    });
    return object;
  }
  function mesh(group, geometry, material, pos = V()) {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, material);
    object.position.copy(pos);
    object.userData.partId = group.userData.partId;
    object.userData.layer = material.isMeshBasicMaterial
      ? material.userData.layer ||
        (group.userData.layer === "structure" ? "plasma" : group.userData.layer)
      : "structure";
    group.add(object);
    return object;
  }
  function box(group, x, y, z, w, h, d, material = M.steel) {
    return mesh(group, new THREE.BoxGeometry(w, h, d), material, V(x, y, z));
  }
  function ball(group, x, y, z, radius, material = M.plasma, scale = null) {
    const o = mesh(
      group,
      new THREE.SphereGeometry(
        radius,
        radius < 0.1 ? 8 : 28,
        radius < 0.1 ? 6 : 18,
      ),
      material,
      V(x, y, z),
    );
    if (scale) o.scale.set(...scale);
    return o;
  }
  function rod(
    group,
    from,
    to,
    radius = 0.06,
    material = M.steel,
    endRadius = radius,
    segments = 12,
  ) {
    const a = Array.isArray(from) ? V(...from) : from;
    const b = Array.isArray(to) ? V(...to) : to;
    const axis = b.clone().sub(a);
    const object = mesh(
      group,
      new THREE.CylinderGeometry(endRadius, radius, axis.length(), segments),
      material,
      a.clone().add(b).multiplyScalar(0.5),
    );
    object.quaternion.setFromUnitVectors(V(0, 1, 0), axis.normalize());
    return object;
  }
  function curve(
    group,
    fn,
    radius = 0.025,
    material = M.field,
    samples = 96,
    closed,
  ) {
    const pts = Array.from({ length: samples + 1 }, (_, i) => fn(i / samples));
    const coincidentEnds = pts[0].distanceTo(pts.at(-1)) < 1e-6;
    closed ??= coincidentEnds;
    if (closed && coincidentEnds) pts.pop();
    const path = new THREE.CatmullRomCurve3(pts, closed, "centripetal");
    return mesh(
      group,
      new THREE.TubeGeometry(path, samples, radius, 5, closed),
      material,
    );
  }
  function ring(
    group,
    center,
    radius,
    tube = 0.09,
    material = M.steel,
    axis = "y",
    arc = TAU,
    start = 0,
  ) {
    const c = Array.isArray(center) ? V(...center) : center;
    return curve(
      group,
      (t) => {
        const a = start + t * arc;
        return axis === "x"
          ? V(c.x, c.y + radius * Math.cos(a), c.z + radius * Math.sin(a))
          : axis === "z"
            ? V(c.x + radius * Math.cos(a), c.y + radius * Math.sin(a), c.z)
            : V(c.x + radius * Math.cos(a), c.y, c.z + radius * Math.sin(a));
      },
      tube,
      material,
      Math.max(24, Math.ceil((48 * arc) / TAU)),
      Math.abs(arc - TAU) < 1e-6,
    );
  }
  function tracer(
    group,
    fn,
    speed = 0.12,
    offset = 0,
    material = M.energy,
    radius = 0.045,
  ) {
    // Fade at the ends of open paths instead of visibly teleporting a tracer.
    // Each tracer owns its material so fading cannot dim the underlying path.
    const tracerMaterial = material.clone();
    tracerMaterial.transparent = true;
    tracerMaterial.depthWrite = false;
    materials.add(tracerMaterial);
    const o = ball(group, 0, 0, 0, radius, tracerMaterial);
    o.userData.tracer = true;
    const closed = fn(0).distanceTo(fn(1)) < 0.02;
    tracers.push({
      object: o,
      fn,
      speed,
      offset,
      closed,
      opacity: material.opacity,
    });
    o.position.copy(fn(offset));
  }
  function flow(group, a, b, material = M.energy, count = 3) {
    const av = V(...a),
      bv = V(...b),
      fn = (t) => av.clone().lerp(bv, t);
    rod(group, av, bv, 0.016, material, 0.016, 6);
    for (let i = 0; i < count; i++)
      tracer(group, fn, 0.16, i / count, material);
  }
  function bolts(group, center, radius, axis = "x", count = 10) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU,
        c = V(...center);
      if (axis === "x") {
        c.y += Math.cos(a) * radius;
        c.z += Math.sin(a) * radius;
      } else if (axis === "y") {
        c.x += Math.cos(a) * radius;
        c.z += Math.sin(a) * radius;
      } else {
        c.x += Math.cos(a) * radius;
        c.y += Math.sin(a) * radius;
      }
      ball(group, c.x, c.y, c.z, 0.045, M.silver);
    }
  }
  function port(group, a, b, radius = 0.23, material = M.steel) {
    const av = V(...a),
      bv = V(...b),
      axis = bv.clone().sub(av).normalize();
    rod(group, av, bv, radius, material);
    rod(
      group,
      bv.clone().addScaledVector(axis, -0.07),
      bv.clone().addScaledVector(axis, 0.05),
      radius * 1.34,
      M.silver,
    );
    rod(
      group,
      bv.clone().addScaledVector(axis, 0.05),
      bv.clone().addScaledVector(axis, 0.075),
      radius * 0.78,
      M.dark,
    );
    const u =
      Math.abs(axis.y) < 0.9
        ? V(0, 1, 0).cross(axis).normalize()
        : V(1, 0, 0).cross(axis).normalize();
    const v = axis.clone().cross(u);
    for (let i = 0; i < 8; i++) {
      const q = bv
        .clone()
        .addScaledVector(axis, 0.08)
        .addScaledVector(u, Math.cos((i * TAU) / 8) * radius * 1.1)
        .addScaledVector(v, Math.sin((i * TAU) / 8) * radius * 1.1);
      ball(group, q.x, q.y, q.z, 0.025, M.dark);
    }
  }
  function feet(group, span = 2.4, floor = -2.1, depth = 1.5) {
    for (const x of [-span, span])
      for (const z of [-depth, depth]) {
        box(group, x, floor + 0.45, z, 0.19, 0.9, 0.19, M.steel);
        box(group, x, floor, z, 0.65, 0.13, 0.5, M.dark);
      }
    box(
      group,
      0,
      floor + 0.12,
      0,
      span * 2 + 0.4,
      0.12,
      depth * 2 + 0.4,
      M.dark,
    );
  }
  function axialVessel(group, length = 6, radius = 1.25) {
    const shell = mesh(
      group,
      new THREE.CylinderGeometry(
        radius,
        radius,
        length,
        56,
        1,
        true,
        Math.PI / 2,
        Math.PI,
      ),
      M.wall,
    );
    shell.rotation.z = Math.PI / 2;
    for (const x of [-length / 2, length / 2]) {
      ring(group, [x, 0, 0], radius, 0.12, M.silver, "x");
      bolts(group, [x, 0, 0], radius, "x", 12);
    }
    for (const a of [0, Math.PI]) {
      rod(
        group,
        [-length / 2, Math.cos(a) * radius, Math.sin(a) * radius],
        [length / 2, Math.cos(a) * radius, Math.sin(a) * radius],
        0.055,
        M.silver,
      );
    }
    feet(group, length * 0.32, -1.9, 0.85);
    port(group, [0, -0.6, -radius + 0.1], [0, -0.6, -radius - 0.6], 0.22);
  }
  function chamber(group, radius = 2.6) {
    // The rear spherical sector leaves the target and diagnostic paths exposed.
    mesh(
      group,
      new THREE.SphereGeometry(
        radius,
        32,
        20,
        Math.PI + 0.14,
        Math.PI - 0.28,
        0.2,
        Math.PI - 0.4,
      ),
      M.wall,
    );
    ring(group, [0, 0, 0], radius, 0.09, M.silver, "y");
    ring(group, [0, 0, 0], radius, 0.065, M.steel, "z", Math.PI, Math.PI);
    feet(group, 1.6, -2.85, 1.25);
    port(group, [-1.6, 0.4, -1.9], [-2.2, 0.4, -2.55], 0.24);
    port(group, [1.5, -0.5, -1.85], [2.15, -0.5, -2.5], 0.24);
  }
  function capsule(group, radius = 0.43, multishell = false) {
    // Open sectors expose nested shells; they are enlarged relative to the machine.
    mesh(
      group,
      new THREE.SphereGeometry(radius, 32, 20, 3, TAU - 1.8),
      M.copper,
    );
    mesh(
      group,
      new THREE.SphereGeometry(radius * 0.79, 28, 18, 2.8, TAU - 2),
      M.silver,
    );
    if (multishell)
      mesh(
        group,
        new THREE.SphereGeometry(radius * 1.3, 32, 18, 3.2, TAU - 2.2),
        M.blanket,
      );
  }
  function plasmaCore(group, radius = 0.25) {
    ball(group, 0, 0, 0, radius, M.plasma);
    ball(group, 0, 0, 0, radius * 0.48, M.hot);
  }
  function blanketTiles(group, radius = 2.45) {
    for (let row = 0; row < 3; row++)
      for (let j = 0; j < 8; j++) {
        const a = Math.PI * 0.95 + j * Math.PI * 0.14;
        const y = (row - 1) * 0.78,
          r = Math.sqrt(radius * radius - y * y);
        const tile = box(
          group,
          Math.cos(a) * r,
          y,
          Math.sin(a) * r,
          0.6,
          0.7,
          0.16,
          M.blanket,
        );
        tile.rotation.y = -a + Math.PI / 2;
      }
  }
  function banks(group, x = 0, y = -1.45, z = 2.1, count = 5) {
    for (let i = 0; i < count; i++) {
      const q = x + (i - (count - 1) / 2) * 0.48;
      box(group, q, y, z, 0.37, 0.64, 0.5, M.dark);
      box(group, q, y, z + 0.255, 0.28, 0.48, 0.025, M.silver);
      box(group, q, y + 0.18, z + 0.28, 0.2, 0.035, 0.02, M.energy);
      for (const dx of [-0.11, 0.11])
        rod(
          group,
          [q + dx, y + 0.34, z],
          [q + dx, y + 0.47, z],
          0.035,
          M.copper,
        );
    }
  }
  function tubeSurface(
    group,
    fn,
    material,
    longitudinal = 96,
    cross = 24,
    start = 0,
    end = TAU,
  ) {
    const positions = [],
      indices = [];
    for (let i = 0; i <= longitudinal; i++)
      for (let j = 0; j <= cross; j++) {
        const p = fn(
          start + (i / longitudinal) * (end - start),
          (j / cross) * TAU,
        );
        positions.push(p.x, p.y, p.z);
      }
    for (let i = 0; i < longitudinal; i++)
      for (let j = 0; j < cross; j++) {
        const n = i * (cross + 1) + j;
        indices.push(
          n,
          n + 1,
          n + cross + 1,
          n + 1,
          n + cross + 2,
          n + cross + 1,
        );
      }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setIndex(indices);
    geometry.userData.surfaceGrid = {
      longitudinal,
      cross,
      periodic: Math.abs(end - start - TAU) < 1e-6,
    };
    geometry.computeVertexNormals();
    return mesh(group, geometry, material);
  }

  function toroidal(stellarator = false, spherical = false) {
    const highField = options.variant === "high_field_tokamak";
    const R = spherical ? 1.45 : 2.05,
      a = spherical ? 0.95 : 0.66,
      elongation = spherical ? 1.65 : 1.35;
    const shape = (phi, theta, scale = 1) => {
      let rr, yy;
      if (stellarator) {
        const twist = phi * 2;
        rr =
          R +
          0.16 * Math.cos(phi * 3) +
          scale *
            (a * Math.cos(theta) * Math.cos(twist) -
              0.88 * Math.sin(theta) * Math.sin(twist));
        yy =
          0.17 * Math.sin(phi * 3) +
          scale *
            (a * Math.cos(theta) * Math.sin(twist) +
              0.88 * Math.sin(theta) * Math.cos(twist));
      } else {
        rr = R + scale * a * Math.cos(theta + 0.25 * Math.sin(theta));
        if (spherical) rr = Math.max(0.34, rr);
        yy = scale * a * elongation * Math.sin(theta);
      }
      return V(rr * Math.cos(phi), yy, rr * Math.sin(phi));
    };
    const vessel = part("vessel", [-2.2, 0, -1], [-0.5, -0.1, -0.6]);
    tubeSurface(
      vessel,
      (p, t) => shape(p, t, 1.55),
      M.wall,
      64,
      24,
      Math.PI * 0.93,
      Math.PI * 2.02,
    );
    for (const phi of [Math.PI * 0.93, Math.PI * 2.02]) {
      curve(vessel, (t) => shape(phi, t * TAU, 1.55), 0.065, M.silver, 48);
      for (let j = 0; j < 12; j++) {
        const q = shape(phi, (j * TAU) / 12, 1.59);
        ball(vessel, q.x, q.y, q.z, 0.04, M.silver);
      }
    }
    feet(vessel, 1.9, spherical ? -3.4 : -2.25, 1.6);
    for (const phi of [Math.PI * 1.1, Math.PI * 1.5, Math.PI * 1.87]) {
      const rr = R + a * 1.5;
      port(
        vessel,
        [rr * Math.cos(phi), 0.05, rr * Math.sin(phi)],
        [(rr + 0.7) * Math.cos(phi), 0.05, (rr + 0.7) * Math.sin(phi)],
        0.24,
      );
    }
    if (!options.experimental) {
      const blanket = part("blanket", [-1.6, 0.35, -1.5], [-0.6, 0.25, -0.2]);
      tubeSurface(
        blanket,
        (p, t) => shape(p, t, 1.34),
        M.blanket,
        52,
        20,
        Math.PI * 1.08,
        Math.PI * 1.94,
      );
      for (let i = 0; i < 9; i++)
        curve(
          blanket,
          (t) => shape(Math.PI * (1.08 + i * 0.1075), t * TAU, 1.355),
          0.018,
          M.dark,
          36,
        );
    }
    const coils = part("coils", [2.2, 1.3, -0.1], [0.7, 0.6, -0.1]);
    if (stellarator && options.variant === "helical_stellarator") {
      for (let k = 0; k < 2; k++) {
        curve(
          coils,
          (t) => shape(t * TAU, t * TAU * 2 + k * Math.PI, 1.94),
          0.13,
          M.magnet,
          190,
        );
        curve(
          coils,
          (t) => shape(t * TAU, t * TAU * 2 + k * Math.PI + 0.13, 1.98),
          0.035,
          M.silver,
          190,
        );
      }
      for (const y of [-1.45, 1.45])
        ring(coils, [0, y, 0], R + 0.1, 0.12, M.magnet);
    } else if (stellarator && options.variant === "patterned_hts_stellarator") {
      // Patterned cylindrical sections form a toroidal array. Mitered ends
      // preserve a gap between adjacent sections, including at the inner bore.
      const count = 8,
        radius = 1.75;
      for (let i = 0; i < count; i++) {
        const phi = (i / count) * TAU;
        const radial = V(Math.cos(phi), 0, Math.sin(phi));
        const tangent = V(-Math.sin(phi), 0, Math.cos(phi));
        const point = (u, theta, r = radius) => {
          const rr = R + r * Math.cos(theta);
          return radial
            .clone()
            .multiplyScalar(rr)
            .addScaledVector(tangent, u * rr * Math.tan(Math.PI / count))
            .add(V(0, r * Math.sin(theta), 0));
        };
        tubeSurface(
          coils,
          (u, theta) => point(u * 0.88, theta),
          M.ghost,
          8,
          40,
          -1,
          1,
        );
        for (const end of [-0.88, 0.88])
          curve(coils, (t) => point(end, t * TAU), 0.035, M.steel, 64);
        for (let j = 0; j < 6; j++) {
          const level = (j - 2.5) * 0.25;
          const pattern = (t) =>
            point(
              level + 0.1 * Math.sin(t * TAU * 3 + i * 0.7),
              t * TAU,
              radius + 0.012,
            );
          curve(coils, pattern, 0.025, M.magnet, 96);
        }
      }
    } else if (stellarator && options.variant === "planar_coil_stellarator") {
      // Small, individually planar coils tile a surrounding winding surface.
      // Counts and current patterns are illustrative, not a Thea device layout.
      for (let i = 0; i < 24; i++)
        for (let j = 0; j < 6; j++) {
          const phi = (i / 24) * TAU,
            theta = (j / 6) * TAU;
          const center = shape(phi, theta, 1.92);
          const u = shape(phi + 0.001, theta, 1.92)
            .sub(center)
            .normalize();
          const v = shape(phi, theta + 0.001, 1.92)
            .sub(center)
            .normalize();
          v.addScaledVector(u, -v.dot(u)).normalize();
          curve(
            coils,
            (t) =>
              center
                .clone()
                .addScaledVector(u, 0.22 * Math.cos(t * TAU))
                .addScaledVector(v, 0.22 * Math.sin(t * TAU)),
            0.045,
            M.magnet,
            20,
          );
          const bolt = center.clone().addScaledVector(u, 0.28);
          ball(coils, bolt.x, bolt.y, bolt.z, 0.038, M.silver);
        }
    } else {
      const count = highField ? 16 : 12;
      for (let i = 0; i < count; i++) {
        const phi = (i / count) * TAU;
        const coilPath = (t) => {
          const theta = t * TAU;
          if (!stellarator) return shape(phi, theta, 1.98);
          const p = shape(phi, theta, 1.9),
            warp = 0.28 * Math.sin(theta * 2 + phi * 3);
          return p.add(V(-Math.sin(phi) * warp, 0, Math.cos(phi) * warp));
        };
        curve(
          coils,
          coilPath,
          highField ? 0.145 : spherical ? 0.07 : 0.115,
          M.magnet,
          48,
        );
        for (const t of [0.22, 0.72]) {
          const q = coilPath(t),
            b = box(coils, q.x, q.y, q.z, 0.28, 0.16, 0.25, M.silver);
          b.rotation.y = -phi;
        }
        // Visible winding seam gives each magnet a manufactured cross-section.
        curve(
          coils,
          (t) =>
            coilPath(t).add(
              V(Math.cos(phi) * 0.025, 0.025, Math.sin(phi) * 0.025),
            ),
          0.018,
          M.silver,
          40,
        );
      }
    }
    if (!stellarator) {
      const solenoid = part("solenoid", [0, 1.25, 0], [0, 1.5, 0]);
      const radius = spherical ? 0.22 : 0.48;
      rod(solenoid, [0, -1.5, 0], [0, 1.6, 0], radius, M.dark);
      for (let i = 0; i < 20; i++)
        ring(
          solenoid,
          [0, -1.45 + i * 0.152, 0],
          radius + 0.02,
          0.045,
          M.copper,
        );
      for (const y of [-1.6, 1.7])
        rod(
          solenoid,
          [0, y - 0.08, 0],
          [0, y + 0.08, 0],
          radius * 1.25,
          M.silver,
        );
      for (const y of [-1.55, 1.55])
        ring(coils, [0, y, 0], R + 0.25, 0.075, M.copper);
    }
    const plasma = part("plasma", [R, 0.1, 0.7], [0, 0.7, 0.6], "plasma");
    tubeSurface(plasma, (p, t) => shape(p, t), M.plasma, 112, 28);
    curve(plasma, (t) => shape(t * TAU, 0, 0.1), 0.065, M.hot, 140);
    const field = part("field", [1.5, 0.6, 1.6], [0.35, 0.55, 0.7], "field");
    for (let j = 0; j < 5; j++) {
      const fn = (t) =>
        shape(
          t * TAU * 2,
          t * TAU * (stellarator ? 3 : 3.4) + (j * TAU) / 5,
          1.06,
        );
      curve(field, fn, 0.016, M.field, 170);
      tracer(field, fn, 0.055, j / 5, M.hot, 0.034);
    }
    const heating = part("heating", [2.8, 0.2, 1.7], [0.9, 0.3, 0.9], "flow");
    const point = V(R * 0.8, 0.15, R * 0.6),
      end = V(3.35, 0.65, 2.25);
    port(
      heating,
      point.clone().lerp(end, 0.6).toArray(),
      end.toArray(),
      0.25,
      M.magnet,
    );
    flow(heating, end.toArray(), point.toArray(), M.energy);
    box(heating, 3.32, 0.65, 2.25, 0.48, 0.62, 0.64, M.dark);
    const exhaustY = spherical ? -2.05 : -1.35;
    const exhaust = part("exhaust", [1.3, exhaustY, 1], [0, -1.1, 0.5], "flow");
    for (const r of [R - 0.3, R + 0.35])
      ring(
        exhaust,
        [0, exhaustY, 0],
        r,
        0.095,
        M.copper,
        "y",
        Math.PI * 1.28,
        -0.15,
      );
    for (let i = 0; i < 9; i++) {
      const phi = (i / 9) * Math.PI * 1.2;
      flow(
        exhaust,
        [R * Math.cos(phi), spherical ? -1.5 : -0.7, R * Math.sin(phi)],
        [(R + 0.1) * Math.cos(phi), exhaustY, (R + 0.1) * Math.sin(phi)],
        M.energy,
        1,
      );
    }
  }

  function mirror() {
    const vessel = part("vessel", [0, -0.9, -0.7], [0, -0.65, -0.55]);
    axialVessel(vessel, 6.1, 1.23);
    const coils = part("coils", [2.7, 0.95, 0], [0, 0.8, -0.35]);
    for (const x of [-2.75, -2.5, -2.25, 2.25, 2.5, 2.75])
      ring(coils, [x, 0, 0], 0.94, 0.16, M.magnet, "x");
    for (const x of [-1.6, -0.8, 0, 0.8, 1.6])
      ring(coils, [x, 0, 0], 1.34, 0.065, M.magnet, "x");
    const plasma = part("plasma", [0, 0.5, 0.1], [0, 0.6, 0.7], "plasma");
    ball(plasma, 0, 0, 0, 0.65, M.plasma, [3.3, 1, 1]);
    const field = part("field", [1.6, 0.7, 0.4], [0, 0.6, 0.7], "field");
    for (let i = 0; i < 10; i++) {
      const a = (i * TAU) / 10;
      const fn = (t) => {
        const x = (t - 0.5) * 7.5,
          r =
            0.29 +
            0.68 * Math.exp(-Math.pow(x / 1.8, 4)) +
            0.42 * Math.max(0, Math.abs(x) - 2.7);
        return V(x, Math.cos(a) * r, Math.sin(a) * r);
      };
      curve(field, fn, 0.017, M.field, 100);
      tracer(field, fn, 0.15, i / 10, M.field, 0.04);
    }
    const heating = part("heating", [0.3, 1.7, 1.4], [0, 1, 1], "flow");
    for (const x of [-0.7, 0.7]) {
      port(heating, [x, 0.9, 0.9], [x + 0.4, 1.55, 1.75], 0.22, M.magnet);
      flow(heating, [x + 0.4, 1.55, 1.75], [x, 0, 0]);
    }
    const collector = part("collector", [3.9, 0.6, 0], [1, 0, 0], "flow");
    for (const sign of [-1, 1])
      for (let i = 0; i < 4; i++)
        ring(
          collector,
          [sign * (3.18 + 0.23 * i), 0, 0],
          0.52 + 0.12 * i,
          0.055,
          i % 2 ? M.copper : M.energy,
          "x",
        );
  }
  function dipole() {
    const vessel = part("vessel", [-1.8, 0, -1.4], [-0.7, -0.5, -0.6]);
    chamber(vessel, 2.65);
    const ringPart = part("ring", [1.05, 0, 0], [0, 0.15, 1.1]);
    ring(ringPart, [0, 0, 0], 1.05, 0.24, M.magnet);
    for (const y of [-0.17, 0.17])
      ring(ringPart, [0, y, 0], 1.05, 0.06, M.silver);
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU;
      curve(
        ringPart,
        (t) => {
          const b = t * TAU;
          return V(
            (1.05 + 0.245 * Math.cos(b)) * Math.cos(a),
            0.245 * Math.sin(b),
            (1.05 + 0.245 * Math.cos(b)) * Math.sin(a),
          );
        },
        0.018,
        M.copper,
        16,
      );
    }
    const levitation = part("levitation", [0, 2.7, 0], [0, 1.25, 0]);
    ring(levitation, [0, 2.7, 0], 0.96, 0.18, M.magnet);
    ring(levitation, [0, 2.93, 0], 0.96, 0.04, M.silver);
    rod(levitation, [-1.6, 2.7, 0], [1.6, 2.7, 0], 0.075, M.steel);
    for (const x of [-1.6, 1.6])
      rod(levitation, [x, 2.7, 0], [x, 1.75, -1.6], 0.075, M.steel);
    const field = part("field", [0.8, 1.1, 0.7], [0.2, 0.6, 0.7], "field");
    const fluxLoops = [dipoleLoop(1.8), dipoleLoop(2.2)];
    for (let az = 0; az < 7; az++)
      for (const path of fluxLoops) {
        const phi = (az * TAU) / 7;
        const fn = (t) => {
          const p = path.getPoint(t);
          return V(p.x * Math.cos(phi), p.y, p.x * Math.sin(phi));
        };
        curve(field, fn, 0.016, M.field, 100);
        tracer(field, fn, 0.08, az / 7, M.field, 0.035);
      }
    const plasma = part("plasma", [1.7, 0.3, 0.2], [0.3, 0, 0.8], "plasma");
    // Plasma lies between nested flux surfaces, leaving the protected ring clear.
    for (const path of fluxLoops)
      tubeSurface(
        plasma,
        (phi, theta) => {
          const p = path.getPoint(theta / TAU);
          return V(p.x * Math.cos(phi), p.y, p.x * Math.sin(phi));
        },
        M.plasma,
        72,
        48,
      );
    const heating = part("heating", [2.6, 0.6, 1.4], [0.8, 0.6, 0.7], "flow");
    port(heating, [2, 0.25, 0.9], [2.9, 0.6, 1.7], 0.24, M.magnet);
    flow(heating, [2.9, 0.6, 1.7], [1.6, 0.2, 0.5]);
  }

  function frc(pulsed = false) {
    const length = pulsed ? 8 : 6.8;
    frcField(pulsed, length);
    const vessel = part("vessel", [0, -0.9, -0.6], [0, -0.6, -0.55]);
    axialVessel(vessel, length, 1.04);
    const coils = part("coils", [1.2, 1, 0], [0, 1, -0.3]);
    for (let i = 0; i < (pulsed ? 15 : 11); i++) {
      const x = -length * 0.45 + (i / (pulsed ? 14 : 10)) * length * 0.9;
      ring(
        coils,
        [x, 0, 0],
        Math.abs(x) < 1.3 && pulsed ? 1.24 : 1.13,
        Math.abs(x) < 1.3 ? 0.12 : 0.08,
        M.magnet,
        "x",
      );
    }
    const plasma = part("plasma", [0, 0.45, 0.25], [0, 0.4, 0.85], "plasma");
    ball(plasma, 0, 0, 0, 0.52, M.plasma, [pulsed ? 2.5 : 3.8, 1, 1]);
    curve(
      plasma,
      (t) =>
        V(
          Math.cos(t * TAU) * (pulsed ? 1.3 : 1.95),
          Math.sin(t * TAU) * 0.52,
          0,
        ),
      0.025,
      M.hot,
      80,
    );
    const injector = part(
      "injector",
      pulsed ? [-3.1, 0.2, 0] : [-0.5, 1.5, 1.4],
      pulsed ? [-0.85, 0.5, 0] : [0, 0.8, 1],
      "flow",
    );
    if (pulsed) {
      for (const sign of [-1, 1]) {
        for (const dx of [-0.3, 0, 0.3])
          ring(injector, [sign * 3.15 + dx, 0, 0], 0.7, 0.065, M.copper, "x");
        ball(injector, sign * 3.1, 0, 0, 0.3, M.plasma, [2, 1, 1]);
        flow(injector, [sign * 3, 0, 0], [sign * 0.7, 0, 0], M.hot, 3);
      }
      const capacitors = part("capacitors", [0, -1.4, 2], [0, -0.2, 1.4]);
      banks(capacitors, 0, -1.3, 2, 7);
      const collector = part(
        "collector",
        [1.9, -0.6, 1.5],
        [0.6, -0.4, 0.75],
        "flow",
      );
      for (const sign of [-1, 1]) {
        const fn = (t) =>
          V(
            sign * (1.1 + 0.9 * Math.sin(Math.PI * t)),
            -0.15 - 1.15 * t,
            1.1 + 0.9 * t,
          );
        curve(collector, fn, 0.045, M.copper, 40);
        tracer(collector, fn, 0.16, sign < 0 ? 0.5 : 0, M.energy, 0.065);
      }
    } else {
      for (const [x, sign] of [
        [-1.3, 1],
        [1.3, -1],
        [0, 1],
      ]) {
        const from = [x - sign * 0.6, 1.55, sign * 1.65],
          to = [x + sign * 0.6, 0.1, sign * 0.35];
        port(
          injector,
          V(...from)
            .lerp(V(...to), 0.25)
            .toArray(),
          from,
          0.27,
          M.magnet,
        );
        flow(injector, from, to, M.energy, 3);
      }
      const exhaust = part("exhaust", [3.7, 0, 0], [1.1, 0, 0], "flow");
      for (const sign of [-1, 1]) {
        ring(exhaust, [sign * 3.7, 0, 0], 0.72, 0.095, M.copper, "x");
        flow(exhaust, [sign * 2.3, 0.1, 0], [sign * 4.1, 0.1, 0], M.energy, 2);
      }
    }
  }
  function frcField(pulsed, length) {
    const field = part("field", [0.9, 0.55, 0.3], [0, 0.8, 0.6], "field");
    for (let i = 0; i < 5; i++) {
      const phi = (i / 5) * TAU;
      // On the inner leg the axial field points opposite to the outer leg.
      const loop = (t) => {
        const angle = t * TAU;
        const r = 0.3 + 0.2 * Math.cos(angle);
        return V(
          (pulsed ? 1.05 : 1.55) * Math.sin(angle),
          r * Math.cos(phi),
          r * Math.sin(phi),
        );
      };
      curve(field, loop, 0.016, M.field, 96);
      tracer(field, loop, 0.12, i / 5, M.field, 0.036);
      const outer = (t) => {
        const x = (t - 0.5) * length;
        const r = 0.74 + 0.15 * Math.exp((-x * x) / 3);
        return V(x, r * Math.cos(phi), r * Math.sin(phi));
      };
      curve(field, outer, 0.013, M.field, 96);
      tracer(field, outer, 0.1, i / 5, M.field, 0.032);
    }
  }
  function pinch() {
    const vessel = part("vessel", [0, -0.7, -0.7], [0, -0.7, -0.7]);
    axialVessel(vessel, 5.4, 1.05);
    const electrodes = part("electrodes", [-2, 0.55, 0], [-0.9, 0.3, 0]);
    for (const sign of [-1, 1]) {
      rod(electrodes, [sign * 2.15, 0, 0], [sign * 2.5, 0, 0], 0.64, M.copper);
      ring(electrodes, [sign * 2.12, 0, 0], 0.66, 0.09, M.silver, "x");
      bolts(electrodes, [sign * 2.05, 0, 0], 0.52);
    }
    const plasma = part("plasma", [0, 0.15, 0], [0, 0.6, 0.7], "plasma");
    rod(plasma, [-2.08, 0, 0], [2.08, 0, 0], 0.13, M.plasma, 0.13, 24);
    rod(plasma, [-2.08, 0, 0], [2.08, 0, 0], 0.035, M.hot, 0.035, 12);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU,
        r = 0.055 + (i % 2) * 0.05;
      tracer(
        plasma,
        (t) => V((t - 0.5) * 4.15, Math.cos(a) * r, Math.sin(a) * r),
        i % 2 ? 0.18 : 0.3,
        i / 6,
        M.hot,
        0.024,
      );
    }
    const field = part("field", [1, 0.6, 0], [0, 0.8, 0], "field");
    for (let i = 0; i < 7; i++) {
      const x = -1.65 + i * 0.55;
      ring(field, [x, 0, 0], 0.56, 0.018, M.field, "x");
      tracer(
        field,
        (t) => V(x, Math.cos(t * TAU) * 0.56, Math.sin(t * TAU) * 0.56),
        0.16,
        i / 7,
        M.field,
        0.04,
      );
    }
    const capacitors = part("capacitors", [-0.5, -1.1, 1.8], [0, -0.1, 1.2]);
    banks(capacitors, 0, -1.15, 1.85, 6);
    for (const sign of [-1, 1])
      curve(
        capacitors,
        (t) => V(sign * (1.1 + 1.1 * t), -1.1 + 1.1 * t, 1.85 * (1 - t)),
        0.05,
        M.copper,
        32,
      );
    const exhaust = part("exhaust", [3.2, 0.1, 0], [1, 0.1, 0], "flow");
    ring(exhaust, [3, 0, 0], 0.78, 0.1, M.steel, "x");
    for (const y of [-0.18, 0, 0.18])
      flow(exhaust, [2.15, y, 0], [3.7, y * 2.4, 0], M.energy, 2);
  }
  function magnetizedTarget() {
    const lm26 = options.entityId === "general_fusion";
    const vessel = part("vessel", [-2, 0.2, -1.2], [-0.7, -0.5, -0.6]);
    chamber(vessel, 2.4);
    const liner = part("liner", [0.8, 0.5, 0.5], [0.6, 0.6, 0.5]);
    mesh(
      liner,
      lm26
        ? new THREE.CylinderGeometry(
            1.34,
            1.34,
            1.8,
            40,
            1,
            true,
            1.65,
            TAU - 1.8,
          )
        : new THREE.SphereGeometry(1.34, 36, 24, 3, TAU - 1.8),
      M.copper,
    );
    const plasma = part("plasma", [0, 0.2, 0.2], [0, 0.6, 0.8], "plasma");
    if (lm26) {
      rod(vessel, [0, -0.95, 0], [0, 0.95, 0], 0.13, M.silver);
      for (const sign of [-1, 1])
        rod(
          vessel,
          [0, sign * 0.25, 0],
          [0, sign * 0.95, 0],
          0.14,
          M.steel,
          0.75,
          32,
        );
      const shape = (phi, theta) => {
        const r = 0.68 + 0.32 * Math.cos(theta);
        return V(r * Math.cos(phi), 0.55 * Math.sin(theta), r * Math.sin(phi));
      };
      tubeSurface(plasma, shape, M.plasma, 64, 28);
      for (let j = 0; j < 3; j++)
        curve(
          plasma,
          (t) => shape(t * TAU, t * TAU * 2 + (j * TAU) / 3),
          0.015,
          M.field,
          100,
        );
    } else {
      ball(plasma, 0, 0, 0, 0.57, M.plasma);
      for (let j = 0; j < 3; j++)
        curve(
          plasma,
          (t) => {
            const a = t * TAU,
              r = 0.4 + 0.1 * Math.cos(a * 2);
            return V(
              r * Math.cos(a),
              0.21 * Math.sin(a * 2 + j),
              r * Math.sin(a),
            );
          },
          0.02,
          M.field,
          60,
        );
    }
    const injector = part("injector", [0, 2.7, 0], [0, 1.2, 0], "flow");
    rod(injector, [0, 1.5, 0], [0, 3.25, 0], 0.34, M.dark);
    for (let i = 0; i < 7; i++)
      ring(injector, [0, 1.7 + i * 0.2, 0], 0.37, 0.065, M.magnet);
    if (lm26) {
      for (let j = 0; j < 4; j++) {
        const phi = (j * TAU) / 4;
        const path = new THREE.CatmullRomCurve3(
          [
            [0.2, 1.5],
            [0.86, 1],
            [0.78, 0.6],
            [0.68, 0.25],
          ].map(([r, y]) => V(r * Math.cos(phi), y, r * Math.sin(phi))),
        );
        const fn = (t) => path.getPoint(t);
        curve(injector, fn, 0.015, M.hot, 48);
        tracer(injector, fn, 0.12, j / 4, M.hot, 0.035);
      }
    } else flow(injector, [0, 1.5, 0], [0, 0.3, 0], M.hot);
    const drivers = part("drivers", [2.7, 0, 0.3], [1.1, 0.1, 0.2], "flow");
    if (lm26) {
      drivers.userData.driverType = "theta-pinch";
      for (const y of [-0.8, -0.4, 0, 0.4, 0.8])
        ring(drivers, [0, y, 0], 1.65, 0.095, M.magnet);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        flow(
          drivers,
          [1.58 * Math.cos(a), 0, 1.58 * Math.sin(a)],
          [1.36 * Math.cos(a), 0, 1.36 * Math.sin(a)],
          M.energy,
          1,
        );
      }
    } else {
      drivers.userData.driverType = "mechanical";
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU,
          c = Math.cos(a),
          s = Math.sin(a);
        rod(
          drivers,
          [c * 2.45, 0, s * 2.45],
          [c * 3.05, 0, s * 3.05],
          0.23,
          M.steel,
        );
        rod(
          drivers,
          [c * 1.4, 0, s * 1.4],
          [c * 2.45, 0, s * 2.45],
          0.09,
          M.silver,
        );
        flow(
          drivers,
          [c * 2.25, 0.25, s * 2.25],
          [c * 1.4, 0.25, s * 1.4],
          M.energy,
          1,
        );
      }
    }
    if (!options.experimental) {
      const blanket = part("blanket", [-1.3, -0.8, -1.2], [-0.4, -0.6, -0.3]);
      blanketTiles(blanket, 2.25);
    }
  }

  function laser(mode) {
    const indirect = mode !== "direct-laser",
      hybrid = mode === "hybrid-laser";
    const vessel = part("vessel", [-1.8, 0.2, -1.7], [-0.65, -0.5, -0.6]);
    chamber(vessel, 2.65);
    if (!options.experimental) {
      const blanket = part("blanket", [-1.3, -0.9, -1.3], [-0.55, -0.5, -0.2]);
      blanketTiles(blanket, 2.47);
    }
    const target = part("target", [0.3, 0.15, 0.3], [0.55, 0.35, 0.7]);
    capsule(target, 0.37);
    const plasma = part("plasma", [0, 0.05, 0.1], [0, 0.6, 0.85], "plasma");
    plasmaCore(plasma, 0.25);
    const drivers = part("drivers", [3, 1, 0], [1, 0.25, 0.35], "flow");
    if (indirect) {
      const hohlraum = part("hohlraum", [0.55, 0.2, -0.2], [0.75, 0.3, -0.3]);
      const shell = mesh(
        hohlraum,
        new THREE.CylinderGeometry(
          0.8,
          0.8,
          1.75,
          40,
          1,
          true,
          Math.PI / 2,
          Math.PI,
        ),
        M.blanket,
      );
      shell.rotation.z = Math.PI / 2;
      for (const x of [-0.875, 0.875])
        ring(hohlraum, [x, 0, 0], 0.8, 0.055, M.copper, "x");
      for (const sign of [-1, 1])
        for (let j = 0; j < 6; j++) {
          const a = (j / 6) * TAU;
          const from = [sign * 3.55, Math.cos(a) * 1.6, Math.sin(a) * 1.6];
          // Beam enters the nearer end opening and terminates at the opposing cavity wall.
          const impact = [
            -sign * 0.38,
            -Math.cos(a) * 0.75,
            -Math.sin(a) * 0.75,
          ];
          const start = V(...from),
            direction = V(...impact)
              .sub(start)
              .normalize();
          port(
            drivers,
            start.clone().addScaledVector(direction, -0.35).toArray(),
            start.toArray(),
            0.18,
            M.magnet,
          );
          flow(drivers, from, impact, M.laser, 2);
          ball(hohlraum, ...impact, 0.065, M.hot);
          // The next link is X-ray drive, visually distinct from the incident laser.
          flow(
            hohlraum,
            impact,
            V(...impact)
              .normalize()
              .multiplyScalar(0.38)
              .toArray(),
            M.xray,
            1,
          );
        }
      if (hybrid) {
        // Later direct drive is a separate path, offset to keep the sequence legible.
        for (const sign of [-1, 1]) {
          const from = [sign * 3.7, 0.25, 0.22];
          port(drivers, [sign * 4.1, 0.25, 0.22], from, 0.25, M.copper);
          flow(
            drivers,
            from,
            V(...from)
              .normalize()
              .multiplyScalar(0.38)
              .toArray(),
            M.laser,
            3,
          );
        }
      }
    } else {
      const directions = [
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0],
        [0, 0, 1],
        [0, 0, -1],
        [1, 0.8, 0.8],
        [-1, 0.8, -0.8],
        [1, -0.8, -0.8],
        [-1, -0.8, 0.8],
        [1, 0.8, -0.8],
        [-1, -0.8, -0.8],
      ];
      for (const values of directions) {
        const d = V(...values).normalize();
        port(
          drivers,
          d.clone().multiplyScalar(3.45).toArray(),
          d.clone().multiplyScalar(2.9).toArray(),
          0.22,
          M.magnet,
        );
        flow(
          drivers,
          d.clone().multiplyScalar(2.9).toArray(),
          d.clone().multiplyScalar(0.38).toArray(),
          M.laser,
          2,
        );
      }
      if (options.fastIgnition) {
        const ignition = part(
          "ignition",
          [2.5, 0.5, 1.6],
          [1, 0.4, 0.8],
          "flow",
        );
        const from = V(2.9, 0.55, 1.5),
          dir = from.clone().normalize();
        port(
          ignition,
          from.clone().addScaledVector(dir, 0.7).toArray(),
          from.toArray(),
          0.3,
          M.copper,
        );
        flow(ignition, from.toArray(), [0, 0, 0], M.hot, 4);
      }
    }
    if (!options.experimental) {
      const injector = part(
        "injector",
        [-0.7, 2.8, 0.6],
        [-0.3, 1.1, 0.4],
        "flow",
      );
      port(injector, [-0.45, 2.1, 0.38], [-0.65, 3.0, 0.55], 0.14, M.steel);
      for (let i = 0; i < 3; i++)
        ball(
          injector,
          (-0.3 * (i + 1)) / 3,
          0.55 + i * 0.45,
          0.27,
          0.045,
          M.copper,
        );
    }
  }
  function pulsedPower(flare = false) {
    const vessel = part("vessel", [-2, -0.2, -1.3], [-0.6, -0.6, -0.6]);
    chamber(vessel, 2.35);
    const capacitors = part("capacitors", [2.8, -0.7, 0.8], [0.7, -0.2, 0.9]);
    for (let j = 0; j < 10; j++) {
      const a = (j / 10) * TAU,
        x = Math.cos(a) * 3.2,
        z = Math.sin(a) * 3.2;
      const block = box(capacitors, x, -0.55, z, 0.6, 0.95, 0.72, M.dark);
      block.rotation.y = -a;
      const panel = box(capacitors, x, -0.03, z, 0.43, 0.08, 0.55, M.silver);
      panel.rotation.y = -a;
      for (const h of [-0.75, -0.5, -0.25]) {
        const seam = box(capacitors, x, h, z, 0.62, 0.025, 0.74, M.steel);
        seam.rotation.y = -a;
      }
    }
    const drivers = part("drivers", [1.9, 0, 1], [0.6, 0.5, 0.5], "flow");
    for (let j = 0; j < 10; j++) {
      const a = (j / 10) * TAU,
        c = Math.cos(a),
        s = Math.sin(a);
      if (flare) {
        rod(
          drivers,
          [c * 0.55, -0.15, s * 0.55],
          [c * 2.95, -0.15, s * 2.95],
          0.095,
          M.copper,
        );
        flow(
          drivers,
          [c * 2.95, 0, s * 2.95],
          [c * 0.5, 0, s * 0.5],
          M.energy,
          2,
        );
      } else {
        // Feed and return conductors meet the two ends of the cylindrical load.
        for (const sign of [-1, 1]) {
          const inner = [c * 0.4, sign * 0.69, s * 0.4];
          const outer = [c * 2.95, sign * 0.69, s * 2.95];
          rod(drivers, inner, outer, 0.045, M.copper);
          const start = sign > 0 ? outer : inner;
          const end = sign > 0 ? inner : outer;
          flow(
            drivers,
            start.map((v, i) => (i === 1 ? v + 0.06 : v)),
            end.map((v, i) => (i === 1 ? v + 0.06 : v)),
            M.energy,
            1,
          );
        }
      }
    }
    if (!flare) {
      for (let j = 0; j < 4; j++) {
        const a = (j / 4) * TAU;
        flow(
          drivers,
          [0.37 * Math.cos(a), 0.62, 0.37 * Math.sin(a)],
          [0.37 * Math.cos(a), -0.62, 0.37 * Math.sin(a)],
          M.energy,
          1,
        );
      }
      const field = part("field", [0.65, 0.35, 0.2], [0.6, 0.8, 0.1], "field");
      for (const y of [-0.4, 0, 0.4]) {
        const loop = (t) =>
          V(0.65 * Math.cos(t * TAU), y, 0.65 * Math.sin(t * TAU));
        curve(field, loop, 0.015, M.field, 64);
        tracer(field, loop, 0.13, y + 0.4, M.field, 0.032);
      }
    }
    const target = part("target", [0.35, 0.2, 0.3], [0.5, 0.4, 0.6]);
    if (flare) capsule(target, 0.45, true);
    else {
      rod(target, [0, -0.62, 0], [0, 0.62, 0], 0.16, M.plasma, 0.16, 20);
      for (const y of [-0.65, 0.65])
        rod(target, [0, y - 0.04, 0], [0, y + 0.04, 0], 0.43, M.silver);
    }
    const plasma = part("plasma", [0, 0.05, 0.1], [0, 0.8, 0.8], "plasma");
    if (flare) plasmaCore(plasma, 0.27);
    else ball(plasma, 0, 0, 0, 0.13, M.hot, [1, 4, 1]);
    if (flare) {
      const ignition = part("ignition", [0.25, 2.8, 0.2], [0, 1.4, 0], "flow");
      // A distinct interface denotes the proposed ignition subsystem; its driver technology is not asserted.
      box(ignition, 0, 2.65, 0, 0.65, 0.8, 0.65, M.copper);
      ring(ignition, [0, 2.17, 0], 0.33, 0.065, M.silver);
      flow(ignition, [0, 2.15, 0], [0, 0.23, 0], M.hot, 4);
    } else {
      const liner = part("liner", [0.35, 0.4, 0], [0.65, 0.3, -0.2]);
      mesh(
        liner,
        new THREE.CylinderGeometry(
          0.35,
          0.35,
          1.25,
          32,
          1,
          true,
          Math.PI / 2,
          Math.PI * 1.5,
        ),
        M.copper,
      );
      for (const y of [-0.62, 0.62])
        ring(
          liner,
          [0, y, 0],
          0.35,
          0.035,
          M.silver,
          "y",
          Math.PI * 1.5,
          Math.PI / 2,
        );
      if (["sandia_z", "fuse"].includes(options.entityId)) {
        const coils = part("coils", [1, 0.2, 0], [0.5, 0.7, -0.4]);
        for (const y of [-0.85, 0.85])
          ring(coils, [0, y, 0], 0.95, 0.09, M.magnet);
        const heating = part("heating", [0, 2.8, 0], [0, 1.2, 0], "flow");
        port(heating, [0, 2.3, 0], [0, 3.0, 0], 0.2, M.magnet);
        flow(heating, [0, 2.3, 0], [0, 0.3, 0], M.hot, 2);
      }
    }
  }
  function electrostatic() {
    const vessel = part("vessel", [-1.7, 0, -1.5], [-0.7, -0.5, -0.6]);
    chamber(vessel, 2.25);
    const electrodes = part("electrodes", [0, 1.05, 0], [0, 0.7, 0.35]);
    rod(electrodes, [0, -1.2, 0], [0, 1.2, 0], 0.16, M.copper);
    for (const y of [-1.4, 1.4]) {
      ring(electrodes, [0, y, 0], 1.22, 0.11, M.copper);
      for (let j = 0; j < 4; j++) {
        const a = (j * TAU) / 4;
        rod(
          electrodes,
          [Math.cos(a) * 1.25, y, Math.sin(a) * 1.25],
          [Math.cos(a) * 1.25, y * 0.75, Math.sin(a) * 1.25],
          0.055,
          M.silver,
        );
      }
    }
    const coils = part("coils", [1.5, 1.15, 0], [0.7, 0.6, -0.5]);
    for (const y of [-1.65, 1.65]) {
      ring(coils, [0, y, 0], 1.55, 0.13, M.magnet);
      ring(coils, [0, y + 0.18, 0], 1.55, 0.045, M.silver);
    }
    const plasma = part("plasma", [1, 0.2, 0.2], [0.25, 0.4, 0.8], "plasma");
    tubeSurface(
      plasma,
      (p, t) =>
        V(
          (0.85 + 0.28 * Math.cos(t)) * Math.cos(p),
          0.75 * Math.sin(t),
          (0.85 + 0.28 * Math.cos(t)) * Math.sin(p),
        ),
      M.plasma,
      64,
      20,
    );
    for (const height of [-0.25, 0.25]) {
      const orbit = (t) => {
        const angle = t * TAU * 5;
        const r = 0.82 / (1 + 0.22 * Math.cos(angle * 0.8));
        return V(r * Math.cos(angle), height, r * Math.sin(angle));
      };
      curve(plasma, orbit, 0.012, M.hot, 220);
      tracer(plasma, orbit, 0.035, height < 0 ? 0 : 0.5, M.hot, 0.04);
    }
    const field = part("field", [1.2, 0.6, 0.2], [0.2, 0.8, 0.6], "field");
    for (let i = 0; i < 8; i++) {
      const phi = (i * TAU) / 8;
      const magnetic = (t) => {
        const y = (t - 0.5) * 4;
        const r = 0.55 + 0.72 * Math.exp(-Math.pow(y / 1.4, 4));
        return V(r * Math.cos(phi), y, r * Math.sin(phi));
      };
      curve(field, magnetic, 0.015, M.field, 80);
      tracer(field, magnetic, 0.08, i / 8, M.field, 0.03);
      const from = V(Math.cos(phi) * 1.28, 0, Math.sin(phi) * 1.28);
      const to = V(Math.cos(phi) * 0.25, 0, Math.sin(phi) * 0.25);
      rod(field, from, to, 0.014, M.electric);
      const arrow = mesh(
        field,
        new THREE.ConeGeometry(0.055, 0.15, 8),
        M.electric,
        to,
      );
      arrow.quaternion.setFromUnitVectors(
        V(0, 1, 0),
        to.clone().sub(from).normalize(),
      );
    }
    const collector = part(
      "collector",
      [2.7, -0.45, 0.7],
      [1, -0.2, 0.4],
      "flow",
    );
    // A pair of coolant pipes connects the chamber to a heat exchanger.
    for (const y of [-0.65, -0.1]) {
      rod(collector, [1.85, y, 0.7], [2.95, y, 0.7], 0.075, M.copper);
      flow(
        collector,
        y > -0.4 ? [1.85, y, 0.8] : [2.95, y, 0.8],
        y > -0.4 ? [2.95, y, 0.8] : [1.85, y, 0.8],
        M.energy,
        1,
      );
    }
    box(collector, 3.05, -0.35, 0.7, 0.35, 1.1, 0.8, M.steel);
    for (let i = 0; i < 6; i++)
      box(collector, 3.25, -0.78 + i * 0.17, 0.7, 0.22, 0.045, 0.9, M.silver);
  }

  if (id === "tokamak") toroidal();
  else if (id === "spherical") toroidal(false, true);
  else if (id === "stellarator") toroidal(true);
  else if (id === "mirror") mirror();
  else if (id === "dipole") dipole();
  else if (id === "beam-frc") frc();
  else if (id === "pulsed-frc") frc(true);
  else if (id === "z-pinch") pinch();
  else if (id === "magnetized-target") magnetizedTarget();
  else if (["indirect-laser", "direct-laser", "hybrid-laser"].includes(id))
    laser(id);
  else if (id === "hybrid-ignition") pulsedPower(true);
  else if (id === "pulsed-power") pulsedPower();
  else if (id === "electrostatic") electrostatic();
  else throw new Error(`Unknown reactor approach: ${id}`);

  // Open nested shells decisively. Constrain relative displacement so no pair
  // of component centres moves closer as the assembly slider increases.
  root.updateMatrixWorld(true);
  const centers = parts.map((p) => {
    const bounds = new THREE.Box3();
    p.object.traverse((mesh) => {
      if (mesh.isMesh && !mesh.userData.tracer)
        bounds.union(new THREE.Box3().setFromObject(mesh));
    });
    return bounds.getCenter(V());
  });
  for (const p of parts)
    p.explode
      .multiplyScalar(3)
      .addScaledVector(p.anchor.clone().normalize(), 0.6);
  if (["tokamak", "spherical", "stellarator"].includes(id)) {
    // Spread toroidal shells across the wide inspection view; pulling every
    // component upwards crowds the model and forces excessive camera retreat.
    const offsets = {
      vessel: [-7, 0, -1],
      blanket: [-4, 0.4, -3],
      coils: [6, 0.3, -3],
      solenoid: [0, 2.4, 0],
      plasma: [0, 0, 0.8],
      field: [3, 0.3, 2],
      heating: [6, 0, 2],
      exhaust: [0, -2.6, 0.5],
    };
    for (const p of parts) if (offsets[p.id]) p.explode.set(...offsets[p.id]);
  }
  if (["indirect-laser", "direct-laser", "hybrid-laser"].includes(id)) {
    const offsets = {
      vessel: [-6, -0.5, 0],
      blanket: [-3, -0.5, -3],
      drivers: [6, 0.5, -3],
      hohlraum: [2, 1, 1],
      target: [0, 0.7, 0.6],
      plasma: [0, -1, 2],
      injector: [-3, 0, -2],
    };
    for (const p of parts) if (offsets[p.id]) p.explode.set(...offsets[p.id]);
  }
  for (let pass = 0; pass < 512; pass++) {
    let corrected = false;
    for (let i = 0; i < parts.length; i++)
      for (let j = i + 1; j < parts.length; j++) {
        const offset = centers[j].clone().sub(centers[i]);
        const length = offset.lengthSq();
        if (length < 1e-12) continue;
        const inward = parts[j].explode
          .clone()
          .sub(parts[i].explode)
          .dot(offset);
        if (inward >= -1e-9) continue;
        offset.multiplyScalar(-inward / (2 * length));
        parts[j].explode.add(offset);
        parts[i].explode.sub(offset);
        corrected = true;
      }
    if (!corrected) break;
  }

  for (const p of parts) {
    const usedLayers = new Set();
    p.object.traverse((mesh) => {
      if (mesh.isMesh) usedLayers.add(mesh.userData.layer);
    });
    p.layers = [...usedLayers];
  }

  return {
    root,
    parts,
    update(timeSeconds) {
      for (const item of tracers) {
        const fraction =
          (((timeSeconds * item.speed + item.offset) % 1) + 1) % 1;
        item.object.position.copy(item.fn(fraction));
        item.object.material.opacity =
          item.opacity *
          (item.closed ? 1 : Math.min(1, fraction * 10, (1 - fraction) * 10));
      }
    },
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      root.clear();
      tracers.length = 0;
    },
  };
}

export function applyReactorLayers(model, layers, isolatedPart = null) {
  for (const p of model.parts) {
    let visible = false;
    p.object.traverse((mesh) => {
      if (!mesh.isMesh) return;
      mesh.visible = Boolean(layers[mesh.userData.layer]);
      visible ||= mesh.visible;
    });
    p.object.visible = visible && (!isolatedPart || p.id === isolatedPart);
  }
}
