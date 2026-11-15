import { describe, expect, it } from 'vitest';
import { curatedOpportunities } from '../../src/data/opportunities';
import {
  computeOpportunityStatus,
  filterOpportunities,
  getDeadlineCountdown,
  isSafeHttpsUrl,
} from '../../src/domain/catalogRules';

describe('catalogRules', () => {
  it('enforces strict https URLs and rejects unsafe schemes', () => {
    expect(isSafeHttpsUrl('https://www.pronabec.gob.pe/beca-18/')).toBe(true);
    expect(isSafeHttpsUrl('http://example.com')).toBe(false);
    expect(isSafeHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpsUrl('data:text/html,<script>1</script>')).toBe(false);
    expect(isSafeHttpsUrl('')).toBe(false);
    expect(isSafeHttpsUrl(undefined)).toBe(false);
  });

  it('computes deadline closure and review_required accurately by date and instant', () => {
    const sample = curatedOpportunities.find((o) => o.id === 'int-eth-esop-2027')!;
    expect(computeOpportunityStatus(sample, new Date('2026-11-15T10:00:00Z'))).toBe('open');
    expect(computeOpportunityStatus(sample, new Date('2026-11-30T10:58:59Z'))).toBe('review_required');
    expect(computeOpportunityStatus(sample, new Date('2026-11-30T11:00:01Z'))).toBe('closed');
  });

  it('filters opportunities by query, country/international eligibility, category, and includeClosed', () => {
    const peAll = filterOpportunities(
      curatedOpportunities,
      { query: '', country: 'PE', category: '', modality: '', includeClosed: true },
      new Date('2026-11-14T12:00:00Z'),
    );
    expect(peAll.some((o) => o.id === 'pe-beca-18-2027')).toBe(true);
    expect(peAll.some((o) => o.id === 'int-eth-esop-2027')).toBe(true);

    const peOpenOnly = filterOpportunities(
      curatedOpportunities,
      { query: '', country: 'PE', category: '', modality: '', includeClosed: false },
      new Date('2026-11-14T12:00:00Z'),
    );
    expect(peOpenOnly.some((o) => o.id === 'pe-beca-18-2027')).toBe(false);

    const ethSearch = filterOpportunities(
      curatedOpportunities,
      { query: 'Zürich', country: '', category: 'education', modality: 'onsite', includeClosed: false },
      new Date('2026-11-14T12:00:00Z'),
    );
    expect(ethSearch.map((o) => o.id)).toContain('int-eth-esop-2027');
  });

  it('filters by language (including es/en bilingual) and deadlineWindow facets', () => {
    const now = new Date('2026-11-14T12:00:00Z');

    const englishOnly = filterOpportunities(
      curatedOpportunities,
      {
        query: '',
        country: '',
        category: '',
        modality: '',
        language: 'en',
        deadlineWindow: '',
        includeClosed: true,
      },
      now,
    );
    expect(englishOnly.some((o) => o.id === 'int-eth-esop-2027')).toBe(true);
    expect(englishOnly.some((o) => o.id === 'int-google-it-support')).toBe(true);
    expect(englishOnly.some((o) => o.id === 'pe-cse-ofis')).toBe(false);

    const closingSoon = filterOpportunities(
      curatedOpportunities,
      {
        query: '',
        country: '',
        category: '',
        modality: '',
        language: '',
        deadlineWindow: 'closing_soon',
        includeClosed: false,
      },
      now,
    );
    expect(closingSoon.some((o) => o.id === 'int-eth-esop-2027')).toBe(true);
    expect(closingSoon.some((o) => o.id === 'us-pell-2026')).toBe(false);

    const ongoing = filterOpportunities(
      curatedOpportunities,
      {
        query: '',
        country: '',
        category: '',
        modality: '',
        language: '',
        deadlineWindow: 'ongoing',
        includeClosed: false,
      },
      now,
    );
    expect(ongoing.some((o) => o.id === 'pe-cse-ofis')).toBe(true);
    expect(ongoing.every((o) => o.deadline.precision === 'none')).toBe(true);

    const reviewRequired = filterOpportunities(
      curatedOpportunities,
      {
        query: '',
        country: '',
        category: '',
        modality: '',
        language: '',
        deadlineWindow: 'review_required',
        includeClosed: false,
      },
      now,
    );
    expect(reviewRequired.some((o) => o.id === 'pe-promigas-billing')).toBe(true);
    expect(reviewRequired.some((o) => o.id === 'co-aws-intern')).toBe(true);

    const defaultActiveOnly = filterOpportunities(
      curatedOpportunities,
      {
        query: '',
        country: '',
        category: '',
        modality: '',
        language: '',
        deadlineWindow: '',
        includeClosed: false,
      },
      now,
    );
    expect(defaultActiveOnly.some((o) => o.id === 'pe-promigas-billing')).toBe(false);
    expect(defaultActiveOnly.some((o) => o.id === 'co-aws-intern')).toBe(false);
    expect(defaultActiveOnly.some((o) => o.id === 'es-cybersecurity-94')).toBe(false);

    const includingClosedAndReview = filterOpportunities(
      curatedOpportunities,
      {
        query: '',
        country: '',
        category: '',
        modality: '',
        language: '',
        deadlineWindow: '',
        includeClosed: true,
      },
      now,
    );
    expect(includingClosedAndReview.some((o) => o.id === 'pe-promigas-billing')).toBe(true);
  });

  it('evaluates pe-innovasuyu-libertad extended 2026-11-12 13:00 America/Lima cutoff accurately', () => {
    const innovasuyu = curatedOpportunities.find((o) => o.id === 'pe-innovasuyu-libertad')!;
    expect(computeOpportunityStatus(innovasuyu, new Date('2026-11-14T12:00:00Z'))).toBe('closed');
    const simulatedActive = { ...innovasuyu, editorialStatus: 'open' as const };
    expect(computeOpportunityStatus(simulatedActive, new Date('2026-11-12T17:59:00Z'))).toBe('open');
    expect(computeOpportunityStatus(simulatedActive, new Date('2026-11-12T18:01:00Z'))).toBe('closed');
  });

  it('computes honest deadline countdowns for fixed deadlines, rolling calls, and closed entries', () => {
    const eth = curatedOpportunities.find((o) => o.id === 'int-eth-esop-2027')!;
    const ethSoon = getDeadlineCountdown(eth, new Date('2026-11-20T12:00:00Z'));
    expect(ethSoon.kind).toBe('days');
    if (ethSoon.kind === 'days') {
      expect(ethSoon.days).toBe(10);
      expect(ethSoon.urgent).toBe(true);
    }

    const ethClosingToday = getDeadlineCountdown(
      { ...eth, reviewBy: '2026-11-30' },
      new Date('2026-11-30T08:00:00Z'),
    );
    expect(ethClosingToday).toEqual({ kind: 'today', urgent: true });

    const ofis = curatedOpportunities.find((o) => o.id === 'pe-cse-ofis')!;
    expect(getDeadlineCountdown(ofis, new Date('2026-11-14T12:00:00Z'))).toEqual({
      kind: 'ongoing',
    });

    const b18 = curatedOpportunities.find((o) => o.id === 'pe-beca-18-2027')!;
    expect(getDeadlineCountdown(b18, new Date('2026-11-14T12:00:00Z'))).toEqual({
      kind: 'none',
    });
  });
});
