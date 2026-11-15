import { AlertTriangle, CheckCircle2, Clock, HelpCircle, Infinity as InfinityIcon, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DeadlineCountdown } from '../domain/catalogRules';
import type { CategoryId, OpportunityMatchSummary } from '../domain/types';
import { CATEGORY_META, monogramFor } from './categoryMeta';

export function CategoryBadge({ category }: { category: CategoryId }) {
  const { t } = useTranslation();
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span className={`cat-badge ${meta.className}`}>
      <Icon size={14} aria-hidden="true" />
      <span>{t(`categories.${category}`)}</span>
    </span>
  );
}

export function ProviderMonogram({
  name,
  category,
}: {
  name: string;
  category: CategoryId;
}) {
  return (
    <span className={`org-monogram ${CATEGORY_META[category].className}`} aria-hidden="true">
      {monogramFor(name)}
    </span>
  );
}

export function DeadlineChip({ countdown }: { countdown: DeadlineCountdown }) {
  const { t } = useTranslation();
  if (countdown.kind === 'none') return null;
  if (countdown.kind === 'ongoing') {
    return (
      <span className="pill pill-neutral">
        <InfinityIcon size={13} aria-hidden="true" />
        <span>{t('explore.countdown.ongoing')}</span>
      </span>
    );
  }
  const urgent = countdown.urgent;
  return (
    <span className={`pill ${urgent ? 'pill-warn' : 'pill-info'}`}>
      <Clock size={13} aria-hidden="true" />
      <span>
        {countdown.kind === 'today'
          ? t('explore.countdown.today')
          : t('explore.countdown.days', { count: countdown.days })}
      </span>
    </span>
  );
}

/**
 * Passive fit indicator derived ONLY from the deterministic matcher counts.
 * It reports counts per state — never a percentage or invented score.
 */
export function FitSummary({
  summary,
  hasProfile,
}: {
  summary: OpportunityMatchSummary | null;
  hasProfile: boolean;
}) {
  const { t } = useTranslation();
  if (!hasProfile || !summary) {
    return (
      <p className="fit-summary fit-empty">
        <HelpCircle size={15} aria-hidden="true" />
        <span>{t('explore.fit.empty')}</span>
      </p>
    );
  }
  const { MATCH, MISMATCH, NEEDS_CONFIRMATION, UNKNOWN } = summary.counts;
  return (
    <p className="fit-summary" data-testid="fit-summary">
      <span className="fit-label">{t('explore.fit.label')}</span>
      {MATCH > 0 && (
        <span className="fit-chip fit-match">
          <CheckCircle2 size={14} aria-hidden="true" />
          {t('explore.fit.match', { count: MATCH })}
        </span>
      )}
      {MISMATCH > 0 && (
        <span className="fit-chip fit-mismatch">
          <XCircle size={14} aria-hidden="true" />
          {t('explore.fit.mismatch', { count: MISMATCH })}
        </span>
      )}
      {NEEDS_CONFIRMATION > 0 && (
        <span className="fit-chip fit-confirm">
          <AlertTriangle size={14} aria-hidden="true" />
          {t('explore.fit.confirm', { count: NEEDS_CONFIRMATION })}
        </span>
      )}
      {UNKNOWN > 0 && (
        <span className="fit-chip fit-unknown">
          <HelpCircle size={14} aria-hidden="true" />
          {t('explore.fit.unknown', { count: UNKNOWN })}
        </span>
      )}
    </p>
  );
}
