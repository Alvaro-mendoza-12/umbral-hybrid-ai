import {
  AlertCircle,
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  CalendarClock,
  ExternalLink,
  Gift,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../app/appContextStore';
import { CATEGORY_META } from '../../components/categoryMeta';
import {
  CategoryBadge,
  DeadlineChip,
  ProviderMonogram,
} from '../../components/OpportunityIndicators';
import { OpportunityStatusBadge } from '../../components/StatusBadge';
import {
  computeOpportunityStatus,
  formatIsoDate,
  getDeadlineCountdown,
  isSafeHttpsUrl,
} from '../../domain/catalogRules';
import type { Opportunity, RequirementCriterion } from '../../domain/types';
import { HybridAIPanel, type HybridAIPanelHandle } from './HybridAIPanel';
import { UnifiedRequirementsCheck } from './UnifiedRequirementsCheck';

const NARROW_QUERY = '(max-width: 959px)';

function subscribeNarrow(callback: () => void) {
  if (typeof window.matchMedia !== 'function') return () => undefined;
  const mql = window.matchMedia(NARROW_QUERY);
  mql.addEventListener?.('change', callback);
  return () => mql.removeEventListener?.('change', callback);
}

function getNarrowSnapshot() {
  return typeof window.matchMedia === 'function' ? window.matchMedia(NARROW_QUERY).matches : false;
}

function useIsNarrow() {
  return useSyncExternalStore(subscribeNarrow, getNarrowSnapshot, () => false);
}

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <OpportunityDetailContent key={id ?? 'missing'} id={id} />;
}

function OpportunityDetailContent({ id }: { id: string | undefined }) {
  const { t } = useTranslation();
  const location = useLocation();
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
  const [loadError, setLoadError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  const isNarrow = useIsNarrow();
  const [sheetOpen, setSheetOpen] = useState(false);
  const panelRef = useRef<HybridAIPanelHandle | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const fromSearch =
    typeof (location.state as { fromSearch?: unknown } | null)?.fromSearch === 'string'
      ? ((location.state as { fromSearch: string }).fromSearch)
      : '';
  const backTo = fromSearch ? `/?${fromSearch}` : '/';

  useEffect(() => {
    return () => {
      aiOrchestrator.cancelActiveRequests();
    };
  }, [aiOrchestrator, id]);

  useEffect(() => {
    let active = true;
    Promise.all([
      id ? catalogPort.getOpportunityById(id) : Promise.resolve(undefined),
      catalogPort.listOpportunities({
        query: '',
        country: '',
        category: '',
        modality: '',
        includeClosed: true,
      }),
    ])
      .then(([found, allItems]) => {
        if (!active) return;
        setLoadError(false);
        setOpportunity(found);
        setCandidates(allItems.filter((item) => item.id !== id));
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
  }, [catalogPort, id, reloadTick]);

  const sheetIsModal = isNarrow && sheetOpen;

  const openSheet = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    openerRef.current?.focus?.();
  }, []);

  // Bottom sheet (<960px): lock background scroll and move focus into the dialog.
  useEffect(() => {
    if (!sheetIsModal) return undefined;
    document.body.classList.add('sheet-open');
    closeBtnRef.current?.focus();
    return () => {
      document.body.classList.remove('sheet-open');
    };
  }, [sheetIsModal]);

  const handleSheetKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!sheetIsModal) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeSheet();
      return;
    }
    if (event.key === 'Tab' && sheetRef.current) {
      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const handleAskAboutRequirement = (req: RequirementCriterion) => {
    if (isNarrow) openSheet();
    // The panel stays mounted (hidden on narrow screens), so the ref is always ready.
    panelRef.current?.askAboutRequirement(req.text[locale]);
  };

  if (loading) {
    return (
      <div className="surface-card" role="status">
        {t('common.loading')}
      </div>
    );
  }

  if (loadError) {
    return (
      <section className="surface-card stack-md" role="alert">
        <h1 style={{ margin: 0 }}>{t('detail.loadErrorTitle')}</h1>
        <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>{t('detail.loadErrorBody')}</p>
        <div className="card-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setLoading(true);
              setLoadError(false);
              setReloadTick((v) => v + 1);
            }}
          >
            {t('common.retry')}
          </button>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{t('common.backToExplore')}</span>
          </Link>
        </div>
      </section>
    );
  }

  if (!opportunity) {
    return (
      <section className="surface-card stack-md">
        <h1 style={{ margin: 0 }}>{t('detail.notFoundTitle')}</h1>
        <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>{t('detail.notFoundBody')}</p>
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
  const countdown = getDeadlineCountdown(opportunity);
  const isSaved = Boolean(route.saved[opportunity.id]);
  const catClass = CATEGORY_META[opportunity.category].className;
  const safeOfficialUrl = isSafeHttpsUrl(opportunity.officialUrl) ? opportunity.officialUrl : null;
  const safeApplyUrl = isSafeHttpsUrl(opportunity.applyUrl) ? opportunity.applyUrl : null;

  const toggleSave = () => {
    if (isSaved) {
      unsaveOpportunity(opportunity.id);
    } else {
      saveOpportunity(opportunity);
    }
  };

  const saveButton = (
    <button
      type="button"
      className={isSaved ? 'btn btn-secondary' : 'btn btn-primary'}
      aria-pressed={isSaved}
      onClick={toggleSave}
    >
      {isSaved ? (
        <BookmarkCheck size={16} aria-hidden="true" />
      ) : (
        <BookmarkPlus size={16} aria-hidden="true" />
      )}
      <span>{isSaved ? t('explore.savedAction') : t('explore.saveAction')}</span>
    </button>
  );

  const officialLink = safeOfficialUrl ? (
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
  );

  return (
    <div className="detail-page">
      <div>
        <Link to={backTo} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{t('common.backToExplore')}</span>
        </Link>
      </div>

      <div className="detail-layout">
        <div className="detail-main animate-enter">
          <article className={`detail-hero ${catClass}`}>
            <div className="opp-badges">
              <CategoryBadge category={opportunity.category} />
              <OpportunityStatusBadge status={computedStatus} />
              <DeadlineChip countdown={countdown} />
              {computedStatus === 'review_required' ? (
                <span className="pill pill-warn">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>
                    {t('detail.pendingCheckOn', {
                      date: formatIsoDate(opportunity.verifiedAt, locale),
                    })}
                  </span>
                </span>
              ) : computedStatus === 'closed' || computedStatus === 'withdrawn' ? (
                <span className="pill pill-neutral">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>
                    {t('detail.verifiedOn', {
                      date: formatIsoDate(opportunity.verifiedAt, locale),
                    })}
                  </span>
                </span>
              ) : (
                <span className="pill pill-good">
                  <ShieldCheck size={14} aria-hidden="true" />
                  <span>
                    {t('detail.verifiedOn', {
                      date: formatIsoDate(opportunity.verifiedAt, locale),
                    })}
                  </span>
                </span>
              )}
            </div>

            {computedStatus === 'review_required' && (
              <div className="banner banner-warn" role="alert" style={{ marginBottom: 0 }}>
                <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t('detail.reviewRequiredNotice')}</span>
              </div>
            )}

            {computedStatus === 'closed' && (
              <div className="banner banner-info" role="status" style={{ marginBottom: 0 }}>
                <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t('detail.closedNotice')}</span>
              </div>
            )}

            <div className="opp-provider-row">
              <ProviderMonogram
                name={opportunity.providerName[locale]}
                category={opportunity.category}
              />
              <span className="opp-provider-name">{opportunity.providerName[locale]}</span>
            </div>
            <h1 className="detail-title">{opportunity.title[locale]}</h1>
            <p className="detail-summary">{opportunity.summary[locale]}</p>

            <div className="detail-actions card-actions">
              {saveButton}
              {officialLink}
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
              <button
                type="button"
                className="btn btn-primary detail-ask-ai-trigger"
                data-testid="mobile-ask-ai-btn"
                onClick={openSheet}
              >
                <Sparkles size={16} aria-hidden="true" />
                <span>{t('detail.askAiBar')}</span>
              </button>
            </div>
          </article>

          <section className="glance-grid" aria-label={t('detail.section.glance')}>
            <div className="glance-card">
              <h2>
                <Users size={16} aria-hidden="true" />
                <span>{t('detail.section.forWhom')}</span>
              </h2>
              <p className="glance-main">{opportunity.keyCondition[locale]}</p>
              <p className="glance-sub">
                <MapPin size={13} aria-hidden="true" />
                <span>
                  {opportunity.locationLabel[locale]} · {t(`modality.${opportunity.modality}`)}
                </span>
              </p>
            </div>

            <div className="glance-card">
              <h2>
                <CalendarClock size={16} aria-hidden="true" />
                <span>{t('detail.section.availability')}</span>
              </h2>
              <p className="glance-main">{opportunity.deadline.label[locale]}</p>
              <p className="glance-sub">
                {computedStatus === 'review_required' || computedStatus === 'closed'
                  ? t('explore.lastCheckedLabel')
                  : t('explore.verifiedLabel')}
                : {formatIsoDate(opportunity.verifiedAt, locale)}
              </p>
            </div>

            <div className="glance-card">
              <h2>
                <Gift size={16} aria-hidden="true" />
                <span>{t('detail.section.benefits')}</span>
              </h2>
              <p className="glance-main">{opportunity.benefit[locale]}</p>
              <p className="glance-sub">
                <span>
                  <strong>{t('detail.costHeading')}:</strong> {opportunity.cost.summary[locale]}
                </span>
              </p>
            </div>
          </section>

          <UnifiedRequirementsCheck
            opportunity={opportunity}
            onAskAi={handleAskAboutRequirement}
          />

          <section className="detail-section" aria-labelledby="next-steps-heading">
            <h2 id="next-steps-heading">{t('detail.section.nextSteps')}</h2>

            <details className="disclosure" open>
              <summary>{t('detail.instructionsHeading')}</summary>
              <p>{opportunity.officialInstructions[locale]}</p>
            </details>

            <details className="disclosure">
              <summary>
                {t('detail.conditionsHeading')}
                {opportunity.unknownFields.length > 0 && (
                  <span className="pill pill-warn" style={{ marginLeft: '8px' }}>
                    <AlertCircle size={13} aria-hidden="true" />
                    {t('detail.unknownsCount', { count: opportunity.unknownFields.length })}
                  </span>
                )}
              </summary>
              <ul>
                {opportunity.conditions.map((cond) => (
                  <li key={cond.id}>{cond.text[locale]}</li>
                ))}
              </ul>
              {opportunity.unknownFields.length > 0 && (
                <div className="banner banner-warn stack-sm" style={{ marginBottom: 0 }}>
                  <strong>{t('detail.unknownsHeading')}</strong>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {opportunity.unknownFields.map((item, idx) => (
                      <li key={idx}>{item[locale]}</li>
                    ))}
                  </ul>
                </div>
              )}
            </details>

            <details className="disclosure">
              <summary>{t('detail.sourcesHeading')}</summary>
              <ul>
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
                {t('detail.reviewBy', { date: formatIsoDate(opportunity.reviewBy, locale) })}
              </span>
            </details>
          </section>
        </div>

        {sheetIsModal && (
          <button
            type="button"
            className="sheet-backdrop"
            tabIndex={-1}
            aria-label={t('ai.copilot.closeSheet')}
            onClick={closeSheet}
          />
        )}

        <aside
          ref={sheetRef}
          className={`ai-aside${sheetOpen ? ' is-open' : ''}`}
          role={sheetIsModal ? 'dialog' : undefined}
          aria-modal={sheetIsModal ? true : undefined}
          aria-label={sheetIsModal ? t('ai.copilot.title') : undefined}
          onKeyDown={handleSheetKeyDown}
          data-testid="ai-aside"
        >
          <div className="sheet-header">
            <span className="sheet-grabber" aria-hidden="true" />
            <button
              ref={closeBtnRef}
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={closeSheet}
            >
              <X size={16} aria-hidden="true" />
              <span>{t('ai.copilot.closeSheet')}</span>
            </button>
          </div>
          <HybridAIPanel
            key={opportunity.id}
            ref={panelRef}
            opportunity={opportunity}
            comparisonCandidates={candidates}
          />
        </aside>
      </div>
    </div>
  );
}
