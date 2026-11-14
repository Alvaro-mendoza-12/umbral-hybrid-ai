import {
  AlertCircle,
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../app/appContextStore';
import { OpportunityStatusBadge } from '../../components/StatusBadge';
import {
  computeOpportunityStatus,
  formatIsoDate,
  isSafeHttpsUrl,
} from '../../domain/catalogRules';
import type { Opportunity } from '../../domain/types';
import { HybridAIPanel } from './HybridAIPanel';
import { SelfCheckPanel } from './SelfCheckPanel';

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const {
    aiOrchestrator,
    catalogPort,
    locale,
    route,
    saveOpportunity,
    unsaveOpportunity,
  } = useApp();

  const [opportunity, setOpportunity] = useState<Opportunity | undefined>(undefined);
  const [candidates, setCandidates] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return () => {
      aiOrchestrator.cancelActiveRequests();
    };
  }, [aiOrchestrator, id]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      id ? catalogPort.getOpportunityById(id) : Promise.resolve(undefined),
      catalogPort.listOpportunities({
        query: '',
        country: '',
        category: '',
        modality: '',
        includeClosed: true,
      }),
    ]).then(([found, allItems]) => {
      if (!active) return;
      setOpportunity(found);
      setCandidates(allItems.filter((item) => item.id !== id));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [catalogPort, id]);

  if (loading) {
    return (
      <div className="surface-card" role="status">
        {t('common.loading')}
      </div>
    );
  }

  if (!opportunity) {
    return (
      <section className="surface-card stack-md">
        <h1 style={{ margin: 0 }}>{t('explore.emptyTitle')}</h1>
        <div>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{t('common.backToExplore')}</span>
          </Link>
        </div>
      </section>
    );
  }

  const computedStatus = computeOpportunityStatus(opportunity);
  const isSaved = Boolean(route.saved[opportunity.id]);
  const safeOfficialUrl = isSafeHttpsUrl(opportunity.officialUrl)
    ? opportunity.officialUrl
    : null;
  const safeApplyUrl = isSafeHttpsUrl(opportunity.applyUrl)
    ? opportunity.applyUrl
    : null;

  return (
    <div className="stack-lg">
      <div>
        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{t('common.backToExplore')}</span>
        </Link>
      </div>

      <article className="surface-card stack-md">
        <div className="opportunity-header-row">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <OpportunityStatusBadge status={computedStatus} />
            <span className="pill pill-neutral">
              {t(`categories.${opportunity.category}`)}
            </span>
            <span className="pill pill-neutral">
              {t(`modality.${opportunity.modality}`)}
            </span>
            <span className="pill pill-neutral">{opportunity.locationLabel[locale]}</span>
          </div>

          <span className="pill pill-good">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>
              {t('detail.verifiedOn', {
                date: formatIsoDate(opportunity.verifiedAt, locale),
              })}
            </span>
          </span>
        </div>

        <div className="stack-sm">
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--brand-primary)',
            }}
          >
            {opportunity.providerName[locale]}
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.32rem, 2.4vw, 1.85rem)',
              lineHeight: 1.24,
            }}
          >
            {opportunity.title[locale]}
          </h1>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {opportunity.summary[locale]}
          </p>
          <p style={{ margin: 0, fontWeight: 600 }}>
            {opportunity.benefit[locale]}
          </p>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className={isSaved ? 'btn btn-secondary' : 'btn btn-primary'}
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

          {safeOfficialUrl ? (
            <a
              href={safeOfficialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <span>{t('detail.officialLinkBtn')}</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <span className="banner banner-warn" style={{ marginBottom: 0 }}>
              {t('detail.unsafeUrlWarning')}
            </span>
          )}

          {safeApplyUrl && safeApplyUrl !== safeOfficialUrl && (
            <a
              href={safeApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <span>{t('detail.applyLinkBtn')}</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </article>

      <div className="detail-layout">
        <div className="stack-lg">
          <section className="surface-card stack-md" aria-labelledby="dossier-heading">
            <h2 id="dossier-heading" style={{ margin: 0, fontSize: '1.15rem' }}>
              {t('detail.trustHeader')}
            </h2>

            <div className="two-col-form">
              <div className="subtle-card stack-sm">
                <strong style={{ fontSize: '0.88rem' }}>{t('detail.costHeading')}</strong>
                <span style={{ fontSize: '0.92rem' }}>
                  {opportunity.cost.summary[locale]}
                </span>
              </div>

              <div className="subtle-card stack-sm">
                <strong style={{ fontSize: '0.88rem' }}>
                  {t('detail.deadlineHeading')}
                </strong>
                <span style={{ fontSize: '0.92rem' }}>
                  {opportunity.deadline.label[locale]}
                </span>
              </div>
            </div>

            <div className="stack-sm">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                {t('detail.instructionsHeading')}
              </h3>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                {opportunity.officialInstructions[locale]}
              </p>
            </div>

            <div className="stack-sm">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                {t('detail.requirementsHeading')}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '6px' }}>
                {opportunity.requirements.map((req) => (
                  <li key={req.id}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      [{req.id}]
                    </code>{' '}
                    <span>{req.text[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="stack-sm">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                {t('detail.conditionsHeading')}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '6px' }}>
                {opportunity.conditions.map((cond) => (
                  <li key={cond.id}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      [{cond.id}]
                    </code>{' '}
                    <span>{cond.text[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {opportunity.unknownFields.length > 0 && (
              <div className="banner banner-warn stack-sm" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={16} aria-hidden="true" />
                  <strong>{t('detail.unknownsHeading')}</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {opportunity.unknownFields.map((item, idx) => (
                    <li key={idx}>{item[locale]}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="stack-sm">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{t('detail.sourcesHeading')}</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '4px' }}>
                {opportunity.sources.map((src) => (
                  <li key={src.id} className="wrap-text">
                    {isSafeHttpsUrl(src.url) ? (
                      <a href={src.url} target="_blank" rel="noopener noreferrer">
                        {src.title[locale]}
                      </a>
                    ) : (
                      <span>{src.title[locale]}</span>
                    )}{' '}
                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.82rem' }}>
                      ({src.publisher} · {formatIsoDate(src.verifiedAt, locale)})
                    </span>
                  </li>
                ))}
              </ul>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                {t('detail.reviewBy', {
                  date: formatIsoDate(opportunity.reviewBy, locale),
                })}
              </span>
            </div>
          </section>

          <SelfCheckPanel opportunity={opportunity} />
        </div>

        <HybridAIPanel
          opportunity={opportunity}
          comparisonCandidates={candidates}
        />
      </div>
    </div>
  );
}
