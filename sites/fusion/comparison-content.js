// Editorial selections from the reviewed ledger, not a ranking or a "latest wins"
// heuristic. Types, date precision and qualifications remain on the source claim.
// Columns: selected evidence; next technical milestone; electricity/pilot target.
export const comparisonSelections = {
  cfs: [['cfs_evidence_01'], ['cfs_target_01'], ['cfs_target_02']],
  helion: [['helion_evidence_01'], ['helion_target_01'], ['helion_target_02']],
  tae: [['tae_evidence_01'], [], ['tae_target_01']],
  tokamak_energy: [['tokamak_energy_evidence_01', 'tokamak_energy_evidence_02'], [], ['tokamak_energy_target_01']],
  type_one: [['type_one_evidence_01'], ['type_one_target_01'], ['type_one_target_02', 'type_one_target_03']],
  proxima: [['proxima_evidence_01'], ['proxima_target_01'], ['proxima_target_03']],
  thea: [['thea_evidence_01'], ['thea_target_01'], ['thea_target_02', 'thea_target_03']],
  renaissance: [['renaissance_evidence_01'], ['renaissance_target_01'], []],
  realta: [['realta_evidence_02'], [], ['realta_target_01']],
  energy_singularity: [['energy_singularity_evidence_02'], ['energy_singularity_target_01'], []],
  kyoto_fusioneering: [['kyoto_fusioneering_evidence_01'], ['kyoto_fusioneering_target_01'], []],
  nt_tao: [['nt_tao_evidence_01'], [], ['nt_tao_target_01', 'nt_tao_target_02']],
  helical_fusion: [['helical_fusion_evidence_01'], ['helical_fusion_target_01'], ['helical_fusion_target_02']],
  inertia: [['inertia_evidence_01', 'inertia_evidence_02'], ['inertia_target_01'], ['inertia_target_03']],
  pacific_fusion: [['pacific_fusion_evidence_01'], ['pacific_fusion_target_01'], []],
  xcimer: [['xcimer_evidence_01'], ['xcimer_target_01'], ['xcimer_target_02', 'xcimer_target_03']],
  focused_energy: [['focused_energy_evidence_01'], ['focused_energy_target_01'], ['focused_energy_target_03']],
  general_fusion: [['general_fusion_evidence_01'], ['general_fusion_target_01'], ['general_fusion_target_02']],
  zap_energy: [['zap_energy_evidence_01'], [], ['zap_energy_target_01']],
  first_light: [['first_light_evidence_01'], [], ['first_light_target_02']],
  marvel_fusion: [['marvel_fusion_evidence_01'], ['marvel_fusion_target_02'], ['marvel_fusion_target_05']],
  avalanche_energy: [['avalanche_energy_evidence_01'], ['avalanche_energy_target_01'], ['avalanche_energy_target_03']],
  ex_fusion: [['ex_fusion_evidence_01'], ['ex_fusion_target_01'], ['ex_fusion_target_02']],
  hb11: [['hb11_evidence_01'], [], ['hb11_target_01']],
  fuse: [['fuse_evidence_01'], ['fuse_target_01'], []],
  startorus: [['startorus_evidence_02'], ['startorus_target_01'], ['startorus_target_03']],
  openstar: [['openstar_evidence_01'], [], []],
  nif: [['nif_evidence_01'], [], []],
  jet: [['jet_evidence_02'], [], []],
  w7x: [['w7x_evidence_01'], [], []],
  east: [['east_evidence_01'], [], []],
  kstar: [['kstar_evidence_01'], [], []],
  west: [['west_evidence_01'], [], []],
  iter: [[], ['iter_target_01', 'iter_target_03'], []],
  jt60sa: [['jt60sa_evidence_01'], [], []],
  ifmif_dones: [[], ['ifmif_dones_target_01'], []],
  sandia_z: [['sandia_z_evidence_01'], [], []],
  omega: [['omega_evidence_01', 'omega_evidence_02'], [], []],
  wham: [['wham_evidence_01'], [], []],
  step: [['step_evidence_01'], [], ['step_target_01']],
  best: [['best_evidence_01'], ['best_target_01', 'best_target_02'], []],
  craft: [['craft_evidence_01'], [], []],
};

export function comparisonClaims(entity, column) {
  const ids = comparisonSelections[entity.canonicalId]?.[column] || [];
  return ids.map(id => entity.claims.find(claim => claim.id === id)).filter(Boolean);
}

export function comparisonAssessment(entity, theme, profiles) {
  // Experimental facilities and suppliers do not inherit commercial-plant
  // requirements merely because they share an approach with a proposed plant.
  const applicable = (entity.roles || [entity.role]).includes('developer') || entity.canonicalId === 'step';
  return {
    notes: entity.assessment.filter(note => note.theme_ids?.includes(theme)),
    context: applicable ? profiles.find(profile => profile.approach_id === entity.approachId)?.themes[theme] : null,
  };
}
