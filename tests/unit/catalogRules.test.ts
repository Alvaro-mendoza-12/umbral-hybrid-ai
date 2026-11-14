import { describe, expect, it } from 'vitest';
import { curatedOpportunities } from '../../src/data/opportunities';
import {
  computeOpportunityStatus,
  filterOpportunities,
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
});
