import * as THREE from "./assets/vendor/three.module.min.js";

// Direction of the vacuum field of a circular current loop, sampled by the
// Biot–Savart law in a meridional plane. The loop lies in y = 0.
// This supplies closed illustrative flux lines, not a plasma equilibrium.
export function loopFieldDirection(radius, height, loopRadius = 1.05) {
  let radial = 0,
    vertical = 0;
  for (let i = 0; i < 64; i++) {
    const angle = ((i + 0.5) * Math.PI * 2) / 64;
    const cosine = Math.cos(angle);
    const distanceSquared =
      radius * radius +
      loopRadius * loopRadius -
      2 * radius * loopRadius * cosine +
      height * height;
    const weight = distanceSquared ** -1.5;
    radial += loopRadius * cosine * height * weight;
    vertical +=
      (loopRadius * loopRadius - loopRadius * radius * cosine) * weight;
  }
  return new THREE.Vector2(radial, vertical).normalize();
}

export function dipoleLoop(outerRadius, loopRadius = 1.05) {
  const start = new THREE.Vector2(outerRadius, 0);
  let point = start.clone();
  const points = [new THREE.Vector3(point.x, point.y, 0)];
  const step = 0.018;
  const direction = (p) => loopFieldDirection(p.x, p.y, loopRadius);
  for (let i = 0; i < 2400; i++) {
    const previous = point.clone();
    const a = direction(point);
    const b = direction(point.clone().addScaledVector(a, step / 2));
    const c = direction(point.clone().addScaledVector(b, step / 2));
    const d = direction(point.clone().addScaledVector(c, step));
    point.addScaledVector(
      a.addScaledVector(b, 2).addScaledVector(c, 2).add(d),
      step / 6,
    );
    // One closed circuit returns through the outer equator, heading down.
    if (i > 50 && previous.y > 0 && point.y <= 0 && point.x > loopRadius) {
      return new THREE.CatmullRomCurve3(points, true, "centripetal");
    }
    points.push(new THREE.Vector3(point.x, point.y, 0));
  }
  throw new Error("Dipole flux line did not close");
}
