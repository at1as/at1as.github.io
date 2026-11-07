// A conceptual tokamak cutaway, not a reconstruction of a particular machine.
// Every component uses the same orthographic projection and depth ordering.
const colors = {
  background: "#101c29", field: "#69baff", plasma: "#ff925c",
  energy: "#9ee4cb", hardware: "#a8bac4", text: "#eee9df", muted: "#9caeb8",
};
const TAU = Math.PI * 2;
const round = (value) => Math.round(value * 100) / 100;
const project = ([x, y, z]) => [372 + x, 224 + z * 0.45 - y * 0.893];
const depth = ([, y, z]) => z * 0.893 + y * 0.45;
const d = (points) => points.map((p, i) => `${i ? "L" : "M"}${p.map(round).join(" ")}`).join(" ");
const ringPoint = (t, radius, height) => [radius * Math.cos(t), height, radius * Math.sin(t)];
const plasmaPoint = (t, p, scale = 1) => ringPoint(
  t, 146 + 43 * scale * Math.cos(p + 0.2 * Math.sin(p)), 60 * scale * Math.sin(p),
);
const text = (x, y, value, color = colors.text, extra = "") =>
  `<text x="${x}" y="${y}" fill="${color}" ${extra}>${value}</text>`;
const mutedColor = (hex, opacity) => {
  const channels = (color) => color.match(/[\da-f]{2}/gi).map((v) => parseInt(v, 16));
  return `rgb(${channels(hex).map((v, i) => Math.round(v * opacity + channels(colors.background)[i] * (1 - opacity))).join(",")})`;
};

export function renderTokamakOverview({ overviewLabels = true, overviewLegend = true } = {}) {
  const surfaces = [];
  const add = (points, svg, offset = 0) => surfaces.push({
    depth: points.reduce((sum, p) => sum + depth(p), 0) / points.length + offset,
    svg,
  });
  const face = (points, fill, opacity = 1) => add(points,
    `<path d="${d(points.map(project))}Z" fill="${fill}" opacity="${opacity}" ${opacity === 1 ? `stroke="${fill}" stroke-width=".3"` : ""}/>`);
  const segment = (a, b, color, width, opacity = 1, offset = 0) => add([a, b],
    `<path d="${d([a, b].map(project))}" fill="none" stroke="${mutedColor(color, opacity)}" stroke-width="${width}" stroke-linecap="round"/>`, offset);

  // Cylindrical central solenoid. Its horizontal windings share the torus's
  // viewing angle, and are occluded by the cylinder on the far side.
  for (let i = 0; i < 48; i++) {
    const t = i * TAU / 48, next = (i + 1) * TAU / 48;
    const shade = Math.round(49 + 22 * Math.cos(t - 0.7));
    for (let bottom = -104; bottom < 119; bottom += 6) {
      const top = Math.min(119, bottom + 6);
      face([ringPoint(t, 20, bottom), ringPoint(next, 20, bottom),
        ringPoint(next, 20, top), ringPoint(t, 20, top)], `rgb(${shade - 15},${shade + 12},${shade + 27})`);
    }
    face([[0, 119, 0], ringPoint(t, 20, 119), ringPoint(next, 20, 119)], "#638392");
    if (Math.sin((t + next) / 2) > 0)
      for (let height = -96; height < 116; height += 13)
        segment(ringPoint(t, 20.6, height), ringPoint(next, 20.6, height), "#91afbd", 2.2, 0.8, 3);
  }

  // Selected toroidal-field coils; foreground coils are omitted in this cutaway.
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.25) * TAU / 12;
    if (t > 0.3 && t < Math.PI - 0.3) continue;
    for (let j = 0; j < 120; j++) {
      const coilPoint = (p) => ringPoint(t,
        146 + 65 * Math.cos(p + 0.2 * Math.sin(p)), 88 * Math.sin(p));
      segment(coilPoint(j * TAU / 120), coilPoint((j + 1) * TAU / 120),
        colors.hardware, 2.4, 0.55);
    }
  }

  // The divertor is an annular component below the plasma, not a tray beneath
  // the central solenoid. The actual target plates and X-point are simplified.
  for (let i = 0; i < 120; i++) {
    const t = i * TAU / 120, next = (i + 1) * TAU / 120;
    const opacity = Math.sin(t) > 0 ? 0.9 : 0.35;
    face([ringPoint(t, 122, -81), ringPoint(next, 122, -81),
      ringPoint(next, 170, -81), ringPoint(t, 170, -81)], mutedColor("#3f625d", opacity));
    face([ringPoint(t, 170, -81), ringPoint(next, 170, -81),
      ringPoint(next, 170, -91), ringPoint(t, 170, -91)], mutedColor("#29433f", opacity));
    for (const radius of [122, 170])
      segment(ringPoint(t, radius, -81), ringPoint(next, radius, -81), colors.energy, 1, opacity * 0.75);
    if (i % 8 === 0)
      segment(ringPoint(t, 122, -80.8), ringPoint(t, 170, -80.8), "#89b6a6", 0.7, opacity * 0.6);
  }

  // A translucent plasma volume, with no wireframe grid masquerading as fields.
  for (let i = 0; i < 96; i++) {
    const t = i * TAU / 96, next = (i + 1) * TAU / 96;
    for (let j = 0; j < 24; j++) {
      const p = j * TAU / 24, q = (j + 1) * TAU / 24;
      face([plasmaPoint(t, p), plasmaPoint(next, p), plasmaPoint(next, q), plasmaPoint(t, q)],
        colors.plasma, 0.075 + 0.05 * Math.max(0, Math.sin(p)));
    }
    // The magnetic axis helps the eye read the complete plasma ring.
    segment(plasmaPoint(t, 0, 0), plasmaPoint(next, 0, 0), colors.plasma, 2.8,
      Math.sin(t) > 0 ? 0.9 : 0.5);
  }

  // Two illustrative field lines on one flux surface: q = 3/2 (three toroidal
  // turns per two poloidal turns). This is a topology diagram, not an equilibrium.
  for (const [j, phase] of [0.4, 0.4 + Math.PI / 3].entries()) {
    const fieldPoint = (t) => plasmaPoint(t, t * 2 / 3 + phase, 0.94);
    for (let i = 0; i < 720; i++) {
      const t = i * TAU * 3 / 720, next = (i + 1) * TAU * 3 / 720;
      const a = fieldPoint(t), b = fieldPoint(next);
      const front = (depth(a) + depth(b)) / 2 > 0;
      segment(a, b, colors.field, j === 0 ? 2 : 1.1,
        front ? (j === 0 ? 1 : 0.7) : (j === 0 ? 0.48 : 0.3));
    }
    if (j === 0) {
      for (const t of [0.6, 4.1, 7, 10.5]) {
        const point = fieldPoint(t), [x, y] = project(point);
        const [px, py] = project(fieldPoint(t - 0.015));
        const length = Math.hypot(x - px, y - py);
        const ux = (x - px) / length, uy = (y - py) / length;
        add([point], `<path d="${d([[x, y], [x - ux * 6 - uy * 2.6, y - uy * 6 + ux * 2.6],
          [x - ux * 6 + uy * 2.6, y - uy * 6 - ux * 2.6]])}Z" fill="${colors.field}" opacity="${depth(point) > 0 ? 1 : 0.48}"/>`);
      }
    }
  }

  let drawing = `<ellipse cx="372" cy="391" rx="213" ry="16" fill="#07131e"/>` +
    surfaces.sort((a, b) => a.depth - b.depth).map((s) => s.svg).join("");

  if (overviewLabels) {
    const leader = (point, elbow, end, label, labelY, color = colors.text, anchor = "start") =>
      `<path d="${d([project(point), elbow, end])}" fill="none" stroke="#8399a5" stroke-width=".9" opacity=".75"/>` +
      text(end[0], labelY, label, color, `text-anchor="${anchor}"`);
    drawing += leader(ringPoint(0, 0, 119), [372, 67], [270, 67], "Central solenoid", 57);
    drawing += leader(ringPoint(3.27, 194, 48), [130, 136], [56, 136], "Toroidal-field coils", 125);
    const fieldAnchor = plasmaPoint(0.4, 0.4 * 2 / 3 + 0.4, 0.94);
    drawing += leader(fieldAnchor, [589, 146], [712, 146], "Helical magnetic field", 135, colors.field, "end");
    const [fx, fy] = project(fieldAnchor);
    drawing += `<circle cx="${round(fx)}" cy="${round(fy)}" r="2.8" fill="${colors.field}"/>`;
    drawing += leader(plasmaPoint(0.72, 0, 0), [592, 286], [704, 286], "Plasma", 309, colors.plasma, "end");
    drawing += leader(ringPoint(0.98, 170, -81), [575, 376], [704, 376], "Divertor / exhaust", 399, colors.energy, "end");
    const [hx, hy] = project(plasmaPoint(2.8, 0, 0.7));
    drawing += `<path d="M90 279L${round(hx)} ${round(hy)}m-7-3 7 3-4 6" fill="none" stroke="${colors.energy}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    drawing += text(56, 306, "External heating", colors.energy);
    drawing += text(372, 426, "Cutaway · vessel and some coils omitted", colors.muted,
      'text-anchor="middle" font-size="10.5"');
  }
  if (overviewLegend) {
    drawing += '<path d="M28 441H732" stroke="#344b59" stroke-width="1"/>';
    for (const [x, color, label] of [[32, colors.field, "Magnetic field"], [216, colors.plasma, "Plasma"],
      [350, colors.energy, "Heating / exhaust"], [570, colors.hardware, "Magnets"]]) {
      drawing += `<path d="M${x} 457h20" stroke="${color}" stroke-width="2"/>` +
        text(x + 28, 461, label, colors.muted, 'font-size="12"');
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" class="tokamak-overview" viewBox="0 0 760 480" role="img" aria-label="Tokamak cutaway: helical magnetic fields confine the plasma, external systems heat it, and a divertor below the plasma handles exhaust."><title>Magnetic confinement in a tokamak</title><desc>Blue field lines wind around the orange plasma ring. Grey toroidal-field coils surround it, and the central solenoid passes through its central hole. Mint identifies external heating and the annular divertor below the plasma. The vacuum vessel and some coils are omitted to reveal the interior.</desc><g font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="500">${drawing}</g></svg>`;
}
