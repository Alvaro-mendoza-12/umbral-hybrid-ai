import type {
  CatalogFilters,
  ComputedOpportunityStatus,
  Locale,
  Opportunity,
} from './types';

const COUNTRY_TIMEZONES: Record<string, string> = {
  PE: 'America/Lima',
  US: 'America/New_York',
  MX: 'America/Mexico_City',
  CO: 'America/Bogota',
  ES: 'Europe/Madrid',
  INT: 'UTC',
};

export function isSafeHttpsUrl(rawUrl: string | undefined): rawUrl is string {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getDateInTimeZone(now: Date, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const month = parts.find((p) => p.type === 'month')?.value ?? '01';
    const day = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${year}-${month}-${day}`;
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

export function computeOpportunityStatus(
  opportunity: Opportunity,
  now: Date = new Date(),
): ComputedOpportunityStatus {
  if (opportunity.editorialStatus === 'withdrawn') {
    return 'withdrawn';
  }
  if (opportunity.editorialStatus === 'closed') {
    return 'closed';
  }

  const timeZone =
    opportunity.deadline.timeZone ??
    COUNTRY_TIMEZONES[opportunity.countryCode] ??
    'UTC';
  const localToday = getDateInTimeZone(now, timeZone);

  if (opportunity.deadline.deadlineAt) {
    const deadlineMs = Date.parse(opportunity.deadline.deadlineAt);
    if (!Number.isNaN(deadlineMs) && now.getTime() >= deadlineMs) {
      return 'closed';
    }
  }

  if (opportunity.deadline.closesOn && localToday > opportunity.deadline.closesOn) {
    return 'closed';
  }

  if (localToday > opportunity.reviewBy) {
    return 'review_required';
  }

  if (opportunity.deadline.opensOn && localToday < opportunity.deadline.opensOn) {
    return 'upcoming';
  }

  return opportunity.editorialStatus;
}

export function matchesCountryFilter(
  opportunity: Opportunity,
  countryFilter: string,
): boolean {
  if (!countryFilter) return true;
  const code = countryFilter.toUpperCase();
  if (opportunity.countryCode === code) return true;
  if (
    opportunity.scope === 'international' &&
    opportunity.eligibleCountries.includes(code)
  ) {
    return true;
  }
  return false;
}

export function filterOpportunities(
  opportunities: readonly Opportunity[],
  filters: CatalogFilters,
  now: Date = new Date(),
): Opportunity[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase();

  const filtered = opportunities.filter((opportunity) => {
    const status = computeOpportunityStatus(opportunity, now);
    if (status === 'withdrawn') return false;
    if (
      !filters.includeClosed &&
      filters.deadlineWindow !== 'review_required' &&
      (status === 'closed' || status === 'review_required')
    ) {
      return false;
    }

    if (!matchesCountryFilter(opportunity, filters.country)) {
      return false;
    }

    if (filters.category && opportunity.category !== filters.category) {
      return false;
    }

    if (filters.modality && opportunity.modality !== filters.modality) {
      return false;
    }

    if (
      filters.language &&
      opportunity.sourceLanguage !== filters.language &&
      opportunity.sourceLanguage !== 'es/en'
    ) {
      return false;
    }

    if (filters.deadlineWindow) {
      if (filters.deadlineWindow === 'review_required' && status !== 'review_required') {
        return false;
      }
      if (filters.deadlineWindow === 'ongoing' && status !== 'ongoing') {
        return false;
      }
      if (filters.deadlineWindow === 'has_deadline' && !opportunity.deadline.closesOn) {
        return false;
      }
      if (filters.deadlineWindow === 'closing_soon') {
        if (status !== 'open' || !opportunity.deadline.closesOn) {
          return false;
        }
        const tz =
          opportunity.deadline.timeZone ??
          COUNTRY_TIMEZONES[opportunity.countryCode] ??
          'UTC';
        const todayIso = getDateInTimeZone(now, tz);
        const diffDays = Math.floor(
          (Date.parse(`${opportunity.deadline.closesOn}T00:00:00Z`) -
            Date.parse(`${todayIso}T00:00:00Z`)) /
            86_400_000,
        );
        if (Number.isNaN(diffDays) || diffDays < 0 || diffDays > 30) {
          return false;
        }
      }
    }

    if (normalizedQuery) {
      const haystack = [
        opportunity.title.es,
        opportunity.title.en,
        opportunity.summary.es,
        opportunity.summary.en,
        opportunity.benefit.es,
        opportunity.benefit.en,
        opportunity.providerName.es,
        opportunity.providerName.en,
        opportunity.locationLabel.es,
        opportunity.locationLabel.en,
        ...opportunity.requirements.flatMap((r) => [r.text.es, r.text.en]),
      ]
        .join(' ')
        .toLocaleLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });

  const statusOrder: Record<ComputedOpportunityStatus, number> = {
    open: 0,
    ongoing: 1,
    upcoming: 2,
    review_required: 3,
    closed: 4,
    withdrawn: 5,
  };

  return [...filtered].sort((a, b) => {
    const statusA = computeOpportunityStatus(a, now);
    const statusB = computeOpportunityStatus(b, now);
    const rankDiff = statusOrder[statusA] - statusOrder[statusB];
    if (rankDiff !== 0) return rankDiff;

    // Nearest explicit deadline first for open opportunities
    if (statusA === 'open') {
      const dateA = a.deadline.closesOn ?? '9999-12-31';
      const dateB = b.deadline.closesOn ?? '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
    }

    // Prefer exact country match over international fallback when a country filter is selected
    if (filters.country) {
      const exactA = a.countryCode === filters.country.toUpperCase() ? 0 : 1;
      const exactB = b.countryCode === filters.country.toUpperCase() ? 0 : 1;
      if (exactA !== exactB) return exactA - exactB;
    }

    return b.verifiedAt.localeCompare(a.verifiedAt);
  });
}

export function formatIsoDate(dateStr: string, locale: Locale): string {
  const parsed = Date.parse(`${dateStr}T12:00:00Z`);
  if (Number.isNaN(parsed)) return dateStr;
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-PE' : 'en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(parsed));
}

export type DeadlineCountdown =
  | { kind: 'days'; days: number; urgent: boolean }
  | { kind: 'today'; urgent: true }
  | { kind: 'ongoing' }
  | { kind: 'none' };

/**
 * Deterministic deadline countdown computed from the published `closesOn` date
 * in the opportunity's own time zone. Returns `none` when no verifiable open
 * deadline exists (closed, pending re-check, upcoming, withdrawn or undated).
 * Never invents a date: it only reflects data already in the catalog.
 */
export function getDeadlineCountdown(
  opportunity: Opportunity,
  now: Date = new Date(),
): DeadlineCountdown {
  const status = computeOpportunityStatus(opportunity, now);
  if (status === 'ongoing') return { kind: 'ongoing' };
  if (status !== 'open' || !opportunity.deadline.closesOn) return { kind: 'none' };

  const timeZone =
    opportunity.deadline.timeZone ?? COUNTRY_TIMEZONES[opportunity.countryCode] ?? 'UTC';
  const todayIso = getDateInTimeZone(now, timeZone);
  const days = Math.round(
    (Date.parse(`${opportunity.deadline.closesOn}T00:00:00Z`) -
      Date.parse(`${todayIso}T00:00:00Z`)) /
      86_400_000,
  );
  if (Number.isNaN(days) || days < 0) return { kind: 'none' };
  if (days === 0) return { kind: 'today', urgent: true };
  return { kind: 'days', days, urgent: days <= 14 };
}
