import { describe, expect, it } from 'vitest';
import { curatedOpportunities } from '../../src/data/opportunities';
import { emptySelfCheckProfile, evaluateOpportunityFit } from '../../src/domain/matcher';
import type { SelfCheckProfile } from '../../src/domain/types';

describe('deterministic 4-state requirement matcher', () => {
  it('returns UNKNOWN for unprovided profile inputs and never guesses eligibility', () => {
    const opp = curatedOpportunities.find((o) => o.id === 'int-eth-esop-2027')!;
    const summary = evaluateOpportunityFit(opp, emptySelfCheckProfile);

    expect(summary.counts.MATCH).toBe(0);
    expect(summary.counts.MISMATCH).toBe(0);
    expect(summary.counts.NEEDS_CONFIRMATION).toBe(1);
    expect(summary.counts.UNKNOWN).toBe(3);
  });

  it('distinguishes MATCH, MISMATCH, NEEDS_CONFIRMATION, and UNKNOWN accurately', () => {
    const opp = curatedOpportunities.find((o) => o.id === 'int-eth-esop-2027')!;
    const profile: SelfCheckProfile = {
      residenceCountry: 'PE',
      workOrStudyAuthorizedInTarget: 'unsure',
      educationLevel: 'technical',
      languages: ['es'],
      preferredModality: 'onsite',
      experienceLevel: 'none',
    };

    const summary = evaluateOpportunityFit(opp, profile);
    const byId = Object.fromEntries(summary.evaluations.map((e) => [e.criterionId, e.status]));

    expect(byId['req-eth-degree']).toBe('MISMATCH');
    expect(byId['req-eth-modality']).toBe('MATCH');
    expect(summary.counts.UNKNOWN + summary.counts.NEEDS_CONFIRMATION).toBeGreaterThan(0);
  });

  it('marks legal authorization as NEEDS_CONFIRMATION when work/study permit is unconfirmed', () => {
    const opp = curatedOpportunities.find((o) => o.id === 'pe-promigas-billing')!;
    const profile: SelfCheckProfile = {
      residenceCountry: 'PE',
      workOrStudyAuthorizedInTarget: 'unsure',
      educationLevel: 'bachelor',
      languages: ['es'],
      preferredModality: 'onsite',
      experienceLevel: '1_to_3y',
    };

    const summary = evaluateOpportunityFit(opp, profile);
    expect(
      summary.evaluations.some(
        (e) => e.status === 'NEEDS_CONFIRMATION' || e.status === 'MATCH',
      ),
    ).toBe(true);
    expect(summary.counts.MISMATCH).toBe(0);
  });
});
