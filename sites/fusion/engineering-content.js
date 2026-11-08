// Reader-facing explanations; the detailed evidence requirements remain in
// the canonical snapshot and are available beneath each panel.
export const engineeringPanels = {
  plasma_and_fuel_physics: {
    title: "Keep enough energy in the fuel",
    lead: "A plasma can be extremely hot and still lose energy too quickly to produce useful fusion.",
    paragraphs: [
      "Temperature makes fusion collisions more likely. Density puts more nuclei within reach of one another. Energy confinement determines how long the heat stays available. Those conditions have to work together: raising one record does not automatically make up for a weakness in the others.",
      "The fuel choice changes the task, too. A result with hydrogen or deuterium can teach researchers how to control a plasma, but it does not establish the reaction rates and losses of a D–T or proton–boron power plant.",
    ],
    note: "A long plasma discharge and a long energy-confinement time are different things. A plasma can stay on while continuously losing and replacing its heat.",
    layout: "aside",
    sourceIds: ["PHY_002", "PHY_006", "PHY_007", "PHY_023"],
  },
  electrical_balance: {
    title: "The heating system can consume the surplus",
    lead: "The same fusion output can leave a plant exporting electricity or buying it from the grid.",
    paragraphs: [
      "Suppose a plasma needs 50 MW of external heating. At 50% electricity-to-heating efficiency, supplying that heat takes 100 MW of electricity. At 25% efficiency it takes 200 MW. The plasma receives the same heat in both cases; the less efficient equipment doubles the electrical bill.",
      "Conversion losses and the rest of the plant then determine what is left. The example below holds fusion output and every other assumption constant. Changing only the heating efficiency turns a 50 MW export into a 50 MW shortfall.",
    ],
    layout: "wide",
    sourceIds: ["PHY_006"],
  },
  sustained_operation: {
    title: "Between pulses, the plant still has work to do",
    lead: "A successful fusion shot leaves another engineering problem: getting the machine ready to do it again.",
    paragraphs: [
      "In a laser-fusion plant, each shot destroys its target. A fresh fuel capsule must arrive in the right position while the chamber and laser recover. Debris from the previous shot must not obstruct the next target or the laser light reaching it. These tasks have to keep pace at the intended fusion output; isolated successful shots do not establish that capability.",
      "Designs aiming for sustained operation have to feed fuel and remove heat and reaction products while maintaining the plasma. Exhaust surfaces face concentrated heat loads; erosion can introduce material into the plasma and make it harder to keep hot. The cooling and exhaust systems are part of sustaining the reaction.",
    ],
    layout: "wide",
    sourceIds: ["PHY_023", "PHY_034", "PHY_042"],
  },
  fuel_cycle: {
    title: "A working reactor can still run short of fuel",
    lead: "A D–T power plant has to make replacement tritium and recover it quickly enough to keep itself running.",
    paragraphs: [
      "Tritium is scarce, and fusion consumes it. Neutrons from the reaction can produce new tritium in a surrounding lithium blanket, but that fuel is not immediately available to burn. It must be extracted, processed and delivered to the reactor. Unburned fuel also has to be recovered and reused.",
      "Fuel tied up in processing cannot feed the next pulse or sustain the plasma. If usable fuel returns too slowly, the operating inventory falls. Over time, new tritium production must also cover consumption, losses and radioactive decay. Enough breeding and fast enough recovery are both necessary.",
    ],
    note: "This is the D–T fuel problem. Other fuels have different supply constraints and require their own demonstrated fusion performance.",
    layout: "aside",
    sourceIds: ["PHY_002", "PHY_022"],
  },
  materials_and_maintenance: {
    title: "Plan for damage, wear and replacement",
    lead: "In D–T fusion, magnetic fields contain charged particles but cannot stop the neutrons carrying energy into the surrounding structure.",
    paragraphs: [
      "The neutrons deposit useful heat, but also knock atoms out of position inside materials. Over time, this damage can make components swell or become brittle. Repeated heating and mechanical loads add stress. A component that survives a short experiment may not survive years of power-plant operation.",
      "When a component needs replacing, the difficulty moves from materials science to access. Radiation can prevent hands-on work, so remote equipment must reach, disconnect, remove and replace parts inside a crowded machine. Replacement access has to be designed in from the start.",
    ],
    note: "A reactor taken offline for maintenance produces no electricity during that outage. Component lifetime and replacement time together determine how much of the year it can operate.",
    layout: "aside",
    sourceIds: ["PHY_023", "PHY_024", "PHY_042", "PHY_043"],
  },
  delivery_and_economics: {
    title: "Electricity has to pay for the whole plant",
    lead: "The cost includes the reactor, power conversion, cooling, fuel processing, maintenance facilities and the financing needed to build them.",
    paragraphs: [
      "Many costs continue when the reactor is offline. Frequent repairs or long outages spread construction and financing costs over fewer units of electricity. A design that produces net power can still be too expensive to operate if its components wear out quickly or its consumables cost too much.",
      "Building it also means making separately tested systems work together, qualifying suppliers, securing cooling and grid connections, and obtaining the approvals for a specific site and design. Each delay can extend the period of spending before electricity sales begin.",
    ],
    note: "Commercial success requires a plant that can be built, maintained and operated at a competitive cost.",
    layout: "aside",
    sourceIds: ["PHY_006", "PHY_042"],
  },
};
