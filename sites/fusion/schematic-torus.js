// Orthographic torus used by the SVG cutaways. Y is vertical; Z is depth.
export function torusPoint(t, p, { R, r, h, stellarator }, scale = 1) {
  const bend = stellarator ? 17 * Math.cos(3 * t) : 0;
  const wave = stellarator ? 26 * Math.sin(3 * t) : 0;
  const radius = R + bend + r * scale * Math.cos(p);
  return [
    radius * Math.cos(t),
    h * scale * Math.sin(p) + wave,
    radius * Math.sin(t),
  ];
}

export function torusPointVisible(point, shape) {
  const { R, r, h, stellarator } = shape;
  const [x, y, z] = point;
  // Follow the sightline toward the viewer. A front-facing normal alone does
  // not catch the near half of the torus occluding its inner, far surface.
  for (let depth = 1; depth < 2 * (R + r + h); depth += 1) {
    const yy = y + 0.45 * depth;
    const zz = z + 0.88 * depth;
    const angle = Math.atan2(zz, x);
    const bend = stellarator ? 17 * Math.cos(3 * angle) : 0;
    const wave = stellarator ? 26 * Math.sin(3 * angle) : 0;
    const radial = (Math.hypot(x, zz) - R - bend) / r;
    if (radial * radial + ((yy - wave) / h) ** 2 < 1) return false;
  }
  return true;
}
