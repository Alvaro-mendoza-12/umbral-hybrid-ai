import { describe, expect, it, vi } from 'vitest';
import { curatedOpportunities } from '../../src/data/opportunities';
import type { AIExecutionLogEntry, StructuredAIResult } from '../../src/domain/types';
import type { AICapabilityReport, HybridAIPort } from '../../src/ports/aiPort';
import { AIOrchestrator } from '../../src/services/aiOrchestrator';

function createCapabilities(
  availability: AICapabilityReport['onDeviceAvailability'],
): AICapabilityReport {
  return {
    browserSupportsPromptApi: availability !== 'unsupported',
    onDeviceAvailability: availability,
    firebaseConfigured: true,
    appCheckConfigured: true,
    appCheckMode: 'recaptcha_enterprise',
    cloudModelId: 'gemini-3.5-flash-lite',
    userAgentSummary: 'Google Chrome 157',
  };
}

describe('AIOrchestrator', () => {
  it('blocks silent cloud fallback when cloudConsentGranted is false and local model is unavailable', async () => {
    const logs: AIExecutionLogEntry[] = [];
    const runStructuredTask = vi.fn();
    const port: HybridAIPort = {
      inspectCapabilities: vi.fn(async () => createCapabilities('downloadable')),
      initializeOnDeviceModel: vi.fn(),
      runStructuredTask,
      runCloudFollowUp: vi.fn(),
    };

    const orchestrator = new AIOrchestrator(port, (entry) => logs.push(entry));

    await expect(
      orchestrator.runStructuredGuidance({
        kind: 'EXPLAIN_REQUIREMENTS',
        locale: 'en',
        opportunity: curatedOpportunities[0]!,
        preference: 'PREFER_ON_DEVICE',
        cloudConsentGranted: false,
      }),
    ).rejects.toMatchObject({ code: 'CLOUD_CONSENT_REQUIRED_FOR_FALLBACK' });

    expect(runStructuredTask).not.toHaveBeenCalled();
    expect(logs[0]?.outcome).toBe('blocked_privacy');
  });

  it('hard-locks ONLY_ON_DEVICE when local is available and cloud consent is false', async () => {
    const runStructuredTask = vi.fn(async (input) => ({
      requestId: input.requestId,
      schemaVersion: 1 as const,
      kind: input.kind,
      opportunityId: input.opportunity.id,
      sourceVersion: input.opportunity.sourceVersion,
      summary: 'Local summary',
      groundedRequirements: [],
      suggestedActions: [],
      unknowns: [],
      cautionNote: 'Check source',
      inferenceSource: 'ON_DEVICE' as const,
      requestedMode: input.preference,
      modelId: 'chrome-prompt-api-gemini-nano',
      latencyMs: 42,
      completedAt: new Date().toISOString(),
    }));

    const port: HybridAIPort = {
      inspectCapabilities: vi.fn(async () => createCapabilities('available')),
      initializeOnDeviceModel: vi.fn(),
      runStructuredTask,
      runCloudFollowUp: vi.fn(),
    };

    const orchestrator = new AIOrchestrator(port);
    const result = await orchestrator.runStructuredGuidance({
      kind: 'EXPLAIN_REQUIREMENTS',
      locale: 'en',
      opportunity: curatedOpportunities[0]!,
      preference: 'PREFER_ON_DEVICE',
      cloudConsentGranted: false,
    });

    expect(runStructuredTask).toHaveBeenCalledWith(
      expect.objectContaining({ preference: 'ONLY_ON_DEVICE' }),
    );
    expect(result.inferenceSource).toBe('ON_DEVICE');
  });

  it('cancels stale in-flight request when a newer request starts', async () => {
    let resolveFirst!: (val: StructuredAIResult) => void;
    let firstSignal: AbortSignal | undefined;

    const runStructuredTask = vi.fn<HybridAIPort['runStructuredTask']>((input) => {
      if (!firstSignal) {
        firstSignal = input.signal;
        return new Promise<StructuredAIResult>((resolve) => {
          resolveFirst = resolve;
        });
      }
      return Promise.resolve({
        requestId: input.requestId,
        schemaVersion: 1 as const,
        kind: input.kind,
        opportunityId: input.opportunity.id,
        sourceVersion: input.opportunity.sourceVersion,
        summary: 'Fresh cloud summary',
        groundedRequirements: [],
        suggestedActions: [],
        unknowns: [],
        cautionNote: 'Info only',
        inferenceSource: 'IN_CLOUD' as const,
        requestedMode: input.preference,
        modelId: 'gemini-3.5-flash-lite',
        latencyMs: 90,
        completedAt: new Date().toISOString(),
      });
    });

    const port: HybridAIPort = {
      inspectCapabilities: vi.fn(async () => createCapabilities('unsupported')),
      initializeOnDeviceModel: vi.fn(),
      runStructuredTask,
      runCloudFollowUp: vi.fn(),
    };

    const orchestrator = new AIOrchestrator(port);
    const caps = createCapabilities('unsupported');
    const req1 = orchestrator.runStructuredGuidance({
      kind: 'EXPLAIN_REQUIREMENTS',
      locale: 'en',
      opportunity: curatedOpportunities[0]!,
      preference: 'ONLY_IN_CLOUD',
      cloudConsentGranted: true,
      capabilities: caps,
    });

    await Promise.resolve();

    const req2 = orchestrator.runStructuredGuidance({
      kind: 'PREPARE_NEXT_STEPS',
      locale: 'en',
      opportunity: curatedOpportunities[0]!,
      preference: 'ONLY_IN_CLOUD',
      cloudConsentGranted: true,
      capabilities: caps,
    });

    expect(firstSignal?.aborted).toBe(true);
    const secondResult = await req2;
    expect(secondResult.summary).toBe('Fresh cloud summary');

    resolveFirst({
      requestId: 'stale',
      schemaVersion: 1,
      kind: 'EXPLAIN_REQUIREMENTS',
      opportunityId: curatedOpportunities[0]!.id,
      sourceVersion: curatedOpportunities[0]!.sourceVersion,
      summary: 'Stale response',
      groundedRequirements: [],
      suggestedActions: [],
      unknowns: [],
      cautionNote: 'Stale',
      inferenceSource: 'IN_CLOUD',
      requestedMode: 'ONLY_IN_CLOUD',
      modelId: 'gemini-3.5-flash-lite',
      latencyMs: 50,
      completedAt: new Date().toISOString(),
    });

    await expect(req1).rejects.toMatchObject({ code: 'REQUEST_CANCELLED' });
  });
});
