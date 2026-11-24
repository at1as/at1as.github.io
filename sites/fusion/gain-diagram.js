// Energy routes, not piping or a quantitative Sankey diagram. Each tab draws a
// dashed measurement boundary and dims hardware outside what that metric counts.
const views = [
  {
    kind: "laser", title: "Laser-fusion plant concept",
    boundaryLabel: "Fuel boundary",
    input: ["absorbed"], output: ["fusion"],
    inputLabel: "Energy absorbed by fuel", outputLabel: "Fusion energy released",
    formulaMode: "ratio", resultLabel: "Fuel gain",
    included: ["fuel"],
    note: "Fuel gain draws the box around the tiny fuel capsule alone. Laser electricity, target losses, conversion losses, and the rest of the plant sit outside.",
  },
  {
    kind: "laser", title: "Laser-fusion plant concept",
    boundaryLabel: "Target boundary",
    input: ["delivered"], output: ["fusion"],
    inputLabel: "Driver energy at target", outputLabel: "Fusion energy released",
    formulaMode: "ratio", resultLabel: "Target gain",
    included: ["reactor", "fuel", "coupling-loss"],
    note: "Target gain widens the box to include the whole target and its losses, while still leaving laser electricity, turbines, and cooling outside.",
  },
  {
    kind: "plasma", title: "Magnetic-fusion plant concept",
    boundaryLabel: "Plasma boundary",
    input: ["delivered"], output: ["fusion"],
    inputLabel: "External heating to plasma", outputLabel: "Fusion power released",
    formulaMode: "ratio", resultLabel: "Plasma Q",
    included: ["reactor"],
    note: "Plasma Q draws the box around the plasma. Electricity lost making that heat, turbine losses, and plant loads sit outside.",
  },
  {
    kind: "recovery", title: "Pulsed electrical-recovery concept",
    boundaryLabel: "Pulse and recovery boundary",
    input: ["electricity"], output: ["returned"],
    inputLabel: "Pulse electricity in", outputLabel: "Total electricity returned",
    formulaMode: "recovery", resultLabel: "Complete cycle",
    included: ["driver", "driver-loss", "delivered", "reactor", "recycled", "fusion-contribution", "recovery", "recovery-loss"],
    note: "Returned electricity mixes recycled pulse input with any fusion energy. Pumps, cooling, and fuel processing sit outside the pulse circuit and still must be subtracted.",
  },
  {
    kind: "plant", title: "Thermal fusion-plant concept",
    boundaryLabel: "Whole-plant boundary",
    input: ["electricity", "aux"], output: ["gross", "export"],
    inputLabel: "All plant electricity use", outputLabel: "Gross electricity generated",
    formulaMode: "plant", resultLabel: "Net to grid",
    included: ["driver", "driver-loss", "delivered", "reactor", "fusion", "heat-capture", "heat", "turbine", "waste-heat", "loads", "return", "grid"],
    note: "Whole-plant accounting wraps the entire facility. Subtract the driver and every auxiliary load from gross output—only a positive surplus crosses to the grid.",
  },
];

const place = (art, x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})">${art}</g>`;
const text = (x, y, lines, cls = "", anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${lines.split("|").map((line, i) => `<tspan x="${x}" dy="${i ? 18 : 0}">${line}</tspan>`).join("")}</text>`;

function driver(kind) {
  const symbol = kind === "recovery"
    ? '<path d="M-29-21v42m9-42v42m22-42v42m9-42v42M-40 0h11m9 0H2m9 0h29"/>'
    : kind === "laser"
      ? '<rect x="-36" y="-13" width="48" height="26" rx="4"/><path d="M12-9h20m-20 9h28M12 9h20m-55-27v-8m0 52v-8"/>'
      : '<path d="M-35 8q9-28 18 0t18 0 18 0 18 0M-35 20h70"/>';
  return `<rect x="-52" y="-37" width="104" height="74" rx="9" fill="#e1e9df" stroke="#73897a" stroke-width="2"/><g fill="none" stroke="#526f60" stroke-width="2.4">${symbol}</g><path d="M-37 37v12m74-12v12M-44 50h88" stroke="#73897a" stroke-width="2"/>`;
}
function reactorOuter(kind) {
  const laser = kind === "laser";
  return `<rect x="-91" y="-66" width="182" height="132" rx="${laser ? 25 : 56}" fill="#e8ece2" stroke="#8b9b8b" stroke-width="2"/>
    ${laser
      ? '<circle r="55" fill="#f1e8d8" stroke="#b6a58b" stroke-width="2"/>'
      : kind === "recovery"
        ? '<ellipse rx="60" ry="27" fill="#e6c2a0" stroke="#b57b55" stroke-width="2"/><ellipse rx="40" ry="12" fill="#dca77c"/><path d="M-70-37v74m16-74v74m108-74v74m16-74v74" fill="none" stroke="#809a96" stroke-width="6"/>'
        : '<ellipse rx="61" ry="39" fill="#e6c2a0" stroke="#b57b55" stroke-width="2"/><ellipse rx="34" ry="17" fill="#e8ece2" stroke="#b57b55" stroke-width="2"/><path d="M-70-37q-12 37 0 74m140-74q12 37 0 74" fill="none" stroke="#809a96" stroke-width="7"/>'}`;
}
function laserFuelCore() {
  return `<circle r="23" fill="#dcaa7d" stroke="#ad6a42" stroke-width="2"/>${text(0, 5, "Fuel", "energy-art-label")}`;
}
function heatCapture() {
  return '<rect x="-31" y="-43" width="62" height="86" rx="10" fill="#ede3d4" stroke="#a78d70" stroke-width="2"/><path d="M-17-29v43q0 18 12 18t12-18v-29q0-15 11-15" fill="none" stroke="#b67e54" stroke-width="4"/><path d="M-22 43v11m44-11v11" stroke="#a78d70" stroke-width="2"/>';
}
function turbineGenerator() {
  return '<path d="M-89-18-15-40V40L-89 18Z" fill="#e1e7dd" stroke="#698373" stroke-width="2"/><path d="M-75-20v40m17-45v50m17-55v60m17-65v70" stroke="#98ac9c" stroke-width="4"/><path d="M-88 0H32" stroke="#536f66" stroke-width="5"/><path d="M-71-12-62 12m8-30 9 36m8-43 9 50" stroke="#536f66" stroke-width="3" fill="none"/><rect x="22" y="-29" width="69" height="58" rx="10" fill="#e2eae4" stroke="#698373" stroke-width="2"/><path d="M32-20v40m48-40v40" stroke="#98ac9c" stroke-width="3"/><rect x="44" y="-12" width="22" height="24" rx="3" fill="#698373"/><path d="M-70 40v12m40-12v12M36 29v23m40-23v23M-80 53H84" fill="none" stroke="#698373" stroke-width="2"/>';
}
function recoveryCircuit() {
  return '<rect x="-61" y="-43" width="122" height="86" rx="10" fill="#e2eae4" stroke="#698373" stroke-width="2"/><path d="M-43 9h16l9-28 16 43L10-5h31" stroke="#527e69" stroke-width="3" fill="none"/><circle cx="-40" cy="-29" r="4" fill="#98ac9c"/><circle cx="-26" cy="-29" r="4" fill="#98ac9c"/><path d="M-43 43v12m86-12v12M-50 56H50" fill="none" stroke="#698373" stroke-width="2"/>';
}
function grid() {
  return '<g fill="none" stroke="#698373" stroke-width="2.4" stroke-linejoin="round"><path d="M0-62-10-40-24 45M0-62 10-40 24 45M-24 45h48M-10-40h20M-15-13h30M-20 15h40M-10-40l25 27-35 28 44 30M10-40-15-13 20 15-24 45"/><path d="M-35-37h70L10-49h-20ZM-43-9h86L15-21h-30Z"/><path d="M-35-37v11m70-11v11M-43-9V2m86-11V2" stroke-width="4"/></g>';
}
function loads(width = 164) {
  return `<rect x="${-width / 2}" y="-27" width="${width}" height="54" rx="7" fill="#edf0e8" stroke="#b0bcaf" stroke-width="1.5"/>${text(0, -4, "Cooling, pumps,|and fuel processing", "energy-small")}`;
}

function boundaryBox(index, mobile) {
  const boxes = mobile
    ? [
        { x: 78, y: 258, w: 64, h: 66, rx: 14, label: "FUEL ONLY", lx: 164, ly: 324 },
        { x: 18, y: 214, w: 184, h: 154, rx: 16, label: "TARGET BOUNDARY", lx: 110, ly: 206 },
        { x: 18, y: 214, w: 184, h: 154, rx: 16, label: "PLASMA BOUNDARY", lx: 110, ly: 206 },
        { x: 12, y: 18, w: 332, h: 540, rx: 16, label: "PULSE &amp; RECOVERY", lx: 256, ly: 18 },
        { x: 10, y: 14, w: 368, h: 822, rx: 16, label: "WHOLE PLANT", lx: 282, ly: 14 },
      ]
    : [
        { x: 386, y: 168, w: 58, h: 64, rx: 14, label: "FUEL ONLY", lx: 415, ly: 156 },
        { x: 290, y: 118, w: 222, h: 232, rx: 16, label: "TARGET BOUNDARY", lx: 401, ly: 118 },
        { x: 310, y: 118, w: 202, h: 184, rx: 16, label: "PLASMA BOUNDARY", lx: 411, ly: 118 },
        { x: 72, y: 54, w: 800, h: 243, rx: 16, label: "PULSE &amp; RECOVERY BOUNDARY", lx: 472, ly: 54 },
        { x: 24, y: 50, w: 966, h: 388, rx: 16, label: "WHOLE-PLANT BOUNDARY", lx: 507, ly: 50 },
      ];
  const b = boxes[index] || boxes[0];
  const plainLen = b.label.replace(/&amp;/g, "&").length;
  const pillW = plainLen * 7.2 + 22;
  return {
    frame: `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx}" class="energy-boundary-rect" data-boundary-box="${index}"/>`,
    badge: `<g class="energy-boundary-badge"><rect x="${b.lx - pillW / 2}" y="${b.ly - 11}" width="${pillW}" height="20" rx="10" class="energy-boundary-pill"/><text x="${b.lx}" y="${b.ly + 2.5}" text-anchor="middle" class="energy-boundary-label">${b.label}</text></g>`,
  };
}

function scene(view, index, mobile) {
  const prefix = `gain-${index}-${mobile ? "mobile" : "wide"}`;
  const recovery = view.kind === "recovery", laser = view.kind === "laser";
  const role = id => view.input.includes(id) ? "input" : view.output.includes(id) ? "output" : "context";
  const dim = id => (view.included.includes(id) ? "" : " energy-excluded");
  const flow = (id, d, loss = false) => {
    const r = role(id);
    const excluded = r === "context" && !view.included.includes(id) ? " energy-excluded" : "";
    return `<path data-energy-flow="${id}" data-count="${r}" d="${d}" class="energy-path gain-${r}${loss ? " energy-loss" : ""}${excluded}" marker-end="url(#${prefix}-${r})"/>`;
  };
  const label = (id, x, y, words, anchor = "middle") => {
    const r = role(id);
    const excluded = r === "context" && !view.included.includes(id) ? " energy-excluded" : "";
    return text(x, y, words, `energy-flow-label gain-${r}${excluded}`, anchor);
  };
  const defs = `<defs>${["input", "output", "context"].map(r => `<marker id="${prefix}-${r}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 7 4 1 7" fill="none" stroke="${r === "input" ? "#a45330" : r === "output" ? "#176344" : "#929896"}" stroke-width="1.5"/></marker>`).join("")}</defs>`;
  const box = boundaryBox(index, mobile);
  let art;
  if (!mobile) {
    art = `${box.frame}
      <g class="${dim("driver").trim()}">${place(driver(view.kind), 132, 200)}${text(132, 287, recovery ? "Pulse power" : laser ? "Laser driver" : "Heating systems", "energy-component")}</g>
      <g class="${dim("reactor").trim()}">${place(reactorOuter(view.kind), 415, 200)}${text(415, 287, laser ? "Target + fuel" : "Plasma", "energy-component")}</g>
      ${laser ? `<g class="${dim("fuel").trim()}">${place(laserFuelCore(), 415, 200)}</g>` : ""}
      <g class="${dim("grid").trim()}">${place(grid(), 1065, 200)}${text(1065, 287, "Grid", "energy-component")}${text(1065, 307, index === 4 ? "Net export" : "Surplus only", index === 4 ? "energy-flow-label gain-output" : "energy-small")}</g>
      ${flow("electricity", "M40 200H78")}
      ${flow("delivered", `M186 200H${laser ? 356 : 353}`)}
      ${laser ? flow("absorbed", "M359 200H389") : ""}
      ${label("delivered", index === 1 ? 236 : 250, index === 1 ? 156 : 166, recovery ? "Drive pulse" : index === 1 ? "Energy|at target" : laser ? "Energy at target" : "External heating")}
      ${label("electricity", index === 3 ? 34 : 81, 135, recovery ? "Pulse|electricity" : "Driver|electricity")}
      ${index === 0 ? `${label("absorbed", 362, 86, "Energy absorbed|by fuel")}<path d="M368 114V177" class="energy-callout gain-input"/><circle cx="368" cy="200" r="4" fill="#a45330"/>` : ""}
      <g class="${dim("driver-loss").trim()}">${flow("driver-loss", "M152 161V95", true)}${text(160, 77, "Driver losses", "energy-small")}</g>
      ${recovery ? `
        <g class="${dim("recovery").trim()}">${place(recoveryCircuit(), 797, 200)}${text(797, 287, "Recovery circuit", "energy-component")}</g>
        ${flow("recycled", "M508 182H731")}${label("recycled", 619, 159, "Returning pulse energy")}
        ${flow("fusion-contribution", "M460 224Q505 253 545 244L734 218", true)}${label("fusion-contribution", 618, 278, "Fusion energy, if converted")}
        ${flow("returned", "M862 200H958")}${label("returned", 914, 120, "Electricity|returned")}
        <g class="${dim("recovery-loss").trim()}">${flow("recovery-loss", "M797 155V96", true)}${text(797, 77, "Losses", "energy-small")}</g>
      ` : `
        <g class="${dim("heat-capture").trim()}">${place(heatCapture(), 642, 200)}${text(642, 287, "Capture heat", "energy-component")}</g>
        <g class="${dim("turbine").trim()}">${place(turbineGenerator(), 822, 200)}${text(822, 287, "Turbine + generator", "energy-component")}</g>
        ${flow("fusion", `M${laser ? 441 : 477} 200H606`)}${label("fusion", 566, 136, index === 2 ? "Fusion power|released" : "Fusion energy|released")}
        ${flow("heat", "M678 200H729")}${label("heat", 704, 177, "Heat")}
        ${flow("gross", "M916 200H968")}${label("gross", 944, 132, "Gross|electricity")}
        <g class="${dim("waste-heat").trim()}">${flow("waste-heat", "M822 158V96", true)}${text(822, 77, "Waste heat", "energy-small")}</g>
        ${laser ? `<g class="${dim("coupling-loss").trim()}">${flow("coupling-loss", "M331 248V314", true)}${text(335, 337, "Target losses", "energy-small")}</g>` : ""}
      `}
      ${flow("export", "M975 200H1017")}
      <circle cx="975" cy="200" r="4" fill="${index === 4 ? "#176344" : "#8a9891"}"/>
      ${flow("return", "M975 200V390H40V200")}
      <g class="${dim("return").trim()}">${text(344, 378, "Electricity reused inside the plant", "energy-small")}</g>
      <g class="${dim("loads").trim()}">${place(loads(), 680, 331)}</g>${flow("aux", "M680 390V363")}
      ${label("aux", 680, 419, "Other plant demand")}
      ${box.badge}`;
  } else {
    art = `${box.frame}
      <g class="${dim("driver").trim()}">${place(driver(view.kind), 110, 110, 0.75)}${text(220, 111, recovery ? "Pulse power" : laser ? "Laser driver" : "Heating|systems", "energy-component", "start")}</g>
      <g class="${dim("reactor").trim()}">${place(reactorOuter(view.kind), 110, 290, 0.9)}${text(220, 296, laser ? "Target + fuel" : "Plasma", "energy-component", "start")}</g>
      ${laser ? `<g class="${dim("fuel").trim()}">${place(laserFuelCore(), 110, 290, 0.9)}</g>` : ""}
      <g class="${dim("grid").trim()}">${place(grid(), 110, 710, 0.8)}${text(220, 723, "Grid", "energy-component", "start")}${text(220, 744, index === 4 ? "Net|export" : "Surplus|only", index === 4 ? "energy-flow-label gain-output" : "energy-small", "start")}</g>
      ${flow("electricity", "M20 110H67")}
      ${flow("delivered", `M110 153V${laser ? 237 : 251}`)}
      ${laser ? flow("absorbed", "M110 242V265") : ""}
      ${label("delivered", 136, 185, recovery ? "Drive pulse" : laser ? "Energy at target" : "External heating", "start")}
      ${label("electricity", 22, 56, recovery ? "Pulse|electricity" : "Driver|electricity", "start")}
      ${index === 0 ? `${label("absorbed", 210, 238, "Energy absorbed|by fuel", "start")}<path d="M200 245H128" class="energy-callout gain-input"/>` : ""}
      <g class="${dim("driver-loss").trim()}">${flow("driver-loss", "M110 79V32", true)}${text(124, 48, "Driver losses", "energy-small", "start")}</g>
      ${recovery ? `
        <g class="${dim("recovery").trim()}">${place(recoveryCircuit(), 110, 505, 0.8)}${text(220, 485, "Recovery|circuit", "energy-component", "start")}</g>
        ${flow("recycled", "M80 326V467")}${label("recycled", 146, 382, "Returning pulse|energy", "start")}
        ${flow("fusion-contribution", "M140 326V467", true)}${label("fusion-contribution", 166, 430, "Fusion energy,|if converted", "start")}
        ${flow("returned", "M110 550V592")}${label("returned", 136, 574, "Electricity|returned", "start")}
      ` : `
        <g class="${dim("turbine").trim()}">${place(turbineGenerator(), 110, 505, 0.8)}${text(220, 478, "Turbine +|generator", "energy-component", "start")}</g>
        ${flow("fusion", `M110 ${laser ? 313 : 326}V465`)}${label("fusion", 136, 391, index === 2 ? "Fusion power|to heat capture" : "Fusion energy|to heat capture", "start")}
        ${flow("gross", "M110 550V592")}${label("gross", 136, 567, "Gross electricity", "start")}
      `}
      <g class="${dim(recovery ? "recovery-loss" : "waste-heat").trim()}">${flow("conversion-loss", `M${recovery ? 161 : 184} 515H242`, true)}${text(250, 541, recovery ? "Losses" : "Waste heat", "energy-small")}</g>
      ${flow("export", "M110 601V654")}
      <circle cx="110" cy="598" r="4" fill="${index === 4 ? "#176344" : "#8a9891"}"/>
      ${flow("return", "M110 598H204V793H20V110")}
      <g class="${dim("loads").trim()}">${place(loads(150), 291, 661)}</g>${flow("aux", "M204 793H291V694")}
      <g class="${dim("return").trim()}">${text(165, 825, "Electricity reused inside the plant", "energy-small")}</g>
      ${box.badge}`;
  }
  const names = ["fuel gain", "target gain", "plasma Q", "electrical recovery", "whole-plant balance"];
  return `<svg class="energy-scene energy-scene-${mobile ? "mobile" : "wide"}" viewBox="${mobile ? "0 0 390 846" : "0 32 1160 416"}" role="img" aria-labelledby="${prefix}-title ${prefix}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${prefix}-title">${view.title}: ${names[index]}</title><desc id="${prefix}-desc">Measurement boundary: ${view.boundaryLabel}. Counted input: ${view.inputLabel}. Counted output: ${view.outputLabel}. ${view.note} Dimmed components sit outside this measurement boundary.</desc>${defs}${art}</svg>`;
}

function measurementFormula(view) {
  if (view.formulaMode === "ratio") {
    return `<div class="energy-measurement energy-measurement-equation">
      <span class="gain-output"><b>OUT</b>${view.outputLabel}</span>
      <i class="energy-op" aria-hidden="true">÷</i>
      <span class="gain-input"><b>IN</b>${view.inputLabel}</span>
      <i class="energy-op" aria-hidden="true">=</i>
      <span class="gain-result"><b>RATIO</b>${view.resultLabel}</span>
    </div>`;
  }
  if (view.formulaMode === "recovery") {
    return `<div class="energy-measurement energy-measurement-equation">
      <span class="gain-output"><b>RETURNED</b>${view.outputLabel}</span>
      <i class="energy-op" aria-hidden="true">−</i>
      <span class="gain-input"><b>IN</b>${view.inputLabel}</span>
      <i class="energy-op" aria-hidden="true">−</i>
      <span class="gain-outside"><b>OUTSIDE PULSE</b>Other plant loads</span>
    </div>`;
  }
  return `<div class="energy-measurement energy-measurement-equation">
    <span class="gain-output"><b>GENERATED</b>${view.outputLabel}</span>
    <i class="energy-op" aria-hidden="true">−</i>
    <span class="gain-input"><b>PLANT USE</b>${view.inputLabel}</span>
    <i class="energy-op" aria-hidden="true">=</i>
    <span class="gain-result gain-result-net"><b>NET</b>${view.resultLabel}</span>
  </div>`;
}

export function renderGainDiagram(index) {
  const view = views[index] || views[0];
  if (!views[index]) index = 0;
  return `<figure class="energy-overview">
    <div class="energy-overview-heading"><strong>${view.title}</strong><div class="energy-key" aria-label="Diagram key"><span class="gain-boundary"><i aria-hidden="true"></i>Measurement boundary</span><span class="gain-input"><i aria-hidden="true"></i>${index === 3 ? "Pulse input" : index === 4 ? "Plant use" : "Counted input"}</span><span class="gain-output"><i aria-hidden="true"></i>${index === 3 ? "Recovered output" : index === 4 ? "Generated / net" : "Counted output"}</span><span class="gain-context"><i aria-hidden="true"></i>Outside boundary</span></div></div>
    ${scene(view, index, false)}${scene(view, index, true)}
    ${measurementFormula(view)}
    <figcaption class="energy-schematic-note">Conceptual plant routes. The dashed box marks what this metric counts; dimmed components sit outside the boundary.</figcaption>
  </figure>`;
}
