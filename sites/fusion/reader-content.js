// Reader-facing explanations; the downloadable research records stay intact.
export const recordCopy = {
  "h mode duration": {
    label: "Time in improved confinement (H-mode)",
    explanation: "H-mode is a way of operating a plasma that helps it retain heat more effectively. This measures how long that operating state lasted.",
  },
  "high triple product duration": {
    label: "Time at a high triple product",
    explanation: "The triple product combines fuel density, temperature and how long the plasma retains its heat. This duration measures how long a high combination of those three was maintained.",
  },
  "ion temperature duration": {
    label: "Time at the reported ion temperature",
    explanation: "Ions are charged atoms or nuclei in the plasma. This measures how long they stayed at the temperature stated below.",
  },
  "plasma duration": {
    label: "Time the plasma was maintained",
    explanation: "A long-lived plasma is an operating achievement. It does not by itself show sustained fusion or net electricity.",
  },
  "plasma gain peak": {
    label: "Peak plasma gain",
    explanation: "Fusion power divided by external heating power delivered to the plasma, at its peak. Electricity used by the facility is outside this ratio.",
  },
  "fusion energy": {
    label: "Fusion energy released",
    explanation: "Total energy released by fusion during the pulse, before any conversion to electricity.",
  },
  "target gain": {
    label: "Target gain",
    explanation: "Fusion energy divided by laser energy reaching the target. This excludes the electricity used to run the lasers and facility.",
  },
};

export const glossaryCopy = {
  plasma: {
    definition: "Matter so energetic that electrons have separated from atoms, leaving a mixture of charged particles. Fusion experiments heat their fuel into a plasma.",
    noteLabel: "Keep in mind:",
    note: "Creating a plasma is an early operating milestone. It does not show that fusion releases more energy than the experiment uses.",
  },
  deuterium: {
    definition: "A form of hydrogen with one proton and one neutron in its nucleus.",
    note: "Ordinary hydrogen, whose nucleus has just one proton, or tritium, which has two neutrons.",
  },
  tritium: {
    definition: "A radioactive form of hydrogen with one proton and two neutrons. About half of a sample decays in 12.3 years.",
    noteLabel: "Fuel supply:",
    note: "Tritium is scarce. A D–T power plant would need an initial supply, then make replacement tritium from lithium as it operates.",
  },
  alpha: {
    definition: "A helium-4 nucleus: two protons and two neutrons. In D–T fusion, this charged particle gives energy back to the plasma and helps heat it.",
    note: "The separate neutron released in D–T fusion. It carries most of the reaction’s energy and is not held by the magnetic field.",
  },
  q_plasma: {
    definition: "Fusion power divided by external heating power delivered to the plasma. For example, 100 MW of fusion from 20 MW of heating gives Q = 5.",
    note: "Electricity drawn from the grid. Producing the heating and running the rest of the plant require additional electricity.",
  },
  target_gain: {
    definition: "Fusion energy from one pulse divided by the driver energy delivered to the target containing the fuel.",
    note: "Fuel gain, which counts only energy absorbed by the fuel, or electrical gain, which counts electricity.",
  },
  q_fuel: {
    definition: "Fusion energy released divided by the energy actually absorbed by the fuel.",
    note: "Target gain. Some energy delivered to the target never reaches the fuel inside it.",
  },
  driver_efficiency: {
    definition: "The share of a heating or compression system’s electricity that reaches the target or plasma as useful input energy.",
    note: "Fusion gain. An efficient laser does not automatically mean its target produces a large fusion yield.",
  },
  electric_gain: {
    definition: "In this guide, electricity generated divided by all the electricity the plant consumes over the same complete operating interval.",
    noteLabel: "Check the definition:",
    note: "Other sources may use “engineering Q” for different ratios. Always check what is counted as input and output.",
  },
  net_electricity: {
    definition: "Electricity generated minus all electricity used by the plant over a complete operating cycle. A positive result is a surplus available to supply the grid.",
    note: "Gross generation, which has not yet subtracted the plant’s own electricity use.",
  },
  grid_export: {
    definition: "Net electricity delivered through a plant’s connection to the grid, accounting for electricity drawn in and any change in stored energy.",
    note: "A single electrical pulse or an agreement to sell electricity in the future.",
  },
  ignition: {
    definition: "A point at which heat from fusion reactions becomes sufficient to sustain or spread the fusion burn under the experiment’s stated conditions.",
    note: "Target gain above one or net electricity. These measure different achievements.",
  },
  burning_plasma: {
    definition: "A plasma heated substantially by its own fusion reactions, usually more than by external heating systems.",
    note: "A power plant producing continuous electricity.",
  },
  triple_product: {
    definition: "Fuel density × temperature × energy confinement time. It combines how much fuel is packed together, how hot it is, and how well it retains heat.",
    note: "A score made by combining records from different experiments. All three quantities must describe the same plasma conditions.",
  },
  confinement_time: {
    definition: "A measure of how quickly a plasma loses its stored heat. Longer energy confinement means heat escapes more slowly.",
    note: "The full length of a plasma pulse. A plasma can run for many seconds while continually losing and replacing its heat.",
  },
  pulse_duration: {
    definition: "How long a plasma discharge or a specified set of operating conditions lasts. Check which interval an experiment is reporting.",
    note: "Energy confinement time, or how reliably a power plant operates over months and years.",
  },
  repetition_rate: {
    definition: "The number of shots or pulses each second. A rate of 10 Hz means ten shots per second.",
    note: "A brief burst of pulses at low power. A plant needs to repeat its full cycle at the required energy and output.",
  },
  blanket: {
    definition: "Material around a fusion chamber that can absorb neutron energy as heat, protect equipment and, when it contains lithium, produce tritium.",
    noteLabel: "Keep in mind:",
    note: "A proposed blanket still needs to demonstrate that it can supply enough recoverable tritium while doing its other jobs.",
  },
  tbr: {
    definition: "Tritium produced divided by tritium consumed. A ratio above one means more is made than burned, before accounting for all losses and other needs.",
    note: "The amount actually available to refuel the plant. Processing losses, radioactive decay and stored reserves also matter.",
  },
  divertor: {
    definition: "An exhaust region in a magnetic-confinement machine that receives heat and particles escaping from the edge of the plasma.",
    note: "The blanket, which mainly handles energy carried out by neutrons.",
  },
  hts: {
    definition: "A material that can carry electricity without electrical resistance at higher temperatures than conventional superconductors. Fusion magnets made from it still need very cold conditions.",
    note: "A room-temperature magnet or a guarantee that the whole plant uses little electricity.",
  },
  frc: {
    definition: "A compact plasma in which the magnetic field reverses direction inside the plasma. No solid central column passes through the confined region.",
    note: "One particular company or fuel. Different designs use this configuration in different ways.",
  },
  aneutronic: {
    definition: "Describes fusion reactions whose main products are charged particles rather than neutrons.",
    note: "A guarantee of zero neutrons or radiation. Other reactions in an operating plant can still produce neutrons and require shielding.",
  },
  thermal_vs_electric: {
    definition: "MW means megawatts, a rate of energy production or use. Fusion MW measures energy released by the reaction; electrical MW measures electricity produced or supplied to the grid.",
    note: "Interchangeable outputs. Converting fusion energy to electricity loses energy, and the plant consumes some electricity itself.",
  },
};
