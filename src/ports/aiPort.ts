import type {
  ChatTurn,
  HybridInferencePreference,
  Locale,
  ObservedInferenceSource,
  OnDeviceAvailability,
  Opportunity,
  SourceFragment,
  StructuredAIResult,
} from '../domain/types';

export interface AICapabilityReport {
  browserSupportsPromptApi: boolean;
  onDeviceAvailability: OnDeviceAvailability;
  firebaseConfigured: boolean;
  appCheckConfigured: boolean;
  appCheckMode: 'recaptcha_enterprise' | 'debug' | 'unconfigured';
  cloudModelId: string;
  userAgentSummary: string;
  reason?: string;
}

export interface GenerateStructuredTaskInput {
  requestId: string;
  kind: 'EXPLAIN_REQUIREMENTS' | 'PREPARE_NEXT_STEPS';
  locale: Locale;
  opportunity: Opportunity;
  fragments: readonly SourceFragment[];
  preference: HybridInferencePreference;
  userFocusNote?: string;
  signal?: AbortSignal;
}

export interface CloudFollowUpInput {
  requestId: string;
  locale: Locale;
  opportunity: Opportunity;
  comparedOpportunity?: Opportunity;
  fragments: readonly SourceFragment[];
  comparedFragments?: readonly SourceFragment[];
  history: readonly ChatTurn[];
  question: string;
  signal?: AbortSignal;
}

export interface CloudFollowUpResult {
  requestId: string;
  answer: string;
  inferenceSource: ObservedInferenceSource;
  modelId: string;
  latencyMs: number;
}

export interface HybridAIPort {
  inspectCapabilities(locale?: Locale): Promise<AICapabilityReport>;
  initializeOnDeviceModel(
    onProgress?: (progressRatio: number) => void,
    locale?: Locale,
  ): Promise<void>;
  runStructuredTask(input: GenerateStructuredTaskInput): Promise<StructuredAIResult>;
  runCloudFollowUp(input: CloudFollowUpInput): Promise<CloudFollowUpResult>;
}
