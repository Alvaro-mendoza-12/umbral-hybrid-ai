import { BookmarkCheck, BookmarkPlus, Calendar, ExternalLink, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useApp } from '../../app/appContextStore';
import { OpportunityStatusBadge } from '../../components/StatusBadge';
import { computeOpportunityStatus, formatIsoDate } from '../../domain/catalogRules';
import type { CatalogFilters, CategoryId, Modality, Opportunity } from '../../domain/types';

const INITIAL_FILTERS: CatalogFilters = {
  query: '',
  country: '',
  category: '',
  modality: '',
  includeClosed: false,
};

const COUNTRY_OPTIONS = ['PE', 'CO', 'MX', 'ES', 'US', 'INT'] as const;
const CATEGORY_OPTIONS: readonly CategoryId[] = [
  'employment',
  'education',
  'training',
  'entrepreneurship',
  'civic',
];
const MODALITY_OPTIONS: readonly Modality[] = ['online', 'onsite', 'hybrid'];

export function ExplorePage() {
  const { t } = useTranslation();
  const { catalogPort, locale, route, saveOpportunity, unsaveOpportunity } = useApp();
  const [filters, setFilters] = useState<CatalogFilters>(INITIAL_FILTERS);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [totalWithClosedCount, setTotalWithClosedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const catalogMeta = catalogPort.getCatalogMetadata();

  useEffect(() => {
    let active = true;
    void Promise.all([
      catalogPort.listOpportunities(filters),
      filters.includeClosed
        ? Promise.resolve<Opportunity[] | null>(null)
        : catalogPort.listOpportunities({ ...filters, includeClosed: true }),
    ]).then(([visibleList, fullList]) => {
      if (!active) return;
      setItems(visibleList);
      setTotalWithClosedCount(fullList ? fullList.length : visibleList.length);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [catalogPort, filters]);

  const excludedCount = Math.max(0, totalWithClosedCount - items.length);
  const hasActiveFilters = Boolean(
    filters.query || filters.country || filters.category || filters.modality || filters.includeClosed,
  );

  return (
    <div className="stack-lg">
      <section className="surface-card stack-sm" aria-labelledby="explore-hero-heading">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--brand-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {t('explore.heroKicker')}
          </span>
          <span className="pill pill-neutral">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>{t('explore.catalogVerified', { date: catalogMeta.lastCuratedAt })}</span>
          </span>
        </div>

        <h1
          id="explore-hero-heading"
          style={{
            margin: 0,
            fontSize: 'clamp(1.38rem, 2.5vw, 1.95rem)',
            lineHeight: 1.22,
          }}
        >
          {t('explore.heroTitle')}
        </h1>

        <p
          style={{
            margin: 0,
            color: 'var(--ink-secondary)',
            maxWidth: '72ch',
          }}
        >
          {t('explore.heroDescription')}
        </p>
      </section>

      <section
        className="surface-card stack-md"
        aria-labelledby="finder-heading"
        data-tour="finder"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <h2 id="finder-heading" style={{ margin: 0, fontSize: '1.12rem' }}>
            {t('explore.finderHeading')}
          </h2>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setFilters(INITIAL_FILTERS)}
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>{t('explore.clearFilters')}</span>
            </button>
          )}
        </div>

        <div className="finder-grid">
          <div className="field-group">
            <label htmlFor="finder-query" className="field-label">
              {t('explore.searchLabel')}
            </label>
            <input
              id="finder-query"
              type="search"
              className="text-input"
              value={filters.query}
              placeholder={t('explore.searchPlaceholder')}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            />
          </div>

          <div className="field-group">
            <label htmlFor="finder-country" className="field-label">
              {t('explore.countryLabel')}
            </label>
            <select
              id="finder-country"
              className="select-input"
              value={filters.country}
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
            >
              <option value="">{t('countries.all')}</option>
              {COUNTRY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {t(`countries.${code}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="finder-category" className="field-label">
              {t('explore.categoryLabel')}
            </label>
            <select
              id="finder-category"
              className="select-input"
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value as CategoryId | '',
                }))
              }
            >
              <option value="">{t('categories.all')}</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="finder-modality" className="field-label">
              {t('explore.modalityLabel')}
            </label>
            <select
              id="finder-modality"
              className="select-input"
              value={filters.modality}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  modality: e.target.value as Modality | '',
                }))
              }
            >
              <option value="">{t('modality.all')}</option>
              {MODALITY_OPTIONS.map((mod) => (
                <option key={mod} value={mod}>
                  {t(`modality.${mod}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              minHeight: '38px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: 'var(--ink-secondary)',
            }}
          >
            <input
              type="checkbox"
              checked={filters.includeClosed}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, includeClosed: e.target.checked }))
              }
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }}
            />
            <span>{t('explore.includeClosed', { count: excludedCount })}</span>
          </label>

          <span
            role="status"
            aria-live="polite"
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--ink-secondary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {loading
              ? t('common.loading')
              : t('explore.resultsCount', { count: items.length })}
          </span>
        </div>
      </section>

      {!loading && items.length === 0 ? (
        <section className="surface-card stack-sm" role="status">
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{t('explore.emptyTitle')}</h2>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>{t('explore.emptyBody')}</p>
          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setFilters(INITIAL_FILTERS)}
            >
              {t('explore.clearFilters')}
            </button>
          </div>
        </section>
      ) : (
        <ul className="opportunity-list" aria-label={t('explore.finderHeading')}>
          {items.map((opportunity, idx) => {
            const status = computeOpportunityStatus(opportunity);
            const isSaved = Boolean(route.saved[opportunity.id]);

            return (
              <li key={opportunity.id}>
                <article
                  className="surface-card opportunity-card"
                  data-tour={idx === 0 ? 'detail-card' : undefined}
                >
                  <div className="opportunity-header-row">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      <OpportunityStatusBadge status={status} />
                      <span className="pill pill-neutral">
                        {t(`categories.${opportunity.category}`)}
                      </span>
                      <span className="pill pill-neutral">
                        {t(`modality.${opportunity.modality}`)}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--ink-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {opportunity.providerName[locale]}
                    </span>
                  </div>

                  <div className="stack-sm">
                    <h2 style={{ margin: 0, fontSize: '1.16rem', lineHeight: 1.3 }}>
                      <Link
                        to={`/opportunities/${opportunity.id}`}
                        style={{ textDecoration: 'none', color: 'var(--ink-primary)' }}
                      >
                        {opportunity.title[locale]}
                      </Link>
                    </h2>

                    <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                      {opportunity.summary[locale]}
                    </p>
                  </div>

                  <div className="meta-strip">
                    <span>
                      <Calendar size={15} aria-hidden="true" />
                      <strong>{t('explore.deadlineLabel')}:</strong>{' '}
                      {opportunity.deadline.label[locale]}
                    </span>
                    <span>
                      <strong>{t('explore.keyConditionLabel')}:</strong>{' '}
                      {opportunity.keyCondition[locale]}
                    </span>
                    <span>
                      <strong>{t('explore.verifiedLabel')}:</strong>{' '}
                      {formatIsoDate(opportunity.verifiedAt, locale)}
                    </span>
                  </div>

                  <div className="card-actions">
                    <Link
                      to={`/opportunities/${opportunity.id}`}
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
                      <span>
                        {isSaved ? t('explore.savedAction') : t('explore.saveAction')}
                      </span>
                    </button>
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
