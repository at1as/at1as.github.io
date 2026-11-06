/** Research snapshot types. Keep qualifications; do not infer missing facts. */
export type ID = string;
export type ISODateOrPeriod = string;
export interface Sourced { source_ids: ID[]; as_of?: ISODateOrPeriod }
export interface Timing {
  display: string;
  role: 'event_date' | 'reported_at' | 'reported_by' | 'publication_date' |
    'target_window' | 'undated_live_page' | 'campaign_end_month' | string;
  precision: string;
  date: ISODateOrPeriod | null;
  start_year: number | null;
  end_year: number | null;
  note: string | null;
}
export type EvidenceCategory = 'experimental_result' | 'model_or_design' |
  'predecessor_evidence' | 'engineering_progress' | 'reported_status' |
  'organization_event' | 'target';
export interface Claim extends Sourced {
  id: ID;
  entity_id: ID;
  category: EvidenceCategory;
  claim: string;
  evidence_type: string;
  timing: Timing;
  reported_at?: ISODateOrPeriod;
  independent_verification: string;
  details: Record<string, unknown>;
}
export interface Site extends Sourced {
  id: ID;
  entity_id: ID;
  related_entity_ids: ID[];
  physical_site_id: ID;
  name: string;
  role: string;
  role_label: string;
  status: string;
  city: string | null;
  region: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  approximate: true;
  coordinate_precision: string;
  coordinate_note: string;
  marker_shape: 'circle' | 'square' | 'outlined_diamond' | 'hexagon';
}
export interface Entity extends Sourced {
  id: ID;
  name: string;
  entity_type: string;
  sector: 'company_or_supplier' | 'public_project_or_facility';
  approach_id: ID | null;
  approach_variant: string | null;
  family: string;
  summary: string;
  mechanism?: string[];
  operating_fuel?: string;
  intended_fuel?: string;
  intended_fuel_ids?: string[];
  site_ids: ID[];
  evidence_claim_ids: ID[];
  target_claim_ids: ID[];
  risk_note_ids: ID[];
  funding_summary: { display: string; [key: string]: unknown };
  net_electricity_evidence_status: string;
  net_electricity_note?: string;
  status?: string;
  role?: string;
  operator?: string | null;
  research_notes?: Record<string, unknown>;
  company_models?: Record<string, unknown>;
}
export type FundingType = 'round' | 'cumulative_total' | 'grant' |
  'conditional_commitment' | 'public_budget' | 'debt_facility' |
  'government_equity_award' | 'proposed_merger' | 'cash_balance_snapshot';
export type AmountOperator = '=' | '>' | '<=' | 'approximately' | 'nearly';
export interface FundingObservation extends Sourced {
  id: ID;
  entity_id: ID;
  announcement_date: ISODateOrPeriod | null;
  date_precision: string;
  amount: number | null;
  currency: string;
  amount_operator: AmountOperator;
  amount_usd: number | null;
  usd_conversion_basis: string;
  event_type: FundingType;
  qualifier: string;
  includes_prior: boolean;
  superseded_by?: ID;
  supersedes?: ID | ID[];
  status?: string;
  funding_scope?: string;
  cash_received_status: string;
  aggregation_policy: 'do_not_sum_without_explicit_nonoverlap_review';
  [key: string]: unknown;
}
export interface Approach extends Sourced {
  id: ID;
  name: string;
  family: string;
  mechanism: string;
  diagram_steps: string[];
  proposed_advantage: string;
  key_open_challenge: string;
  diagram_guardrail: string;
  examples: string[];
}
export interface MetricRecord extends Sourced {
  id: ID;
  entity_id: ID;
  date: ISODateOrPeriod;
  date_role: string;
  metric: ID;
  value: number;
  unit: string;
  boundary: string;
  evidence_type: 'published_experimental_result';
  measurement_type: string;
  reported_display?: string;
  [key: string]: unknown;
}
export interface Source {
  id: ID;
  aliases: ID[];
  title: string;
  publisher: string;
  url: string;
  published_date: ISODateOrPeriod | null;
  accessed_at: ISODateOrPeriod;
  last_reviewed_at: ISODateOrPeriod;
  access_timezone: string;
  source_type: string;
  claims: string[];
  independence_note?: string | null;
  [key: string]: unknown;
}
export interface RiskTheme { id: ID; label: string; question: string; dimension_ids: ID[] }
export interface RiskAssessment extends Sourced {
  id: ID;
  entity_id: ID;
  theme_ids: ID[];
  original_dimension: string;
  headline: string;
  interpretation: string;
  source_evidence_status: string | null;
  is_interpretive: true;
  is_probability: false;
}
export interface FusionAtlas {
  meta: { title: string; public_title: string; schema_version: string; as_of: string;
    timezone: string; counts: Record<string, number>; [key: string]: unknown };
  approaches: Approach[];
  entities: Entity[];
  sites: Site[];
  claims: Claim[];
  funding_events: FundingObservation[];
  records: MetricRecord[];
  timeline: Array<Sourced & { id: ID; timing: Timing; entity_id: ID | null;
    title: string; description: string; status: string }>;
  risk_themes: RiskTheme[];
  risk_dimensions: Array<Sourced & {id: ID; label: string; question: string;
    evidence_required: string; interpretation: string; applies_to: string}>;
  risk_assessments: RiskAssessment[];
  sources: Source[];
  source_aliases: Record<ID, ID>;
  amount_operator_labels: Record<AmountOperator, {prefix: string; label: string}>;
  power_balance: Record<string, unknown>;
  story_content: Record<string, unknown>;
  approach_risk_profiles: Record<string, unknown>;
  [key: string]: unknown;
}
