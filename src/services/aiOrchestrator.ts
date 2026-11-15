import { buildSourceFragments, sanitizePlainText } from '../domain/aiContract';
import type {
  AIExecutionLogEntry,
  ChatTurn,
  HybridInferencePreference,
  Locale,
  Opportunity,
  StructuredAIResult,
} from '../domain/types';
import type {
  AICapabilityReport,
  CloudFollowUpResult,
  HybridAIPort,
} from '../ports/aiPort';

export type AIOrchestratorErrorCode =
  | 'CLOUD_CONSENT_REQUIRED'
  | 'CLOUD_CONSENT_REQUIRED_FOR_FALLBACK'
  | 'EMPTY_QUESTION'
  | 'REQUEST_CANCELLED'
  | 'REQUEST_TIMEOUT';

export class AIOrchestratorError extends Error {
  readonly code: AIOrchestratorErrorCode;

  constructor(code: AIOrchestratorErrorCode, message: string) {
    super(message);
    this.name = 'AIOrchestratorError';
    this.code = code;
  }
}

export const DEFAULT_STRUCTURED_TIMEOUT_MS = 45_000;
export const DEFAULT_CLOUD_CHAT_TIMEOUT_MS = 35_000;

export interface RunStructuredGuidanceRequest {
  kind: 'EXPLAIN_REQUIREMENTS' | 'PREPARE_NEXT_STEPS';
  locale: Locale;
  opportunity: Opportunity;
  preference: HybridInferencePreference;
  cloudConsentGranted: boolean;
  capabilities?: AICapabilityReport | null;
  userFocusNote?: string;
  timeoutMs?: number;
}

export interface RunCloudFollowUpRequest {
  locale: Locale;
  opportunity: Opportunity;
  comparedOpportunity?: Opportunity;
  history: readonly ChatTurn[];
  question: string;
  cloudConsentGranted: boolean;
  timeoutMs?: number;
}

async function raceWithAbortAndTimeout<T>(
  runner: () => Promise<T>,
  controller: AbortController,
  timeoutMs: number,
): Promise<T> {
  const clampedMs = Math.max(1, timeoutMs);
  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;

  const guardPromise = new Promise<never>((_resolve, reject) => {
    onAbort = () => {
      if (timedOut) {
        reject(
          new AIOrchestratorError(
            'REQUEST_TIMEOUT',
            `AI request timed out after ${clampedMs}ms.`,
          ),
        );
      } else {
        reject(new AIOrchestratorError('REQUEST_CANCELLED', 'AI request was cancelled.'));
      }
    };

    if (controller.signal.aborted) {
      onAbort();
      return;
    }

    controller.signal.addEventListener('abort', onAbort, { once: true });
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, clampedMs);
  });

  try {
    return await Promise.race([runner(), guardPromise]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    if (onAbort) controller.signal.removeEventListener('abort', onAbort);
  }
}

function createRequestId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class AIOrchestrator {
  private readonly port: HybridAIPort;
  private readonly onLog?: (entry: AIExecutionLogEntry) => void;
  private latestStructuredRequestId: string | null = null;
  private activeStructuredController: AbortController | null = null;
  private latestChatRequestId: string | null = null;
  private activeChatController: AbortController | null = null;

  constructor(port: HybridAIPort, onLog?: (entry: AIExecutionLogEntry) => void) {
    this.port = port;
    this.onLog = onLog;
  }

  private emitLog(entry: AIExecutionLogEntry): void {
    this.onLog?.(entry);
  }

  cancelActiveRequests(): void {
    this.latestStructuredRequestId = null;
    this.activeStructuredController?.abort();
    this.activeStructuredController = null;
    this.latestChatRequestId = null;
    this.activeChatController?.abort();
    this.activeChatController = null;
  }

  async inspectCapabilities(locale?: Locale): Promise<AICapabilityReport> {
    return this.port.inspectCapabilities(locale);
  }

  async initializeOnDeviceModel(
    onProgress?: (progressRatio: number) => void,
    locale?: Locale,
  ): Promise<void> {
    return this.port.initializeOnDeviceModel(onProgress, locale);
  }

  async runStructuredGuidance(
    req: RunStructuredGuidanceRequest,
  ): Promise<StructuredAIResult> {
    const requestId = createRequestId('struct');
    this.activeStructuredController?.abort();
    const controller = new AbortController();
    this.activeStructuredController = controller;
    this.latestStructuredRequestId = requestId;

    const capabilities =
      req.capabilities ?? (await this.port.inspectCapabilities(req.locale));

    if (controller.signal.aborted || this.latestStructuredRequestId !== requestId) {
      this.emitLog({
        requestId,
        kind: req.kind,
        requestedMode: req.preference,
        inferenceSource: 'NONE',
        outcome: 'cancelled',
        latencyMs: 0,
        timestamp: new Date().toISOString(),
        note: 'Cancelled before dispatch.',
      });
      throw new AIOrchestratorError(
        'REQUEST_CANCELLED',
        'Superseded before execution.',
      );
    }
    const onDeviceReady = capabilities.onDeviceAvailability === 'available';

    let effectivePreference: HybridInferencePreference = req.preference;

    if (
      (req.preference === 'ONLY_IN_CLOUD' || req.preference === 'PREFER_IN_CLOUD') &&
      !req.cloudConsentGranted
    ) {
      this.emitLog({
        requestId,
        kind: req.kind,
        requestedMode: req.preference,
        inferenceSource: 'NONE',
        outcome: 'blocked_privacy',
        latencyMs: 0,
        timestamp: new Date().toISOString(),
        note: 'Blocked: explicit cloud consent required.',
      });
      throw new AIOrchestratorError(
        'CLOUD_CONSENT_REQUIRED',
        'Cloud inference requires explicit user consent before sending opportunity context.',
      );
    }

    if (req.preference === 'PREFER_ON_DEVICE' && !req.cloudConsentGranted) {
      if (!onDeviceReady) {
        this.emitLog({
          requestId,
          kind: req.kind,
          requestedMode: req.preference,
          inferenceSource: 'NONE',
          outcome: 'blocked_privacy',
          latencyMs: 0,
          timestamp: new Date().toISOString(),
          note: 'Blocked silent cloud fallback: local model unavailable and cloud consent not granted.',
        });
        throw new AIOrchestratorError(
          'CLOUD_CONSENT_REQUIRED_FOR_FALLBACK',
          'Local model is not ready and cloud fallback requires explicit consent.',
        );
      }
      // Prevent silent cloud fallback if on-device drops mid-flight without cloud consent
      effectivePreference = 'ONLY_ON_DEVICE';
    }

    const fragments = buildSourceFragments(req.opportunity, req.locale);
    const startedAt = performance.now();

    const timeoutMs = req.timeoutMs ?? DEFAULT_STRUCTURED_TIMEOUT_MS;

    try {
      const result = await raceWithAbortAndTimeout(
        () =>
          this.port.runStructuredTask({
            requestId,
            kind: req.kind,
            locale: req.locale,
            opportunity: req.opportunity,
            fragments,
            preference: effectivePreference,
            userFocusNote: req.userFocusNote,
            signal: controller.signal,
          }),
        controller,
        timeoutMs,
      );

      if (
        controller.signal.aborted ||
        this.latestStructuredRequestId !== requestId
      ) {
        this.emitLog({
          requestId,
          kind: req.kind,
          requestedMode: effectivePreference,
          inferenceSource: result.inferenceSource,
          outcome: 'cancelled',
          latencyMs: Math.round(performance.now() - startedAt),
          timestamp: new Date().toISOString(),
          note: 'Discarded superseded response.',
        });
        throw new AIOrchestratorError(
          'REQUEST_CANCELLED',
          'Superseded by a newer request.',
        );
      }

      this.emitLog({
        requestId,
        kind: req.kind,
        requestedMode: effectivePreference,
        inferenceSource: result.inferenceSource,
        outcome: 'success',
        latencyMs: result.latencyMs,
        timestamp: result.completedAt,
      });

      return result;
    } catch (err) {
      const isTimeout =
        err instanceof AIOrchestratorError && err.code === 'REQUEST_TIMEOUT';
      const isCancelled =
        !isTimeout &&
        (controller.signal.aborted ||
          (err instanceof Error &&
            (err.name === 'AbortError' ||
              (err as { code?: string }).code === 'REQUEST_CANCELLED')));
      const outcome = isCancelled
        ? 'cancelled'
        : err instanceof Error &&
            (err as { code?: string }).code === 'ON_DEVICE_UNAVAILABLE'
          ? 'unavailable'
          : 'error';

      this.emitLog({
        requestId,
        kind: req.kind,
        requestedMode: effectivePreference,
        inferenceSource: 'NONE',
        outcome,
        latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
        timestamp: new Date().toISOString(),
        note: err instanceof Error ? sanitizePlainText(err.message, 120) : undefined,
      });

      if (isCancelled && !(err instanceof AIOrchestratorError)) {
        throw new AIOrchestratorError('REQUEST_CANCELLED', 'AI request was cancelled.');
      }

      throw err;
    } finally {
      if (this.activeStructuredController === controller) {
        this.activeStructuredController = null;
      }
    }
  }

  async runCloudFollowUp(
    req: RunCloudFollowUpRequest,
  ): Promise<CloudFollowUpResult> {
    const cleanQuestion = sanitizePlainText(req.question, 400);
    if (!cleanQuestion) {
      throw new AIOrchestratorError('EMPTY_QUESTION', 'Question cannot be empty.');
    }

    const requestId = createRequestId('chat');

    if (!req.cloudConsentGranted) {
      this.emitLog({
        requestId,
        kind: 'FOLLOW_UP_COMPARE',
        requestedMode: 'ONLY_IN_CLOUD',
        inferenceSource: 'NONE',
        outcome: 'blocked_privacy',
        latencyMs: 0,
        timestamp: new Date().toISOString(),
        note: 'Blocked cloud follow-up: consent not granted.',
      });
      throw new AIOrchestratorError(
        'CLOUD_CONSENT_REQUIRED',
        'Explicit cloud consent is required for multi-turn follow-up or cross-opportunity comparison.',
      );
    }

    this.activeChatController?.abort();
    const controller = new AbortController();
    this.activeChatController = controller;
    this.latestChatRequestId = requestId;

    const fragments = buildSourceFragments(req.opportunity, req.locale);
    const comparedFragments = req.comparedOpportunity
      ? buildSourceFragments(req.comparedOpportunity, req.locale)
      : undefined;

    const startedAt = performance.now();

    const timeoutMs = req.timeoutMs ?? DEFAULT_CLOUD_CHAT_TIMEOUT_MS;

    try {
      const result = await raceWithAbortAndTimeout(
        () =>
          this.port.runCloudFollowUp({
            requestId,
            locale: req.locale,
            opportunity: req.opportunity,
            comparedOpportunity: req.comparedOpportunity,
            fragments,
            comparedFragments,
            history: req.history,
            question: cleanQuestion,
            signal: controller.signal,
          }),
        controller,
        timeoutMs,
      );

      if (controller.signal.aborted || this.latestChatRequestId !== requestId) {
        this.emitLog({
          requestId,
          kind: 'FOLLOW_UP_COMPARE',
          requestedMode: 'ONLY_IN_CLOUD',
          inferenceSource: result.inferenceSource,
          outcome: 'cancelled',
          latencyMs: Math.round(performance.now() - startedAt),
          timestamp: new Date().toISOString(),
          note: 'Discarded superseded cloud follow-up.',
        });
        throw new AIOrchestratorError(
          'REQUEST_CANCELLED',
          'Superseded by a newer question.',
        );
      }

      this.emitLog({
        requestId,
        kind: 'FOLLOW_UP_COMPARE',
        requestedMode: 'ONLY_IN_CLOUD',
        inferenceSource: result.inferenceSource,
        outcome: 'success',
        latencyMs: result.latencyMs,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      const isTimeout =
        err instanceof AIOrchestratorError && err.code === 'REQUEST_TIMEOUT';
      const isCancelled =
        !isTimeout &&
        (controller.signal.aborted ||
          (err instanceof Error &&
            (err.name === 'AbortError' ||
              (err as { code?: string }).code === 'REQUEST_CANCELLED')));

      this.emitLog({
        requestId,
        kind: 'FOLLOW_UP_COMPARE',
        requestedMode: 'ONLY_IN_CLOUD',
        inferenceSource: 'NONE',
        outcome: isCancelled ? 'cancelled' : 'error',
        latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
        timestamp: new Date().toISOString(),
        note: err instanceof Error ? sanitizePlainText(err.message, 120) : undefined,
      });

      if (isCancelled && !(err instanceof AIOrchestratorError)) {
        throw new AIOrchestratorError('REQUEST_CANCELLED', 'Superseded by a newer question.');
      }

      throw err;
    } finally {
      if (this.activeChatController === controller) {
        this.activeChatController = null;
      }
    }
  }
}
