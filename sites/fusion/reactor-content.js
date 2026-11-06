/** Educational component models. Sources refer to the reviewed atlas snapshot.
 * Geometry is schematic; engineering challenges are explanatory interpretation.
 */
const IDS = {
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
};
const SOURCES = {
  tokamak: ["PHY_004", "PHY_020", "PHY_023"],
  spherical: ["PHY_004", "PHY_042"],
  stellarator: ["PHY_005", "PHY_015"],
  mirror: ["PHY_035", "PHY_003"],
  dipole: ["PAR_OPENSTAR_PPPL", "PAR_OPENSTAR_TECH"],
  "beam-frc": ["PHY_036", "PHY_002"],
  "pulsed-frc": ["PHY_037", "PHY_007"],
  "z-pinch": ["PHY_038"],
  "magnetized-target": ["PHY_039"],
  "indirect-laser": ["PHY_009", "PHY_010"],
  "direct-laser": ["PHY_034"],
  "hybrid-laser": ["PAR_XCIMER_HDD", "ALT_XCIMER_ROADMAP"],
  "hybrid-ignition": ["ALT_FIRSTLIGHT_TECH", "ALT_FIRSTLIGHT_TEST"],
  "pulsed-power": ["PHY_033"],
  electrostatic: ["ALT_AVALANCHE_TECH"],
};
const part = (id, name, role, description, challenge, connectsTo) => ({
  id,
  name,
  role,
  description,
  challenge,
  connectsTo,
});
const vessel = (links) =>
  part(
    "vessel",
    "Vacuum chamber",
    "Keep the working volume isolated",
    "The chamber provides a controlled environment around the fuel. Openings admit heating, fueling and diagnostic systems while the wall separates the working volume from the rest of the machine.",
    "Ports, maintenance access and wall protection must fit around the confinement system.",
    links,
  );
const blanket = (links) =>
  part(
    "blanket",
    "Future plant blanket",
    "Capture heat and breed fuel",
    "In a proposed D–T plant, a blanket absorbs neutron energy and uses lithium to produce tritium. Coolant carries the captured heat toward electricity-generating equipment outside this view.",
    "This is a plant requirement, not a claim that the experiment shown has a working breeding blanket.",
    links,
  );
const heat = (links) =>
  part(
    "heating",
    "Heating systems",
    "Put energy into the plasma",
    "External heating raises the plasma temperature toward fusion conditions. Heating power enters the energy balance even when fusion products begin to heat the plasma themselves.",
    "Enough heating must reach the fuel without overwhelming the eventual electrical output.",
    links,
  );
const exhaust = (links) =>
  part(
    "exhaust",
    "Plasma exhaust",
    "Remove particles and excess heat",
    "Particles and heat leaving the useful plasma must reach surfaces designed to receive them. Exhaust hardware provides a route out of the confinement region.",
    "Concentrated heat loads and material erosion limit how hard those surfaces can be driven.",
    links,
  );
const torusParts = (spherical = false) => [
  vessel(["coils", "exhaust"]),
  part(
    "coils",
    "Field coils",
    "Build the surrounding magnetic field",
    "External coils create the toroidal part of the field around the chamber. Combined with the field produced by plasma current, this gives the confining field its twist.",
    "Magnets need space for structure, cooling and protection as magnetic forces grow.",
    ["plasma", "solenoid"],
  ),
  part(
    "solenoid",
    spherical ? "Central column & solenoid" : "Central solenoid",
    "Induce current through the plasma",
    spherical
      ? "The narrow central column shares scarce space between magnets, structure and protection. Where a central solenoid is used, its changing magnetic field induces the plasma current."
      : "A changing magnetic field in the central solenoid induces a current around the plasma ring. That plasma current contributes to the field that confines the fuel.",
    spherical
      ? "Compact geometry leaves especially little room at the center."
      : "Transformer action alone does not supply indefinite steady current.",
    ["coils", "plasma"],
  ),
  part(
    "plasma",
    "Confined plasma",
    "Hold hot fuel away from walls",
    "Charged particles move within a magnetic configuration shaped by external coils and plasma current. The magnetic field guides their motion; it is not a solid barrier around every particle.",
    "Instabilities and transport can move energy out faster than useful fusion can replenish it.",
    ["coils", "heating", "exhaust"],
  ),
  heat(["plasma"]),
  exhaust(["plasma", "vessel"]),
  blanket(["plasma", "vessel"]),
];
const MODELS = {
  tokamak: {
    title: "Inside a tokamak",
    subtitle: "External coils + plasma current",
    overview:
      "A ring of plasma sits inside a magnetic field made by both the machine and the plasma itself.",
    parts: torusParts(),
  },
  spherical: {
    title: "Inside a spherical tokamak",
    subtitle: "A tighter center changes the engineering",
    overview:
      "Shrink the central hole and elongate the plasma. The field still comes from external coils and plasma current, with less room for the hardware at its center.",
    parts: torusParts(true),
  },
  stellarator: {
    title: "Inside a stellarator",
    subtitle: "The confinement twist comes from external magnets",
    overview:
      "Three-dimensional magnetic geometry is built into the surrounding coils, reducing dependence on a large driven plasma current.",
    parts: [
      vessel(["coils", "exhaust"]),
      part(
        "coils",
        "Shaped field coils",
        "Build a three-dimensional magnetic geometry",
        "Precisely arranged external coils create the twist needed for confinement. Their shape and placement determine the magnetic volume the plasma can occupy.",
        "Manufacturing accuracy must coexist with room for heating, maintenance and a future blanket.",
        ["field", "vessel"],
      ),
      part(
        "field",
        "Twisted magnetic field",
        "Guide particles around the torus",
        "The external field winds around a closed path in three dimensions. Lines here trace field geometry, not the literal orbit of a single particle.",
        "A useful shape must limit particle losses while leaving a workable exhaust route.",
        ["coils", "plasma"],
      ),
      part(
        "plasma",
        "Confined plasma",
        "Maintain hot fuel inside the field",
        "The plasma occupies the magnetic volume established by the coils. External heating sustains it without relying on a tokamak-sized transformer-driven plasma current.",
        "Sustained confinement is only one requirement for sustained plant operation.",
        ["field", "heating", "exhaust"],
      ),
      heat(["plasma"]),
      exhaust(["plasma", "vessel"]),
      blanket(["plasma", "vessel"]),
    ],
  },
  mirror: {
    title: "Inside a magnetic mirror",
    subtitle: "Strong end fields, open ends",
    overview:
      "The magnetic field strengthens at either end of a straight chamber. It reflects many particles, while a population can still escape through the throats.",
    parts: [
      vessel(["coils", "collector"]),
      part(
        "coils",
        "Mirror magnets",
        "Strengthen the field at both ends",
        "End magnets constrict the bundle of field lines. The stronger end regions reflect particles with suitable motion back toward the center.",
        "A stronger magnet is a subsystem result, not a demonstration of fusion gain.",
        ["field", "plasma"],
      ),
      part(
        "field",
        "Open field lines",
        "Connect the plasma to both throats",
        "Field lines pass along the machine and narrow near its ends. Some particles travel out along those lines rather than reflecting.",
        "End losses must be small enough to fit the total energy balance.",
        ["coils", "plasma", "collector"],
      ),
      part(
        "plasma",
        "Central plasma",
        "Store hot fuel between the mirrors",
        "Heating maintains the plasma between the strong-field throats. Confinement depends on both its internal behavior and the rate of loss out of the ends.",
        "Particles must remain energetic and confined long enough to produce useful fusion.",
        ["field", "heating"],
      ),
      heat(["plasma"]),
      part(
        "collector",
        "Proposed end collector",
        "Recover some escaping particle energy",
        "A collector can be designed to recover energy from charged particles escaping the mirror. In a proposed D–T plant, neutron energy would still require a thermal system.",
        "Energy recovery cannot substitute for sufficient fusion confinement.",
        ["field", "vessel"],
      ),
    ],
  },
  dipole: {
    title: "Inside a levitated dipole",
    subtitle: "The magnet lives inside the chamber",
    overview:
      "A superconducting ring is suspended inside the vacuum chamber. Plasma surrounds the magnetic field of that internal ring.",
    parts: [
      vessel(["ring", "levitation"]),
      part(
        "ring",
        "Superconducting ring",
        "Generate the internal dipole field",
        "Current in a superconducting ring creates the dipole field. Unlike a tokamak, the main field-producing ring sits inside the plasma chamber.",
        "The ring must remain cold and protected in the environment of a future reactor.",
        ["field", "levitation"],
      ),
      part(
        "levitation",
        "Levitation system",
        "Hold the ring without internal supports",
        "An external levitation system supports the superconducting ring magnet. Its position matters because the plasma geometry is organized around that ring.",
        "Stable support must operate alongside cooling, control and eventual reactor shielding.",
        ["ring", "vessel"],
      ),
      part(
        "field",
        "Dipole field",
        "Organize plasma around the ring",
        "Nested field geometry surrounds the internal magnet. The drawn lines illustrate the field arrangement, not a simulated particle trajectory.",
        "Useful confinement must be demonstrated at the required plasma conditions.",
        ["ring", "plasma"],
      ),
      part(
        "plasma",
        "Surrounding plasma",
        "Occupy the field around the magnet",
        "The hot plasma occupies the region around the levitated ring. Its energy and particle transport determine how much heating it needs.",
        "Prototype plasma operation does not establish D–T gain or an integrated power cycle.",
        ["field", "heating"],
      ),
      heat(["plasma"]),
    ],
  },
  "beam-frc": {
    title: "Inside a beam-sustained FRC",
    subtitle: "Beams create and sustain a compact plasma",
    overview:
      "A field-reversed configuration contains closed magnetic-field regions made by plasma currents. Neutral beams supply particles and energy to sustain that configuration.",
    parts: [
      vessel(["coils", "injector"]),
      part(
        "coils",
        "External field coils",
        "Support the surrounding magnetic configuration",
        "External magnets provide the machine’s surrounding field. The compact reversed-field region is formed by currents in the plasma itself.",
        "External magnet performance and plasma confinement must work together.",
        ["field", "plasma"],
      ),
      part(
        "field",
        "Reversed field region",
        "Define the compact confinement volume",
        "The internal field reverses direction relative to the surrounding field. A boundary called the separatrix encloses the compact closed-field region.",
        "Keeping that configuration stable and well confined requires active plasma control.",
        ["coils", "plasma"],
      ),
      part(
        "plasma",
        "Field-reversed plasma",
        "Hold the beam-supported fuel population",
        "Energetic beam particles help form, heat and sustain the compact plasma. This sustained-beam architecture has a different operating cycle from merging and compressing two FRCs.",
        "Confinement and fuel requirements must justify the continuous beam demand.",
        ["field", "injector", "exhaust"],
      ),
      part(
        "injector",
        "Neutral beam injectors",
        "Add energetic particles and heat",
        "Neutral beams carry energetic particles into the magnetic configuration. Once coupled to the plasma, they help maintain its particle population and operating state.",
        "Beam generation consumes power that must appear in the complete balance.",
        ["plasma", "vessel"],
      ),
      exhaust(["plasma", "vessel"]),
    ],
  },
  "pulsed-frc": {
    title: "Inside a pulsed FRC machine",
    subtitle: "Form, accelerate, merge, compress, recover",
    overview:
      "Two compact plasmas move toward a central region and merge. A magnetic pulse compresses them, and their expansion can return energy to the electrical circuit.",
    parts: [
      vessel(["injector", "coils"]),
      part(
        "coils",
        "Acceleration & compression coils",
        "Move and squeeze the plasmas",
        "Changing coil fields accelerate the two configurations toward the center. The central magnetic pulse then compresses the merged plasma.",
        "Pulse timing, confinement and repeated mechanical loads must work together.",
        ["plasma", "capacitors", "collector"],
      ),
      part(
        "injector",
        "Plasma formation sections",
        "Prepare two compact plasma configurations",
        "Separate sections form field-reversed plasmas on either side of the machine. Those plasmas become the fuel configurations that meet in the central chamber.",
        "Each pulse must begin with suitable, repeatable plasma conditions.",
        ["plasma", "coils"],
      ),
      part(
        "plasma",
        "Merged compressed plasma",
        "Raise temperature and density through compression",
        "The merging configurations form the central plasma. Magnetic compression raises its density and temperature before expansion.",
        "Fusion-added energy must be distinguished from energy originally supplied to the pulse.",
        ["coils", "injector", "collector"],
      ),
      part(
        "capacitors",
        "Pulse energy storage",
        "Supply and receive electrical pulse energy",
        "Stored electrical energy drives the coil pulse. The recovery circuit is intended to return a portion of the pulse energy to storage.",
        "A valid net-energy comparison needs the same stored-energy state at the start and end.",
        ["coils", "collector"],
      ),
      part(
        "collector",
        "Inductive energy recovery",
        "Return expansion energy to the circuit",
        "As the plasma expands, it couples energy electromagnetically to the surrounding circuit. Returned electricity includes previously supplied energy as well as any additional fusion contribution.",
        "Recovered input energy alone is not net fusion electricity.",
        ["plasma", "coils", "capacitors"],
      ),
    ],
  },
  "z-pinch": {
    title: "Inside a sheared-flow Z-pinch",
    subtitle: "The plasma current creates its own squeeze",
    overview:
      "Current along a plasma column creates an encircling magnetic field. A varying axial flow speed helps stabilize the compressed column.",
    parts: [
      vessel(["electrodes", "exhaust"]),
      part(
        "electrodes",
        "Current electrodes",
        "Drive current along the plasma column",
        "Electrodes deliver the electrical pulse into the plasma. The current along the column produces the magnetic field that compresses it.",
        "Electrode surfaces must survive repeated current pulses and plasma exposure.",
        ["capacitors", "plasma"],
      ),
      part(
        "plasma",
        "Sheared flowing plasma",
        "Combine axial flow with radial compression",
        "The plasma flows along the machine while the magnetic force acts inward. Flow speed varies across the column to help suppress instability.",
        "Sheared flow addresses instability without establishing that every instability is solved.",
        ["electrodes", "field", "exhaust"],
      ),
      part(
        "field",
        "Self-generated magnetic field",
        "Wrap around and pinch the current",
        "Axial plasma current creates a magnetic field around the column. That field supplies the inward magnetic pressure without an external confinement magnet.",
        "The pinch must remain stable long enough at useful fusion conditions.",
        ["plasma", "electrodes"],
      ),
      part(
        "capacitors",
        "Pulsed electrical supply",
        "Deliver energy to the current pulse",
        "Electrical storage supplies the current that forms and compresses the plasma. The circuit must reset before the next pulse.",
        "Repetition and efficiency matter as much as an individual high-current shot.",
        ["electrodes"],
      ),
      exhaust(["plasma", "vessel"]),
    ],
  },
  "magnetized-target": {
    title: "Inside magnetized target fusion",
    subtitle: "Magnetize the fuel, then compress the liner",
    overview:
      "A preformed magnetized plasma enters a compression chamber. A surrounding liner moves inward, heating and compressing the fuel.",
    parts: [
      vessel(["liner", "drivers"]),
      part(
        "injector",
        "Magnetized plasma injector",
        "Prepare and load the plasma target",
        "An injector forms plasma with an embedded magnetic field. It delivers that plasma to the chamber before the compression event.",
        "Plasma formation and compression must meet at the right time and operating state.",
        ["plasma", "liner"],
      ),
      part(
        "plasma",
        "Magnetized target plasma",
        "Retain energy during the compression pulse",
        "The magnetic configuration begins inside the target plasma. A moving liner increases the plasma density and temperature during compression.",
        "The plasma must preserve suitable confinement as its volume changes rapidly.",
        ["injector", "liner"],
      ),
      part(
        "liner",
        "Compressing liner",
        "Move the material boundary inward",
        "A surrounding liner is driven toward the magnetized plasma. Experimental solid liners and proposed renewable liquid-metal walls represent different engineering systems.",
        "Scaling a compression shot into repeatable plant operation requires a practical reset.",
        ["drivers", "plasma", "blanket"],
      ),
      part(
        "drivers",
        "Mechanical compression drive",
        "Transfer driver energy into liner motion",
        "The compression system puts surrounding material into inward motion. That moving boundary does work on the magnetized plasma.",
        "Compression timing and symmetry determine how much driver energy reaches useful fuel conditions.",
        ["liner", "vessel"],
      ),
      blanket(["liner", "vessel"]),
    ],
  },
  "indirect-laser": {
    title: "Inside indirect laser drive",
    subtitle: "Laser light → X-rays → fuel implosion",
    overview:
      "Lasers heat a cavity around a tiny capsule. The cavity’s X-rays drive material off the capsule, and the reaction force compresses the remaining fuel.",
    parts: [
      vessel(["drivers", "blanket"]),
      part(
        "drivers",
        "Laser beamlines",
        "Deliver light to the cavity walls",
        "Laser beams enter openings in the hohlraum and deposit energy on its walls. The capsule is driven by the resulting X-rays rather than direct laser illumination.",
        "Driver efficiency and repeated operation must support an eventual plant energy balance.",
        ["hohlraum", "vessel"],
      ),
      part(
        "hohlraum",
        "Hohlraum cavity",
        "Convert laser energy into X-rays",
        "The cavity walls absorb the incoming laser light and generate X-rays. Those X-rays surround and heat the capsule’s outer surface.",
        "The radiation must drive a sufficiently uniform implosion.",
        ["drivers", "target"],
      ),
      part(
        "target",
        "Fuel capsule",
        "Turn outward ablation into inward compression",
        "The capsule’s outer layer heats and blows outward. The reaction force drives the remaining fuel inward into a much denser state.",
        "Small asymmetries can spoil the compressed fuel conditions.",
        ["hohlraum", "plasma"],
      ),
      part(
        "plasma",
        "Compressed burning fuel",
        "Release fusion energy during a brief burn",
        "At suitable conditions, compressed D–T fuel can burn and release fusion energy. Target energy gain measures the target boundary rather than the electrical input to the entire facility.",
        "A power plant also needs efficient drivers, repeated targets and net electricity.",
        ["target", "blanket"],
      ),
      blanket(["plasma", "vessel"]),
    ],
  },
  "direct-laser": {
    title: "Inside direct laser drive",
    subtitle: "Put laser energy directly onto the capsule",
    overview:
      "Laser beams illuminate the capsule itself. Ablation of its outer layer drives the fuel inward; some designs add a separate fast-ignition stage.",
    parts: [
      vessel(["drivers", "injector"]),
      part(
        "drivers",
        "Compression laser beams",
        "Drive the capsule surface with light",
        "Multiple laser beams illuminate the capsule directly. The illuminated material expands outward and drives an inward implosion.",
        "Beam uniformity, coupling and wall-plug efficiency must work together.",
        ["target", "vessel"],
      ),
      part(
        "target",
        "Fuel capsule",
        "Concentrate the fuel through inward implosion",
        "The target contains fuel and the material that receives the driver energy. Its geometry controls how the drive produces compression.",
        "Manufacturing and target delivery must be repeatable at an eventual plant’s shot rate.",
        ["drivers", "plasma", "injector"],
      ),
      part(
        "plasma",
        "Compressed fuel",
        "Reach a short-lived fusion-burning state",
        "Compression raises the fuel density and temperature. Conventional direct drive and fast-ignition variants use different routes to begin the burn.",
        "An ignition design must demonstrate gain with compatible target and driver conditions.",
        ["target", "blanket"],
      ),
      part(
        "injector",
        "Future target injection",
        "Deliver fresh fuel for each pulse",
        "A proposed plant supplies a new target after each shot. Tracking and aiming systems must place driver energy on that moving target.",
        "Target supply, chamber clearing and precision aiming must all sustain repetition.",
        ["target", "vessel"],
      ),
      blanket(["plasma", "vessel"]),
    ],
  },
  "hybrid-laser": {
    title: "Inside hybrid direct drive",
    subtitle: "An X-ray start, then direct laser drive",
    overview:
      "The proposed Xcimer sequence begins with X-ray compression from a hohlraum. Later laser energy directly drives the capsule as part of the same implosion.",
    parts: [
      vessel(["drivers", "blanket"]),
      part(
        "drivers",
        "Pulsed laser driver",
        "Supply the two drive phases",
        "Laser energy first creates an X-ray drive inside a hohlraum. Later light couples directly to the capsule.",
        "The laser and target need compatible pulse shapes and efficient energy transfer.",
        ["hohlraum", "target"],
      ),
      part(
        "hohlraum",
        "Initial X-ray cavity",
        "Start compression through indirect drive",
        "The initial laser pulse heats the surrounding cavity. Its X-rays drive the first compression phase of the capsule.",
        "The target must make the transition to direct drive as intended.",
        ["drivers", "target"],
      ),
      part(
        "target",
        "Hybrid-drive target",
        "Combine two compression stages in one target",
        "The target is designed for an initial X-ray-driven stage followed by direct laser drive. This is a hybrid implosion sequence rather than a separate fast-ignition pulse.",
        "Modeled target performance needs experimental validation.",
        ["drivers", "hohlraum", "plasma"],
      ),
      part(
        "plasma",
        "Compressed fuel",
        "Convert the intended implosion into burn",
        "The combined drive stages are intended to reach fusion-burning conditions. The drawing illustrates the proposed mechanism rather than a measured company gain.",
        "Gain and repeated operation must be demonstrated with the actual driver and target.",
        ["target", "blanket"],
      ),
      blanket(["plasma", "vessel"]),
    ],
  },
  "hybrid-ignition": {
    title: "Inside hybrid fast ignition",
    subtitle: "Electrical compression, then a separate spark",
    overview:
      "An engineered multi-shell fuel package separates compression from the later rapid ignition stage. First Light’s FLARE concept develops the fuel system within a wider partner-supplied plant.",
    parts: [
      vessel(["drivers", "target"]),
      part(
        "capacitors",
        "Electrical pulse supply",
        "Store energy for the compression drive",
        "Stored electrical energy supplies a brief compression pulse. The fuel package is one part of the wider driver and reactor system.",
        "A complete plant must account for the electrical supply and its losses.",
        ["drivers"],
      ),
      part(
        "drivers",
        "Electrical compression driver",
        "Squeeze the engineered fuel package",
        "An electrical driver compresses the multi-shell target. The intended compression limits premature heating before the separate ignition step.",
        "Compression tests alone do not demonstrate ignition or target gain.",
        ["capacitors", "target"],
      ),
      part(
        "target",
        "Multi-shell fuel package",
        "Shape compression around the D–T fuel",
        "The fuel package controls how the drive compresses the fuel.",
        "Fuel-system performance must be validated with the complete drive sequence.",
        ["drivers", "ignition", "plasma"],
      ),
      part(
        "ignition",
        "Separate ignition stage",
        "Rapidly heat already compressed fuel",
        "A distinct rapid heating step is intended to initiate burn after compression. Its separation from compression defines the fast-ignition approach.",
        "Successful ignition must follow the validated compression stage.",
        ["target", "plasma"],
      ),
      part(
        "plasma",
        "Compressed burning fuel",
        "Release energy after compression and ignition",
        "The intended fuel state combines high compression with the later ignition input. A successful burn would then supply heat to the wider plant.",
        "Modeled gain is not a measured fusion result.",
        ["target", "ignition", "vessel"],
      ),
    ],
  },
  "pulsed-power": {
    title: "Inside pulsed-power inertial fusion",
    subtitle: "Stored electricity becomes magnetic pressure",
    overview:
      "Electrical modules deliver an intense current pulse into a target assembly. Its magnetic force implodes a liner or target around the fuel.",
    parts: [
      vessel(["drivers", "target"]),
      part(
        "capacitors",
        "Pulsed-power modules",
        "Store electricity before the short pulse",
        "Modules accumulate electrical energy before firing. Their synchronized discharge supplies the target-driving pulse.",
        "The driver must combine useful efficiency with repeatable high-power operation.",
        ["drivers"],
      ),
      part(
        "drivers",
        "Current delivery system",
        "Bring the pulse to the target",
        "Transmission hardware carries the short, high-current pulse toward the load. Current in the target assembly produces the magnetic compression force.",
        "Electrical losses and replaceable hardware affect the entire shot cycle.",
        ["capacitors", "liner"],
      ),
      part(
        "liner",
        "Imploding liner or load",
        "Convert current into inward magnetic pressure",
        "Current creates a magnetic force that accelerates the liner or target inward. Specific liner and target architectures differ between developers.",
        "The implosion must couple enough energy into fuel rather than instability or debris.",
        ["drivers", "target"],
      ),
      part(
        "target",
        "Fuel assembly",
        "Hold fuel inside the imploding target",
        "The fuel sits within the target assembly being compressed. Preheat and premagnetization are features of specific architectures, not every pulsed-power design.",
        "Target preparation must match the actual driver architecture.",
        ["liner", "plasma"],
      ),
      part(
        "plasma",
        "Compressed fuel plasma",
        "Reach fusion conditions during the pulse",
        "The implosion rapidly increases fuel density and temperature. A proposed plant must capture released energy and prepare fresh target hardware for the next pulse.",
        "A useful single shot must become a repeatable positive plant balance.",
        ["target", "vessel"],
      ),
    ],
  },
  electrostatic: {
    title: "Inside a magneto-electrostatic concept",
    subtitle: "Electric fields guide ions; magnets help confine electrons",
    overview:
      "The Orbitron concept uses an electric potential to accelerate and confine ions, with magnetic assistance for electrons.",
    parts: [
      vessel(["electrodes", "coils"]),
      part(
        "electrodes",
        "Central electrode",
        "Create the electric potential for ions",
        "A negatively charged central electrode attracts positive ions. The design seeks to keep energetic ions in orbiting populations around it.",
        "Electrode and electrical losses must fit the full energy balance.",
        ["field", "plasma"],
      ),
      part(
        "coils",
        "Magnetic field system",
        "Help confine the electron population",
        "A surrounding magnetic field helps confine electrons. It works with the electric field rather than replacing the high-voltage system.",
        "Electron confinement must be compatible with the intended energetic ion population.",
        ["field", "plasma"],
      ),
      part(
        "field",
        "Crossed-field region",
        "Organize the charged particle populations",
        "Electric and magnetic fields play different roles for ions and electrons. The drawn curves indicate the concept rather than calculated particle trajectories.",
        "A promising field geometry still needs measured confinement and energy accounting.",
        ["electrodes", "coils", "plasma"],
      ),
      part(
        "plasma",
        "Energetic ions & electrons",
        "Produce fusion through particle collisions",
        "The co-confined populations are intended to support fusion-producing collisions. Neutron production can support testing before an electricity-producing machine exists.",
        "Fusion output must eventually exceed collision, radiation and electrical losses.",
        ["field", "collector"],
      ),
      part(
        "collector",
        "Energy-output boundary",
        "Separate useful output from electrical input",
        "A power system needs to collect the released energy and account for its electrical demand.",
        "High voltage and neutron yield do not establish net electrical power.",
        ["plasma", "vessel"],
      ),
    ],
  },
};

// Additional explorable systems shared by closely related configurations.
for (const id of ["tokamak", "spherical"]) {
  MODELS[id].parts.splice(
    3,
    0,
    part(
      "field",
      "Helical magnetic field",
      "Combine coil fields with plasma current",
      "The external toroidal field combines with the field made by current in the plasma. Together they form the twisting field geometry used for confinement.",
      "Field lines guide charged motion but do not eliminate transport or instability.",
      ["coils", "solenoid", "plasma"],
    ),
  );
}
for (const id of ["indirect-laser", "hybrid-laser"]) {
  MODELS[id].parts.push(
    part(
      "injector",
      "Future target supply",
      "Place a fresh target each shot",
      "A proposed plant supplies and positions a fresh target after every pulse. Target delivery must coordinate with the laser timing and chamber clearing.",
      "A repeatable plant cycle is a separate demonstration from a successful laboratory target.",
      ["target", "vessel"],
    ),
  );
}

const ENTITY_ALIASES = {
  "commonwealth-fusion-systems": "cfs",
  "tae-technologies": "tae",
  "tokamak-energy": "tokamak_energy",
  "type-one-energy": "type_one",
  "proxima-fusion": "proxima",
  "thea-energy": "thea",
  "renaissance-fusion": "renaissance",
  "realta-fusion": "realta",
  "energy-singularity": "energy_singularity",
  "kyoto-fusioneering": "kyoto_fusioneering",
  "nt-tao": "nt_tao",
  "helical-fusion": "helical_fusion",
  "inertia-enterprises": "inertia",
  "pacific-fusion": "pacific_fusion",
  "xcimer-energy": "xcimer",
  "focused-energy": "focused_energy",
  "general-fusion": "general_fusion",
  "zap-energy": "zap_energy",
  "first-light-fusion": "first_light",
  "marvel-fusion": "marvel_fusion",
  "avalanche-energy": "avalanche_energy",
  "ex-fusion": "ex_fusion",
  "hb11-energy": "hb11",
  "fuse-energy-technologies": "fuse",
  "startorus-fusion": "startorus",
  "openstar-technologies": "openstar",
  "national-ignition-facility": "nif",
  "joint-european-torus": "jet",
  "wendelstein-7-x": "w7x",
  "jt-60sa": "jt60sa",
  "ifmif-dones": "ifmif_dones",
  "sandia-z-and-maglif": "sandia_z",
};
const EXPERIMENTS = new Set([
  "nif",
  "jet",
  "w7x",
  "east",
  "kstar",
  "west",
  "iter",
  "jt60sa",
  "sandia_z",
  "omega",
  "wham",
  "best",
]);
const canonicalEntity = (entity) =>
  entity.canonicalId || ENTITY_ALIASES[entity.id] || entity.id;
const unique = (values) => [...new Set(values || [])];
const normalize = (value) =>
  String(value || "")
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
const PATCHES = {
  cfs: {
    sources: ["MAG_CFS_SPARC", "MAG_CFS_ARC", "MAG_CFS_MAGNET"],
    note: "Approach concept spanning SPARC and the proposed ARC plant. The blanket is a future ARC system, not a component claimed for SPARC.",
    parts: {
      coils: {
        name: "High-temperature superconducting magnets",
        description:
          "HTS magnets provide the surrounding field for the compact tokamak approach. Plasma current supplies another part of the confining magnetic geometry.",
      },
      blanket: {
        name: "Future ARC blanket",
        description:
          "The proposed ARC plant would capture D–T neutron energy as heat and breed tritium. This future plant system is not part of the SPARC gain demonstration.",
      },
    },
  },
  thea: {
    sources: ["MAG_THEA_EOS", "MAG_THEA_HELIOS", "MAG_THEA_CANIS"],
    note: "Thea’s concept uses individually controlled planar coils to synthesize a three-dimensional field.",
    parts: {
      coils: {
        name: "Planar coil array",
        role: "Synthesize a field with controlled currents",
        description:
          "An array of simple planar coils surrounds the chamber. Individually controlled currents combine to create the three-dimensional stellarator field.",
        challenge:
          "Many controlled coils must produce the required magnetic geometry while leaving room for plant systems.",
      },
    },
  },
  renaissance: {
    sources: ["MAG_RENAISSANCE_TECH"],
    note: "Renaissance proposes patterned superconducting paths and a flowing liquid-lithium wall. These are concept features, not a measured power-producing reactor.",
    parts: {
      coils: {
        name: "Patterned HTS current paths",
        description:
          "Laser-patterned paths in superconducting material are intended to create the confinement field. This replaces a generic set of separate sculpted stellarator coils in the concept view.",
      },
      blanket: {
        name: "Proposed flowing lithium wall",
        description:
          "Flowing lithium is intended to absorb heat, shield surrounding hardware and breed tritium. A commercial system would need to maintain that flowing wall alongside plasma confinement.",
      },
    },
  },
  helical_fusion: {
    sources: ["MAG_HELICAL_TECH", "MAG_HELICAL_MANUFACTURE"],
    note: "Helical Fusion’s concept uses two helical superconducting coils wound around the torus. This is a mechanism drawing, not a reconstruction of Helix hardware.",
    parts: {
      coils: {
        name: "Helical superconducting coils",
        description:
          "Two helical superconducting coils wind around the plasma torus. Their geometry produces the twisted field used to confine the plasma.",
      },
    },
  },
  general_fusion: {
    sources: ["ALT_GENERAL_PAPER", "ALT_GENERAL_TEMP", "ALT_GENERAL_PATH"],
    note: "LM26 compresses a magnetized plasma inside a solid lithium liner driven by theta-pinch coils. This simplified mechanism view omits the future commercial liquid wall and breeding blanket; coil count and geometry are illustrative.",
    parts: {
      injector: {
        description:
          "An injector forms a deuterium spherical-tokamak plasma with an embedded magnetic field. That plasma enters the compression region before the liner moves inward.",
      },
      drivers: {
        name: "Theta-pinch compression coils",
        role: "Drive the solid liner electromagnetically",
        description:
          "Pulsed coils induce currents in the cylindrical lithium liner. The resulting magnetic force drives the metal inward, mechanically compressing the plasma. These are not the pistons of a proposed liquid-wall plant.",
        challenge:
          "The collapsing liner must remain sufficiently symmetric while heating and compressing the plasma.",
      },
      liner: {
        name: "LM26 solid lithium liner",
        description:
          "LM26 uses a solid lithium liner to compress the magnetized plasma. A future commercial machine envisages renewable liquid metal, which requires a different repeating mechanical cycle.",
      },
      blanket: {
        name: "Future liquid-metal plant wall",
        description:
          "A proposed commercial liquid wall would capture heat and breed tritium. These plant functions should not be read as demonstrated by the solid-liner LM26 experiment.",
      },
    },
  },
  inertia: {
    sources: ["ALT_INERTIA_MODEL", "ALT_INERTIA_PAPER", "ALT_INERTIA_FUELING"],
    note: "Concept view of Inertia’s proposed indirect-drive D–T architecture. NIF ignition supports the physics family; it does not establish this company’s plant performance.",
    parts: {
      drivers: {
        name: "Diode-pumped laser beamlines",
        description:
          "The proposed beamlines deliver laser light to a hohlraum around a cryogenic D–T capsule. The cavity generates X-rays that drive the capsule implosion.",
      },
      vessel: {
        name: "Proposed gas-armored chamber",
        description:
          "The proposed chamber combines gas protection and a replaceable solid wall around the target region. Heat capture and tritium breeding sit within the wider plant architecture.",
      },
    },
  },
  hb11: {
    sources: ["ALT_HB11_TECH", "ALT_HB11_PAPER"],
    note: "HB11 proposes proton–boron fast ignition, not the conventional D–T capsule cycle. Published reaction-yield experiments do not establish ignition or net energy; the heat-recovery stage is a future plant concept.",
    parts: {
      drivers: {
        name: "Compression laser",
        description:
          "A proposed nanosecond laser pulse compresses a proton–boron fuel pellet. A separate short pulse is intended to initiate ignition through focused energetic protons.",
      },
      target: {
        name: "Proton–boron fuel pellet",
        description:
          "The target contains proton–boron fuel rather than D–T. The proposed sequence combines compression with a later fast-ignition input.",
      },
      plasma: {
        name: "Proton–boron reaction region",
        description:
          "The main proton–boron-11 reaction produces three helium nuclei. Experiments study reaction yield and target geometry, which are different evidence from a self-sustaining high-gain burn.",
        challenge:
          "A measured reaction yield must progress to a demonstrated high-gain operating regime.",
      },
      blanket: {
        name: "Future heat recovery",
        role: "Collect heat for a thermal cycle",
        description:
          "The proposed plant recovers released energy as heat for a conventional steam cycle. Its primary fuel cycle does not require a D–T tritium-breeding blanket.",
        challenge:
          "Efficient repetitive lasers and integrated heat recovery remain necessary.",
      },
    },
  },
  marvel_fusion: {
    sources: ["ALT_MARVEL_TECH"],
    note: "Marvel’s concept uses nanostructured targets and fast ignition. Its near-term plant fuel is D–T.",
    parts: {
      target: {
        name: "Nanostructured target",
        description:
          "The proposed hollow-shell target uses non-cryogenic D–T fuel and nanostructured material. Converters are intended to couple energy through fast particles and radiation into the fuel.",
      },
      drivers: {
        name: "Target-driving laser pulses",
        description:
          "Laser pulses interact with the designed target to transfer energy toward fuel conditions. A fast-ignition architecture is intended to initiate the burn.",
      },
    },
  },
  focused_energy: {
    sources: ["ALT_FOCUSED_TECH", "ALT_FOCUSED_EXP"],
    note: "Focused Energy combines direct compression with development work on laser-generated protons for fast ignition. This concept view does not assert demonstrated ignition.",
  },
  ex_fusion: {
    sources: ["PAR_EXFUSION_TECH", "ALT_EXFUSION_TEST"],
    note: "EX-Fusion’s referenced LIFT design separates multidirectional compression and a later laser ignition stage. Target tracking and beam control are part of the proposed repeating cycle.",
  },
  fuse: {
    sources: ["ALT_FUSE_TEST", "ALT_FUSE_CONCEPT"],
    note: "This is Fuse’s proposed energy concept. Its existing dense-plasma-focus hardware produces neutrons for testing and is distinct from the proposed MagLIF energy system.",
    parts: {
      target: {
        description:
          "The proposed MagLIF energy concept uses preconditioned fuel inside a compressing liner. Existing dense-plasma-focus neutron-testing hardware has a different architecture.",
      },
    },
  },
  sandia_z: {
    sources: ["PHY_033"],
    note: "This view represents the MagLIF mechanism studied at Sandia: magnetized, preheated fuel inside an imploding liner. It does not represent an electricity-producing plant.",
  },
  pacific_fusion: {
    sources: ["ALT_PACIFIC_MODULE", "ALT_PACIFIC_FOUND"],
    note: "Pacific Fusion’s pulsed magnetic inertial concept is shown at the module-to-target level. Sandia-specific preheat and magnetization hardware is not inferred for this architecture.",
  },
  tae: {
    sources: ["MAG_TAE_NATURE", "MAG_TAE_FUEL"],
    note: "This is TAE’s beam-driven FRC approach, including beam formation and sustainment. Its long-term proton–boron fuel ambition requires different performance from D–T; the diagram is not a claim about a prototype’s fuel.",
  },
  helion: {
    sources: ["PHY_037", "MAG_HELION_POLARIS"],
    note: "Helion’s intended fuel cycle is D–He3. The recovery circuit returns supplied pulse energy as well as any fusion-added energy; only a complete cycle can establish net output.",
  },
  openstar: {
    sources: ["PAR_OPENSTAR_PPPL", "PAR_OPENSTAR_TECH"],
    note: "OpenStar’s Junior prototype and proposed Tama Nui power plant are separate development stages. The levitated ring concept does not establish D–T gain.",
  },
  nif: {
    sources: ["PHY_009", "PHY_010"],
    note: "Mechanism view of NIF indirect-drive experiments. No power-plant breeding blanket or repeated target injector is implied; target gain and facility electrical gain have different boundaries.",
  },
};

/** Return a fresh, mutable content model so view state cannot alter the source. */
export function getReactorContent(id, options = {}) {
  id = IDS[id] || id;
  const base = MODELS[id];
  if (!base) return null;
  const entityId = ENTITY_ALIASES[options.entityId] || options.entityId;
  const variant = normalize(options.variant);
  const patchKey =
    entityId ||
    (variant === "planar_coil_stellarator"
      ? "thea"
      : variant === "patterned_hts_stellarator"
        ? "renaissance"
        : variant === "helical_stellarator"
          ? "helical_fusion"
          : null);
  const patch = PATCHES[patchKey] || {};
  const sourceIds = unique([...(patch.sources || []), ...SOURCES[id]]);
  let parts = base.parts.map((p) => ({
    ...p,
    ...(patch.parts?.[p.id] || {}),
    connectsTo: [...p.connectsTo],
    sourceIds: [...sourceIds],
  }));
  const fastIgnition =
    id === "direct-laser" &&
    (options.fastIgnition ||
      /fast_ignition|proton_boron/.test(variant) ||
      ["hb11", "marvel_fusion", "focused_energy", "ex_fusion"].includes(
        entityId,
      ));
  if (fastIgnition) {
    const proton = ["hb11", "focused_energy"].includes(entityId);
    parts.push({
      ...part(
        "ignition",
        proton ? "Fast-ignition proton pulse" : "Separate ignition pulse",
        "Start burn after the compression stage",
        proton
          ? "A short laser pulse generates energetic protons intended to heat the compressed fuel. This provides an ignition input distinct from the compression drive."
          : "A separate rapid energy input is intended to ignite the compressed fuel. Its timing and coupling are distinct from the main compression step.",
        "The ignition input must couple effectively into the fuel at the right compressed state.",
        ["target", "plasma", "drivers"],
      ),
      sourceIds: [...sourceIds],
    });
    for (const p of parts)
      if (["target", "plasma", "drivers"].includes(p.id))
        p.connectsTo.push("ignition");
  }
  if (id === "pulsed-power" && ["fuse", "sandia_z"].includes(entityId)) {
    parts.push({
      ...part(
        "coils",
        "Fuel magnetization",
        "Establish a field before compression",
        "The MagLIF architecture magnetizes the fuel before the liner implodes. This preconditioning is a feature of this architecture rather than every pulsed-power concept.",
        "Magnetization, preheat and liner compression must operate together.",
        ["target", "liner"],
      ),
      sourceIds: [...sourceIds],
    });
    parts.push({
      ...part(
        "heating",
        "Fuel preheat",
        "Heat the fuel before implosion",
        "A preheat stage supplies energy to the fuel before peak compression. Its role is different from a separate fast-ignition pulse applied after compression.",
        "Preheat must couple to the fuel without spoiling the later compression.",
        ["target", "liner"],
      ),
      sourceIds: [...sourceIds],
    });
    parts.find((p) => p.id === "target").connectsTo.push("coils", "heating");
  }
  if (options.experimental || EXPERIMENTS.has(entityId)) {
    const laser = ["direct-laser", "indirect-laser", "hybrid-laser"].includes(
      id,
    );
    parts = parts.filter(
      (p) => p.id !== "blanket" && !(laser && p.id === "injector"),
    );
  }
  const valid = new Set(parts.map((p) => p.id));
  for (const p of parts)
    p.connectsTo = unique(p.connectsTo).filter((key) => valid.has(key));
  return {
    title: options.title || base.title,
    subtitle: options.subtitle || base.subtitle,
    overview: options.overview || base.overview,
    conceptNote:
      options.conceptNote ||
      patch.note ||
      (EXPERIMENTS.has(entityId)
        ? "Experimental machine; power-plant systems are omitted."
        : ""),
    sourceIds,
    parts,
    defaultPart: parts[0].id,
  };
}

/** Accept both canonical source entities and the browser’s adapted entity records. */
export function getEntityReactorOptions(entity) {
  if (!entity) return null;
  const approachId = entity.approachId || entity.approach_id;
  const id = IDS[approachId] || (MODELS[approachId] ? approachId : null);
  if (
    !id ||
    entity.role === "supplier" ||
    entity.entity_type === "fusion_systems_supplier"
  )
    return null;
  const entityId = canonicalEntity(entity);
  const variant = entity.approach_variant || normalize(entity.variant);
  const patch = PATCHES[entityId];
  const experimental =
    entityId === "general_fusion" ||
    EXPERIMENTS.has(entityId) ||
    entity.entity_type === "public_research_project";
  return {
    id,
    entityId,
    variant,
    fastIgnition:
      id === "direct-laser" &&
      (/fast_ignition|proton_boron/.test(variant || "") ||
        ["hb11", "focused_energy", "marvel_fusion", "ex_fusion"].includes(
          entityId,
        )),
    title:
      entityId === "general_fusion"
        ? "LM26 compression mechanism"
        : `Approach concept for ${entity.name}`,
    subtitle: entity.approach || MODELS[id].subtitle,
    conceptNote:
      patch?.note ||
      (experimental
        ? "Experimental machine; power-plant systems are omitted."
        : "Future plant systems shown here remain design aims."),
    overview: entity.mechanism || MODELS[id].overview,
    sourceIds: [...(entity.sourceIds || entity.source_ids || [])],
    experimental,
  };
}

/** Enabling infrastructure gets its own process diagram, never a fictional reactor. */
export function getInfrastructureContent(entity) {
  const id = canonicalEntity(entity);
  const sourceIds = [...(entity.sourceIds || entity.source_ids || [])];
  if (id === "kyoto_fusioneering")
    return {
      title: "Engineering the systems around fusion",
      description:
        "Kyoto Fusioneering supplies and tests plant systems across several reactor approaches. Its test facilities are not fusion-powered grid plants.",
      sourceIds,
      stages: [
        {
          name: "Heating",
          text: "Develop systems that deliver energy into a customer’s plasma.",
        },
        {
          name: "Heat transfer",
          text: "Test blanket and thermal-cycle engineering using controlled heat sources.",
        },
        {
          name: "Fuel cycle",
          text: "Develop tritium handling and recovery systems for future integrated plants.",
        },
        {
          name: "Reactor integration",
          text: "Bring validated components together with a customer’s confinement system.",
        },
      ],
    };
  if (id === "ifmif_dones")
    return {
      title: "Testing materials for a fusion environment",
      description:
        "IFMIF-DONES is an accelerator-driven neutron source for materials testing. Its job is to expose samples to fusion-relevant neutron conditions.",
      sourceIds,
      stages: [
        {
          name: "Accelerator",
          text: "Accelerator-driven equipment supplies the neutron-source process.",
        },
        {
          name: "Neutron exposure",
          text: "Material samples experience a fusion-relevant neutron environment.",
        },
        {
          name: "Materials evidence",
          text: "Tests help qualify materials for future fusion machines.",
        },
      ],
    };
  return {
    title:
      entity.name === "CRAFT"
        ? "Test infrastructure for future fusion systems"
        : `Enabling infrastructure: ${entity.name}`,
    description:
      entity.summary ||
      "Engineering test infrastructure supporting future fusion systems.",
    sourceIds,
    stages: [
      {
        name: "Engineering systems",
        text: "Develop hardware needed by future fusion machines.",
      },
      {
        name: "Component testing",
        text: "Evaluate engineering performance in dedicated test infrastructure.",
      },
      {
        name: "Machine integration",
        text: "Use that evidence to support later integrated fusion systems.",
      },
    ],
  };
}
