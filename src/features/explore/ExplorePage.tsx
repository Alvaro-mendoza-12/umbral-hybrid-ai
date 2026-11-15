import {
  BookmarkCheck,
  BookmarkPlus,
  Compass,
  ExternalLink,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../app/appContextStore';
import { CATEGORY_META } from '../../components/categoryMeta';
import {
  CategoryBadge,
  DeadlineChip,
  FitSummary,
  ProviderMonogram,
} from '../../components/OpportunityIndicators';
import { OpportunityStatusBadge } from '../../components/StatusBadge';
import {
  computeOpportunityStatus,
  formatIsoDate,
  getDeadlineCountdown,
} from '../../domain/catalogRules';
import { evaluateOpportunityFit, hasAnyProfileInput } from '../../domain/matcher';
import type {
  CatalogFilters,
  CategoryId,
  DeadlineWindowFilter,
  Locale,
  Modality,
  Opportunity,
} from '../../domain/types';

const COUNTRY_OPTIONS = ['PE', 'CO', 'MX', 'ES', 'US', 'INT'] as const;
const CATEGORY_OPTIONS: readonly CategoryId[] = [
  'education',
  'employment',
  'training',
  'entrepreneurship',
  'civic',
];
const MODALITY_OPTIONS: readonly Modality[] = ['online', 'onsite', 'hybrid'];
const DEADLINE_WINDOWS: readonly Exclude<DeadlineWindowFilter, ''>[] = [
  'closing_soon',
  'has_deadline',
  'ongoing',
  'review_required',
];

/** Filters live in the URL so Back, reload and shared links keep the exact context. */
function filtersFromParams(params: URLSearchParams): CatalogFilters {
  const country = params.get('country') ?? '';
  const category = params.get('cat') ?? '';
  const modality = params.get('mod') ?? '';
  const language = params.get('lang') ?? '';
  const win = params.get('win') ?? '';
  return {
    query: params.get('q') ?? '',
    country: (COUNTRY_OPTIONS as readonly string[]).includes(country) ? country : '',
    category: (CATEGORY_OPTIONS as readonly string[]).includes(category)
      ? (category as CategoryId)
      : '',
    modality: (MODALITY_OPTIONS as readonly string[]).includes(modality)
      ? (modality as Modality)
      : '',
    language: language === 'es' || language === 'en' ? language : '',
    deadlineWindow: (DEADLINE_WINDOWS as readonly string[]).includes(win)
      ? (win as DeadlineWindowFilter)
      : '',
    includeClosed: params.get('closed') === '1',
  };
}

export function ExplorePage() {
  const { t } = useTranslation();
  const { catalogPort, locale, profile, route, saveOpportunity, startTour, unsaveOpportunity } =
    useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [totalWithClosedCount, setTotalWithClosedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [reloadTick, setReloadTick] = useState<number>(0);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const catalogMeta = catalogPort.getCatalogMetadata();

  const patchFilters = (patch: Partial<Record<string, string | null>>, replace = false) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace },
    );
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  useEffect(() => {
    let active = true;
    Promise.all([
      catalogPort.listOpportunities(filters),
      filters.includeClosed
        ? Promise.resolve<Opportunity[] | null>(null)
        : catalogPort.listOpportunities({ ...filters, includeClosed: true }),
    ])
      .then(([visibleList, fullList]) => {
        if (!active) return;
        setLoadError(false);
        setItems(visibleList);
        setTotalWithClosedCount(fullList ? fullList.length : visibleList.length);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [catalogPort, filters, reloadTick]);

  const excludedCount = Math.max(0, totalWithClosedCount - items.length);
  const secondaryActiveCount = [
    filters.modality,
    filters.language,
    filters.deadlineWindow,
    filters.includeClosed ? 'closed' : '',
  ].filter(Boolean).length;
  const hasActiveFilters = Boolean(
    filters.query || filters.country || filters.category || secondaryActiveCount > 0,
  );
  const hasProfile = hasAnyProfileInput(profile);

  const fitByOpportunity = useMemo(() => {
    if (!hasProfile) return new Map<string, ReturnType<typeof evaluateOpportunityFit>>();
    return new Map(items.map((item) => [item.id, evaluateOpportunityFit(item, profile)]));
  }, [hasProfile, items, profile]);

  return (
    <div className="explore-stack">
      <section className="explore-hero animate-enter" aria-labelledby="explore-hero-heading">
        <div className="explore-hero-copy">
          <h1 id="explore-hero-heading">{t('explore.heroTitle')}</h1>
          <p>{t('explore.heroDescription')}</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm explore-hero-help"
          data-testid="hero-tour-cta"
          onClick={startTour}
        >
          <Compass size={16} aria-hidden="true" />
          <span>{t('explore.howItWorksCta')}</span>
        </button>
      </section>

      <section
        id="finder-section"
        className="finder-panel animate-enter stagger-1"
        aria-label={t('explore.finderHeading')}
        data-tour="finder"
      >
        <div className="finder-top-row">
          <div className="finder-search-row">
            <label htmlFor="finder-query" className="sr-only">
              {t('explore.searchLabel')}
            </label>
            <div className="search-field">
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchInputRef}
                id="finder-query"
                type="search"
                className="text-input search-input"
                value={filters.query}
                placeholder={t('explore.searchPlaceholder')}
                autoComplete="off"
                onChange={(e) => patchFilters({ q: e.target.value }, true)}
              />
            </div>
          </div>

          <div className="finder-side-controls">
            <div className="field-group country-field">
              <label htmlFor="finder-country" className="sr-only">
                {t('explore.countryLabel')}
              </label>
              <select
                id="finder-country"
                className="select-input"
                value={filters.country}
                onChange={(e) => patchFilters({ country: e.target.value })}
              >
                <option value="">{t('countries.all')}</option>
                {COUNTRY_OPTIONS.map((code) => (
                  <option key={code} value={code}>
                    {t(`countries.${code}`)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              aria-expanded={moreOpen}
              aria-controls="more-filters-panel"
              onClick={() => setMoreOpen((open) => !open)}
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              <span>
                {secondaryActiveCount > 0
                  ? t('explore.moreFiltersCount', { count: secondaryActiveCount })
                  : t('explore.moreFilters')}
              </span>
            </button>
          </div>
        </div>

        <div
          className="chip-row"
          role="group"
          aria-label={t('explore.categoryLabel')}
          data-testid="category-chips"
        >
          <button
            type="button"
            className="chip"
            aria-pressed={filters.category === ''}
            onClick={() => patchFilters({ cat: null })}
          >
            {t('categories.all')}
          </button>
          {CATEGORY_OPTIONS.map((cat) => {
            const Icon = CATEGORY_META[cat].icon;
            return (
              <button
                key={cat}
                type="button"
                className={`chip ${CATEGORY_META[cat].className}`}
                aria-pressed={filters.category === cat}
                onClick={() => patchFilters({ cat: filters.category === cat ? null : cat })}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{t(`categories.${cat}`)}</span>
              </button>
            );
          })}
        </div>

        {moreOpen && (
          <div id="more-filters-panel" className="more-filters" role="group" aria-label={t('explore.moreFilters')}>
            <div className="field-group">
              <label htmlFor="finder-modality" className="field-label">
                {t('explore.modalityLabel')}
              </label>
              <select
                id="finder-modality"
                className="select-input"
                value={filters.modality}
                onChange={(e) => patchFilters({ mod: e.target.value })}
              >
                <option value="">{t('modality.all')}</option>
                {MODALITY_OPTIONS.map((mod) => (
                  <option key={mod} value={mod}>
                    {t(`modality.${mod}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="finder-language" className="field-label">
                {t('explore.languageLabel')}
              </label>
              <select
                id="finder-language"
                className="select-input"
                value={filters.language ?? ''}
                onChange={(e) => patchFilters({ lang: e.target.value as '' | Locale })}
              >
                <option value="">{t('explore.languages.all')}</option>
                <option value="es">{t('explore.languages.es')}</option>
                <option value="en">{t('explore.languages.en')}</option>
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="finder-deadline" className="field-label">
                {t('explore.windowFilterLabel')}
              </label>
              <select
                id="finder-deadline"
                className="select-input"
                value={filters.deadlineWindow ?? ''}
                onChange={(e) => patchFilters({ win: e.target.value })}
              >
                <option value="">{t('explore.windows.all')}</option>
                {DEADLINE_WINDOWS.map((win) => (
                  <option key={win} value={win}>
                    {t(`explore.windows.${win}`)}
                  </option>
                ))}
              </select>
            </div>

            <label className="check-row">
              <input
                type="checkbox"
                checked={filters.includeClosed}
                onChange={(e) => patchFilters({ closed: e.target.checked ? '1' : null })}
              />
              <span>{t('explore.includeClosed', { count: excludedCount })}</span>
            </label>
          </div>
        )}

        <div className="results-bar">
          <span role="status" aria-live="polite" className="results-count">
            {loading ? t('common.loading') : t('explore.resultsCount', { count: items.length })}
          </span>
          <span className="results-meta">{t('explore.catalogVerified', { date: catalogMeta.lastCuratedAt })}</span>
          {hasActiveFilters && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <RotateCcw size={14} aria-hidden="true" />
              <span>{t('explore.clearFilters')}</span>
            </button>
          )}
        </div>
      </section>

      {loadError ? (
        <section className="surface-card stack-sm" role="alert">
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{t('explore.errorTitle')}</h2>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>{t('explore.errorBody')}</p>
          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setLoading(true);
                setReloadTick((n) => n + 1);
              }}
            >
              {t('explore.retryLoad')}
            </button>
          </div>
        </section>
      ) : !loading && items.length === 0 ? (
        <section className="empty-state" role="status">
          <svg viewBox="0 0 96 96" width="88" height="88" aria-hidden="true" focusable="false">
            <circle cx="48" cy="48" r="38" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.35" />
            <circle cx="48" cy="48" r="4" fill="currentColor" />
            <path d="M48 16 L55 48 L48 80 L41 48 Z" fill="currentColor" opacity="0.8" />
          </svg>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{t('explore.emptyTitle')}</h2>
          <p style={{ margin: 0, color: 'var(--ink-secondary)', maxWidth: '46ch' }}>
            {t('explore.emptyBody')}
          </p>
          <button type="button" className="btn btn-primary" onClick={clearFilters}>
            {t('explore.clearFilters')}
          </button>
        </section>
      ) : (
        <ul className="opportunity-list animate-enter stagger-2" aria-label={t('explore.finderHeading')}>
          {items.map((opportunity, idx) => {
            const status = computeOpportunityStatus(opportunity);
            const isSaved = Boolean(route.saved[opportunity.id]);
            const countdown = getDeadlineCountdown(opportunity);
            const catClass = CATEGORY_META[opportunity.category].className;

            return (
              <li key={opportunity.id}>
                <article
                  className={`opportunity-card opp-card ${catClass}`}
                  data-tour={idx === 0 ? 'detail-card' : undefined}
                >
                  <div className="opp-top-row">
                    <div className="opp-badges">
                      <CategoryBadge category={opportunity.category} />
                      <OpportunityStatusBadge status={status} />
                      <DeadlineChip countdown={countdown} />
                    </div>
                  </div>

                  <div className="opp-provider-row">
                    <ProviderMonogram
                      name={opportunity.providerName[locale]}
                      category={opportunity.category}
                    />
                    <div className="opp-provider-text">
                      <span className="opp-provider-name">{opportunity.providerName[locale]}</span>
                      <span className="opp-provider-meta">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{opportunity.locationLabel[locale]}</span>
                        <span aria-hidden="true">·</span>
                        <span>{t(`modality.${opportunity.modality}`)}</span>
                      </span>
                    </div>
                  </div>

                  <h2 className="opp-title">
                    <Link
                      to={`/opportunities/${opportunity.id}`}
                      state={{ fromSearch: searchParams.toString() }}
                    >
                      {opportunity.title[locale]}
                    </Link>
                  </h2>

                  <p className="opp-benefit">
                    <strong>{t('explore.benefitLabel')}:</strong> {opportunity.benefit[locale]}
                  </p>

                  <FitSummary
                    summary={fitByOpportunity.get(opportunity.id) ?? null}
                    hasProfile={hasProfile}
                  />

                  <div className="opp-footer">
                    <span className="opp-verified">
                      {status === 'review_required' || status === 'closed'
                        ? t('explore.lastCheckedLabel')
                        : t('explore.verifiedLabel')}
                      : {formatIsoDate(opportunity.verifiedAt, locale)}
                    </span>
                    <div className="card-actions">
                      <Link
                        to={`/opportunities/${opportunity.id}`}
                        state={{ fromSearch: searchParams.toString() }}
                        className="btn btn-primary"
                      >
                        <span>{t('explore.openDetail')}</span>
                        <ExternalLink size={15} aria-hidden="true" />
                      </Link>

                      <button
                        type="button"
                        className={isSaved ? 'btn btn-secondary' : 'btn btn-ghost'}
                        aria-pressed={isSaved}
                        onClick={() => {
                          if (isSaved) {
                            unsaveOpportunity(opportunity.id);
                          } else {
                            saveOpportunity(opportunity);
                          }
                        }}
                      >
                        {isSaved ? (
                          <BookmarkCheck size={16} aria-hidden="true" />
                        ) : (
                          <BookmarkPlus size={16} aria-hidden="true" />
                        )}
                        <span>{isSaved ? t('explore.savedAction') : t('explore.saveAction')}</span>
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
