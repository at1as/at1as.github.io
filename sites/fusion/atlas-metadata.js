// Presentation labels for the snapshot's source registry. A company summary
// of a paper remains a company source; publication status comes from the source.
const sourceLabels = {
  company_primary: "Company source",
  company_press_release: "Company announcement",
  company_report: "Company report",
  company_technology_description: "Company technical description",
  company_technical_explainer: "Company explainer",
  company_technical_library: "Company technical library",
  counterparty_primary: "Partner source",
  peer_reviewed_experiment: "Peer-reviewed paper",
  peer_reviewed_paper: "Peer-reviewed paper",
  peer_reviewed_design_and_simulation: "Peer-reviewed paper",
  peer_reviewed_review: "Peer-reviewed review",
  preprint_design: "Preprint",
  preprint_experiment: "Preprint",
  research_preprint: "Preprint",
  research_publication_abstract: "Research abstract",
  original_research_historical: "Historical research paper",
  author_data_repository: "Author's data repository",
  laboratory_results: "Laboratory report",
  laboratory_result_announcement: "Laboratory announcement",
  laboratory_paper_summary: "Laboratory paper summary",
  laboratory_result_explanation: "Laboratory explainer",
  laboratory_explainer: "Laboratory explainer",
  laboratory_history: "Laboratory history",
  national_laboratory_presentation: "Laboratory presentation",
  government_result_announcement: "Government announcement",
  government_institute_result_announcement: "Research institute announcement",
  government_funding_announcement: "Government announcement",
  public_funding_announcement: "Public funding announcement",
  government_explainer: "Government explainer",
  government_program: "Government programme",
  government_technical_roadmap: "Government roadmap",
  institution_primary: "Institutional source",
  institutional_news: "Institutional announcement",
  institutional_analysis: "Institutional analysis",
  institutional_database: "Institutional database",
  institutional_history: "Institutional history",
  project_official: "Official project source",
  project_institutional_update: "Project update",
  project_partner_report: "Project partner report",
  project_explainer: "Project explainer",
  project_safety_explainer: "Project explainer",
  industry_survey_primary: "Industry survey",
  industry_survey: "Industry survey",
  proposed_regulation: "Proposed regulation",
  regulator_status: "Regulator update",
  user_reference: "Background reference",
};

export function sourceTypeLabel(source) {
  return sourceLabels[source?.source_type] || "Source type not recorded";
}

export function claimSourceLabels(claim, sources) {
  const labels = (claim.sourceIds || [])
    .map(id => sourceTypeLabel(sources.get(id)));
  return [...new Set(labels.length ? labels : ["Source type not recorded"])];
}

export const atlasFamilies = [
  { id: "magnetic", label: "Magnetic confinement" },
  { id: "inertial", label: "Inertial confinement" },
  { id: "magneto_inertial", label: "Magneto-inertial fusion" },
  { id: "electrostatic_magnetic", label: "Electrostatic + magnetic" },
  { id: "enabling_systems", label: "Enabling systems" },
];

// Z-pinch is a pulsed magnetic design, not a separate top-level family.
export const atlasFamilyId = family => family === "magnetic_pulsed" ? "magnetic" : family;
export const atlasFamilyLabel = family =>
  atlasFamilies.find(f => f.id === atlasFamilyId(family))?.label || "Unclassified";

export function matchesApproach(entity, family, configuration) {
  return (!family || atlasFamilyId(entity.family) === family) &&
    (!configuration || entity.approachId === configuration);
}

export function readApproachFilters(params, configurations) {
  let family = params.get("family") || "";
  let configuration = params.get("configuration") || "";
  // Keep existing shared URLs working after splitting the old mixed selector.
  if (!configuration && family.startsWith("approach:")) configuration = family.slice(9);
  if (!configuration && family === "magnetic_pulsed") configuration = "z_pinch";
  const selected = configurations.find(c => c.id === configuration);
  family = selected?.family || atlasFamilyId(family);
  return {
    family: atlasFamilies.some(f => f.id === family) ? family : "",
    configuration: selected?.id || "",
  };
}
