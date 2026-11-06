import { torusPoint, torusPointVisible } from "./schematic-torus.js";
/** Original editable fusion mechanism drawings. Schematic geometry, never to scale. */
export const approaches = [
  {
    id: "tokamak",
    name: "Tokamak",
    family: "Magnetic",
    tagline: "A magnetic bottle, bent into a ring.",
    description:
      "External coils and a current flowing through the plasma together produce a twisting magnetic field. High-temperature superconductors are a magnet technology, not a separate confinement family.",
    stages: [
      {
        title: "Energize the coils",
        text: "External toroidal-field coils surround a ring-shaped vacuum chamber. A central solenoid helps induce current in the plasma.",
      },
      {
        title: "Drive a plasma current",
        text: "The plasma current contributes a second magnetic field. Together, the fields wrap helically around the torus.",
      },
      {
        title: "Heat and confine",
        text: "External heating raises the temperature. Charged fusion products can then help heat the fuel; magnetic field lines guide charged-particle motion.",
      },
      {
        title: "Handle the exhaust",
        text: "An exhaust region called the divertor receives particles and heat. A proposed D–T plant also needs a blanket to capture neutron energy and breed tritium.",
      },
    ],
    constraint:
      "Current drive, disruptions, exhaust heat and neutron-resistant components must work together in a power plant.",
  },
  {
    id: "spherical",
    name: "Spherical tokamak",
    family: "Magnetic",
    tagline: "The same idea, with a much tighter waist.",
    description:
      "A tokamak variant with an elongated plasma and a small central hole. Its central column must fit magnets, support and protection into a particularly constrained space.",
    stages: [
      {
        title: "Build a compact field",
        text: "The coils wrap a tall, cored-apple-shaped plasma chamber around a narrow central column.",
      },
      {
        title: "Establish the current",
        text: "Plasma current combines with the external field to produce the confining magnetic geometry.",
      },
      {
        title: "Heat the plasma",
        text: "Heating and current-drive systems must maintain useful plasma conditions while controlling instabilities.",
      },
      {
        title: "Protect the center",
        text: "The compact center column shares limited space between magnets, shielding and structural support. Exhaust and blanket engineering remain essential.",
      },
    ],
    constraint:
      "A smaller central hole changes the engineering tradeoffs; compact size alone does not establish cheaper electricity.",
  },
  {
    id: "stellarator",
    name: "Stellarator",
    family: "Magnetic",
    tagline: "Put the twist in the magnets.",
    description:
      "A three-dimensional external field confines the plasma without relying on a tokamak-sized plasma current. This generic shaped-coil sketch is not the geometry of every stellarator: Thea proposes arrays of planar coils.",
    stages: [
      {
        title: "Shape the external field",
        text: "Precisely arranged magnets create a three-dimensional magnetic geometry around a closed plasma path.",
      },
      {
        title: "Fill the twisted volume",
        text: "The plasma follows a shaped magnetic volume. A field line is not a rigid wall or the literal orbit of one particle.",
      },
      {
        title: "Sustain the heating",
        text: "External heating maintains the plasma; the approach is attractive for sustained operation without large driven plasma current.",
      },
      {
        title: "Extract heat continuously",
        text: "A plant still needs exhaust, blankets, cooling and maintenance access around its intricate magnetic geometry.",
      },
    ],
    constraint:
      "Precision manufacturing and access must coexist with good confinement, exhaust handling and a viable blanket.",
  },
  {
    id: "mirror",
    name: "Magnetic mirror",
    family: "Magnetic",
    tagline: "An open bottle with stronger fields at its ends.",
    description:
      "A long magnetic chamber has stronger fields at both throats. Some charged particles reflect; others escape along the open ends, where energy recovery may be possible.",
    stages: [
      {
        title: "Make two magnetic throats",
        text: "Strong end magnets narrow the bundle of field lines at either end of the chamber.",
      },
      {
        title: "Heat the central plasma",
        text: "Injectors and heating systems sustain hot plasma between the high-field ends.",
      },
      {
        title: "Manage escaping particles",
        text: "Particles with some combinations of velocity can escape through the ends. Reducing these losses is central to confinement.",
      },
      {
        title: "Recover some end-loss energy",
        text: "A proposed collector can recover energy from escaping charged particles. Energy recovery and sufficient fusion confinement are separate demonstrations.",
      },
    ],
    constraint:
      "The open geometry makes access attractive, but end losses must fit within an integrated positive power balance.",
  },
  {
    id: "dipole",
    name: "Levitated dipole",
    family: "Magnetic",
    tagline: "Suspend a magnet inside its own plasma.",
    description:
      "A superconducting ring levitates inside a vacuum chamber, and the plasma surrounds its dipole field. The internal magnet must stay cold and protected in a future plant.",
    stages: [
      {
        title: "Levitate the ring",
        text: "An external levitation system supports a superconducting ring inside the vacuum chamber.",
      },
      {
        title: "Create a dipole field",
        text: "The internal ring creates nested field geometry around itself. The magnet sits inside the chamber, unlike the external coils of a tokamak.",
      },
      {
        title: "Heat the surrounding plasma",
        text: "Plasma occupies the field around the ring. Confinement must be demonstrated under the required plasma conditions.",
      },
      {
        title: "Protect the internal magnet",
        text: "Cooling, shielding and ring protection become demanding in a D–T plant. OpenStar’s Junior prototype and proposed Tama Nui plant are distinct evidence stages.",
      },
    ],
    constraint:
      "A cold superconducting magnet must survive inside a hot, neutron-producing reactor chamber.",
  },
  {
    id: "beam-frc",
    name: "Beam-sustained FRC",
    family: "Magnetic",
    tagline: "Keep a compact plasma spinning with beams.",
    description:
      "A field-reversed configuration is a compact plasma with a reversed internal field. Neutral beams add energetic particles to help heat and sustain it; TAE’s long-term fuel ambition is proton–boron.",
    stages: [
      {
        title: "Form a compact configuration",
        text: "A field-reversed plasma forms in the central chamber, with a boundary called the separatrix.",
      },
      {
        title: "Inject energetic particles",
        text: "Neutral beams enter the magnetic configuration, adding energetic particles and heat.",
      },
      {
        title: "Sustain the FRC",
        text: "Continued injection helps support the plasma population and configuration. This is distinct from a repeated colliding-plasma compression cycle.",
      },
      {
        title: "Control the operating state",
        text: "Useful performance requires sustained confinement, plasma stability and an adequate power balance including beam demand.",
      },
    ],
    constraint:
      "Beam power, confinement and the much harder p–B11 fuel-performance requirement must close an integrated energy balance.",
  },
  {
    id: "pulsed-frc",
    name: "Pulsed FRC",
    family: "Magneto-inertial",
    tagline: "Form. Merge. Compress. Recover. Repeat.",
    description:
      "Two field-reversed plasmas are accelerated together and compressed. A proposed power cycle recovers electricity during expansion; recovery of supplied energy must be distinguished from energy added by fusion.",
    stages: [
      {
        title: "Form two plasmas",
        text: "Separate formation sections create compact field-reversed plasma configurations.",
      },
      {
        title: "Accelerate and merge",
        text: "Magnetic coils accelerate the configurations toward the central region, where they merge.",
      },
      {
        title: "Compress the merged plasma",
        text: "A magnetic pulse compresses and heats the central plasma. These frames slow the process down and do not represent its physical timing.",
      },
      {
        title: "Expand and recover",
        text: "Expanding plasma couples energy back to the circuit. Recovered input and fusion-added energy require separate full-cycle accounting. Helion’s intended fuel cycle is D–He3.",
      },
    ],
    constraint:
      "Net output must exceed every input over a complete cycle with the same initial and final stored-energy state.",
  },
  {
    id: "z-pinch",
    name: "Sheared-flow Z-pinch",
    family: "Magnetic",
    tagline: "Let the plasma current do the squeezing.",
    description:
      "A strong axial current generates an encircling magnetic field that pinches the plasma. Axial flow varies across the plasma to help stabilize the column.",
    stages: [
      {
        title: "Establish axial flow",
        text: "Plasma flows between electrodes. The flow speed varies across the column: this velocity shear is part of the stabilization strategy.",
      },
      {
        title: "Drive axial current",
        text: "Current runs along the plasma and creates a magnetic field that encircles it.",
      },
      {
        title: "Pinch the column",
        text: "The self-generated magnetic field compresses the plasma. Flow, current and field are different quantities shown separately.",
      },
      {
        title: "Exhaust and reset",
        text: "The system must repeat while electrodes, chamber surfaces and heat-removal systems survive.",
      },
    ],
    constraint:
      "Sheared flow addresses instability; it does not establish that all instabilities or plant engineering challenges are solved.",
  },
  {
    id: "magnetized-target",
    name: "Magnetized target",
    family: "Magneto-inertial",
    tagline: "Start with a magnetic plasma. Then squeeze it.",
    description:
      "A magnetized plasma enters a chamber, where a moving liner rapidly compresses it. This generic liner sketch is not an LM26 device drawing or a specific commercial liquid-metal architecture.",
    stages: [
      {
        title: "Form the magnetized target",
        text: "An injector forms a plasma with an embedded magnetic field.",
      },
      {
        title: "Load the compression chamber",
        text: "The magnetized plasma enters the chamber before the compression event.",
      },
      {
        title: "Move the liner inward",
        text: "A mechanical compression system drives the surrounding material inward, raising plasma density and temperature.",
      },
      {
        title: "Capture heat and reset",
        text: "A proposed plant captures heat, clears or resets the chamber and repeats the cycle. LM26 test geometry differs from a future commercial liquid-wall system.",
      },
    ],
    constraint:
      "Compression scaling, plasma behavior, repeatability, heat conversion and reset must be demonstrated together.",
  },
  {
    id: "indirect-laser",
    name: "Indirect-drive laser",
    family: "Inertial",
    tagline: "Laser light becomes X-rays. X-rays squeeze fuel.",
    description:
      "Lasers enter a cavity called a hohlraum and heat its walls. The resulting X-rays compress a tiny fuel capsule. This is the drive mechanism behind NIF’s ignition experiments.",
    stages: [
      {
        title: "Position the target",
        text: "A fuel capsule sits inside a hohlraum.",
      },
      {
        title: "Heat the hohlraum",
        text: "Lasers enter through openings and strike the cavity walls, rather than directly illuminating the fuel capsule.",
      },
      {
        title: "Compress with X-rays",
        text: "X-rays from the heated walls ablate the capsule’s outer layer. The reaction force implodes the fuel.",
      },
      {
        title: "Burn, clear and replace",
        text: "A successful implosion can produce a brief fusion burn. A power plant must capture heat, clear the chamber and inject a new target at a high repetition rate.",
      },
    ],
    constraint:
      "Target gain is only one boundary: driver efficiency, target production, repetition rate and plant loads also determine net power.",
  },
  {
    id: "direct-laser",
    name: "Direct-drive laser",
    family: "Inertial",
    tagline: "Light directly compresses a tiny fuel capsule.",
    description:
      "Laser beams illuminate the capsule, driving ablation and compression. Fast ignition is a specific variant with a separate ignition pulse; Marvel’s near-term fuel is D–T, while HB11 pursues laser p–B11 fast ignition.",
    stages: [
      {
        title: "Inject the capsule",
        text: "A precisely manufactured target enters the chamber.",
      },
      {
        title: "Illuminate symmetrically",
        text: "Multiple laser beams illuminate the capsule directly; uniform drive helps make the implosion symmetric.",
      },
      {
        title: "Compress the fuel",
        text: "The capsule’s outer layer blows outward and the remaining fuel implodes inward. Fast-ignition designs add a separate ignition stage after compression.",
      },
      {
        title: "Burn and replace",
        text: "Fusion energy leaves the target. Proposed power systems must protect optics, clear the chamber and supply fresh targets repeatedly. EX-Fusion describes a separate fast-ignition laser.",
      },
    ],
    constraint:
      "Compression, ignition, efficient drivers and repeated target operation must be proven at compatible operating conditions.",
  },
  {
    id: "hybrid-laser",
    name: "Hybrid direct-drive laser",
    family: "Inertial",
    tagline: "An X-ray start. A direct-laser finish.",
    description:
      "Xcimer’s proposed hybrid direct-drive sequence starts with a hohlraum-generated X-ray stage and later uses direct laser drive. It is distinct from both ordinary NIF indirect drive and fast ignition.",
    stages: [
      {
        title: "Load a hybrid target",
        text: "A capsule begins inside a hohlraum with two-sided laser access.",
      },
      {
        title: "Begin with X-ray drive",
        text: "Early laser energy heats the hohlraum. X-rays drive the initial compression stage.",
      },
      {
        title: "Switch to direct drive",
        text: "Later laser light directly drives the capsule. The two stages are designed as one hybrid implosion sequence.",
      },
      {
        title: "Complete the proposed burn",
        text: "The intended compressed target produces fusion energy. The proposed target and driver must validate gain experimentally before a plant cycle is established.",
      },
    ],
    constraint:
      "Hybrid target behavior, optical coupling, efficient large drivers and repetition remain linked demonstrations.",
  },
  {
    id: "hybrid-ignition",
    name: "Hybrid fast ignition",
    family: "Inertial",
    tagline: "Separate the squeeze from the spark.",
    description:
      "First Light’s FLARE develops a D–T fuel system with electrical multi-shell compression and a distinct rapid ignition stage. Major driver and reactor systems involve partners; this is not its old projectile concept.",
    stages: [
      {
        title: "Prepare the fuel module",
        text: "The fuel system contains a multi-shell target.",
      },
      {
        title: "Compress electrically",
        text: "An electrical driver compresses the multi-shell target before ignition.",
      },
      {
        title: "Apply separate ignition",
        text: "A distinct rapid ignition stage is intended to start the burn in the compressed fuel. The stages are separate; no MagLIF premagnetization is implied.",
      },
      {
        title: "Integrate the plant cycle",
        text: "The fuel system must integrate with partner drivers and heat-capture systems. FLARE’s modeled gain and compression-test evidence are not demonstrated ignition or gain.",
      },
    ],
    constraint:
      "A compression result must be followed by validated ignition, gain and integration with the complete driver and plant.",
  },
  {
    id: "pulsed-power",
    name: "Pulsed-power inertial",
    family: "Inertial",
    tagline: "Turn stored electricity into a violent squeeze.",
    description:
      "Capacitor modules deliver an intense electrical pulse that compresses a target or liner. Pacific Fusion, Fuse and Sandia’s MagLIF use distinct architectures; this drawing shows only the generic power-to-compression sequence.",
    stages: [
      {
        title: "Charge the modules",
        text: "Energy is stored electrically across pulsed-power modules.",
      },
      {
        title: "Deliver the current pulse",
        text: "Transmission lines deliver a brief, very high-current pulse to the target assembly.",
      },
      {
        title: "Compress the target",
        text: "Magnetic pressure from the current compresses the liner or target. Some specific architectures add preheat or premagnetization; neither is universal.",
      },
      {
        title: "Capture heat and replace",
        text: "A proposed power plant captures the fusion pulse and replaces target components for the next shot. Fuse’s existing neutron-testing hardware is distinct from its proposed energy plant.",
      },
    ],
    constraint:
      "Driver efficiency, target coupling, replaceable hardware and high repetition must produce a positive full-plant balance.",
  },
  {
    id: "electrostatic",
    name: "Electrostatic compact",
    family: "Alternative",
    tagline: "Accelerate ions through electric fields.",
    description:
      "Electric fields accelerate and confine ions toward an intended collision region. Avalanche’s crossed-field Orbitron concept also uses magnetic electron confinement.",
    stages: [
      {
        title: "Apply the fields",
        text: "Electrodes establish a high electric potential inside a compact vacuum chamber.",
      },
      {
        title: "Accelerate the ions",
        text: "Electric fields accelerate charged ions. The drawn tracks indicate a proposed confinement concept, not simulated particle trajectories.",
      },
      {
        title: "Create a collision region",
        text: "The design seeks enough fusion-producing collisions while limiting losses. Magnetic assistance is used where specified by the actual design.",
      },
      {
        title: "Account for every loss",
        text: "Electrode, radiation, collision and electrical losses must fit the complete energy balance. Compact hardware alone does not demonstrate net gain.",
      },
    ],
    constraint:
      "High-voltage hardware and neutron production are subsystem evidence; a net-energy system requires a broader demonstration.",
  },
];

const C = {
  ink: "#101c29",
  line: "#405665",
  cream: "#eee9df",
  muted: "#9caeb8",
  plasma: "#ff925c",
  field: "#69baff",
  energy: "#9ee4cb",
  white: "#fff3d5",
};
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const n = (x) => Math.round(x * 100) / 100;
const path = (d, cls = "machine-metal", extra = "") =>
  `<path d="${d}" class="${cls}" ${extra}/>`;
const ellipse = (cx, cy, rx, ry, cls = "machine-metal", extra = "") =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="${cls}" ${extra}/>`;
const circle = (cx, cy, r, cls = "machine-metal", extra = "") =>
  ellipse(cx, cy, r, r, cls, extra);
const rect = (x, y, w, h, cls = "machine-metal", rx = 0, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}" ${extra}/>`;
const text = (x, y, value, cls = "machine-label", extra = "") =>
  `<text x="${x}" y="${y}" class="${cls}" ${extra}>${esc(value)}</text>`;
const line = (x, y, x2, y2, cls = "machine-metal", extra = "") =>
  path(`M${x} ${y}L${x2} ${y2}`, cls, extra);
const group = (content, opacity = 1, extra = "") =>
  `<g opacity="${opacity}" ${extra}>${content}</g>`;
const leader = (d, x, y, label, cls = "machine-label", extra = "") =>
  path(d, "machine-leader") + text(x, y, label, cls, extra);
const pointsPath = (pts) =>
  pts.map((p, i) => `${i ? "L" : "M"}${n(p[0])} ${n(p[1])}`).join(" ");
const samples = (fn, count = 96, start = 0, end = Math.PI * 2) =>
  Array.from({ length: count + 1 }, (_, i) =>
    fn(start + ((end - start) * i) / count),
  );
function arrow(x, y, x2, y2, color = C.energy, width = 2) {
  const angle = Math.atan2(y2 - y, x2 - x),
    size = 7;
  return path(
    `M${x} ${y}L${x2} ${y2}M${n(x2 - Math.cos(angle - 0.48) * size)} ${n(y2 - Math.sin(angle - 0.48) * size)}L${x2} ${y2}L${n(x2 - Math.cos(angle + 0.48) * size)} ${n(y2 - Math.sin(angle + 0.48) * size)}`,
    "",
    `fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`,
  );
}
function particles(cx, cy, rx, ry, count = 24, seed = 1) {
  return Array.from({ length: count }, (_, i) => {
    const a = i * 2.399963 + seed,
      r = Math.sqrt((i + 0.5) / count);
    return circle(
      n(cx + Math.cos(a) * rx * r),
      n(cy + Math.sin(a) * ry * r),
      i % 5 ? 1.8 : 2.8,
      "machine-particle",
    );
  }).join("");
}
function burst(cx, cy, radius = 60, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * Math.PI * 2) / count;
    return arrow(
      n(cx + Math.cos(a) * radius * 0.55),
      n(cy + Math.sin(a) * radius * 0.55),
      n(cx + Math.cos(a) * radius),
      n(cy + Math.sin(a) * radius),
      C.plasma,
      1.5,
    );
  }).join("");
}
function coils(xs, y, h, ry = 12) {
  return xs
    .map(
      (x) =>
        ellipse(x, y, ry, h / 2, "machine-coil") +
        ellipse(x + 5, y, ry, h / 2, "machine-metal"),
    )
    .join("");
}
function frc(cx, cy, rx, ry, active = true) {
  return (
    ellipse(cx, cy, rx, ry, active ? "machine-plasma-fill" : "machine-ghost") +
    [-0.7, -0.35, 0.35, 0.7]
      .map((v) =>
        path(
          `M${cx - rx} ${cy}C${cx - rx * 0.5} ${cy + ry * v * 2},${cx + rx * 0.5} ${cy + ry * v * 2},${cx + rx} ${cy}`,
          "machine-field",
        ),
      )
      .join("") +
    line(cx - rx - 12, cy, cx + rx + 12, cy, "machine-field-dash") +
    (active ? particles(cx, cy, rx * 0.76, ry * 0.67, 14) : "")
  );
}

function torus(kind, s) {
  const spherical = kind === "spherical",
    stellarator = kind === "stellarator";
  const cx = 372,
    cy = 230,
    R = spherical ? 98 : 146,
    r = spherical ? 53 : 42,
    h = spherical ? 88 : 48;
  const shape = { R, r, h, stellarator };
  const project = (t, p, expansion = 1) => {
    const [x, y, z] = torusPoint(t, p, shape, expansion);
    return [cx + x, cy + z * 0.45 - y * 0.88];
  };
  let out = ellipse(cx, 364, 203, 18, "machine-shadow");
  out += path(
    `M${cx - R - r - 13} 258L${cx - R - r - 13} 337L${cx - R - r + 12} 356M${cx + R + r + 13} 258L${cx + R + r + 13} 337L${cx + R + r - 12} 356`,
    "machine-support",
  );
  // Outer casing is deliberately open: the cutaway reveals plasma and field topology.
  for (let i = 0; i < 9; i++) {
    const p = (i * Math.PI * 2) / 9;
    out += path(
      pointsPath(samples((t) => project(t, p, 1.3), 100, Math.PI, Math.PI * 2)),
      "machine-casing",
    );
  }
  if (!stellarator) {
    out += rect(
      cx - (spherical ? 12 : 20),
      104,
      spherical ? 24 : 40,
      231,
      "machine-solenoid",
      8,
    );
    for (let y = 118; y < 329; y += 13)
      out += line(
        cx - (spherical ? 13 : 21),
        y,
        cx + (spherical ? 13 : 21),
        y - 5,
        "machine-coil",
      );
  }
  const rearCoils = [],
    frontCoils = [];
  for (let i = 0; i < 10; i++) {
    // Leave one foreground coil out of the cutaway to expose the field winding.
    if (!stellarator && s > 0 && i === 2) continue;
    const t = ((i + 0.25) * Math.PI) / 5;
    const d =
      pointsPath(
        samples(
          (p) =>
            project(
              t + (stellarator ? 0.12 * Math.sin(p * 2 + t) : 0),
              p,
              1.45,
            ),
          42,
        ),
      ) + "Z";
    (Math.sin(t) < 0 ? rearCoils : frontCoils).push(
      path(d, "machine-torus-coil") + path(d, "machine-torus-coil-edge"),
    );
  }
  out += rearCoils.join("");
  // Flat-shaded toroidal surface: an editable technical cutaway, not a bitmap.
  if (s > 0) {
    const facets = [];
    const tCount = 64,
      pCount = 16;
    for (let i = 0; i < tCount; i++)
      for (let j = 0; j < pCount; j++) {
        const t = (i * Math.PI * 2) / tCount,
          p = (j * Math.PI * 2) / pCount;
        const dt = (Math.PI * 2) / tCount,
          dp = (Math.PI * 2) / pCount;
        const shade = 0.24 + 0.42 * Math.max(0, Math.sin(p + 0.3));
        const tone = [255, 146, 92].map((v, k) =>
          Math.round([16, 28, 41][k] * (1 - shade) + v * shade),
        );
        const depth =
          (R + r * Math.cos(p)) * Math.sin(t) * 0.88 + h * Math.sin(p) * 0.45;
        facets.push({
          depth,
          svg: `<path d="${pointsPath([project(t, p), project(t + dt, p), project(t + dt, p + dp), project(t, p + dp)])}Z" fill="rgb(${tone.join(",")})" stroke="rgb(${tone.join(",")})" stroke-width=".6"/>`,
        });
      }
    out += facets
      .sort((a, b) => a.depth - b.depth)
      .map((f) => f.svg)
      .join("");
  }
  for (let i = 0; i < 6; i++) {
    const p = (i * Math.PI * 2) / 6;
    out += path(
      pointsPath(samples((t) => project(t, p), 100)),
      s > 0 ? "machine-plasma-surface" : "machine-ghost",
    );
  }
  if (s > 0) {
    // Trace a helix on a flux surface, with two toroidal turns per poloidal
    // turn. Occlude it against the entire torus, including the near inner rim.
    for (const phase of [0.4, 2.3]) {
      let d = "",
        connected = false;
      for (let i = 0; i <= 720; i++) {
        const t = (i * Math.PI * 4) / 720;
        const p = t / 2 + phase;
        if (!torusPointVisible(torusPoint(t, p, shape, 1.025), shape)) {
          connected = false;
          continue;
        }
        const [x, y] = project(t, p, 1.025);
        d += `${connected ? "L" : "M"}${n(x)} ${n(y)}`;
        connected = true;
      }
      out += path(d, "machine-torus-field");
    }
    if (!stellarator) out += arrow(244, 258, 276, 275, C.plasma, 3);
  }
  out += frontCoils.join("");
  const coilAnchor = project((5.25 * Math.PI) / 5, 0.8, 1.45);
  out += leader(
    `M${n(coilAnchor[0])} ${n(coilAnchor[1])}L141 138H72`,
    72,
    127,
    stellarator ? "Shaped coils" : "External coils",
  );
  out += leader(
    `M${cx + R - 10} 265L585 283H691`,
    584,
    309,
    "Plasma",
    "machine-label-plasma",
  );
  const fieldAnchor = s > 0 ? project(0.4, 0.6, 1.025) : [cx + R - 17, 196];
  out += leader(
    `M${n(fieldAnchor[0])} ${n(fieldAnchor[1])}L585 145H712`,
    712,
    128,
    s > 0 ? "Twisting magnetic field" : "Vacuum chamber",
    s > 0 ? "machine-label-field" : "machine-label",
    'text-anchor="end"',
  );
  if (s > 0)
    out += circle(
      n(fieldAnchor[0]),
      n(fieldAnchor[1]),
      3,
      "",
      `fill="${C.field}"`,
    );
  if (!stellarator)
    out += leader(
      `M${cx} 112V80H250`,
      182,
      77,
      spherical ? "Narrow center column" : "Central solenoid",
    );
  else
    out += text(
      381,
      85,
      "External shaping supplies the twist",
      "machine-small",
      'text-anchor="middle"',
    );
  if (s >= 2) {
    out +=
      arrow(101, 270, 199, 243, C.plasma, 3) +
      text(63, 291, "Heating", "machine-label-plasma");
  }
  if (s >= 3) {
    out += path(
      "M305 333L329 355H420L444 333L437 330L417 348H332L312 330Z",
      "machine-divertor",
    );
    out += arrow(343, 319, 343, 347, C.energy, 1.8);
    out += arrow(404, 319, 404, 347, C.energy, 1.8);
    out +=
      arrow(374, 355, 374, 391, C.energy, 2) +
      text(392, 394, "Divertor / exhaust", "machine-label-energy");
  } else
    out += text(
      372,
      410,
      stellarator
        ? "Shaped coils create the magnetic field"
        : spherical
          ? "Tight central hole · elongated plasma"
          : "External coils + plasma current",
      "machine-small",
      'text-anchor="middle"',
    );
  return out;
}

function mirror(s) {
  let out =
    rect(143, 139, 474, 186, "machine-chamber", 82) +
    ellipse(142, 232, 27, 92, "machine-metal") +
    ellipse(617, 232, 27, 92, "machine-metal");
  out += coils([200, 214, 228, 531, 545, 559], 232, 177, 17);
  [-67, -44, -22, 22, 44, 67].forEach(
    (d) =>
      (out += path(
        `M81 ${232 + d * 1.35}C154 ${232 + d * 1.5},183 ${232 + d * 0.3},227 ${232 + d * 0.45}S334 ${232 + d * 1.25},380 ${232 + d * 1.25}S490 ${232 + d * 0.4},540 ${232 + d * 0.4}S624 ${232 + d * 1.5},685 ${232 + d * 1.35}`,
        "machine-field",
      )),
  );
  if (s >= 1)
    out +=
      ellipse(380, 232, 134, 43, "machine-plasma-fill") +
      particles(380, 232, 123, 34, 45) +
      arrow(349, 99, 365, 186, C.plasma, 3) +
      text(308, 84, "Heating / injection", "machine-label-plasma");
  if (s >= 2) {
    out +=
      arrow(278, 230, 86, 230, C.plasma, 2) +
      arrow(488, 230, 675, 230, C.plasma, 2);
    out += text(
      380,
      378,
      "Some particles escape along open ends",
      "machine-label-plasma",
      'text-anchor="middle"',
    );
  }
  if (s >= 3) {
    out +=
      rect(69, 198, 14, 67, "machine-energy-fill", 4) +
      rect(678, 198, 14, 67, "machine-energy-fill", 4);
    out +=
      arrow(686, 273, 686, 338) +
      text(566, 361, "Possible recovery", "machine-label-energy");
  }
  out += leader(
    "M205 149V111H113",
    57,
    99,
    "High-field throat",
    "machine-label-field",
  );
  out += leader(
    "M548 150V110H642",
    536,
    99,
    "High-field throat",
    "machine-label-field",
  );
  out += text(
    380,
    297,
    "Central plasma",
    "machine-label-plasma",
    'text-anchor="middle"',
  );
  return out;
}

function dipole(s) {
  let out =
    ellipse(376, 240, 217, 148, "machine-chamber") +
    ellipse(376, 240, 217, 60, "machine-casing") +
    line(159, 240, 159, 260, "machine-metal") +
    line(593, 240, 593, 260, "machine-metal");
  out +=
    ellipse(376, 92, 79, 19, "machine-coil", 'stroke-width="10"') +
    line(376, 112, 376, 196, "machine-field-dash");
  if (s > 0) {
    [1, -1].forEach((side) =>
      [60, 100, 143, 180].forEach(
        (d) =>
          (out += path(
            `M${376 + side * 42} 218C${376 + side * d} ${218 - d * 0.85},${376 + side * (d + 30)} ${258 + d * 0.72},${376 + side * 42} 258`,
            "machine-field",
          )),
      ),
    );
  }
  if (s >= 2) {
    out +=
      ellipse(376, 240, 135, 55, "machine-plasma-fill") +
      ellipse(376, 240, 76, 27, "machine-hole") +
      particles(264, 242, 22, 35, 12) +
      particles(490, 242, 22, 35, 12);
    out += arrow(130, 280, 239, 255, C.plasma, 3);
  }
  out +=
    ellipse(376, 244, 67, 25, "machine-ring") +
    ellipse(376, 233, 67, 25, "machine-ring-top") +
    ellipse(376, 233, 36, 12, "machine-hole");
  if (s >= 3)
    out +=
      ellipse(376, 244, 77, 34, "machine-energy", 'stroke-dasharray="5 5"') +
      leader(
        "M444 267L545 333H645",
        546,
        355,
        "Ring protection",
        "machine-label-energy",
      );
  out += leader("M440 89L504 67H657", 504, 56, "Levitation coil");
  out += leader(
    "M356 244L283 345H124",
    85,
    369,
    "Internal superconducting ring",
  );
  out += leader(
    "M536 189L599 163H684",
    577,
    147,
    "Dipole field",
    "machine-label-field",
  );
  return out;
}

function beamFrc(s) {
  let out =
    rect(135, 166, 495, 139, "machine-chamber", 65) +
    coils([165, 194, 570, 599], 236, 155, 13);
  out += frc(385, 236, 138, 53, true);
  out += rect(
    226,
    84,
    88,
    32,
    "machine-hardware",
    5,
    'transform="rotate(28 270 100)"',
  );
  out += rect(
    450,
    346,
    88,
    32,
    "machine-hardware",
    5,
    'transform="rotate(28 494 362)"',
  );
  if (s >= 1)
    out +=
      arrow(282, 122, 350, 210, C.plasma, 3) +
      arrow(482, 344, 423, 265, C.plasma, 3);
  if (s >= 2)
    out += [0, 1, 2]
      .map((i) =>
        ellipse(
          384,
          235,
          95 + i * 12,
          22 + i * 5,
          "machine-particle-track",
          `transform="rotate(-8 384 235)"`,
        ),
      )
      .join("");
  if (s >= 3)
    out +=
      arrow(515, 237, 650, 237, C.plasma) +
      arrow(650, 242, 650, 303, C.energy) +
      text(598, 326, "End region", "machine-label-energy");
  out += text(210, 64, "Neutral-beam injectors", "machine-label-plasma");
  out += leader(
    "M414 185L507 104H675",
    503,
    91,
    "Separatrix / plasma boundary",
    "machine-label-field",
  );
  out += leader("M338 271L289 347H105", 77, 373, "Field-reversed plasma");
  out += text(
    389,
    315,
    s >= 2 ? "Beams sustain the population" : "Compact magnetic configuration",
    "machine-small",
    'text-anchor="middle"',
  );
  return out;
}

function pulsedFrc(s) {
  let out =
    rect(71, 170, 618, 134, "machine-chamber", 28) +
    coils([103, 131, 159, 291, 320, 440, 469, 601, 629, 657], 237, 158, 9);
  out +=
    rect(292, 83, 176, 37, "machine-hardware", 5) +
    text(
      380,
      107,
      "Capacitor / recovery circuit",
      "machine-small",
      'text-anchor="middle"',
    );
  out += path("M292 101H183V161M468 101H577V161", "machine-energy");
  if (s === 0) out += frc(198, 237, 64, 31) + frc(563, 237, 64, 31);
  if (s === 1)
    out +=
      frc(306, 237, 62, 32) +
      frc(454, 237, 62, 32) +
      arrow(182, 237, 237, 237, C.plasma, 3) +
      arrow(579, 237, 522, 237, C.plasma, 3);
  if (s === 2)
    out +=
      frc(380, 237, 70, 24) +
      arrow(380, 167, 380, 205, C.field, 3) +
      arrow(380, 307, 380, 269, C.field, 3);
  if (s === 3)
    out +=
      frc(380, 237, 115, 52) +
      arrow(351, 171, 328, 133) +
      arrow(409, 171, 432, 133) +
      text(
        380,
        359,
        "Recovered input + fusion-added energy",
        "machine-label-energy",
        'text-anchor="middle"',
      );
  out +=
    text(129, 345, "Formation", "machine-label") +
    text(564, 345, "Formation", "machine-label");
  out += text(
    380,
    54,
    s === 0
      ? "Two separate plasma configurations"
      : s === 1
        ? "Accelerate toward the center"
        : s === 2
          ? "Magnetic compression"
          : "Expansion couples back to the circuit",
    s === 3 ? "machine-label-energy" : "machine-label",
    'text-anchor="middle"',
  );
  if (s === 3)
    out += text(
      380,
      385,
      "Recovery alone does not establish net generation",
      "machine-small",
      'text-anchor="middle"',
    );
  return out;
}

function pinch(s) {
  const width = s === 2 ? 13 : 29;
  let out =
    rect(151, 137, 458, 193, "machine-chamber", 22) +
    rect(174, 168, 37, 132, "machine-hardware", 6) +
    rect(550, 168, 37, 132, "machine-hardware", 6);
  out +=
    path(
      `M211 ${235 - width}C306 ${232 - width},450 ${232 - width},550 ${235 - width}L550 ${235 + width}C450 ${238 + width},306 ${238 + width},211 ${235 + width}Z`,
      "machine-plasma-fill",
    ) + particles(380, 235, 157, width * 0.75, 35);
  if (s >= 1) {
    [279, 346, 413, 480].forEach(
      (x) => (out += ellipse(x, 235, 15, 65, "machine-field")),
    );
    out +=
      arrow(215, 109, 547, 109, C.energy, 2.5) +
      text(
        380,
        94,
        "Axial electrical current",
        "machine-label-energy",
        'text-anchor="middle"',
      );
  }
  [-1, 0, 1].forEach(
    (row) =>
      (out += arrow(
        296,
        235 + row * width * 0.65,
        row === 0 ? 438 : 396,
        235 + row * width * 0.65,
        C.plasma,
        2.2,
      )),
  );
  if (s === 2)
    out +=
      arrow(380, 158, 380, 208, C.field, 2.4) +
      arrow(380, 313, 380, 263, C.field, 2.4);
  if (s === 3)
    out +=
      arrow(594, 235, 683, 235, C.plasma, 2.5) +
      text(615, 271, "Exhaust", "machine-label-plasma");
  out += text(144, 358, "Electrode") + text(543, 358, "Electrode");
  out += text(
    380,
    381,
    "Axial flow varies across the column",
    "machine-label-plasma",
    'text-anchor="middle"',
  );
  out += leader(
    "M480 175L598 73H663",
    537,
    56,
    "Encircling field",
    "machine-label-field",
  );
  return out;
}

function target(s) {
  const cx = 391,
    cy = 236,
    radius = s === 2 ? 48 : 93;
  let out =
    circle(cx, cy, 154, "machine-chamber") +
    circle(cx, cy, 143, "machine-casing");
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4,
      x = cx + Math.cos(a) * 155,
      y = cy + Math.sin(a) * 155;
    out += rect(
      n(x - 17),
      n(y - 12),
      34,
      24,
      "machine-hardware",
      3,
      `transform="rotate(${i * 45} ${n(x)} ${n(y)})"`,
    );
    if (s === 2)
      out += arrow(
        n(cx + Math.cos(a) * 126),
        n(cy + Math.sin(a) * 126),
        n(cx + Math.cos(a) * 69),
        n(cy + Math.sin(a) * 69),
        C.energy,
        2.3,
      );
  }
  out += circle(cx, cy, radius, "machine-liner", 'stroke-width="20"');
  out += rect(89, 218, 145, 38, "machine-hardware", 8);
  if (s === 0)
    out += frc(161, 237, 47, 14) + arrow(216, 237, 281, 237, C.plasma, 2);
  else out += frc(cx, cy, radius * 0.65, radius * 0.5);
  if (s === 3)
    out +=
      burst(cx, cy, 120, 10) +
      arrow(555, 275, 639, 322) +
      text(581, 348, "Heat capture", "machine-label-energy");
  out += text(77, 194, "Plasma injector");
  out += leader("M451 167L543 109H676", 541, 95, "Moving liner");
  out += text(
    391,
    418,
    "Generic compression chamber",
    "machine-small",
    'text-anchor="middle"',
  );
  out += text(
    107,
    348,
    s === 2 ? "Actuators compress" : "Compression actuators",
    "machine-label-energy",
  );
  return out;
}

function laser(kind, s, fastIgnition = false) {
  const indirect = kind === "indirect-laser",
    hybrid = kind === "hybrid-laser";
  const cx = 380,
    cy = 230,
    compressed = s >= 2;
  let out =
    circle(cx, cy, 155, "machine-chamber") +
    circle(cx, cy, 163, "machine-casing");
  const laserAngles =
    indirect || hybrid
      ? [-150, -30, 30, 150]
      : [-155, -115, -65, -25, 25, 65, 115, 155];
  const showHohlraum = indirect || (hybrid && s < 2);
  if (showHohlraum) {
    out +=
      rect(290, 161, 180, 138, "machine-hohlraum", 13) +
      rect(301, 173, 158, 114, "machine-hole", 6);
    out +=
      rect(284, 206, 24, 47, "machine-hole") +
      rect(453, 206, 24, 47, "machine-hole");
  }
  laserAngles.forEach((deg) => {
    const a = (deg * Math.PI) / 180,
      x = cx + Math.cos(a) * 208,
      y = cy + Math.sin(a) * 165;
    out += rect(
      n(x - 35),
      n(y - 10),
      70,
      20,
      "machine-hardware",
      3,
      `transform="rotate(${deg} ${n(x)} ${n(y)})"`,
    );
    if (s >= 1) {
      const tx = showHohlraum
        ? cx + Math.sign(Math.cos(a)) * 31
        : cx + Math.cos(a) * (compressed ? 15 : 35);
      const ty = showHohlraum
        ? cy - Math.sign(Math.sin(a)) * 51
        : cy + Math.sin(a) * (compressed ? 15 : 35);
      out += path(
        `M${n(x - Math.cos(a) * 36)} ${n(y - Math.sin(a) * 36)}L${n(tx)} ${n(ty)}`,
        "machine-laser",
      );
      if (showHohlraum) out += circle(tx, ty, 5, "machine-particle");
    }
  });
  if (showHohlraum && s >= (hybrid ? 1 : 2)) {
    [-1, 1].forEach((side) =>
      [-44, 0, 44].forEach(
        (dx) =>
          (out += arrow(
            cx + dx,
            cy + side * 48,
            cx + dx * 0.25,
            cy + side * 22,
            C.white,
            1.5,
          )),
      ),
    );
    out += text(
      cx,
      328,
      "X-rays from the cavity walls",
      "machine-label",
      'text-anchor="middle"',
    );
  }
  const targetRadius = compressed ? 17 : 35;
  out +=
    circle(cx, cy, targetRadius + 8, "machine-capsule") +
    circle(cx, cy, targetRadius, "machine-plasma-fill") +
    particles(cx, cy, targetRadius * 0.75, targetRadius * 0.75, 13);
  if (s === 2 && !showHohlraum) out += burst(cx, cy, 64, 8);
  if (s === 3)
    out += burst(cx, cy, 106, 14) + circle(cx, cy, 9, "machine-fusion-core");
  if (fastIgnition && s >= 2 && !indirect && !hybrid)
    out +=
      arrow(599, 232, 405, 232, C.energy, 4) +
      text(548, 267, "Ignition pulse", "machine-label-energy");
  out += leader(
    "M398 221L493 135H663",
    527,
    122,
    compressed ? "Compressed fuel" : "Fuel capsule",
    "machine-label-plasma",
  );
  out += text(62, 90, "Laser drivers", "machine-label-energy");
  out += leader("M267 119L184 70H74", 74, 57, "Reaction chamber");
  if (showHohlraum)
    out += leader("M297 286L200 339H77", 77, 363, "Hohlraum / X-ray cavity");
  else
    out += text(
      68,
      359,
      hybrid
        ? "Later stage: direct illumination"
        : fastIgnition
          ? "Selected variant: fast ignition"
          : "Direct illumination",
      "machine-label",
    );
  return out;
}

function hybridIgnition(s) {
  const cx = 390,
    cy = 241,
    scale = s >= 1 ? 0.64 : 1;
  let out =
    rect(237, 114, 307, 254, "machine-chamber", 24) +
    text(
      390,
      94,
      "Fuel-system module",
      "machine-label",
      'text-anchor="middle"',
    );
  [97, 76, 55].forEach(
    (r, i) =>
      (out += circle(
        cx,
        cy,
        r * scale,
        i === 1 ? "machine-coil" : "machine-shell",
        'stroke-width="6"',
      )),
  );
  out +=
    circle(cx, cy, 29 * scale, "machine-plasma-fill") +
    particles(cx, cy, 21 * scale, 21 * scale, 12);
  out +=
    rect(75, 198, 104, 86, "machine-hardware", 6) +
    text(127, 223, "Electrical", "machine-small", 'text-anchor="middle"') +
    text(127, 243, "compression", "machine-small", 'text-anchor="middle"') +
    text(127, 263, "driver", "machine-small", 'text-anchor="middle"');
  out += line(180, 241, 237, 241, "machine-energy");
  if (s >= 1)
    [-1, 1].forEach(
      (d) => (out += arrow(cx + 109 * d, cy, cx + 75 * d, cy, C.energy, 3)),
    );
  out +=
    rect(587, 204, 104, 72, "machine-hardware", 6) +
    text(639, 234, "Separate", "machine-small", 'text-anchor="middle"') +
    text(639, 255, "ignition", "machine-small", 'text-anchor="middle"');
  if (s >= 2) out += arrow(586, 241, 415, 241, C.plasma, 3.5);
  else out += line(545, 241, 586, 241, "machine-ghost");
  if (s === 3)
    out +=
      burst(cx, cy, 109) +
      arrow(cx, 370, cx, 398, C.energy, 3) +
      text(411, 402, "Proposed heat capture", "machine-label-energy");
  else out += leader("M373 312L277 370H99", 81, 395, "Multi-shell target");
  out += text(
    641,
    318,
    "Partner interface",
    "machine-small",
    'text-anchor="middle"',
  );
  return out;
}

function pulsedPower(s) {
  let out =
    circle(380, 237, 112, "machine-chamber") +
    circle(380, 237, 124, "machine-casing");
  [-150, -90, -30, 30, 90, 150].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180,
      x = 380 + Math.cos(a) * 213,
      y = 237 + Math.sin(a) * 145;
    out += rect(n(x - 32), n(y - 24), 64, 48, "machine-hardware", 5);
    for (let j = 0; j < 3; j++)
      out += rect(
        n(x - 22 + j * 16),
        n(y - 13),
        10,
        26,
        s > 0 ? "machine-energy-fill" : "machine-casing",
        2,
      );
    const x2 = 380 + Math.cos(a) * 62,
      y2 = 237 + Math.sin(a) * 62;
    out += line(
      n(x - Math.cos(a) * 34),
      n(y - Math.sin(a) * 24),
      n(x2),
      n(y2),
      s > 0 ? "machine-energy" : "machine-metal",
    );
    if (s >= 1)
      out += arrow(
        n(x - Math.cos(a) * 49),
        n(y - Math.sin(a) * 38),
        n(x2),
        n(y2),
        C.energy,
        2,
      );
  });
  const half = s >= 2 ? 14 : 30;
  out +=
    rect(
      380 - half - 8,
      195,
      half * 2 + 16,
      84,
      "machine-liner",
      5,
      'stroke-width="5"',
    ) + rect(380 - half, 202, half * 2, 70, "machine-plasma-fill", 5);
  if (s >= 2)
    out +=
      ellipse(380, 237, 63, 28, "machine-field") +
      ellipse(380, 237, 68, 35, "machine-field") +
      arrow(316, 238, 353, 238, C.field) +
      arrow(444, 238, 407, 238, C.field);
  if (s === 3) out += burst(380, 237, 100, 10);
  out += leader(
    "M228 133L182 99H66",
    55,
    79,
    "Capacitor modules",
    "machine-label-energy",
  );
  out += leader("M406 209L506 153H683", 535, 140, "Target / liner");
  return out;
}

function electrostatic(s) {
  let out =
    ellipse(380, 237, 195, 142, "machine-chamber") +
    ellipse(380, 237, 195, 67, "machine-casing");
  out +=
    ellipse(380, 237, 112, 107, "machine-electrode") +
    ellipse(380, 237, 26, 107, "machine-electrode") +
    rect(371, 107, 18, 260, "machine-electrode", 8);
  if (s >= 1) {
    [-30, 30].forEach(
      (deg) =>
        (out += ellipse(
          380,
          237,
          148,
          61,
          "machine-particle-track",
          `transform="rotate(${deg} 380 237)"`,
        )),
    );
    [
      [257, 171],
      [440, 310],
      [491, 163],
      [280, 304],
    ].forEach(([x, y]) => (out += circle(x, y, 5, "machine-particle")));
    out += arrow(242, 263, 260, 285, C.plasma, 2.5);
  }
  if (s >= 2)
    out +=
      ellipse(380, 237, 48, 45, "machine-plasma-fill") +
      particles(380, 237, 37, 33, 24) +
      path(
        "M201 217C263 103,491 105,560 216M201 260C263 373,491 372,560 259",
        "machine-field-dash",
      );
  if (s === 3)
    out +=
      arrow(423, 258, 579, 339, C.plasma, 2) +
      text(584, 362, "Losses", "machine-label-plasma");
  out += leader("M380 110L494 79H663", 504, 61, "High-voltage electrode");
  out += leader(
    "M259 176L179 126H69",
    65,
    106,
    "Ion tracks",
    "machine-label-plasma",
  );
  return out;
}

/** opts.fastIgnition selects a visibly separate ignition beam for direct-laser only. */
export function renderMachine(id, stage = 0, opts = {}) {
  const approach = approaches.find((a) => a.id === id) || approaches[0];
  const s = Math.max(
    0,
    Math.min(
      approach.stages.length - 1,
      Number.isFinite(Number(stage)) ? Math.floor(Number(stage)) : 0,
    ),
  );
  let drawing;
  switch (approach.id) {
    case "tokamak":
    case "spherical":
    case "stellarator":
      drawing = torus(approach.id, s);
      break;
    case "mirror":
      drawing = mirror(s);
      break;
    case "dipole":
      drawing = dipole(s);
      break;
    case "beam-frc":
      drawing = beamFrc(s);
      break;
    case "pulsed-frc":
      drawing = pulsedFrc(s);
      break;
    case "z-pinch":
      drawing = pinch(s);
      break;
    case "magnetized-target":
      drawing = target(s);
      break;
    case "indirect-laser":
    case "direct-laser":
    case "hybrid-laser":
      drawing = laser(approach.id, s, Boolean(opts.fastIgnition));
      break;
    case "hybrid-ignition":
      drawing = hybridIgnition(s);
      break;
    case "pulsed-power":
      drawing = pulsedPower(s);
      break;
    case "electrostatic":
      drawing = electrostatic(s);
      break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" class="machine-svg" viewBox="0 0 760 470" role="img" aria-label="${esc(approach.name + ": " + approach.stages[s].title)}">
    <title>${esc(approach.name + " — " + approach.stages[s].title)}</title>
    <desc>${esc(approach.stages[s].text)} Blue lines are magnetic fields, orange indicates plasma or particle energy, and mint indicates electrical or driver energy.</desc>
    <style>
      .machine-svg{display:block;width:100%;height:auto;background:${C.ink};font-family:Arial,Helvetica,sans-serif}
      .machine-svg path,.machine-svg ellipse,.machine-svg rect{vector-effect:non-scaling-stroke}
      .machine-metal{fill:none;stroke:${C.line};stroke-width:1.25}
      .machine-casing{fill:none;stroke:${C.line};stroke-width:1;opacity:.42}
      .machine-chamber{fill:#152532;fill-opacity:.55;stroke:#56717e;stroke-width:1.5}
      .machine-hardware{fill:#203744;stroke:#607a87;stroke-width:1.3}
      .machine-support{fill:none;stroke:#3a515e;stroke-width:5}
      .machine-shadow{fill:#07131e;stroke:none}
      .machine-coil{fill:none;stroke:#75a1b7;stroke-width:3;stroke-linejoin:round}
      .machine-coil-edge{fill:none;stroke:#b3d2dc;stroke-width:.7;opacity:.65}
      .machine-torus-coil{fill:none;stroke:#839aa7;stroke-width:3;stroke-linejoin:round}
      .machine-torus-coil-edge{fill:none;stroke:#d0dce1;stroke-width:.65;opacity:.65}
      .machine-torus-field{fill:none;stroke:${C.field};stroke-width:1.8;stroke-linecap:round}
      .machine-divertor{fill:#294a46;stroke:${C.energy};stroke-width:1.3;stroke-linejoin:round}
      .machine-solenoid{fill:#1d3e50;stroke:#6c9bb0;stroke-width:1.5}
      .machine-plasma-surface{fill:none;stroke:${C.plasma};stroke-width:2;opacity:.34}
      .machine-plasma-fill{fill:${C.plasma};fill-opacity:.13;stroke:${C.plasma};stroke-width:1.75}
      .machine-field{fill:none;stroke:${C.field};stroke-width:1.25;opacity:.9}
      .machine-field-dash{fill:none;stroke:${C.field};stroke-width:1.25;stroke-dasharray:5 5;opacity:.7}
      .machine-legend-plasma{fill:none;stroke:${C.plasma};stroke-width:3}
      .machine-particle{fill:${C.plasma};stroke:none}
      .machine-particle-track{fill:none;stroke:${C.plasma};stroke-width:1.6;stroke-dasharray:8 6;opacity:.8}
      .machine-fusion-core{fill:${C.white};stroke:${C.plasma};stroke-width:3}
      .machine-ghost{fill:none;stroke:#506572;stroke-width:1;stroke-dasharray:4 5;opacity:.35}
      .machine-leader{fill:none;stroke:#78909b;stroke-width:.85;opacity:.65}
      .machine-label{fill:${C.cream};font-size:14px;font-weight:500;letter-spacing:.1px}
      .machine-small{fill:${C.muted};font-size:12px;letter-spacing:.2px}
      .machine-label-plasma{fill:${C.plasma};font-size:14px;font-weight:500}
      .machine-label-field{fill:${C.field};font-size:14px;font-weight:500}
      .machine-label-energy{fill:${C.energy};font-size:14px;font-weight:500}
      .machine-energy{fill:none;stroke:${C.energy};stroke-width:2}
      .machine-energy-fill{fill:${C.energy};fill-opacity:.2;stroke:${C.energy};stroke-width:1}
      .machine-exhaust{fill:none;stroke:${C.energy};stroke-width:5;stroke-linejoin:round}
      .machine-hole{fill:${C.ink};stroke:#49616f;stroke-width:1}
      .machine-ring{fill:#18374b;stroke:#79aec9;stroke-width:4}
      .machine-ring-top{fill:#36586b;stroke:#a5c6d2;stroke-width:2}
      .machine-liner{fill:none;stroke:#6f8a90}
      .machine-hohlraum{fill:#88765a;fill-opacity:.35;stroke:#c9b385;stroke-width:2}
      .machine-laser{fill:none;stroke:${C.energy};stroke-width:2.3;opacity:.9}
      .machine-capsule{fill:none;stroke:#ded1b4;stroke-width:4}
      .machine-shell{fill:none;stroke:#c7b9a0;stroke-width:2}
      .machine-electrode{fill:#233b49;fill-opacity:.55;stroke:#b6a482;stroke-width:2}
    </style>
    <path d="M24 24h16M24 24v16M736 24h-16M736 24v16M24 420h16M24 420v-16M736 420h-16M736 420v-16" class="machine-casing"/>
    ${drawing}
    <path d="M28 437H732" class="machine-casing"/>
    ${line(30, 454, 51, 454, "machine-field")}${text(59, 458, "Field", "machine-small")}
    ${line(123, 454, 144, 454, "machine-legend-plasma")}${text(151, 458, ["tokamak", "spherical", "stellarator"].includes(approach.id) ? "Plasma" : "Plasma / particles", "machine-small")}
    ${line(["tokamak", "spherical", "stellarator"].includes(approach.id) ? 222 : 296, 454, ["tokamak", "spherical", "stellarator"].includes(approach.id) ? 243 : 317, 454, "machine-energy")}${text(["tokamak", "spherical", "stellarator"].includes(approach.id) ? 251 : 325, 458, "Driver / energy", "machine-small")}
  </svg>`;
}
