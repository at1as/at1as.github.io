/**
 * Original, deliberately schematic cutaway models for the Fusion Atlas.
 * Dimensions, field-line pitch and target sizes are illustrative, not engineering CAD.
 * Each selectable component owns its meshes; the viewer controls transforms and layers.
 */
import * as THREE from './assets/vendor/three.module.min.js';

const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const PALETTE = {
  steel: 0x7895ad, dark: 0x233748, silver: 0xc4d2db, magnet: 0x4c86ac,
  copper: 0xc78a5d, plasma: 0xff9860, core: 0xffd9a0, field: 0x74bde4,
  energy: 0xa0e4cd, blanket: 0xbba374, wall: 0x354a5c,
};

export function buildReactor(id, options = {}) {
  const root = new THREE.Group();
  root.name = `Fusion concept: ${id}`;
  const parts = [], tracers = [], geometries = new Set(), materials = new Set();
  const mat = (key, settings = {}) => {
    const material = new THREE.MeshStandardMaterial({ color: PALETTE[key], metalness: .55, roughness: .38, ...settings });
    materials.add(material);
    return material;
  };
  const luminous = (key, opacity = 1) => {
    const material = new THREE.MeshBasicMaterial({ color: PALETTE[key], transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    materials.add(material);
    return material;
  };
  const M = {
    steel: mat('steel'), dark: mat('dark'), silver: mat('silver', { side: THREE.DoubleSide }), magnet: mat('magnet'),
    copper: mat('copper', { side: THREE.DoubleSide }), blanket: mat('blanket', { side: THREE.DoubleSide }), wall: mat('wall', { side: THREE.DoubleSide }),
    field: luminous('field', .63), energy: luminous('energy', .9),
    plasma: luminous('plasma', .38), hot: luminous('core', .8),
    laser: luminous('energy', .68), xray: luminous('core', .48),
    ghost: mat('steel', { transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide }),
  };
  function part(partId, anchor, explode, layer = 'structure') {
    const object = new THREE.Group();
    object.name = partId;
    object.userData.partId = partId;
    root.add(object);
    parts.push({ id: partId, object, anchor: V(...anchor), explode: V(...explode), layer });
    return object;
  }
  function mesh(group, geometry, material, pos = V()) {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, material);
    object.position.copy(pos);
    object.userData.partId = group.userData.partId;
    group.add(object);
    return object;
  }
  function box(group, x, y, z, w, h, d, material = M.steel) {
    return mesh(group, new THREE.BoxGeometry(w, h, d), material, V(x, y, z));
  }
  function ball(group, x, y, z, radius, material = M.plasma, scale = null) {
    const o = mesh(group, new THREE.SphereGeometry(radius, radius < .1 ? 8 : 28, radius < .1 ? 6 : 18), material, V(x, y, z));
    if (scale) o.scale.set(...scale);
    return o;
  }
  function rod(group, from, to, radius = .06, material = M.steel, endRadius = radius, segments = 12) {
    const a = Array.isArray(from) ? V(...from) : from;
    const b = Array.isArray(to) ? V(...to) : to;
    const axis = b.clone().sub(a);
    const object = mesh(group, new THREE.CylinderGeometry(endRadius, radius, axis.length(), segments), material, a.clone().add(b).multiplyScalar(.5));
    object.quaternion.setFromUnitVectors(V(0, 1, 0), axis.normalize());
    return object;
  }
  function curve(group, fn, radius = .025, material = M.field, samples = 96, closed = false) {
    const pts = Array.from({ length: samples + 1 }, (_, i) => fn(i / samples));
    const path = new THREE.CatmullRomCurve3(pts, closed, 'centripetal');
    return mesh(group, new THREE.TubeGeometry(path, samples, radius, 5, closed), material);
  }
  function ring(group, center, radius, tube = .09, material = M.steel, axis = 'y', arc = TAU, start = 0) {
    const c = Array.isArray(center) ? V(...center) : center;
    return curve(group, t => {
      const a = start + t * arc;
      return axis === 'x' ? V(c.x, c.y + radius * Math.cos(a), c.z + radius * Math.sin(a))
        : axis === 'z' ? V(c.x + radius * Math.cos(a), c.y + radius * Math.sin(a), c.z)
          : V(c.x + radius * Math.cos(a), c.y, c.z + radius * Math.sin(a));
    }, tube, material, Math.max(24, Math.ceil(48 * arc / TAU)), false);
  }
  function tracer(group, fn, speed = .12, offset = 0, material = M.energy, radius = .045) {
    const o = ball(group, 0, 0, 0, radius, material);
    tracers.push({ object: o, fn, speed, offset });
    o.position.copy(fn(offset));
  }
  function flow(group, a, b, material = M.energy, count = 3) {
    const av = V(...a), bv = V(...b), fn = t => av.clone().lerp(bv, t);
    rod(group, av, bv, .016, material, .016, 6);
    for (let i = 0; i < count; i++) tracer(group, fn, .16, i / count, material);
  }
  function bolts(group, center, radius, axis = 'x', count = 10) {
    for (let i = 0; i < count; i++) {
      const a = i / count * TAU, c = V(...center);
      if (axis === 'x') { c.y += Math.cos(a) * radius; c.z += Math.sin(a) * radius; }
      else if (axis === 'y') { c.x += Math.cos(a) * radius; c.z += Math.sin(a) * radius; }
      else { c.x += Math.cos(a) * radius; c.y += Math.sin(a) * radius; }
      ball(group, c.x, c.y, c.z, .045, M.silver);
    }
  }
  function port(group, a, b, radius = .23, material = M.steel) {
    const av = V(...a), bv = V(...b), axis = bv.clone().sub(av).normalize();
    rod(group, av, bv, radius, material);
    rod(group, bv.clone().addScaledVector(axis, -.07), bv.clone().addScaledVector(axis, .05), radius * 1.34, M.silver);
    rod(group, bv.clone().addScaledVector(axis, .05), bv.clone().addScaledVector(axis, .075), radius * .78, M.dark);
    const u = Math.abs(axis.y) < .9 ? V(0, 1, 0).cross(axis).normalize() : V(1, 0, 0).cross(axis).normalize();
    const v = axis.clone().cross(u);
    for (let i = 0; i < 8; i++) {
      const q = bv.clone().addScaledVector(axis, .08).addScaledVector(u, Math.cos(i * TAU / 8) * radius * 1.1).addScaledVector(v, Math.sin(i * TAU / 8) * radius * 1.1);
      ball(group, q.x, q.y, q.z, .025, M.dark);
    }
  }
  function feet(group, span = 2.4, floor = -2.1, depth = 1.5) {
    for (const x of [-span, span]) for (const z of [-depth, depth]) {
      box(group, x, floor + .45, z, .19, .9, .19, M.steel);
      box(group, x, floor, z, .65, .13, .5, M.dark);
    }
    box(group, 0, floor + .12, 0, span * 2 + .4, .12, depth * 2 + .4, M.dark);
  }
  function axialVessel(group, length = 6, radius = 1.25) {
    const shell = mesh(group, new THREE.CylinderGeometry(radius, radius, length, 56, 1, true, Math.PI / 2, Math.PI), M.wall);
    shell.rotation.z = Math.PI / 2;
    for (const x of [-length / 2, length / 2]) {
      ring(group, [x, 0, 0], radius, .12, M.silver, 'x');
      bolts(group, [x, 0, 0], radius, 'x', 12);
    }
    for (const a of [0, Math.PI]) {
      rod(group, [-length / 2, Math.cos(a) * radius, Math.sin(a) * radius], [length / 2, Math.cos(a) * radius, Math.sin(a) * radius], .055, M.silver);
    }
    feet(group, length * .32, -1.9, .85);
    port(group, [0, -.6, -radius + .1], [0, -.6, -radius - .6], .22);
  }
  function chamber(group, radius = 2.6) {
    // The rear spherical sector leaves the target and diagnostic paths exposed.
    mesh(group, new THREE.SphereGeometry(radius, 32, 20, Math.PI + .14, Math.PI - .28, .2, Math.PI - .4), M.wall);
    ring(group, [0, 0, 0], radius, .09, M.silver, 'y');
    ring(group, [0, 0, 0], radius, .065, M.steel, 'z', Math.PI, Math.PI);
    feet(group, 1.6, -2.85, 1.25);
    port(group, [-1.6, .4, -1.9], [-2.2, .4, -2.55], .24);
    port(group, [1.5, -.5, -1.85], [2.15, -.5, -2.5], .24);
  }
  function capsule(group, radius = .43, multishell = false) {
    // Open sectors expose nested shells; they are enlarged relative to the machine.
    mesh(group, new THREE.SphereGeometry(radius, 32, 20, 3, TAU - 1.8), M.copper);
    mesh(group, new THREE.SphereGeometry(radius * .79, 28, 18, 2.8, TAU - 2), M.silver);
    if (multishell) mesh(group, new THREE.SphereGeometry(radius * 1.3, 32, 18, 3.2, TAU - 2.2), M.blanket);
  }
  function plasmaCore(group, radius = .25) {
    ball(group, 0, 0, 0, radius, M.plasma);
    ball(group, 0, 0, 0, radius * .48, M.hot);
  }
  function blanketTiles(group, radius = 2.45) {
    for (let row = 0; row < 3; row++) for (let j = 0; j < 8; j++) {
      const a = Math.PI * .95 + j * Math.PI * .14;
      const y = (row - 1) * .78, r = Math.sqrt(radius * radius - y * y);
      const tile = box(group, Math.cos(a) * r, y, Math.sin(a) * r, .6, .7, .16, M.blanket);
      tile.rotation.y = -a + Math.PI / 2;
    }
  }
  function banks(group, x = 0, y = -1.45, z = 2.1, count = 5) {
    for (let i = 0; i < count; i++) {
      const q = x + (i - (count - 1) / 2) * .48;
      box(group, q, y, z, .37, .64, .5, M.dark);
      box(group, q, y, z + .255, .28, .48, .025, M.silver);
      box(group, q, y + .18, z + .28, .2, .035, .02, M.energy);
      for (const dx of [-.11, .11]) rod(group, [q + dx, y + .34, z], [q + dx, y + .47, z], .035, M.copper);
    }
  }
  function tubeSurface(group, fn, material, longitudinal = 96, cross = 24, start = 0, end = TAU) {
    const positions = [], indices = [];
    for (let i = 0; i <= longitudinal; i++) for (let j = 0; j <= cross; j++) {
      const p = fn(start + i / longitudinal * (end - start), j / cross * TAU);
      positions.push(p.x, p.y, p.z);
    }
    for (let i = 0; i < longitudinal; i++) for (let j = 0; j < cross; j++) {
      const n = i * (cross + 1) + j;
      indices.push(n, n + 1, n + cross + 1, n + 1, n + cross + 2, n + cross + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    return mesh(group, geometry, material);
  }

  function toroidal(stellarator = false, spherical = false) {
    const highField = options.variant === 'high_field_tokamak';
    const R = spherical ? 1.45 : 2.05, a = spherical ? .95 : .66, elongation = spherical ? 1.65 : 1.35;
    const shape = (phi, theta, scale = 1) => {
      let rr, yy;
      if (stellarator) {
        const twist = phi * (options.variant === 'quasi_isodynamic_stellarator' ? 2 : 1.5);
        rr = R + .16 * Math.cos(phi * 3) + scale * (a * Math.cos(theta) * Math.cos(twist) - .88 * Math.sin(theta) * Math.sin(twist));
        yy = .17 * Math.sin(phi * 3) + scale * (a * Math.cos(theta) * Math.sin(twist) + .88 * Math.sin(theta) * Math.cos(twist));
      } else {
        rr = R + scale * a * Math.cos(theta + .25 * Math.sin(theta));
        if (spherical) rr = Math.max(.34, rr);
        yy = scale * a * elongation * Math.sin(theta);
      }
      return V(rr * Math.cos(phi), yy, rr * Math.sin(phi));
    };
    const vessel = part('vessel', [-2.2, 0, -1], [-.5, -.1, -.6]);
    tubeSurface(vessel, (p, t) => shape(p, t, 1.55), M.wall, 64, 24, Math.PI * .93, Math.PI * 2.02);
    for (const phi of [Math.PI * .93, Math.PI * 2.02]) {
      curve(vessel, t => shape(phi, t * TAU, 1.55), .065, M.silver, 48);
      for (let j = 0; j < 12; j++) { const q = shape(phi, j * TAU / 12, 1.59); ball(vessel, q.x, q.y, q.z, .04, M.silver); }
    }
    feet(vessel, 1.9, spherical ? -3.4 : -2.25, 1.6);
    for (const phi of [Math.PI * 1.1, Math.PI * 1.5, Math.PI * 1.87]) {
      const rr = R + a * 1.5;
      port(vessel, [rr * Math.cos(phi), .05, rr * Math.sin(phi)], [(rr + .7) * Math.cos(phi), .05, (rr + .7) * Math.sin(phi)], .24);
    }
    if (!options.experimental) {
      const blanket = part('blanket', [-1.6, .35, -1.5], [-.6, .25, -.2]);
      tubeSurface(blanket, (p, t) => shape(p, t, 1.34), M.blanket, 52, 20, Math.PI * 1.08, Math.PI * 1.94);
      for (let i = 0; i < 9; i++) curve(blanket, t => shape(Math.PI * (1.08 + i * .1075), t * TAU, 1.355), .018, M.dark, 36);
    }
    const coils = part('coils', [2.2, 1.3, -.1], [.7, .6, -.1]);
    if (stellarator && options.variant === 'helical_stellarator') {
      for (let k = 0; k < 2; k++) {
        curve(coils, t => shape(t * TAU, t * TAU * 2 + k * Math.PI, 1.94), .13, M.magnet, 190);
        curve(coils, t => shape(t * TAU, t * TAU * 2 + k * Math.PI + .13, 1.98), .035, M.silver, 190);
      }
      for (const y of [-1.45, 1.45]) ring(coils, [0, y, 0], R + .1, .12, M.magnet);
    } else if (stellarator && options.variant === 'patterned_hts_stellarator') {
      // Patterned current paths on a simple supporting surface. These schematic
      // contours distinguish the idea from individually sculpted modular coils.
      const substrate = mesh(coils, new THREE.CylinderGeometry(3.17, 3.17, 2.7, 64, 1, true, Math.PI * .53, Math.PI), M.ghost);
      substrate.rotation.y = -.35;
      for (let j = 0; j < 12; j++) {
        const level = (j - 5.5) * .165;
        const fn = t => { const p = t * TAU; return V(3.2 * Math.cos(p), level + .24 * Math.sin(p * 3 + j * .12), 3.2 * Math.sin(p)); };
        curve(coils, fn, .04, M.magnet, 128);
        curve(coils, t => fn(t).add(V(0, .022, 0)), .012, M.silver, 128);
      }
      for (const y of [-1.3, 1.3]) ring(coils, [0, y, 0], 3.2, .065, M.steel);
    } else if (stellarator && options.variant === 'planar_coil_stellarator') {
      // Small, individually planar coils tile a surrounding winding surface.
      // Counts and current patterns are illustrative, not a Thea device layout.
      for (let i = 0; i < 24; i++) for (let j = 0; j < 6; j++) {
        const phi = i / 24 * TAU, theta = j / 6 * TAU;
        const center = shape(phi, theta, 1.92);
        const u = shape(phi + .001, theta, 1.92).sub(center).normalize();
        const v = shape(phi, theta + .001, 1.92).sub(center).normalize();
        v.addScaledVector(u, -v.dot(u)).normalize();
        curve(coils, t => center.clone().addScaledVector(u, .22 * Math.cos(t * TAU)).addScaledVector(v, .22 * Math.sin(t * TAU)), .045, M.magnet, 20);
        const bolt = center.clone().addScaledVector(u, .28);
        ball(coils, bolt.x, bolt.y, bolt.z, .038, M.silver);
      }
    } else {
      const planar = stellarator && options.variant === 'planar_coil_stellarator';
      const patterned = stellarator && options.variant === 'patterned_hts_stellarator';
      const count = planar ? 16 : patterned ? 18 : highField ? 16 : 12;
      for (let i = 0; i < count; i++) {
        const phi = i / count * TAU;
        const planeTilt = planar ? .32 * Math.sin(phi * 3) : 0;
        const coilPath = t => {
          const theta = t * TAU;
          if (!stellarator) return shape(phi, theta, 1.98);
          if (planar) {
            const rr = R + .98 * Math.cos(theta), yy = 1.35 * Math.sin(theta), sideways = yy * Math.sin(planeTilt);
            return V(rr * Math.cos(phi) - sideways * Math.sin(phi), yy * Math.cos(planeTilt), rr * Math.sin(phi) + sideways * Math.cos(phi));
          }
          const p = shape(phi, theta, 1.9), warp = .28 * Math.sin(theta * 2 + phi * 3);
          return p.add(V(-Math.sin(phi) * warp, 0, Math.cos(phi) * warp));
        };
        curve(coils, coilPath, highField ? .145 : patterned ? .09 : .115, M.magnet, 48);
        for (const t of [.22, .72]) {
          const q = coilPath(t), b = box(coils, q.x, q.y, q.z, .28, .16, .25, M.silver); b.rotation.y = -phi;
        }
        // Visible winding seam gives each magnet a manufactured cross-section.
        curve(coils, t => coilPath(t).add(V(Math.cos(phi) * .025, .025, Math.sin(phi) * .025)), .018, M.silver, 40);
      }
    }
    if (!stellarator) {
      const solenoid = part('solenoid', [0, 1.25, 0], [0, 1.5, 0]);
      const radius = spherical ? .22 : .48;
      rod(solenoid, [0, -1.5, 0], [0, 1.6, 0], radius, M.dark);
      for (let i = 0; i < 20; i++) ring(solenoid, [0, -1.45 + i * .152, 0], radius + .02, .045, M.copper);
      for (const y of [-1.6, 1.7]) rod(solenoid, [0, y - .08, 0], [0, y + .08, 0], radius * 1.25, M.silver);
      for (const y of [-1.55, 1.55]) ring(coils, [0, y, 0], R + .25, .075, M.copper);
    }
    const plasma = part('plasma', [R, .1, .7], [0, .7, .6], 'plasma');
    tubeSurface(plasma, (p, t) => shape(p, t), M.plasma, 112, 28);
    curve(plasma, t => shape(t * TAU, 0, .1), .065, M.hot, 140);
    const field = part('field', [1.5, .6, 1.6], [.35, .55, .7], 'field');
    for (let j = 0; j < 5; j++) {
      const fn = t => shape(t * TAU * 2, t * TAU * (stellarator ? 3 : 3.4) + j * TAU / 5, 1.06);
      curve(field, fn, .016, M.field, 170);
      tracer(field, fn, .055, j / 5, M.hot, .034);
    }
    const heating = part('heating', [2.8, .2, 1.7], [.9, .3, .9], 'flow');
    const point = V(R * .8, .15, R * .6), end = V(3.35, .65, 2.25);
    port(heating, point.clone().lerp(end, .6).toArray(), end.toArray(), .25, M.magnet);
    flow(heating, end.toArray(), point.toArray(), M.energy);
    box(heating, 3.32, .65, 2.25, .48, .62, .64, M.dark);
    const exhaust = part('exhaust', [1.3, -1.4, 1], [0, -1.1, .5], 'flow');
    for (const r of [R - .3, R + .35]) ring(exhaust, [0, -1.35, 0], r, .095, M.copper, 'y', Math.PI * 1.28, -.15);
    for (let i = 0; i < 9; i++) {
      const phi = i / 9 * Math.PI * 1.2;
      flow(exhaust, [R * Math.cos(phi), -.7, R * Math.sin(phi)], [(R + .1) * Math.cos(phi), -1.35, (R + .1) * Math.sin(phi)], M.energy, 1);
    }
  }

  function mirror() {
    const vessel = part('vessel', [0, -.9, -.7], [0, -.65, -.55]); axialVessel(vessel, 6.1, 1.23);
    const coils = part('coils', [2.7, .95, 0], [0, .8, -.35]);
    for (const x of [-2.75, -2.5, -2.25, 2.25, 2.5, 2.75]) ring(coils, [x, 0, 0], .94, .16, M.magnet, 'x');
    for (const x of [-1.6, -.8, 0, .8, 1.6]) ring(coils, [x, 0, 0], 1.34, .065, M.magnet, 'x');
    const plasma = part('plasma', [0, .5, .1], [0, .6, .7], 'plasma'); ball(plasma, 0, 0, 0, .65, M.plasma, [3.3, 1, 1]);
    const field = part('field', [1.6, .7, .4], [0, .6, .7], 'field');
    for (let i = 0; i < 10; i++) {
      const a = i * TAU / 10;
      const fn = t => { const x = (t - .5) * 7.5, r = .29 + .68 * Math.exp(-Math.pow(x / 1.8, 4)) + .42 * Math.max(0, Math.abs(x) - 2.7); return V(x, Math.cos(a) * r, Math.sin(a) * r); };
      curve(field, fn, .017, M.field, 100); tracer(field, fn, .15, i / 10, M.hot, .04);
    }
    const heating = part('heating', [.3, 1.7, 1.4], [0, 1, 1], 'flow');
    for (const x of [-.7, .7]) { port(heating, [x, .9, .9], [x + .4, 1.55, 1.75], .22, M.magnet); flow(heating, [x + .4, 1.55, 1.75], [x, 0, 0]); }
    const collector = part('collector', [3.9, .6, 0], [1, 0, 0], 'flow');
    for (const sign of [-1, 1]) for (let i = 0; i < 4; i++) ring(collector, [sign * (3.18 + .23 * i), 0, 0], .52 + .12 * i, .055, i % 2 ? M.copper : M.energy, 'x');
  }
  function dipole() {
    const vessel = part('vessel', [-1.8, 0, -1.4], [-.7, -.5, -.6]); chamber(vessel, 2.65);
    const ringPart = part('ring', [1.05, 0, 0], [0, .15, 1.1]);
    ring(ringPart, [0, 0, 0], 1.05, .24, M.magnet);
    for (const y of [-.17, .17]) ring(ringPart, [0, y, 0], 1.05, .06, M.silver);
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * TAU;
      curve(ringPart, t => { const b = t * TAU; return V((1.05 + .245 * Math.cos(b)) * Math.cos(a), .245 * Math.sin(b), (1.05 + .245 * Math.cos(b)) * Math.sin(a)); }, .018, M.copper, 16);
    }
    const levitation = part('levitation', [0, 2.7, 0], [0, 1.25, 0]);
    ring(levitation, [0, 2.7, 0], .96, .18, M.magnet);
    ring(levitation, [0, 2.93, 0], .96, .04, M.silver);
    rod(levitation, [-1.6, 2.7, 0], [1.6, 2.7, 0], .075, M.steel);
    for (const x of [-1.6, 1.6]) rod(levitation, [x, 2.7, 0], [x, 1.75, -1.6], .075, M.steel);
    const field = part('field', [.8, 1.1, .7], [.2, .6, .7], 'field');
    for (let az = 0; az < 7; az++) for (const size of [1.55, 2.2]) {
      const phi = az * TAU / 7;
      // Ideal dipole meridional line r = L sin²(theta), outside a finite protected ring.
      const fn = t => { const th = .3 + t * (Math.PI - .6), r = size * Math.pow(Math.sin(th), 2); return V(r * Math.sin(th) * Math.cos(phi), r * Math.cos(th), r * Math.sin(th) * Math.sin(phi)); };
      curve(field, fn, .016, M.field, 60); tracer(field, fn, .08, az / 7, M.hot, .035);
    }
    const plasma = part('plasma', [1.7, .3, .2], [.3, 0, .8], 'plasma');
    tubeSurface(plasma, (p, t) => { const r = 1.5 + .43 * Math.cos(t); return V(r * Math.cos(p), .7 * Math.sin(t), r * Math.sin(p)); }, M.plasma, 72, 24);
    const heating = part('heating', [2.6, .6, 1.4], [.8, .6, .7], 'flow');
    port(heating, [2, .25, .9], [2.9, .6, 1.7], .24, M.magnet); flow(heating, [2.9, .6, 1.7], [1.6, .2, .5]);
  }

  function frc(pulsed = false) {
    const length = pulsed ? 8 : 6.8;
    const vessel = part('vessel', [0, -.9, -.6], [0, -.6, -.55]); axialVessel(vessel, length, 1.04);
    const coils = part('coils', [1.2, 1, 0], [0, 1, -.3]);
    for (let i = 0; i < (pulsed ? 15 : 11); i++) {
      const x = -length * .45 + i / (pulsed ? 14 : 10) * length * .9;
      ring(coils, [x, 0, 0], Math.abs(x) < 1.3 && pulsed ? 1.24 : 1.13, Math.abs(x) < 1.3 ? .12 : .08, M.magnet, 'x');
    }
    const plasma = part('plasma', [0, .45, .25], [0, .4, .85], 'plasma');
    ball(plasma, 0, 0, 0, .52, M.plasma, [pulsed ? 2.5 : 3.8, 1, 1]);
    curve(plasma, t => V(Math.cos(t * TAU) * (pulsed ? 1.3 : 1.95), Math.sin(t * TAU) * .52, 0), .025, M.hot, 80);
    const injector = part('injector', pulsed ? [-3.1, .2, 0] : [-.5, 1.5, 1.4], pulsed ? [-.85, .5, 0] : [0, .8, 1], 'flow');
    if (pulsed) {
      for (const sign of [-1, 1]) {
        for (const dx of [-.3, 0, .3]) ring(injector, [sign * 3.15 + dx, 0, 0], .7, .065, M.copper, 'x');
        ball(injector, sign * 3.1, 0, 0, .3, M.plasma, [2, 1, 1]);
        flow(injector, [sign * 3, 0, 0], [sign * .7, 0, 0], M.hot, 3);
      }
      const capacitors = part('capacitors', [0, -1.4, 2], [0, -.2, 1.4]); banks(capacitors, 0, -1.3, 2, 7);
      const collector = part('collector', [1.9, -.6, 1.5], [.6, -.4, .75], 'flow');
      for (const sign of [-1, 1]) {
        const fn = t => V(sign * (1.1 + .9 * Math.sin(Math.PI * t)), -.15 - 1.15 * t, 1.1 + .9 * t);
        curve(collector, fn, .045, M.copper, 40); tracer(collector, fn, .16, sign < 0 ? .5 : 0, M.energy, .065);
      }
    } else {
      for (const [x, sign] of [[-1.3, 1], [1.3, -1], [0, 1]]) {
        const from = [x - sign * .6, 1.55, sign * 1.65], to = [x + sign * .6, .1, sign * .35];
        port(injector, V(...from).lerp(V(...to), .25).toArray(), from, .27, M.magnet);
        flow(injector, from, to, M.energy, 3);
      }
      const field = part('field', [1, .7, .3], [0, .8, .6], 'field');
      for (let i = 0; i < 6; i++) {
        const phi = i / 6 * TAU;
        const fn = t => { const a = t * TAU, r = .63 * Math.sin(a); return V(2.1 * Math.cos(a), r * Math.cos(phi), r * Math.sin(phi)); };
        curve(field, fn, .016, M.field, 80); tracer(field, fn, .1, i / 6, M.hot, .032);
      }
      const exhaust = part('exhaust', [3.7, 0, 0], [1.1, 0, 0], 'flow');
      for (const sign of [-1, 1]) { ring(exhaust, [sign * 3.7, 0, 0], .72, .095, M.copper, 'x'); flow(exhaust, [sign * 2.3, .1, 0], [sign * 4.1, .1, 0], M.energy, 2); }
    }
  }
  function pinch() {
    const vessel = part('vessel', [0, -.7, -.7], [0, -.7, -.7]); axialVessel(vessel, 5.4, 1.05);
    const electrodes = part('electrodes', [-2, .55, 0], [-.9, .3, 0]);
    for (const sign of [-1, 1]) {
      rod(electrodes, [sign * 2.15, 0, 0], [sign * 2.5, 0, 0], .64, M.copper);
      ring(electrodes, [sign * 2.12, 0, 0], .66, .09, M.silver, 'x');
      bolts(electrodes, [sign * 2.05, 0, 0], .52);
    }
    const plasma = part('plasma', [0, .15, 0], [0, .6, .7], 'plasma');
    rod(plasma, [-2.08, 0, 0], [2.08, 0, 0], .13, M.plasma, .13, 24);
    rod(plasma, [-2.08, 0, 0], [2.08, 0, 0], .035, M.hot, .035, 12);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU, r = .16 + (i % 2) * .07;
      tracer(plasma, t => V((t - .5) * 4.15, Math.cos(a) * r, Math.sin(a) * r), i % 2 ? .18 : .3, i / 6, M.hot, .035);
    }
    const field = part('field', [1, .6, 0], [0, .8, 0], 'field');
    for (let i = 0; i < 7; i++) {
      const x = -1.65 + i * .55;
      ring(field, [x, 0, 0], .56, .018, M.field, 'x');
      tracer(field, t => V(x, Math.cos(t * TAU) * .56, Math.sin(t * TAU) * .56), .16, i / 7, M.field, .04);
    }
    const capacitors = part('capacitors', [-.5, -1.1, 1.8], [0, -.1, 1.2]); banks(capacitors, 0, -1.15, 1.85, 6);
    for (const sign of [-1, 1]) curve(capacitors, t => V(sign * (1.1 + 1.1 * t), -1.1 + 1.1 * t, 1.85 * (1 - t)), .05, M.copper, 32);
    const exhaust = part('exhaust', [3.2, .1, 0], [1, .1, 0], 'flow');
    ring(exhaust, [3, 0, 0], .78, .1, M.steel, 'x');
    for (const y of [-.18, 0, .18]) flow(exhaust, [2.15, y, 0], [3.7, y * 2.4, 0], M.energy, 2);
  }
  function magnetizedTarget() {
    const vessel = part('vessel', [-2, .2, -1.2], [-.7, -.5, -.6]); chamber(vessel, 2.4);
    const liner = part('liner', [.8, .5, .5], [.6, .6, .5]);
    mesh(liner, new THREE.SphereGeometry(1.34, 36, 24, 3, TAU - 1.8), M.copper);
    const plasma = part('plasma', [0, .2, .2], [0, .6, .8], 'plasma');
    ball(plasma, 0, 0, 0, .57, M.plasma);
    for (let j = 0; j < 3; j++) curve(plasma, t => { const a = t * TAU, r = .4 + .1 * Math.cos(a * 2); return V(r * Math.cos(a), .21 * Math.sin(a * 2 + j), r * Math.sin(a)); }, .02, M.field, 60);
    const injector = part('injector', [0, 2.7, 0], [0, 1.2, 0], 'flow');
    rod(injector, [0, 1.5, 0], [0, 3.25, 0], .34, M.dark);
    for (let i = 0; i < 7; i++) ring(injector, [0, 1.7 + i * .2, 0], .37, .065, M.magnet);
    flow(injector, [0, 1.5, 0], [0, .3, 0], M.hot);
    const drivers = part('drivers', [2.7, 0, .3], [1.1, .1, .2], 'flow');
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU, c = Math.cos(a), s = Math.sin(a);
      rod(drivers, [c * 2.45, 0, s * 2.45], [c * 3.05, 0, s * 3.05], .23, M.steel);
      rod(drivers, [c * 1.4, 0, s * 1.4], [c * 2.45, 0, s * 2.45], .09, M.silver);
      flow(drivers, [c * 2.25, .25, s * 2.25], [c * 1.4, .25, s * 1.4], M.energy, 1);
    }
    if (!options.experimental) {
      const blanket = part('blanket', [-1.3, -.8, -1.2], [-.4, -.6, -.3]); blanketTiles(blanket, 2.25);
    }
  }

  function laser(mode) {
    const indirect = mode !== 'direct-laser', hybrid = mode === 'hybrid-laser';
    const vessel = part('vessel', [-1.8, .2, -1.7], [-.65, -.5, -.6]); chamber(vessel, 2.65);
    if (!options.experimental) {
      const blanket = part('blanket', [-1.3, -.9, -1.3], [-.55, -.5, -.2]); blanketTiles(blanket, 2.47);
    }
    const target = part('target', [.3, .15, .3], [.55, .35, .7]); capsule(target, .37);
    const plasma = part('plasma', [0, .05, .1], [0, .6, .85], 'plasma'); plasmaCore(plasma, .25);
    const drivers = part('drivers', [3, 1, 0], [1, .25, .35], 'flow');
    if (indirect) {
      const hohlraum = part('hohlraum', [.55, .2, -.2], [.75, .3, -.3]);
      const shell = mesh(hohlraum, new THREE.CylinderGeometry(.8, .8, 1.75, 40, 1, true, Math.PI / 2, Math.PI), M.blanket);
      shell.rotation.z = Math.PI / 2;
      for (const x of [-.875, .875]) ring(hohlraum, [x, 0, 0], .8, .055, M.copper, 'x');
      for (const sign of [-1, 1]) for (let j = 0; j < 6; j++) {
        const a = j / 6 * TAU;
        const from = [sign * 3.55, Math.cos(a) * 1.6, Math.sin(a) * 1.6];
        // Beam enters the nearer end opening and terminates at the opposing cavity wall.
        const impact = [-sign * .38, -Math.cos(a) * .75, -Math.sin(a) * .75];
        const start = V(...from), direction = V(...impact).sub(start).normalize();
        port(drivers, start.clone().addScaledVector(direction, -.35).toArray(), start.toArray(), .18, M.magnet);
        flow(drivers, from, impact, M.laser, 2);
        ball(hohlraum, ...impact, .065, M.hot);
        // The next link is X-ray drive, visually distinct from the incident laser.
        flow(hohlraum, impact, [impact[0] * .25, impact[1] * .3, impact[2] * .3], M.xray, 1);
      }
      if (hybrid) {
        // Later direct drive is a separate path, offset to keep the sequence legible.
        for (const sign of [-1, 1]) {
          const from = [sign * 3.7, .25, .22];
          port(drivers, [sign * 4.1, .25, .22], from, .25, M.copper);
          flow(drivers, from, [sign * .3, .1, .12], M.hot, 3);
        }
      }
    } else {
      const directions = [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
        [1, .8, .8], [-1, .8, -.8], [1, -.8, -.8], [-1, -.8, .8], [1, .8, -.8], [-1, -.8, -.8],
      ];
      for (const values of directions) {
        const d = V(...values).normalize();
        port(drivers, d.clone().multiplyScalar(3.45).toArray(), d.clone().multiplyScalar(2.9).toArray(), .22, M.magnet);
        flow(drivers, d.clone().multiplyScalar(2.9).toArray(), d.clone().multiplyScalar(.38).toArray(), M.laser, 2);
      }
      if (options.fastIgnition) {
        const ignition = part('ignition', [2.5, .5, 1.6], [1, .4, .8], 'flow');
        const from = V(2.9, .55, 1.5), dir = from.clone().normalize();
        port(ignition, from.clone().addScaledVector(dir, .7).toArray(), from.toArray(), .3, M.copper);
        flow(ignition, from.toArray(), [0, 0, 0], M.hot, 4);
      }
    }
    if (!options.experimental) {
      const injector = part('injector', [-.7, 2.8, .6], [-.3, 1.1, .4], 'flow');
      port(injector, [-.45, 2.1, .38], [-.65, 3.0, .55], .14, M.steel);
      for (let i = 0; i < 3; i++) ball(injector, -.3 * (i + 1) / 3, .55 + i * .45, .27, .045, M.copper);
    }
  }
  function pulsedPower(flare = false) {
    const vessel = part('vessel', [-2, -.2, -1.3], [-.6, -.6, -.6]); chamber(vessel, 2.35);
    const capacitors = part('capacitors', [2.8, -.7, .8], [.7, -.2, .9]);
    for (let j = 0; j < 10; j++) {
      const a = j / 10 * TAU, x = Math.cos(a) * 3.2, z = Math.sin(a) * 3.2;
      const block = box(capacitors, x, -.55, z, .6, .95, .72, M.dark); block.rotation.y = -a;
      const panel = box(capacitors, x, -.03, z, .43, .08, .55, M.silver); panel.rotation.y = -a;
      for (const h of [-.75, -.5, -.25]) { const seam = box(capacitors, x, h, z, .62, .025, .74, M.steel); seam.rotation.y = -a; }
    }
    const drivers = part('drivers', [1.9, 0, 1], [.6, .5, .5], 'flow');
    for (let j = 0; j < 10; j++) {
      const a = j / 10 * TAU, c = Math.cos(a), s = Math.sin(a);
      rod(drivers, [c * .55, -.15, s * .55], [c * 2.95, -.15, s * 2.95], .095, M.copper);
      flow(drivers, [c * 2.95, 0, s * 2.95], [c * .5, 0, s * .5], M.energy, 2);
    }
    const target = part('target', [.35, .2, .3], [.5, .4, .6]);
    if (flare) capsule(target, .45, true);
    else {
      rod(target, [0, -.62, 0], [0, .62, 0], .16, M.plasma, .16, 20);
      for (const y of [-.65, .65]) rod(target, [0, y - .04, 0], [0, y + .04, 0], .43, M.silver);
    }
    const plasma = part('plasma', [0, .05, .1], [0, .8, .8], 'plasma');
    if (flare) plasmaCore(plasma, .27);
    else ball(plasma, 0, 0, 0, .13, M.hot, [1, 4, 1]);
    if (flare) {
      const ignition = part('ignition', [.25, 2.8, .2], [0, 1.4, 0], 'flow');
      // A distinct interface denotes the proposed ignition subsystem; its driver technology is not asserted.
      box(ignition, 0, 2.65, 0, .65, .8, .65, M.copper);
      ring(ignition, [0, 2.17, 0], .33, .065, M.silver);
      flow(ignition, [0, 2.15, 0], [0, .23, 0], M.hot, 4);
    } else {
      const liner = part('liner', [.35, .4, 0], [.65, .3, -.2]);
      mesh(liner, new THREE.CylinderGeometry(.35, .35, 1.25, 32, 1, true, Math.PI / 2, Math.PI * 1.5), M.copper);
      for (const y of [-.62, .62]) ring(liner, [0, y, 0], .35, .035, M.silver, 'y', Math.PI * 1.5, Math.PI / 2);
      if (['sandia_z', 'fuse'].includes(options.entityId)) {
        const coils = part('coils', [1, .2, 0], [.5, .7, -.4]);
        for (const y of [-.85, .85]) ring(coils, [0, y, 0], .95, .09, M.magnet);
        const heating = part('heating', [0, 2.8, 0], [0, 1.2, 0], 'flow');
        port(heating, [0, 2.3, 0], [0, 3.0, 0], .2, M.magnet); flow(heating, [0, 2.3, 0], [0, .3, 0], M.hot, 2);
      }
    }
  }
  function electrostatic() {
    const vessel = part('vessel', [-1.7, 0, -1.5], [-.7, -.5, -.6]); chamber(vessel, 2.25);
    const electrodes = part('electrodes', [0, 1.05, 0], [0, .7, .35]);
    rod(electrodes, [0, -1.2, 0], [0, 1.2, 0], .16, M.copper);
    for (const y of [-1.4, 1.4]) {
      ring(electrodes, [0, y, 0], 1.22, .11, M.copper);
      for (let j = 0; j < 4; j++) { const a = j * TAU / 4; rod(electrodes, [Math.cos(a) * 1.25, y, Math.sin(a) * 1.25], [Math.cos(a) * 1.25, y * .75, Math.sin(a) * 1.25], .055, M.silver); }
    }
    const coils = part('coils', [1.5, 1.15, 0], [.7, .6, -.5]);
    for (const y of [-1.65, 1.65]) { ring(coils, [0, y, 0], 1.55, .13, M.magnet); ring(coils, [0, y + .18, 0], 1.55, .045, M.silver); }
    const plasma = part('plasma', [1, .2, .2], [.25, .4, .8], 'plasma');
    tubeSurface(plasma, (p, t) => V((.85 + .28 * Math.cos(t)) * Math.cos(p), .75 * Math.sin(t), (.85 + .28 * Math.cos(t)) * Math.sin(p)), M.plasma, 64, 20);
    const field = part('field', [1.2, .6, .2], [.2, .8, .6], 'field');
    for (let i = 0; i < 5; i++) {
      const y = (i - 2) * .34, r = .7 + Math.abs(y) * .35;
      const fn = t => V(r * Math.cos(t * TAU), y, r * Math.sin(t * TAU));
      curve(field, fn, .016, M.field, 64); tracer(field, fn, .12, i / 5, M.hot, .045);
    }
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      rod(field, [Math.cos(a) * .25, 0, Math.sin(a) * .25], [Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35], .012, M.energy);
    }
    const collector = part('collector', [2.7, -.45, .7], [1, -.2, .4], 'flow');
    port(collector, [1.85, -.35, .7], [2.9, -.35, .7], .29, M.steel);
    box(collector, 3.05, -.35, .7, .25, .95, .95, M.dark);
    for (const z of [.38, .7, 1.02]) box(collector, 3.2, -.35, z, .035, .7, .12, M.silver);
  }

  if (id === 'tokamak') toroidal();
  else if (id === 'spherical') toroidal(false, true);
  else if (id === 'stellarator') toroidal(true);
  else if (id === 'mirror') mirror();
  else if (id === 'dipole') dipole();
  else if (id === 'beam-frc') frc();
  else if (id === 'pulsed-frc') frc(true);
  else if (id === 'z-pinch') pinch();
  else if (id === 'magnetized-target') magnetizedTarget();
  else if (['indirect-laser', 'direct-laser', 'hybrid-laser'].includes(id)) laser(id);
  else if (id === 'hybrid-ignition') pulsedPower(true);
  else if (id === 'pulsed-power') pulsedPower();
  else if (id === 'electrostatic') electrostatic();
  else throw new Error(`Unknown reactor approach: ${id}`);

  return {
    root, parts,
    update(timeSeconds) {
      for (const item of tracers) {
        const fraction = ((timeSeconds * item.speed + item.offset) % 1 + 1) % 1;
        item.object.position.copy(item.fn(fraction));
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
