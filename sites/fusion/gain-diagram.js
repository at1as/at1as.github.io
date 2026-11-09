// Energy routes, not piping or a quantitative Sankey diagram. The coloured
// arrows identify measurement boundaries; all plant hardware is conceptual.
const views = [
  {
    kind: "laser", title: "Laser-fusion plant concept", input: ["absorbed"], output: ["fusion"],
    inputLabel: "Energy absorbed by fuel", outputLabel: "Fusion energy released",
    note: "Fuel gain counts the energy absorbed by the fuel. Laser electricity, target losses and the rest of the plant sit outside that ratio.",
  },
  {
    kind: "plasma", title: "Magnetic-fusion plant concept", input: ["delivered"], output: ["fusion"],
    inputLabel: "External heating to plasma", outputLabel: "Fusion power released",
    note: "Plasma Q compares fusion power with external heating delivered to the plasma. Making that heat and running the plant use additional electricity.",
  },
  {
    kind: "laser", title: "Laser-fusion plant concept", input: ["delivered"], output: ["fusion"],
    inputLabel: "Driver energy at target", outputLabel: "Fusion energy released",
    note: "Target gain includes losses between the target and its fuel. It still leaves out the electricity used by the lasers and the rest of the plant.",
  },
  {
    kind: "recovery", title: "Pulsed electrical-recovery concept", input: ["electricity"], output: ["returned"],
    inputLabel: "Electricity supplied for pulse", outputLabel: "Total electricity returned",
    note: "Returned electricity can include recycled pulse energy. Subtract the pulse input and all other plant demand to establish a net electrical gain over a complete cycle.",
  },
  {
    kind: "plant", title: "Thermal fusion-plant concept", input: ["electricity", "aux"], output: ["gross"],
    inputLabel: "All plant electricity use", outputLabel: "Gross electricity generated",
    note: "Subtract the driver and every other plant load from gross generation. Only a surplus can supply the grid; imports must cover any shortfall.",
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
function reactor(kind) {
  const laser = kind === "laser";
  return `<rect x="-91" y="-66" width="182" height="132" rx="${laser ? 25 : 56}" fill="#e8ece2" stroke="#8b9b8b" stroke-width="2"/>
    ${laser
      ? '<circle r="55" fill="#f1e8d8" stroke="#b6a58b" stroke-width="2"/><circle r="23" fill="#dcaa7d" stroke="#ad6a42" stroke-width="2"/>'
      : kind === "recovery"
        ? '<ellipse rx="60" ry="27" fill="#e6c2a0" stroke="#b57b55" stroke-width="2"/><ellipse rx="40" ry="12" fill="#dca77c"/><path d="M-70-37v74m16-74v74m108-74v74m16-74v74" fill="none" stroke="#809a96" stroke-width="6"/>'
        : '<ellipse rx="61" ry="39" fill="#e6c2a0" stroke="#b57b55" stroke-width="2"/><ellipse rx="34" ry="17" fill="#e8ece2" stroke="#b57b55" stroke-width="2"/><path d="M-70-37q-12 37 0 74m140-74q12 37 0 74" fill="none" stroke="#809a96" stroke-width="7"/>'}
    ${laser ? text(0, 5, "Fuel", "energy-art-label") : ""}`;
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
  return `<rect x="${-width / 2}" y="-27" width="${width}" height="54" rx="7" fill="#edf0e8" stroke="#b0bcaf" stroke-width="1.5"/>${text(0, -4, "Cooling, pumps|and fuel processing", "energy-small")}`;
}

function scene(view, index, mobile) {
  const prefix = `gain-${index}-${mobile ? "mobile" : "wide"}`;
  const recovery = view.kind === "recovery", laser = view.kind === "laser";
  const role = id => view.input.includes(id) ? "input" : view.output.includes(id) ? "output" : "context";
  const flow = (id, d, loss = false) => `<path data-energy-flow="${id}" data-count="${role(id)}" d="${d}" class="energy-path gain-${role(id)}${loss ? " energy-loss" : ""}" marker-end="url(#${prefix}-${role(id)})"/>`;
  const label = (id, x, y, words, anchor = "middle") => text(x, y, words, `energy-flow-label gain-${role(id)}`, anchor);
  const defs = `<defs>${["input", "output", "context"].map(r => `<marker id="${prefix}-${r}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 7 4 1 7" fill="none" stroke="${r === "input" ? "#a45330" : r === "output" ? "#2e6853" : "#8a9891"}" stroke-width="1.5"/></marker>`).join("")}</defs>`;
  let art;
  if (!mobile) {
    art = `${place(driver(view.kind), 132, 200)}${place(reactor(view.kind), 415, 200)}${place(grid(), 1065, 200)}
      ${flow("electricity", "M40 200H78")}
      ${flow("delivered", `M186 200H${laser ? 356 : 353}`)}
      ${laser ? flow("absorbed", "M359 200H389") : ""}
      ${label("delivered", 263, 166, recovery ? "Drive pulse" : laser ? "Energy at target" : "External heating")}
      ${label("electricity", 81, 135, recovery ? "Pulse|electricity" : "Driver|electricity")}
      ${index === 0 ? `${label("absorbed", 368, 91, "Energy absorbed|by fuel")}<path d="M368 118V177" class="energy-callout gain-input"/><circle cx="368" cy="200" r="4" fill="#a45330"/>` : ""}
      ${text(132, 287, recovery ? "Pulse power" : laser ? "Laser driver" : "Heating systems", "energy-component")}
      ${text(415, 287, laser ? "Target + fuel" : "Plasma", "energy-component")}
      ${text(1065, 287, "Grid", "energy-component")}${text(1065, 307, "Surplus only", "energy-small")}
      ${flow("driver-loss", "M152 161V95", true)}${text(160, 77, "Driver losses", "energy-small")}
      ${recovery ? `
        ${place(recoveryCircuit(), 797, 200)}
        ${flow("recycled", "M508 182H731")}${label("recycled", 619, 159, "Returning pulse energy")}
        ${flow("fusion-contribution", "M460 224Q505 253 545 244L734 218", true)}${label("fusion-contribution", 618, 278, "Fusion energy, if converted")}
        ${text(797, 287, "Recovery circuit", "energy-component")}
        ${flow("returned", "M862 200H958")}${label("returned", 914, 120, "Electricity|returned")}
        ${flow("recovery-loss", "M797 155V96", true)}${text(797, 77, "Losses", "energy-small")}
      ` : `
        ${place(heatCapture(), 642, 200)}${place(turbineGenerator(), 822, 200)}
        ${flow("fusion", `M${laser ? 441 : 477} 200H606`)}${label("fusion", 552, 132, index === 1 ? "Fusion power|released" : "Fusion energy|released")}
        ${flow("heat", "M678 200H729")}${label("heat", 704, 177, "Heat")}
        ${text(642, 287, "Capture heat", "energy-component")}${text(822, 287, "Turbine + generator", "energy-component")}
        ${flow("gross", "M916 200H968")}${label("gross", 950, 132, "Gross|electricity")}
        ${flow("waste-heat", "M822 158V96", true)}${text(822, 77, "Waste heat", "energy-small")}
        ${laser ? `${flow("coupling-loss", "M331 248V314", true)}${text(331, 337, "Target losses", "energy-small")}` : ""}
      `}
      ${flow("export", "M975 200H1015")}
      <circle cx="975" cy="200" r="4" fill="#8a9891"/>
      ${flow("return", "M975 200V390H40V200")}
      ${text(344, 378, "Electricity reused inside the plant", "energy-small")}
      ${place(loads(), 680, 331)}${flow("aux", "M680 390V363")}
      ${label("aux", 680, 419, "Other plant demand")}`;
  } else {
    art = `${place(driver(view.kind), 110, 110, 0.75)}${place(reactor(view.kind), 110, 290, 0.9)}${place(grid(), 110, 710, 0.8)}
      ${flow("electricity", "M20 110H67")}
      ${flow("delivered", `M110 153V${laser ? 237 : 251}`)}
      ${laser ? flow("absorbed", "M110 242V265") : ""}
      ${label("delivered", 136, 185, recovery ? "Drive pulse" : laser ? "Energy at target" : "External heating", "start")}
      ${label("electricity", 22, 65, recovery ? "Pulse|electricity" : "Driver|electricity", "start")}
      ${text(220, 111, recovery ? "Pulse power" : laser ? "Laser driver" : "Heating|systems", "energy-component", "start")}
      ${text(220, 296, laser ? "Target + fuel" : "Plasma", "energy-component", "start")}
      ${index === 0 ? `${label("absorbed", 210, 238, "Energy absorbed|by fuel", "start")}<path d="M200 245H128" class="energy-callout gain-input"/>` : ""}
      ${flow("driver-loss", "M110 79V32", true)}${text(133, 28, "Driver losses", "energy-small", "start")}
      ${recovery ? `
        ${place(recoveryCircuit(), 110, 505, 0.8)}
        ${flow("recycled", "M80 326V467")}${label("recycled", 146, 382, "Returning pulse|energy", "start")}
        ${flow("fusion-contribution", "M140 326V467", true)}${label("fusion-contribution", 166, 430, "Fusion energy,|if converted", "start")}
        ${text(220, 485, "Recovery|circuit", "energy-component", "start")}
        ${flow("returned", "M110 550V592")}${label("returned", 136, 567, "Electricity|returned", "start")}
      ` : `
        ${place(turbineGenerator(), 110, 505, 0.8)}
        ${flow("fusion", `M110 ${laser ? 313 : 326}V465`)}${label("fusion", 136, 391, index === 1 ? "Fusion power|to heat capture" : "Fusion energy|to heat capture", "start")}
        ${text(220, 478, "Turbine +|generator", "energy-component", "start")}
        ${flow("gross", "M110 550V592")}${label("gross", 136, 567, "Gross electricity", "start")}
      `}
      ${flow("conversion-loss", `M${recovery ? 161 : 184} 515H242`, true)}${text(250, 541, recovery ? "Losses" : "Waste heat", "energy-small")}
      ${flow("export", "M110 601V654")}
      ${text(220, 723, "Grid", "energy-component", "start")}${text(220, 744, "Surplus|only", "energy-small", "start")}
      <circle cx="110" cy="598" r="4" fill="#8a9891"/>
      ${flow("return", "M110 598H204V793H20V110")}
      ${place(loads(150), 291, 661)}${flow("aux", "M204 793H291V694")}
      ${text(165, 825, "Electricity reused inside the plant", "energy-small")}`;
  }
  return `<svg class="energy-scene energy-scene-${mobile ? "mobile" : "wide"}" viewBox="${mobile ? "0 0 390 846" : "0 44 1160 402"}" role="img" aria-labelledby="${prefix}-title ${prefix}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${prefix}-title">${view.title}: ${["fuel gain", "plasma Q", "target gain", "electrical recovery", "whole-plant balance"][index]}</title><desc id="${prefix}-desc">Highlighted input: ${view.inputLabel}. Highlighted output: ${view.outputLabel}. ${view.note} The surrounding illustration shows losses, plant electricity use and the route to the grid.</desc>${defs}${art}</svg>`;
}

export function renderGainDiagram(index) {
  const view = views[index] || views[0];
  if (!views[index]) index = 0;
  return `<figure class="energy-overview">
    <div class="energy-overview-heading"><strong>${view.title}</strong><div class="energy-key" aria-label="Diagram key"><span class="gain-input"><i aria-hidden="true"></i>${index === 3 ? "Pulse input" : index === 4 ? "Plant use" : "Counted input"}</span><span class="gain-output"><i aria-hidden="true"></i>${index === 3 ? "Recovered output" : index === 4 ? "Gross output" : "Counted output"}</span><span class="gain-context"><i aria-hidden="true"></i>Other energy paths</span></div></div>
    ${scene(view, index, false)}${scene(view, index, true)}
    <div class="energy-measurement"><span class="gain-input"><b>${index === 4 ? "SUBTRACT" : "IN"}</b>${view.inputLabel}</span><span class="gain-output"><b>${index === 4 ? "GENERATED" : "OUT"}</b>${view.outputLabel}</span></div>
    <figcaption class="energy-schematic-note">Proposed plant context, not an operating facility. Arrows show energy routes, not amounts. Imported electricity supplies any shortfall.</figcaption>
  </figure>`;
}
