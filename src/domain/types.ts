export type Locale = 'es' | 'en';

export type LocalizedText = {
  es: string;
  en: string;
};

export type CategoryId =
  | 'employment'
  | 'education'
  | 'training'
  | 'entrepreneurship'
  | 'civic';

export type CountryCode = 'PE' | 'CO' | 'MX' | 'ES' | 'US' | 'INT';

export type Modality = 'online' | 'onsite' | 'hybrid' | 'unknown';

export type OpportunityEditorialStatus =
  | 'open'
  | 'ongoing'
  | 'upcoming'
  | 'review_required'
  | 'closed'
  | 'withdrawn';

export type ComputedOpportunityStatus =
  | 'open'
  | 'ongoing'
  | 'upcoming'
  | 'closed'
  | 'review_required'
  | 'withdrawn';

export type CostType = 'free' | 'paid' | 'funded' | 'loan' | 'unknown';

export type EducationLevel =
  | ''
  | 'primary'
  | 'secondary'
  | 'student_enrolled'
  | 'technical'
  | 'bachelor'
  | 'postgrad';

export type ExperienceLevel = '' | 'none' | 'under_1y' | '1_to_3y' | '3y_plus';

export interface OpportunitySource {
  id: string;
  title: LocalizedText;
  url: string;
  publisher: string;
  verifiedAt: string;
}

export type CriterionKind =
  | 'country'
  | 'modality'
  | 'education'
  | 'language'
  | 'experience'
  | 'age'
  | 'legal'
  | 'document';

export interface RequirementPrerequisiteGuide {
  title: LocalizedText;
  steps: readonly LocalizedText[];
  officialUrl: string;
  officialLabel: LocalizedText;
}

export interface RequirementCriterion {
  id: string;
  kind: CriterionKind;
  mandatory: boolean;
  text: LocalizedText;
  sourceId: string;
  allowedCountries?: readonly string[];
  requiredModalities?: readonly Modality[];
  minEducation?: Exclude<EducationLevel, ''>;
  requiredLanguage?: Locale;
  minExperience?: Exclude<ExperienceLevel, ''>;
  requiresExternalVerification?: boolean;
  prerequisiteGuide?: RequirementPrerequisiteGuide;
}

export interface OpportunityCondition {
  id: string;
  text: LocalizedText;
  sourceId: string;
}

export interface SuggestedStep {
  id: string;
  text: LocalizedText;
  sourceId: string;
}

export interface Opportunity {
  id: string;
  category: CategoryId;
  kind: 'job' | 'scholarship' | 'course' | 'grant' | 'loan' | 'accelerator' | 'procedure';
  title: LocalizedText;
  summary: LocalizedText;
  benefit: LocalizedText;
  providerName: LocalizedText;
  countryCode: CountryCode;
  eligibleCountries: readonly string[];
  scope: 'national' | 'regional' | 'international' | 'unknown';
  locationLabel: LocalizedText;
  modality: Modality;
  cost: {
    type: CostType;
    summary: LocalizedText;
  };
  deadline: {
    precision: 'instant' | 'date' | 'none';
    opensOn?: string;
    closesOn?: string;
    deadlineAt?: string;
    timeZone?: string;
    label: LocalizedText;
  };
  sourceLanguage: 'es' | 'en' | 'es/en';
  officialUrl: string;
  applyUrl?: string;
  officialActionLabel: LocalizedText;
  officialInstructions: LocalizedText;
  keyCondition: LocalizedText;
  requirements: readonly RequirementCriterion[];
  conditions: readonly OpportunityCondition[];
  suggestedSteps: readonly SuggestedStep[];
  unknownFields: readonly LocalizedText[];
  sources: readonly OpportunitySource[];
  editorialStatus: OpportunityEditorialStatus;
  verifiedAt: string;
  reviewBy: string;
  sourceVersion: string;
  isDemoFixture?: boolean;
}

export type DeadlineWindowFilter =
  | ''
  | 'closing_soon'
  | 'has_deadline'
  | 'ongoing'
  | 'review_required';

export interface CatalogFilters {
  query: string;
  country: string;
  category: CategoryId | '';
  modality: Modality | '';
  language?: '' | Locale;
  deadlineWindow?: DeadlineWindowFilter;
  includeClosed: boolean;
}

export interface SelfCheckProfile {
  residenceCountry: CountryCode | 'OTHER' | '';
  workOrStudyAuthorizedInTarget: 'yes' | 'no' | 'unsure' | '';
  educationLevel: EducationLevel;
  languages: Locale[];
  preferredModality: '' | 'online' | 'onsite' | 'hybrid';
  experienceLevel: ExperienceLevel;
}

export type CriterionMatchStatus =
  | 'MATCH'
  | 'MISMATCH'
  | 'NEEDS_CONFIRMATION'
  | 'UNKNOWN';

export interface CriterionEvaluation {
  criterionId: string;
  mandatory: boolean;
  status: CriterionMatchStatus;
  reason: LocalizedText;
}

export interface OpportunityMatchSummary {
  evaluations: CriterionEvaluation[];
  counts: Record<CriterionMatchStatus, number>;
  mandatoryCounts: Record<CriterionMatchStatus, number>;
  optionalCounts: Record<CriterionMatchStatus, number>;
  contradictions: LocalizedText[];
}

export type TrackingStatus =
  | 'saved'
  | 'preparing'
  | 'applied_self_reported'
  | 'closed';

export interface SavedOpportunityTracking {
  opportunityId: string;
  titleSnapshot: LocalizedText;
  providerSnapshot: LocalizedText;
  officialUrlSnapshot: string;
  status: TrackingStatus;
  savedAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface ActiveGoal {
  text: string;
  opportunityId?: string;
  updatedAt: string;
}

export interface RouteTask {
  id: string;
  text: string;
  status: TaskStatus;
  opportunityId?: string;
  personalTargetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyRouteState {
  version: 2;
  goal: ActiveGoal | null;
  tasks: RouteTask[];
  saved: Record<string, SavedOpportunityTracking>;
}

export type HybridInferencePreference =
  | 'PREFER_ON_DEVICE'
  | 'ONLY_ON_DEVICE'
  | 'PREFER_IN_CLOUD'
  | 'ONLY_IN_CLOUD';

export type ObservedInferenceSource = 'ON_DEVICE' | 'IN_CLOUD' | 'UNVERIFIED';

export type OnDeviceAvailability =
  | 'available'
  | 'downloadable'
  | 'downloading'
  | 'unavailable'
  | 'unsupported';

export type AITaskKind =
  | 'EXPLAIN_REQUIREMENTS'
  | 'PREPARE_NEXT_STEPS'
  | 'FOLLOW_UP_COMPARE';

export interface SourceFragment {
  id: string;
  label: string;
  text: string;
}

export interface GroundedItem {
  text: string;
  evidenceIds: string[];
}

export interface StructuredAIResult {
  requestId: string;
  schemaVersion: 1;
  kind: 'EXPLAIN_REQUIREMENTS' | 'PREPARE_NEXT_STEPS';
  opportunityId: string;
  sourceVersion: string;
  summary: string;
  groundedRequirements: GroundedItem[];
  suggestedActions: GroundedItem[];
  unknowns: string[];
  cautionNote: string;
  inferenceSource: ObservedInferenceSource;
  requestedMode: HybridInferencePreference;
  modelId: string;
  latencyMs: number;
  completedAt: string;
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  inferenceSource?: ObservedInferenceSource;
  modelId?: string;
  latencyMs?: number;
  timestamp: string;
}

export interface AIExecutionLogEntry {
  requestId: string;
  kind: AITaskKind;
  requestedMode: HybridInferencePreference;
  inferenceSource: ObservedInferenceSource | 'NONE';
  outcome: 'success' | 'blocked_privacy' | 'unavailable' | 'cancelled' | 'error';
  latencyMs: number;
  timestamp: string;
  note?: string;
}

export interface UserPreferences {
  version: 1;
  locale: Locale;
  inferencePreference: HybridInferencePreference;
  cloudConsentGranted: boolean;
  introVersionSeen: string | null;
  tourStatus: 'never' | 'completed' | 'dismissed';
  tourVersion: string;
}
