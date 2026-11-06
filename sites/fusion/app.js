import { renderPowerCycle } from "./reaction-power.js";
import { approaches, renderMachine } from "./diagrams.js";
import { balance, defaults, readScenario, targetCost } from "./model.js";
import {
  getEntityReactorOptions,
  getInfrastructureContent,
  getReactorContent,
} from "./reactor-content.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const human = (x) => String(x ?? "").replaceAll("_", " ");
const fmt = (n) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { maximumFractionDigits: 1 })
    : "Unavailable";
const params = new URLSearchParams(location.search);
let data, sourceMap, sourceNumbers, entityMap, world;
let approach = params.get("approach") || "tokamak",
  machineStage = 0,
  reactionStage = 0,
  boundary = 1,
  playMachine,
  playReaction,
  view = ["cards", "table", "sites", "funding"].includes(params.get("view"))
    ? params.get("view")
    : "cards",
  scenario = readScenario(params),
  comparison = new Set(
    (params.get("compare") || "").split(",").filter(Boolean),
  );
let lastFocus,
  showAllCards = false,
  fastIgnition = params.get("variant") === "fast-ignition";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const categoryClass = (s) =>
  /target|plan/i.test(s)
    ? "target"
    : /model|simulat|design/i.test(s)
      ? "model"
      : /experiment|measured|predecessor/i.test(s)
        ? "experiment"
        : "neutral";
const badge = (s) =>
  `<span class="badge ${categoryClass(s)}">${categoryClass(s) === "target" ? "◇" : categoryClass(s) === "model" ? "○" : categoryClass(s) === "experiment" ? "●" : "—"} ${esc(human(s))}</span>`;
function citations(ids = []) {
  return [...new Set(ids)]
    .filter((id) => sourceMap?.has(id))
    .map((id) => {
      const s = sourceMap.get(id);
      const label = s.publisher
        .replace("U.S. Department of Energy", "DOE")
        .replace("Department of Energy", "DOE")
        .replace("Lawrence Livermore National Laboratory", "LLNL")
        .replace("Max Planck Institute for Plasma Physics", "IPP");
      return `<span class="reference"><a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.title)}" aria-label="Reference ${sourceNumbers.get(id)}: ${esc(s.title)} (opens a new tab)">[${sourceNumbers.get(id)}] ${esc(label)} ↗</a><button class="source-info" data-source="${esc(id)}" aria-label="Source details: ${esc(s.title)}">ⓘ</button></span>`;
    })
    .join(" ");
}
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").style.display = "block";
  setTimeout(() => ($("#toast").style.display = "none"), 3000);
}
function updateURL(extra = {}) {
  const p = new URLSearchParams(location.search);
  Object.entries(extra).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
  history.replaceState(
    null,
    "",
    `${location.pathname}${p.size ? "?" + p : ""}${location.hash}`,
  );
}
const reactorMounts = new Map();
function releaseReactor(host) {
  const mount = reactorMounts.get(host);
  if (!mount) return;
  mount.cancelled = true;
  mount.observer?.disconnect();
  mount.view?.dispose();
  reactorMounts.delete(host);
}
function releaseDialogReactors() {
  $$("#dialog-content .reactor-slot").forEach(releaseReactor);
}
function mountReactor(host, id, options = {}) {
  if (!host) return;
  const key =
    id +
    ":" +
    (options.variant || "") +
    ":" +
    (options.entityId || "") +
    ":" +
    !!options.fastIgnition;
  if (reactorMounts.get(host)?.key === key) return;
  releaseReactor(host);
  const mount = { key, cancelled: false, view: null, observer: null };
  reactorMounts.set(host, mount);
  host.innerHTML = `<div class="reactor-loading">${renderMachine(id, 3, options)}<div><h3>Interactive model</h3><p>Rotate the model and inspect its components</p><button data-load-reactor>Open interactive model ↗</button></div></div>`;
  let loading = false;
  async function load() {
    if (loading || mount.cancelled) return;
    loading = true;
    mount.observer?.disconnect();
    try {
      const { createReactorExplorer } = await import("./reactor-explorer.js");
      if (mount.cancelled || !host.isConnected) return;
      mount.view = createReactorExplorer(host, id, { ...options, citations });
    } catch (error) {
      if (!mount.cancelled) {
        host.querySelector(".reactor-loading p").textContent =
          "The 3D view could not load. The schematic and operating-cycle descriptions remain available.";
        host.querySelector("[data-load-reactor]").textContent =
          "Retry interactive model";
        loading = false;
      }
      console.error("Reactor explorer:", error);
    }
  }
  host.querySelector("[data-load-reactor]").onclick = load;
  mount.observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) load();
    },
    { rootMargin: "100px" },
  );
  mount.observer.observe(host);
}
function infrastructure(entity) {
  const c = getInfrastructureContent(entity);
  if (!c) return "";
  return `<section class="infrastructure-visual"><p class="eyebrow">ENABLING INFRASTRUCTURE</p><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><div class="infra-flow">${c.stages.map((p, i) => `<button class="infra-node ${i === 0 ? "active" : ""}" data-infra-index="${i}" data-infra-entity="${entity.id}" aria-pressed="${i === 0}"><span>0${i + 1}</span><strong>${esc(p.name)}</strong></button>`).join("")}</div><p class="infrastructure-detail" aria-live="polite">${esc(c.stages[0]?.text || "")}</p></section>`;
}
function modal(title, html) {
  releaseDialogReactors();
  if (!$("#detail-dialog").open) lastFocus = document.activeElement;
  $("#dialog-eyebrow").textContent = title;
  $("#dialog-content").innerHTML = html;
  const heading = $("#dialog-content h2");
  if (heading) heading.id = "detail-title";
  if (!$("#detail-dialog").open) $("#detail-dialog").showModal();
  $("#detail-dialog").scrollTop = 0;
  $("#close-dialog").focus();
}
let sourceFocus;
$("#close-source").onclick = () => $("#source-dialog").close();
$("#source-dialog").addEventListener("close", () => {
  if (sourceFocus?.isConnected) sourceFocus.focus({ preventScroll: true });
});
$("#source-dialog").addEventListener("click", (e) => {
  if (e.target !== e.currentTarget) return;
  const r = e.target.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    e.target.close();
});
$("#close-dialog").onclick = () => $("#detail-dialog").close();
$("#detail-dialog").addEventListener("close", () => {
  releaseDialogReactors();
  if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  updateURL({ entity: "" });
});
$("#detail-dialog").addEventListener("click", (e) => {
  if (e.target === $("#detail-dialog")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
});
const reactionSteps = [
  [
    "Start with the fuel",
    "Deuterium has one proton and one neutron. Tritium has one proton and two neutrons.",
  ],
  [
    "Create the conditions",
    "Temperature, density, and heat retention must work together so nuclei react before energy escapes.",
  ],
  [
    "Release binding energy",
    "A helium-4 nucleus carries 3.5 MeV; a neutron carries 14.1 MeV. Together: 17.6 MeV.",
  ],
  [
    "Capture the energy",
    "Charged helium can heat the plasma. Neutrons travel into the blanket, where energy capture and tritium breeding are required.",
  ],
  [
    "Turn heat into electricity",
    "A thermal power cycle converts part of the captured heat to electricity. The rest leaves as waste heat.",
  ],
  [
    "Supply the plant systems",
    "Heating, pumps, cooling, fuel processing and other systems consume power. Only the remainder can reach the grid.",
  ],
];
const circle = (x, y, r, fill, stroke = "none") =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}"/>`;
function nucleus(x, y, count, name) {
  const offsets =
    count === 2
      ? [
          [-9, 0],
          [9, 0],
        ]
      : count === 3
        ? [
            [-10, 6],
            [10, 6],
            [0, -11],
          ]
        : [
            [-10, -10],
            [10, -10],
            [-10, 10],
            [10, 10],
          ];
  return `<g>${offsets.map(([dx, dy], i) => circle(x + dx, y + dy, 14, i < (count === 4 ? 2 : 1) ? "#ba5e3e" : "#6a8e9c", "#f9faf5")).join("")}<text x="${x}" y="${y + 62}" text-anchor="middle" fill="#203c40" font-size="28">${name}</text></g>`;
}
function reaction() {
  const s = reactionStage;
  let content = "";
  if (s < 2) {
    content = `${s === 1 ? '<rect x="100" y="48" width="430" height="185" rx="90" fill="#eee1d0" stroke="#b78d6d" stroke-dasharray="6 6"/>' : ""}${nucleus(225, 130, 2, "Deuterium")}${nucleus(405, 130, 3, "Tritium")}<text x="315" y="138" text-anchor="middle" fill="#63776a" font-size="30">+</text><text x="315" y="265" text-anchor="middle" fill="#47634f" font-size="20">${s === 0 ? "Orange: proton · blue: neutron" : "Hot, dense fuel that retains its energy"}</text>`;
  } else if (s === 2) {
    content = `${nucleus(90, 140, 2, "Deuterium")}${nucleus(235, 140, 3, "Tritium")}<text x="160" y="148" fill="#63776a" font-size="25">+</text><path d="M285 140H347m-10-8 10 8-10 8" fill="none" stroke="#718772" stroke-width="3"/>${nucleus(410, 140, 4, "Helium-4")}${circle(555, 140, 14, "#6a8e9c")}<text x="555" y="202" text-anchor="middle" fill="#203c40" font-size="28">Neutron</text><text x="410" y="80" text-anchor="middle" fill="#a84e2e" font-size="30">3.5 MeV</text><text x="555" y="80" text-anchor="middle" fill="#a84e2e" font-size="30">14.1 MeV</text><text x="315" y="270" text-anchor="middle" fill="#47634f" font-size="20">17.6 MeV released per reaction</text>`;
  } else if (s === 3) {
    content = `<rect x="180" y="40" width="270" height="210" rx="95" fill="#e2e9da" stroke="#6c866e" stroke-width="2"/><ellipse cx="315" cy="145" rx="70" ry="54" fill="#e6b897" stroke="#b5663e"/><text x="315" y="152" text-anchor="middle" font-size="28" fill="#77472e">Plasma</text><path d="M365 118 412 80m-12 2 12-2-4 12" fill="none" stroke="#467588" stroke-width="3"/>${circle(390, 100, 7, "#6a8e9c")}<text x="480" y="75" font-size="20" fill="#416777">Neutrons</text><text x="315" y="282" text-anchor="middle" font-size="20" fill="#47634f">Lithium blanket</text><path d="M285 165q-13 25 15 30" fill="none" stroke="#b75e37" stroke-width="3"/><text x="90" y="156" text-anchor="middle" font-size="24" fill="#a35834">Helium</text><text x="90" y="190" text-anchor="middle" font-size="24" fill="#a35834">heats fuel</text>`;
  } else {
    content = renderPowerCycle(s === 5);
  }
  $("#reaction-scene").innerHTML =
    `<svg viewBox="0 0 630 300" role="img" aria-label="${esc(reactionSteps[s][1])}">${content}</svg>`;
  $("#reaction-caption").innerHTML =
    `<h3>${reactionSteps[s][0]}</h3><p>${reactionSteps[s][1]} ${s === 2 ? "MeV means million electronvolts, a unit of particle energy. About 80% goes to the neutron; this is not electrical efficiency." : ""}</p>`;
  $("#reaction-progress").textContent = `0${s + 1} / 06`;
  const reactionFocus = document.activeElement?.dataset.reaction;
  $("#reaction-steps").innerHTML = reactionSteps
    .map(
      ([t, d], i) =>
        `<button class="reaction-step ${i === s ? "active" : ""}" data-reaction="${i}" aria-pressed="${i === s}"><span class="number">0${i + 1}</span><span><strong class="step-title">${t}</strong><span class="step-description">${d}</span></span></button>`,
    )
    .join("");
  if (reactionFocus !== undefined)
    $(`[data-reaction="${reactionFocus}"]`)?.focus({ preventScroll: true });
  $("#reaction-back").disabled = s === 0;
  $("#reaction-next").disabled = s === 5;
}
function stopReaction() {
  clearInterval(playReaction);
  playReaction = null;
  $("#reaction-play").textContent = "Play sequence ▷";
  $("#reaction-scene").classList.remove("playing");
}
$("#reaction-back").onclick = () => {
  stopReaction();
  reactionStage = Math.max(0, reactionStage - 1);
  reaction();
};
$("#reaction-next").onclick = () => {
  stopReaction();
  reactionStage = Math.min(5, reactionStage + 1);
  reaction();
};
$("#reaction-play").onclick = () => {
  if (playReaction) return stopReaction();
  if (reactionStage === 5) reactionStage = 0;
  reaction();
  $("#reaction-play").textContent = "Pause Ⅱ";
  $("#reaction-scene").classList.add("playing");
  playReaction = setInterval(
    () => {
      reactionStage++;
      reaction();
      if (reactionStage === 5) stopReaction();
    },
    reduced ? 5000 : 3000,
  );
};
function machineId(e) {
  return (
    {
      tokamak: "tokamak",
      spherical_tokamak: "spherical",
      stellarator: "stellarator",
      magnetic_mirror: "mirror",
      levitated_dipole: "dipole",
      beam_frc: "beam-frc",
      pulsed_frc: "pulsed-frc",
      z_pinch: "z-pinch",
      magnetized_target: "magnetized-target",
      laser_indirect: "indirect-laser",
      laser_direct: "direct-laser",
      hybrid_direct_drive: "hybrid-laser",
      hybrid_fast_ignition: "hybrid-ignition",
      pulsed_power_inertial: "pulsed-power",
      electrostatic: "electrostatic",
    }[e.approachId] || null
  );
}
function machine() {
  if (!approaches.some((a) => a.id === approach)) approach = "tokamak";
  const a = approaches.find((a) => a.id === approach);
  machineStage = Math.min(machineStage, a.stages.length - 1);
  $("#fast-ignition-control").hidden = approach !== "direct-laser";
  $("#fast-ignition").checked = fastIgnition;
  $("#machine-diagram").innerHTML = renderMachine(a.id, machineStage, {
    fastIgnition,
  });
  mountReactor($("#reactor-explorer"), a.id, { fastIgnition });
  $("#machine-family").textContent = human(a.family).toUpperCase();
  $("#machine-index").textContent =
    `CONFIGURATION ${String(approaches.indexOf(a) + 1).padStart(2, "0")} / ${approaches.length}`;
  $("#machine-name").textContent = a.name;
  $("#machine-description").textContent =
    a.description +
    (approach === "direct-laser" && fastIgnition
      ? " Selected variant: compression is followed by a separate fast-ignition pulse."
      : "");
  $("#machine-stage-title").textContent =
    `0${machineStage + 1} / ${a.stages[machineStage].title}`;
  $("#machine-stage-text").textContent = a.stages[machineStage].text;
  $("#machine-constraint").textContent = a.constraint;
  const stageFocus = document.activeElement?.dataset.machineStage;
  $("#machine-stage-buttons").innerHTML = a.stages
    .map(
      (s, i) =>
        `<button class="${i === machineStage ? "active" : ""}" data-machine-stage="${i}" aria-label="Stage ${i + 1}: ${esc(s.title)}" aria-pressed="${i === machineStage}">${i + 1}</button>`,
    )
    .join("");
  if (stageFocus !== undefined)
    $(`[data-machine-stage="${stageFocus}"]`)?.focus({ preventScroll: true });
  $("#machine-back").disabled = machineStage === 0;
  $("#machine-next").disabled = machineStage === a.stages.length - 1;
  $("#approach-select").value = approach;
  if (data) {
    const entities = data.entities.filter((e) => machineId(e) === approach);
    $("#machine-entities").innerHTML =
      `<p class="eyebrow">EXPLORE THIS APPROACH</p><div class="entity-chips">${entities
        .slice(0, 8)
        .map((e) => `<button data-entity="${e.id}">${esc(e.name)}</button>`)
        .join("")}</div>`;
    $("#machine-sources").innerHTML = citations(
      getReactorContent(a.id, { fastIgnition }).sourceIds,
    );
  }
  compareMachine();
}
function compareMachine() {
  const open = $("#compare-machines").checked;
  $("#comparison-machine").hidden = !open;
  if (!open) {
    releaseReactor($("#comparison-diagram"));
    return;
  }
  const a =
    approaches.find((a) => a.id === $("#second-approach").value) ||
    approaches[2];
  mountReactor($("#comparison-diagram"), a.id);
  $("#comparison-copy").innerHTML =
    `<p>${esc(a.description)} ${esc(a.constraint)}</p>`;
}

function stopMachine() {
  clearInterval(playMachine);
  playMachine = null;
  $("#machine-play").textContent = "Play ▷";
}
function selectMachine(id) {
  stopMachine();
  approach = id;
  machineStage = 0;
  machine();
  updateURL({ approach: id });
}
$("#fast-ignition").onchange = (e) => {
  fastIgnition = e.target.checked;
  machine();
  updateURL({ variant: fastIgnition ? "fast-ignition" : "" });
};
$("#approach-select").onchange = (e) => selectMachine(e.target.value);
$("#second-approach").onchange = compareMachine;
$("#compare-machines").onchange = compareMachine;
$("#machine-back").onclick = () => {
  stopMachine();
  machineStage--;
  machine();
};
$("#machine-next").onclick = () => {
  stopMachine();
  machineStage++;
  machine();
};
$("#machine-play").onclick = () => {
  if (playMachine) return stopMachine();
  const a = approaches.find((a) => a.id === approach);
  if (machineStage === a.stages.length - 1) machineStage = 0;
  machine();
  $("#machine-play").textContent = "Pause Ⅱ";
  playMachine = setInterval(
    () => {
      machineStage++;
      machine();
      if (machineStage === a.stages.length - 1) stopMachine();
    },
    reduced ? 5000 : 3000,
  );
};
const boundaryData = [
  [
    "Fuel gain",
    "Fusion energy ÷ energy absorbed by the fuel",
    "In inertial fusion, only part of the driver energy reaches the fuel. A gain measured here omits the losses in the laser, target and energy coupling.",
    "fuel",
  ],
  [
    "Plasma Q",
    "Fusion power ÷ external heating power delivered to the plasma",
    "ITER’s Q = 10 design goal means 500 MW of fusion power for 50 MW of external plasma heating. It does not include the electricity needed to run that heating or the rest of the facility.",
    "reaction",
  ],
  [
    "Target gain",
    "Fusion energy ÷ driver energy delivered to the target",
    "NIF compares the fusion yield of a shot with laser energy arriving at the target. This is an energy ratio for a pulse; plasma Q is normally a power ratio. Neither is a whole-plant electrical balance.",
    "reaction",
  ],
  [
    "Electrical recovery",
    "Electricity returned by an energy-recovery system",
    "A recovery circuit can return some of the electricity used to drive a pulse. Returned energy is not all new fusion energy. Compare input and output over a full cycle, with the same stored energy at the start and end.",
    "conversion",
  ],
  [
    "Whole plant",
    "Gross electricity − all plant electrical consumption",
    "Subtract heating or driver demand, cooling, pumps, magnets and fuel processing over the same interval. Positive net output is necessary for a power plant; reliability and cost still matter.",
    "plant",
  ],
];
function boundaries() {
  const b = boundaryData[boundary];
  if (!$("#boundary-tabs").children.length)
    $("#boundary-tabs").innerHTML = boundaryData
      .map((x, i) => `<button data-boundary="${i}">${x[0]}</button>`)
      .join("");
  $$("[data-boundary]").forEach((button, i) => {
    button.classList.toggle("active", i === boundary);
    button.setAttribute("aria-pressed", i === boundary);
  });
  $("#boundary-visual").innerHTML =
    `<div class="energy-chain ${b[3] === "plant" ? "selected" : ""}">
    <p class="energy-chain-label">WHOLE PLANT</p>
    <div class="energy-chain-steps">
      <div class="energy-node"><span>Electricity in</span><strong>Heating / driver</strong><small>Losses before the energy reaches the experiment</small></div>
      <span class="energy-arrow" aria-hidden="true">→</span>
      <div class="energy-node ${b[3] === "reaction" ? "selected" : ""}"><span>${boundary === 2 ? "Driver energy delivered" : "Heating power delivered"}</span><strong>${boundary === 2 ? "Target" : boundary === 1 ? "Plasma" : "Plasma / target"}</strong><span class="fuel-boundary ${b[3] === "fuel" ? "selected" : ""}">Fuel</span></div>
      <span class="energy-arrow" aria-hidden="true">→</span>
      <div class="energy-node ${b[3] === "conversion" ? "selected" : ""}"><span>Energy released</span><strong>Energy conversion</strong><small>Gross electricity out; conversion losses leave as heat</small></div>
    </div>
    <p class="energy-return">Gross electricity − the plant’s own electricity use = net output</p>
  </div>`;
  $("#boundary-caption").innerHTML =
    `<h3>${b[0]}</h3><div><strong>${b[1]}</strong><p>${b[2]}</p></div>`;
}
const sliderMeta = {
  gain: ["Fusion gain", 0, 100, 0.1, "×"],
  heating: ["Heating delivered to plasma", 0, 200, 1, "MW"],
  energy: ["Driver energy delivered per shot", 0, 20, 0.1, "MJ"],
  rate: ["Repetition rate", 0, 20, 0.1, "Hz"],
  driver: ["Electric-to-driver efficiency", 1, 100, 1, "%"],
  thermal: ["Heat-to-electric efficiency", 0, 60, 1, "%"],
  capture: ["Fusion energy captured", 0, 100, 1, "%"],
  aux: ["Other plant electrical demand", 0, 500, 1, "MW"],
};
function calcControls() {
  const mode = scenario.mode;
  $$("[data-mode]").forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === mode);
    b.setAttribute("aria-pressed", b.dataset.mode === mode);
  });
  $("#calc-context").innerHTML =
    mode === "inertia"
      ? `<strong>ATTRIBUTED COMPANY MODEL · Inertia Phase I roadmap</strong> A modeled scenario, not measured electricity. Defaults: 10 MJ, 10 Hz, 12% laser efficiency, 45% thermal efficiency, 5 MJ other demand per shot. Those inputs give 241.7 MW using unrounded arithmetic; the roadmap describes roughly 250 MW. Undated page reviewed 22 Oct 2026. ${citations(["ALT_INERTIA_PHASE1"])}`
      : "<strong>ILLUSTRATIVE ASSUMPTIONS</strong> Adjust the inputs to calculate gross generation, plant demand, and net output. These defaults describe no particular company or experiment.";
  const keys = [
    "gain",
    ...(mode === "continuous" ? ["heating"] : ["energy", "rate"]),
    "driver",
    "thermal",
    "capture",
    "aux",
  ];
  $("#calc-controls").innerHTML = keys
    .map((k) => {
      const [baseLabel, min, max, step, unit] =
        k === "aux" && mode === "inertia"
          ? ["Other electricity per shot", 0, 50, 0.1, "MJ"]
          : sliderMeta[k];
      const label =
        k === "gain"
          ? mode === "continuous"
            ? "Plasma gain Q"
            : "Target gain"
          : k === "driver" && mode === "continuous"
            ? "Electricity-to-heating efficiency"
            : baseLabel;
      const v = scenario[k] * (unit === "%" ? 100 : 1);
      return `<div class="slider-row"><label for="input-${k}">${label}</label><output id="output-${k}" for="input-${k}">${fmt(v)} ${unit}</output><input id="input-${k}" data-input="${k}" type="range" min="${min}" max="${max}" step="${step}" value="${v}" aria-valuetext="${fmt(v)} ${unit}"></div>`;
    })
    .join("");
  calc();
}
function calc() {
  const p = scenario,
    r = balance(p);
  if (r.error) {
    $("#net-number").textContent = r.error;
    return;
  }
  $("#net-number").classList.toggle("negative", r.net < 0);
  $("#net-number").innerHTML =
    `${r.net > 0 ? "+" : ""}${fmt(r.net)}<small>MW</small><span>${r.net < 0 ? "Net consumption" : r.net > 0 ? "Net electricity to the grid" : r.gross === 0 && r.consumption === 0 ? "No electricity generated or consumed" : "Electrical break-even in this simplified model"}</span>`;
  const max = Math.max(r.fusion, r.gross, r.driver, r.aux, 1);
  $("#power-flow").innerHTML = [
    ["Fusion power", r.fusion, "fusion"],
    ["Gross electricity", r.gross, ""],
    ["Driver demand", r.driver, "demand"],
    ["Other plant demand", r.aux, "demand"],
  ]
    .map(
      ([label, v, c]) =>
        `<div class="power-row"><div><span>${label}</span><strong>${fmt(v)} MW</strong></div><div class="power-bar-track"><div class="power-bar ${c}" style="width:${(v / max) * 100}%"></div></div></div>`,
    )
    .join("");
  const scale = Math.max(r.gross, r.consumption, 1);
  $("#signed-axis").innerHTML =
    `<span class="axis-zero">0</span><span class="axis-dot" style="left:${50 + (r.net / scale) * 47}%;background:${r.net < 0 ? "#b15130" : "#2e6451"}"></span><div class="axis-labels"><span>−${fmt(scale)} MW · consumption</span><span>+${fmt(scale)} MW · export</span></div>`;
  $("#threshold").textContent =
    r.threshold === null
      ? "Break-even gain unavailable: no delivered or captured electrical energy"
      : `Electrical break-even requires gain ${fmt(r.threshold)} with these assumptions`;
  $("#equations").innerHTML =
    `<code>Fusion = ${p.mode === "continuous" ? `${fmt(p.gain)} × ${fmt(p.heating)}` : `${fmt(p.energy)} × ${fmt(p.gain)} × ${fmt(p.rate)}`} = ${fmt(r.fusion)} MW<br>Gross = ${p.thermal} × ${p.capture} × ${fmt(r.fusion)} = ${fmt(r.gross)} MW<br>Driver = ${fmt(r.delivered)} / ${p.driver} = ${fmt(r.driver)} MW<br>Net = ${fmt(r.gross)} − ${fmt(r.driver)} − ${fmt(r.aux)} = ${fmt(r.net)} MW</code>`;
  $("#target-cost").textContent =
    p.mode === "continuous"
      ? "Select a pulsed mode to estimate the contribution of target manufacturing to electricity cost"
      : `${fmt(p.rate * 86400)} targets per operating day. At a hypothetical $1 per target: ${r.net > 0 ? "$" + fmt(targetCost(p.rate, 1, r.net)) + "/MWh of delivered electricity" : "cost per delivered MWh unavailable with nonpositive net output"}. Target cost alone excludes every other plant cost and is not an electricity price.`;
}
$("#calc-controls").oninput = (e) => {
  const k = e.target.dataset.input;
  if (!k) return;
  const unit =
    k === "aux" && scenario.mode === "inertia" ? "MJ" : sliderMeta[k][4];
  scenario[k] = +e.target.value / (unit === "%" ? 100 : 1);
  e.target.setAttribute("aria-valuetext", `${fmt(+e.target.value)} ${unit}`);
  $("#output-" + k).textContent = `${fmt(+e.target.value)} ${unit}`;
  calc();
};
$("#calc-reset").onclick = () => {
  scenario = { ...defaults[scenario.mode] };
  calcControls();
};
$("#calc-share").onclick = async () => {
  const u = new URL(location.href);
  Object.entries(scenario).forEach(([k, v]) => u.searchParams.set(k, v));
  u.hash = "gain";
  try {
    await navigator.clipboard.writeText(u.href);
    toast("Scenario link copied");
  } catch {
    modal(
      "SCENARIO LINK",
      `<h2>Your scenario</h2><p><a href="${esc(u.href)}">${esc(u.href)}</a></p>`,
    );
  }
};
function recordConditions(r) {
  const notes = [];
  if (r.ion_temperature_c)
    notes.push(`Ion temperature: ${fmt(r.ion_temperature_c / 1e6)} million °C`);
  if (r.fuel) notes.push(`Fuel: ${r.fuel}`);
  if (r.duration_s) notes.push(`Pulse duration: ${fmt(r.duration_s)} s`);
  if (r.fusion_power_mw)
    notes.push(
      `Fusion power: ${fmt(r.fusion_power_mw)} MW; external heating: ${fmt(r.heating_power_mw)} MW`,
    );
  if (r.measurement_type === "peak_not_pulse_average")
    notes.push("Peak value, not a pulse average");
  return notes.length ? `<p>${notes.map(esc).join("<br>")}</p>` : "";
}
function records() {
  if (!data) return;
  const mode = $("#record-select").value;
  const rows = data.results.filter((r) =>
    mode === "nif"
      ? r.metric === "target gain"
      : mode === "energy"
        ? r.metric === "fusion energy"
        : mode === "plasma"
          ? r.metric === "plasma gain peak"
          : r.unit === "s",
  );
  let svg = "";
  if (mode === "nif") {
    const min = Date.parse("2022-01-01"),
      max = Date.parse("2027-01-01");
    const x = (d) => 55 + ((Date.parse(d) - min) / (max - min)) * 570,
      y = (v) => 230 - v * 40;
    svg = [0, 1, 2, 3, 4, 5]
      .map(
        (v) =>
          `<line x1="55" y1="${y(v)}" x2="625" y2="${y(v)}" stroke="#d4dbcf" ${v === 1 ? 'stroke-dasharray="4 4"' : ""}/><text x="35" y="${y(v) + 4}" fill="#708171" font-size="11">${v}</text>`,
      )
      .join("");
    svg += [2022, 2023, 2024, 2025, 2026, 2027]
      .map(
        (v) =>
          `<text x="${x(v + "-01-01")}" y="251" text-anchor="middle" fill="#708171" font-size="10">${v}</text>`,
      )
      .join("");
    svg += rows
      .map(
        (r) =>
          `<circle cx="${x(r.date)}" cy="${y(r.value)}" r="5" fill="#b9633d"/><text x="${x(r.date)}" y="${y(r.value) - 13}" fill="#9a4e31" text-anchor="middle" font-size="12">${esc((r.reported_display || String(r.value)).replace("approximately ", "≈"))}</text>`,
      )
      .join("");
    svg +=
      '<text x="60" y="23" font-size="11" fill="#5d7565">TARGET GAIN · SELECTED PUBLISHED SHOTS</text>';
    $("#record-chart").innerHTML =
      `<svg viewBox="0 0 650 270" role="img" aria-label="Selected NIF target gain shots from December 2022 to June 2026; all data in the table below">${svg}</svg><p class="quiet">Curated shots, not every attempt. No success rate can be inferred. The inconsistent October 2025 row is excluded from this series.</p>`;
  } else
    $("#record-chart").innerHTML =
      `<p class="quiet">${mode === "duration" ? "Separate operating regimes; these are not points on one interchangeable progress scale." : mode === "plasma" ? "Peak plasma gain uses external heating delivered to the plasma. It is not an electrical gain." : "Fusion energy is measured in MJ. It is not grid electricity or a power rating."}</p>`;
  $("#record-table").innerHTML =
    `<details ${mode !== "nif" ? "open" : ""}><summary>Data and sources · ${rows.length} results</summary><div class="table-scroll" tabindex="0" role="region" aria-label="Experiment results"><table class="data-table"><thead><tr><th>Experiment / date</th><th>Metric and result</th><th>Evidence</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.facility)}<br>${esc(r.date)}<br><small>${esc(human(r.date_role || "event date"))}</small></td><td>${esc(r.metric)}<br><b>${esc(r.reported_display || String(r.value))} ${r.unit === "ratio" ? "×" : esc(r.unit)}</b><br>${esc(human(r.boundary))}${recordConditions(r)}${r.fusion_energy_mj !== undefined ? `<p>Yield: ${r.fusion_energy_mj}${r.fusion_energy_uncertainty_mj ? " ± " + r.fusion_energy_uncertainty_mj : ""} MJ<br>Delivered driver: ${r.driver_energy_mj === null ? "not supplied" : r.driver_energy_mj + " MJ"}</p>` : ""}</td><td>${badge(r.category)}<br>${citations(r.sourceIds)}</td></tr>`).join("")}</tbody></table></div></details>`;
}
$("#record-select").onchange = records;
function selectedEntities() {
  const q = $("#atlas-search").value.trim().toLowerCase(),
    f = $("#filter-family").value,
    fuel = $("#filter-fuel").value,
    role = $("#filter-role").value,
    country = $("#filter-country").value,
    evidence = $("#filter-evidence").value;
  return data.entities.filter(
    (e) =>
      (!q ||
        [
          e.name,
          e.summary,
          e.approach,
          ...e.locations.map((l) => l.name + " " + l.place),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)) &&
      (!f || e.family === f) &&
      (!fuel ||
        (e.intended_fuel_ids || []).includes(fuel) ||
        e.intendedFuel?.includes(fuel)) &&
      (!role || (e.roles || [e.role]).includes(role)) &&
      (!country || e.locations.some((l) => l.country === country)) &&
      (!evidence || e.claims.some((c) => c.category === evidence)),
  );
}
function entityCard(e) {
  const claim =
    e.claims.find((c) => !/target|agreement|organization/i.test(c.category)) ||
    e.claims[0];
  return `<article class="entity-card"><div class="card-top"><span>${esc(human(e.family))} · ${esc(e.role === "public" ? "public research" : e.role)}</span><label><input type="checkbox" data-compare="${e.id}" aria-label="Compare ${esc(e.name)}" ${comparison.has(e.id) ? "checked" : ""}> Compare</label></div><h3><button data-entity="${e.id}">${esc(e.name)}</button></h3><p>${esc(e.approach)}<br>${esc(e.locations[0]?.country || "Location not established")}</p><div class="card-evidence">${claim ? badge(claim.category) + `<p>${esc(claim.displayText || claim.text)}</p>${claim.date ? `<p class="detail-meta">${esc(claim.dateRole)}: ${esc(claim.date)}</p>` : ""}<div class="citation">${citations(claim.sourceIds.slice(0, 2))}</div>` : "<p>No result included</p>"}</div><div class="card-bottom"><span>${e.claims.length} evidence entries</span><button data-entity="${e.id}">Open field notes ↗</button></div></article>`;
}
function atlas() {
  if (!data) return;
  const entities = selectedEntities();
  $$("[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
    b.setAttribute("aria-pressed", b.dataset.view === view);
  });
  $("#result-count").textContent =
    `${entities.length} of ${data.entities.length} organizations · curated snapshot, 22 Oct 2026`;
  if (view === "cards")
    $("#atlas-content").innerHTML = entities.length
      ? `<div class="entity-grid">${entities
          .slice(0, showAllCards ? entities.length : 9)
          .map(entityCard)
          .join(
            "",
          )}</div>${entities.length > 9 ? `<button id="show-all-cards" style="display:block;margin:25px auto 0">${showAllCards ? "Show fewer organizations" : "Explore all " + entities.length + " organizations ↓"}</button>` : ""}`
      : '<div class="empty"><h3>No matching organizations</h3><p>Try a broader search or clear the filters</p></div>';
  if (view === "table")
    $("#atlas-content").innerHTML =
      `<div class="table-scroll" tabindex="0" role="region" aria-label="Scrollable data table"><table class="data-table"><thead><tr><th>Organization</th><th>Approach / intended fuel</th><th>Included evidence</th><th>Announced target</th><th>Financing snapshot</th></tr></thead><tbody>${entities
        .map((e) => {
          const c = e.claims.find((c) => !/target/i.test(c.category)),
            t = e.targets[0];
          return `<tr><td><button data-entity="${e.id}">${esc(e.name)}</button><p>${esc(e.locations[0]?.place || "Unknown")}</p></td><td>${esc(e.approach)}<p>${esc(e.intendedFuel || "Not established")}</p></td><td>${c ? badge(c.category) + `<p>${esc(c.displayText || c.text)}</p>${c.date ? `<p class="detail-meta">${esc(c.dateRole)}: ${esc(c.date)}</p>` : ""}` + citations(c.sourceIds) : "Not established in this record"}</td><td>${t ? badge("Target") + `<p>${esc(t.displayText || t.text)}</p>${t.date ? `<p class="detail-meta">${esc(t.dateRole)}: ${esc(t.date)}</p>` : ""}` + citations(t.sourceIds) : "No included target"}</td><td>${esc(e.displayFundingSummary || e.fundingSummary || "Not established in this record")}<p>${citations(e.funding.flatMap((f) => f.sourceIds).slice(0, 1))}</p></td></tr>`;
        })
        .join("")}</tbody></table></div>`;
  if (view === "funding") funding(entities);
  if (view === "sites") sites(entities);
  if (!entities.length)
    $("#atlas-content").innerHTML =
      '<div class="empty"><h3>No matching organizations</h3><p>Try a broader search or clear the filters</p></div>';
  tray();
  updateURL({
    view: view === "cards" ? "" : view,
    q: $("#atlas-search").value,
    family: $("#filter-family").value,
    fuel: $("#filter-fuel").value,
    role: $("#filter-role").value,
    country: $("#filter-country").value,
    evidence: $("#filter-evidence").value,
  });
}
function funding(entities) {
  const rows = entities.flatMap((e) =>
    e.funding.map((f) => ({ ...f, entity: e })),
  );
  const currencies = [
      ...new Set(rows.map((r) => r.currency).filter(Boolean)),
    ].sort(),
    types = [...new Set(rows.map((r) => r.type))].sort();
  $("#atlas-content").innerHTML =
    `<p class="funding-note">These are financing observations, not cash balances. Cumulative totals include earlier rounds. Revised rounds, conditional commitments, debt, grants, public budgets and valuations remain distinct. No aggregate is calculated.</p><div class="funding-filters"><label>Original currency<select id="fund-currency"><option value="">All currencies</option>${currencies.map((c) => `<option>${esc(c)}</option>`).join("")}</select></label><label>Accounting basis<select id="fund-type"><option value="">All types</option>${types.map((c) => `<option>${esc(c)}</option>`).join("")}</select></label></div><div class="table-scroll" id="fund-table" tabindex="0" role="region" aria-label="Financing observations"></div>`;
  function render() {
    const c = $("#fund-currency").value,
      t = $("#fund-type").value;
    if (!rows.some((r) => (!c || r.currency === c) && (!t || r.type === t))) {
      $("#fund-table").innerHTML =
        '<p class="empty">No financing observations match these filters.</p>';
      return;
    }
    $("#fund-table").innerHTML =
      `<table class="data-table"><thead><tr><th>Organization / date</th><th>Amount as reported</th><th>Type</th><th>Scope, conditions and sources</th></tr></thead><tbody>${rows
        .filter((r) => (!c || r.currency === c) && (!t || r.type === t))
        .map(
          (r) =>
            `<tr><td><button data-entity="${r.entity.id}">${esc(r.entity.name)}</button><br>${esc(r.date || "Undated")}</td><td>${esc(r.amountLabel || "Undisclosed")}</td><td>${esc(human(r.type))}${r.superseded_by ? "<br><b>Superseded amount</b>" : ""}</td><td>${esc(r.displayScope || r.scope)}<p>${citations(r.sourceIds)}</p></td></tr>`,
        )
        .join("")}</tbody></table>`;
  }
  $("#fund-currency").onchange = render;
  $("#fund-type").onchange = render;
  render();
}
let mapSites = [],
  mapClusters = [];
function sites(entities) {
  const ids = new Set(entities.map((e) => e.id));
  mapSites = data.sites.filter(
    (s) =>
      ids.has(s.entityId) ||
      (s.relatedEntityIds || []).some((id) => ids.has(id)),
  );
  const visible = mapSites.filter(
    (s) => s.latitude !== null && s.longitude !== null,
  );
  const grouped = new Map();
  visible.forEach((s) => {
    const key = `${Math.round(s.longitude / 3)},${Math.round(s.latitude / 3)}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(s);
  });
  mapClusters = [...grouped.values()];
  const grid =
    [-120, -60, 0, 60, 120]
      .map(
        (l) =>
          `<line x1="${(l + 180) * 2.5}" x2="${(l + 180) * 2.5}" y1="30" y2="400" stroke="#29404e" stroke-width=".5"/>`,
      )
      .join("") +
    [-60, -30, 0, 30, 60]
      .map(
        (l) =>
          `<line x1="0" x2="900" y1="${(90 - l) * 2.5}" y2="${(90 - l) * 2.5}" stroke="#29404e" stroke-width=".5"/>`,
      )
      .join("");
  const markers = mapClusters
    .map((cluster, i) => {
      const s = cluster[0],
        x =
          cluster.reduce((a, s) => a + (s.longitude + 180) * 2.5, 0) /
          cluster.length,
        y =
          cluster.reduce((a, s) => a + (90 - s.latitude) * 2.5, 0) /
          cluster.length,
        shape = cluster.length > 1 ? "circle" : s.marker_shape,
        color =
          cluster.length > 1
            ? "#e7d9bf"
            : s.role.toLowerCase().includes("plant")
              ? "#ffac77"
              : "#a5d7bd",
        size = cluster.length > 1 ? 9 : 5;
      let icon =
        shape === "square"
          ? `<rect x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" rx="1"/>`
          : shape === "diamond"
            ? `<path d="M${x} ${y - size - 2}l${size + 2} ${size + 2}-${size + 2} ${size + 2}-${size + 2}-${size + 2}Z"/>`
            : shape === "hexagon"
              ? `<path d="M${x - size} ${y}l${size / 2}-${size}h${size}l${size / 2} ${size}-${size / 2} ${size}h-${size}Z"/>`
              : `<circle cx="${x}" cy="${y}" r="${size}"/>`;
      return `<g class="map-marker" data-cluster="${i}" tabindex="0" role="button" aria-label="${esc(cluster.length > 1 ? cluster.length + " site records near " + s.place : s.name + "; " + s.role + "; " + s.status)}" fill="${shape === "diamond" && cluster.length === 1 ? "#142431" : color}" stroke="${color}" stroke-width="1.4" ${cluster.length === 1 && /planned|construction/.test(s.status) ? 'stroke-dasharray="2 1"' : ""}>${icon}${cluster.length > 1 ? `<text x="${x}" y="${y + 3}" text-anchor="middle" fill="#122e27" stroke="none" font-size="9">${cluster.length}</text>` : ""}</g>`;
    })
    .join("");
  $("#atlas-content").innerHTML =
    `<p class="site-note">${mapSites.length} site records for ${entities.length} organizations. Coordinates are approximate city or area centers. ${mapSites.length - visible.length} sites have no selected or supplied position. Select a marker or use the site list.</p><div class="world-map"><svg viewBox="0 25 900 390" role="group" aria-label="Fusion sites, approximate world map. An equivalent site list follows.">${grid}<path d="${world?.path || ""}" fill="#344b56" stroke="#506772" stroke-width=".4"/>${markers}</svg><div class="map-key"><span>● Headquarters</span><span>■ Experiment</span><span>◇ Proposed plant</span><span>⬡ Enabling facility</span><span>Dashed outline: planned / construction</span></div><div class="map-popup" id="map-popup" aria-live="polite">Select a marker to inspect its sites. Numbered markers group nearby site records. One location can have more than one role.</div><p class="quiet">Map outline: <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth · public domain</a>. Site positions: research snapshot.</p></div><div class="site-list" id="site-list">${mapSites.map(siteRow).join("")}</div>`;
  $("#result-count").textContent =
    `${mapSites.length} site records · ${entities.length} organizations · funding is counted per organization, never per marker`;
}
function siteRow(s) {
  return `<article class="site-row" data-site-row="${s.id}"><button data-site="${s.id}">${esc(s.name)}</button><p>${esc(s.role)} · ${esc(s.status)}</p><p>${esc(s.place || "Location not selected")}</p><p>${s.latitude === null ? "Coordinates not established" : `Approximate: ${s.latitude.toFixed(2)}°, ${s.longitude.toFixed(2)}°`}</p>${citations(s.sourceIds)}</article>`;
}
function selectCluster(i) {
  const sites = mapClusters[i];
  $("#map-popup").innerHTML = sites
    .map((s) => `<button data-site="${s.id}">${esc(s.name)}</button>`)
    .join(" ");
  $$("[data-site-row]").forEach((r) =>
    r.classList.toggle(
      "selected",
      sites.some((s) => s.id === r.dataset.siteRow),
    ),
  );
  const first = $(`[data-site-row="${sites[0].id}"]`);
  $("#site-list").scrollTop = first.offsetTop - $("#site-list").offsetTop;
}
function tray() {
  const list = [...comparison].map((id) => entityMap.get(id)).filter(Boolean);
  $("#comparison-tray").hidden = !list.length;
  $("#comparison-tray").innerHTML =
    `<span>${list.length}/3 selected · ${list.map((e) => esc(e.name)).join(" · ")}</span><span><button data-open="comparison">Compare evidence ↗</button> <button id="clear-compare">Clear</button></span>`;
  updateURL({ compare: list.map((e) => e.id).join(",") });
}
function entityDetail(id) {
  const e = entityMap?.get(id);
  if (!e) return;
  const m = machineId(e);
  updateURL({ entity: e.id });
  modal(
    "ORGANIZATION FIELD NOTES",
    `<div class="detail-meta">${esc(human(e.role))} · snapshot 22 Oct 2026</div><h2>${esc(e.name)}</h2><p>${esc(e.displaySummary || e.summary)}</p>${m ? '<section class="company-reactor"><div class="reactor-slot" id="entity-reactor"></div></section>' : infrastructure(e)}<h3>How it works</h3><p>${esc(e.mechanism)}</p>${m ? `<button data-goto-machine="${m}" data-fast="${m === "direct-laser" && (/fast/.test(e.variant) || e.canonicalId === "hb11")}">Explore this mechanism ↗</button>` : ""}<div class="methodology-grid" style="margin-top:25px;gap:30px"><div><h4>Experimental fuel / status</h4><p>${esc(e.displayExperimentalFuel || e.experimentalFuel || "Not established in this record")}</p></div><div><h4>Intended commercial fuel</h4><p>${esc(e.intendedFuel || "Not established in this record")}</p></div></div><h3>Evidence ledger</h3>${e.claims.map((c) => `<div class="ledger">${badge(c.category)}<p>${esc(c.displayText || c.text)}</p>${c.date ? `<p class="detail-meta">${esc(c.dateRole)}: ${esc(c.date)}</p>` : ""}${citations(c.sourceIds)}</div>`).join("")}<h3>Locations</h3>${e.locations.map((s) => `<div class="ledger"><h4>${esc(s.name)}</h4><p>${esc(s.role)} · ${esc(s.status)}<br>${esc(s.place || "Site not selected")}</p>${citations(s.sourceIds)}</div>`).join("")}<h3>Financing</h3><p>${esc(e.displayFundingSummary || e.fundingSummary || "Not established in this record")}</p>${e.funding.map((f) => `<div class="ledger"><b>${esc(f.amountLabel)} · ${esc(human(f.type))}</b><p>${esc(f.date || "Undated")} · ${esc(f.displayScope || f.scope)}</p>${citations(f.sourceIds)}</div>`).join("")}<h3>Assessment · what remains</h3>${e.assessment.map((a) => `<div class="ledger"><p>${esc(a.displayText || a.text)}</p>${citations(a.sourceIds)}</div>`).join("")}<p class="quiet">Public evidence may be incomplete. Company announcements are attributed, and future targets remain separate from measured results.</p>`,
  );
  if (m) {
    const options = getEntityReactorOptions(e);
    mountReactor($("#entity-reactor"), options?.id || m, options || {});
  }
}
function compareDetail(fundingView = false) {
  const list = [...comparison].map((id) => entityMap.get(id)).filter(Boolean);
  modal(
    "SIDE-BY-SIDE EVIDENCE",
    `<h2>Compare the evidence</h2><p>Each column preserves the type of evidence and its scope. No overall score or ranking is implied.</p><div class="segmented"><button data-compare-view="evidence" aria-pressed="${!fundingView}" class="${!fundingView ? "active" : ""}">Evidence and remaining questions</button><button data-compare-view="funding" aria-pressed="${fundingView}" class="${fundingView ? "active" : ""}">Financing observations</button></div><div class="comparison-grid" style="--columns:${list.length}">${list
      .map(
        (e) =>
          `<article><h3>${esc(e.name)}</h3><p>${esc(e.approach)}</p>${
            fundingView
              ? e.funding
                  .map(
                    (f) =>
                      `<div class="ledger"><strong>${esc(f.amountLabel)} · ${esc(human(f.type))}</strong><p>${esc(f.date)} · ${esc(f.displayScope || f.scope)}</p>${citations(f.sourceIds)}</div>`,
                  )
                  .join("")
              : data.riskThemes
                  .map((t) => {
                    const notes = e.assessment.filter((a) =>
                      (a.theme_ids || []).includes(t.id),
                    );
                    return `<h4>${esc(t.label)}</h4><p>${esc(t.question)}</p>${notes.length ? notes.map((a) => `<p><strong>Assessment:</strong> ${esc(a.displayText || a.text)}</p>${citations(a.sourceIds)}`).join("") : "<p>No separate assessment for this question is included in the snapshot. The reported evidence appears below.</p>"}`;
                  })
                  .join("") +
                `<h4>Included evidence</h4>${e.claims.map((c) => `<div class="ledger">${badge(c.category)}<p>${esc(c.displayText || c.text)}</p>${c.date ? `<p class="detail-meta">${esc(c.dateRole)}: ${esc(c.date)}</p>` : ""}${citations(c.sourceIds)}</div>`).join("")}`
          }</article>`,
      )
      .join("")}</div>`,
  );
}
function sourceDetail(id) {
  const s = sourceMap?.get(id);
  if (!s) return;
  sourceFocus = document.activeElement;
  $("#source-content").innerHTML =
    `<div class="detail-meta">Reference ${sourceNumbers.get(id)} · ${esc(human(s.type))}</div><h2 id="source-title">${esc(s.title)}</h2><p>${esc(s.publisher)}</p><p>Published: ${esc(s.published || "Undated live page")}<br>Reviewed for the snapshot: ${esc(s.reviewed || "2026-10-22")}</p><p>${esc(s.note || s.description || "")}</p><p><a href="${esc(s.url)}" target="_blank" rel="noopener">Open the original source ↗</a></p><p class="quiet">Dataset reference: ${esc(s.id)}. A company announcement documents what the company reports; it is not independent verification.</p>`;
  $("#close-source").textContent = $("#detail-dialog").open
    ? "Back to details ×"
    : "Close ×";
  $("#source-dialog").showModal();
  $("#source-dialog").scrollTop = 0;
  $("#close-source").focus();
}
let showAllSources = false;
function sourceList() {
  if (!data) return;
  const q = $("#source-search").value.trim().toLowerCase();
  const items = data.sources.filter((s) =>
    [s.id, s.title, s.publisher, s.type].join(" ").toLowerCase().includes(q),
  );
  $("#source-list").innerHTML =
    `<p class="quiet" role="status">${items.length} matching sources${items.length > 16 && !showAllSources ? " · showing the first 16" : ""}</p>` +
    items
      .slice(0, showAllSources ? items.length : 16)
      .map(
        (s) =>
          `<div class="source-row" id="source-${s.id}"><span>[${sourceNumbers.get(s.id)}]<br>${esc(s.publisher)}</span><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a><button data-source="${s.id}" aria-label="Details for ${esc(s.title)}">Details</button></div>`,
      )
      .join("") +
    (items.length > 16
      ? `<button id="show-all-sources">${showAllSources ? "Show fewer sources" : "Show all " + items.length + " sources ↓"}</button>`
      : "");
}
function riskQuestions() {
  $("#risk-questions").innerHTML = data.riskThemes
    .map(
      (t, i) =>
        `<details class="risk-item"><summary><span><span class="number">0${i + 1}</span>${esc(t.label)}</span></summary><p><strong>${esc(t.question)}</strong></p>${data.risks
          .filter((r) => t.dimension_ids.includes(r.id))
          .map(
            (r) =>
              `<h4>${esc(r.name)}</h4><p>${esc(r.interpretation)}</p><p>Evidence to look for: ${esc(r.evidenceNeeded)}</p><div class="citation">${citations(r.sourceIds)}</div>`,
          )
          .join("")}</details>`,
    )
    .join("");
}
function historyDetail() {
  modal(
    "SELECTED HISTORY",
    `<h2>Fusion research timeline</h2><p>Selected events, with original date precision and event type. Announced plans remain targets after their dates pass.</p><div style="margin-top:30px">${data.history.map((h) => `${/target/i.test(h.category) && h.id === data.history.find((x) => /target/i.test(x.category))?.id ? '<h3 class="snapshot-divider">Snapshot · 22 October 2026</h3><p class="quiet">ANNOUNCED PLANS · No achievement implied</p>' : ""}<article class="history-event ${/target/i.test(h.category) ? "planned" : ""}"><strong>${esc(h.date)} · ${esc(human(h.dateRole))}</strong><h4>${esc(h.title)}</h4>${badge(h.category)}<p>${esc(h.displayText || h.text)}</p>${citations(h.sourceIds)}</article>`).join("")}</div>`,
  );
}
function glossaryDetail() {
  modal(
    "FUSION GLOSSARY",
    `<h2>Terms used in this guide</h2><div class="glossary-grid">${data.glossary.map((g) => `<article class="ledger"><h3>${esc(g.term)}</h3><p>${esc(g.definition)}</p><p class="quiet"><strong>Distinction:</strong> ${esc(g.distinction)}</p>${citations(g.sourceIds)}</article>`).join("")}</div>`,
  );
}
function fuelDetail() {
  modal(
    "FUEL CHOICES",
    `<h2>Fusion fuels</h2><div class="fuel-grid">${data.fuels.map((f) => `<article><h3>${esc(f.name)}</h3><p><strong>${esc(f.label)}</strong></p><p>${esc(f.benefits)}</p><p><strong>The difficulty:</strong> ${esc(f.challenges)}</p>${citations(f.sourceIds)}</article>`).join("")}</div>`,
  );
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button,[data-cluster]");
  if (!b) return;
  if (b.dataset.reaction !== undefined) {
    stopReaction();
    reactionStage = +b.dataset.reaction;
    reaction();
  }
  if (b.dataset.machineStage !== undefined) {
    stopMachine();
    machineStage = +b.dataset.machineStage;
    machine();
  }
  if (b.dataset.boundary !== undefined) {
    boundary = +b.dataset.boundary;
    boundaries();
  }
  if (b.dataset.mode) {
    scenario = { ...defaults[b.dataset.mode] };
    calcControls();
  }
  if (b.dataset.view) {
    view = b.dataset.view;
    atlas();
  }
  if (b.dataset.infraIndex !== undefined) {
    const c = getInfrastructureContent(entityMap.get(b.dataset.infraEntity)),
      root = b.closest(".infrastructure-visual");
    root.querySelector(".infrastructure-detail").textContent =
      c.stages[+b.dataset.infraIndex].text;
    root.querySelectorAll("[data-infra-index]").forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", x === b);
    });
  }
  if (b.dataset.entity) entityDetail(b.dataset.entity);
  if (b.dataset.source) sourceDetail(b.dataset.source);
  if (b.dataset.open === "diagram") {
    const a = approaches.find((a) => a.id === approach);
    modal(
      "MECHANISM DETAIL",
      `<h2>${esc(a.name)}</h2><div class="expanded-cycle">${renderMachine(a.id, machineStage, { fastIgnition })}</div><h3>${esc(a.stages[machineStage].title)}</h3><p>${esc(a.stages[machineStage].text)}</p><p class="quiet">Conceptual diagram · not to scale</p>${citations(getReactorContent(a.id, { fastIgnition }).sourceIds)}`,
    );
  }
  if (b.dataset.open === "glossary" && data) glossaryDetail();
  if (b.dataset.open === "fuels" && data) fuelDetail();
  if (b.dataset.open === "history" && data) historyDetail();
  if (b.dataset.open === "comparison") compareDetail();
  if (b.dataset.compareView) compareDetail(b.dataset.compareView === "funding");
  if (b.id === "show-all-cards") {
    showAllCards = !showAllCards;
    atlas();
    $("#show-all-cards")?.focus({ preventScroll: true });
  }
  if (b.id === "show-all-sources") {
    showAllSources = !showAllSources;
    sourceList();
    $("#show-all-sources")?.focus({ preventScroll: true });
  }
  if (b.id === "clear-compare") {
    comparison.clear();
    atlas();
  }
  if (b.dataset.gotoMachine) {
    fastIgnition = b.dataset.fast === "true";
    updateURL({ variant: fastIgnition ? "fast-ignition" : "" });
    $("#detail-dialog").close();
    selectMachine(b.dataset.gotoMachine);
    location.hash = "machines";
  }
  if (b.dataset.cluster !== undefined) selectCluster(+b.dataset.cluster);
  if (b.dataset.site) {
    const s = data.sites.find((s) => s.id === b.dataset.site);
    modal(
      "SITE FIELD NOTES",
      `<h2>${esc(s.name)}</h2><p>${esc(s.role)} · ${esc(s.status)}</p><p>${esc(s.place || "Location not selected")}</p><p>${s.latitude === null ? "No coordinates established." : `Approximate area center: ${s.latitude.toFixed(2)}°, ${s.longitude.toFixed(2)}°. Not a surveyed facility boundary.`}</p>${citations(s.sourceIds)}<p><button data-entity="${s.entityId}">Open organization notes ↗</button></p>`,
    );
  }
});
document.addEventListener("keydown", (e) => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.matches("[data-cluster]")
  ) {
    e.preventDefault();
    selectCluster(+e.target.dataset.cluster);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.compare) {
    const id = e.target.dataset.compare;
    if (e.target.checked) {
      if (comparison.size >= 3) {
        e.target.checked = false;
        toast("Choose up to three organizations.");
        return;
      }
      comparison.add(id);
    } else comparison.delete(id);
    tray();
  }
});
$("#atlas-search").oninput = atlas;
["family", "fuel", "role", "country", "evidence"].forEach(
  (k) => ($("#filter-" + k).onchange = atlas),
);
$("#clear-filters").onclick = () => {
  $("#atlas-search").value = "";
  ["family", "fuel", "role", "country", "evidence"].forEach(
    (k) => ($("#filter-" + k).value = ""),
  );
  atlas();
};
$("#source-search").oninput = () => {
  showAllSources = false;
  sourceList();
};
async function init() {
  reaction();
  boundaries();
  const options = approaches
    .map((a) => `<option value="${a.id}">${esc(a.name)}</option>`)
    .join("");
  $("#approach-select").innerHTML = options;
  $("#second-approach").innerHTML = options;
  $("#second-approach").value = "stellarator";
  $("#hero-machine").innerHTML = renderMachine("tokamak", 3);
  machine();
  calcControls();
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw Error("Dataset failed to load");
    data = await response.json();
    sourceMap = new Map(data.sources.map((s) => [s.id, s]));
    sourceNumbers = new Map(data.sources.map((s, i) => [s.id, i + 1]));
    entityMap = new Map(data.entities.map((e) => [e.id, e]));
    comparison = new Set(
      [...comparison]
        .map((id) =>
          entityMap.has(id)
            ? id
            : data.entities.find((e) => e.canonicalId === id)?.id,
        )
        .filter(Boolean)
        .slice(0, 3),
    );
    $("#atlas-stats").innerHTML =
      `<span><b>${data.entities.filter((e) => e.role !== "public").length}</b>companies & suppliers</span><span><b>${data.entities.filter((e) => e.role === "public").length}</b>public programmes</span><span><b>${data.sources.length}</b>sources</span>`;
    $("#filter-family").innerHTML += [
      ...new Set(data.entities.map((e) => e.family)),
    ]
      .sort()
      .map((v) => `<option value="${esc(v)}">${esc(human(v))}</option>`)
      .join("");
    $("#filter-country").innerHTML += [
      ...new Set(data.sites.map((s) => s.country).filter(Boolean)),
    ]
      .sort()
      .map((v) => `<option>${esc(v)}</option>`)
      .join("");
    $("#filter-evidence").innerHTML += [
      ...new Set(data.entities.flatMap((e) => e.claims.map((c) => c.category))),
    ]
      .sort()
      .map((v) => `<option>${esc(v)}</option>`)
      .join("");
    $("#atlas-search").value = params.get("q") || "";
    ["family", "fuel", "role", "country", "evidence"].forEach(
      (k) => ($("#filter-" + k).value = params.get(k) || ""),
    );
    $$("[data-cites]").forEach(
      (el) => (el.innerHTML = citations(el.dataset.cites.split(" "))),
    );
    machine();
    calcControls();
    records();
    atlas();
    riskQuestions();
    sourceList();
    // Map artwork is optional: a failed map download must not hide the atlas.
    fetch("./assets/world.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((map) => {
        world = map;
        if (view === "sites" && selectedEntities().length)
          sites(selectedEntities());
      })
      .catch(() => {});
    for (const mount of reactorMounts.values()) mount.view?.refreshSources();
    $("#history-milestones").innerHTML = [
      "phy_history_1934",
      "phy_history_1957",
      "phy_history_1997",
      "phy_history_2021",
      "phy_history_2022",
      "phy_history_nif2025",
    ]
      .map((id) => data.history.find((h) => h.id === id))
      .map(
        (h) =>
          `<article><span>${h.date.slice(0, 4)}</span><h4>${esc(h.title)}</h4><p>${esc(h.dateRole)}</p><div class="citation">${citations(h.sourceIds.slice(0, 1))}</div></article>`,
      )
      .join("");
    const eid = params.get("entity");
    if (eid)
      entityDetail(
        entityMap.has(eid)
          ? eid
          : data.entities.find((e) => e.canonicalId === eid)?.id,
      );
  } catch (e) {
    console.error(e);
    $("#atlas-content").innerHTML =
      '<p>The dataset could not load. Reload this page, or <a href="./fusion_atlas.json">download the canonical dataset</a>.</p>';
  }
}
init();

// Keep reading position and motion predictable when a reader leaves a chapter.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopReaction();
    stopMachine();
  }
});
const chapterMotionObserver = new IntersectionObserver((entries) => {
  for (const e of entries)
    if (!e.isIntersecting) {
      if (e.target.id === "learn") stopReaction();
      if (e.target.id === "machines") stopMachine();
    }
});
chapterMotionObserver.observe($("#learn"));
chapterMotionObserver.observe($("#machines"));
const cycle = $(".operating-cycle");
cycle.addEventListener("toggle", () => {
  if (!cycle.open) stopMachine();
});
let chapterFrame = 0;
function markChapter() {
  chapterFrame = 0;
  const sections = $$("main > section[id]");
  const current = sections
    .filter(
      (s) =>
        s.getBoundingClientRect().top < $(".site-header").offsetHeight + 180,
    )
    .at(-1)?.id;
  $$(".site-header nav a").forEach((a) => {
    if (a.hash === "#" + current) a.setAttribute("aria-current", "location");
    else a.removeAttribute("aria-current");
  });
}
addEventListener(
  "scroll",
  () => {
    if (!chapterFrame) chapterFrame = requestAnimationFrame(markChapter);
  },
  { passive: true },
);
addEventListener("resize", markChapter);
markChapter();
