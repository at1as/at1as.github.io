// Nuclear rest masses, without electrons: NIST 2022 CODATA adjustment.
// https://physics.nist.gov/cuu/Constants/Table/allascii.txt
export const nuclearMassU = Object.freeze({
  deuterium: 2.013553212544,
  tritium: 3.01550071597,
  helium4: 4.001506179129,
  neutron: 1.00866491606,
});
export const massBeforeU = nuclearMassU.deuterium + nuclearMassU.tritium;
export const massAfterU = nuclearMassU.helium4 + nuclearMassU.neutron;
export const massDifferenceU = massBeforeU - massAfterU;
export const reactionEnergyMeV = massDifferenceU * 931.49410372;
