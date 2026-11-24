// Reader-facing explanations; the detailed evidence requirements remain in
// the canonical snapshot and are available beneath each panel.
export const engineeringPanels = {
  plasma_and_fuel_physics: {
    title: "Keep enough energy in the fuel",
    lead: "A plasma can reach extreme temperatures and still lose heat too fast for useful fusion.",
    paragraphs: [
      "Temperature drives collision rates, density packs more nuclei together, and energy confinement determines how long heat stays trapped. All three must hold simultaneously—a record in one does not compensate for a shortfall in another.",
      "Fuel choice changes the bar too. Hydrogen or deuterium plasmas prove machine control, not the higher-temperature reaction rates and radiation losses of D–T or proton–boron.",
    ],
    note: "Pulse length is not energy confinement time: a plasma can run for minutes while constantly losing and replacing its heat.",
    layout: "aside",
    sourceIds: ["PHY_002", "PHY_006", "PHY_007", "PHY_023"],
  },
  electrical_balance: {
    title: "The heating system can consume the surplus",
    lead: "Identical fusion output can either export power or drain the grid.",
    paragraphs: [
      "Delivering 50 MW of heating to a plasma takes 100 MW of wall-plug electricity at 50% efficiency—or 200 MW at 25% efficiency. The plasma sees the same heat, while the electrical bill doubles.",
      "Holding fusion output and every other assumption fixed (matching the calculator above), that single drop in heating efficiency turns a 50 MW surplus into a 50 MW deficit.",
    ],
    layout: "wide",
    sourceIds: ["PHY_006"],
  },
  sustained_operation: {
    title: "Between pulses, the plant still has work to do",
    lead: "One strong fusion shot is only the start; a plant has to repeat or sustain it reliably.",
    paragraphs: [
      "In laser fusion, every shot destroys its target. The plant must clear chamber debris, position a fresh cryogenic capsule, and recharge the laser several times a second—all at full fusion yield.",
      "Steady-state designs face continuous fueling and exhaust instead. Concentrated heat loads erode divertor surfaces and send impurities back into the plasma, cooling the reaction.",
    ],
    layout: "wide",
    sourceIds: ["PHY_023", "PHY_034", "PHY_042"],
  },
  fuel_cycle: {
    title: "A working reactor can still run short of fuel",
    lead: "A D–T plant must breed replacement tritium from lithium and recycle it fast enough to keep running.",
    paragraphs: [
      "Tritium is scarce and burns up inside the reactor. Neutrons can breed new tritium in a lithium blanket, but that fuel must be extracted, processed, and fed back into the core alongside unburned exhaust.",
      "Fuel stuck in processing pipes cannot power the next pulse. Over time, breeding must outpace consumption, processing losses, and tritium’s 12.3-year radioactive decay.",
    ],
    note: "Other fuels avoid tritium breeding but face much steeper temperature, confinement, or supply constraints.",
    layout: "aside",
    sourceIds: ["PHY_002", "PHY_022"],
  },
  materials_and_maintenance: {
    title: "Plan for damage, wear, and replacement",
    lead: "Magnetic fields confine charged plasma, but D–T neutrons fly straight into the surrounding walls.",
    paragraphs: [
      "Neutrons deliver useful heat while knocking atoms out of place, causing structural alloys to swell or turn brittle under years of thermal and mechanical stress.",
      "Once components activate, hands-on repair is off the table. Remote robotics must reach, unbolt, swap, and reseal heavy hardware inside a tight machine—so maintenance access shapes the entire design.",
    ],
    note: "Every month offline for blanket swaps yields zero electricity, directly driving up plant cost.",
    layout: "aside",
    sourceIds: ["PHY_023", "PHY_024", "PHY_042", "PHY_043"],
  },
  delivery_and_economics: {
    title: "Electricity has to pay for the whole plant",
    lead: "A commercial plant pays for the core, turbines, cooling, fuel cycle, remote maintenance, and financing.",
    paragraphs: [
      "Fixed capital and financing costs keep ticking during outages. Even a net-electric reactor can be uneconomical if blankets wear out too quickly or target consumables cost too much.",
      "Delivery also means integrating separately tested subsystems, qualifying supply chains, securing grid and cooling permits, and surviving multi-year construction schedules before the first megawatt-hour is sold.",
    ],
    note: "Net electricity proves physics and engineering; uptime, lifetime, and capital cost decide whether anyone buys it.",
    layout: "aside",
    sourceIds: ["PHY_006", "PHY_042"],
  },
};
