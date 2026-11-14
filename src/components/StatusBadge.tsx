import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  ComputedOpportunityStatus,
  CriterionMatchStatus,
  ObservedInferenceSource,
} from '../domain/types';

export function OpportunityStatusBadge({
  status,
}: {
  status: ComputedOpportunityStatus;
}) {
  const { t } = useTranslation();

  switch (status) {
    case 'open':
      return (
        <span className="pill pill-good">
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>{t(`status.${status}`)}</span>
        </span>
      );
    case 'ongoing':
    case 'upcoming':
      return (
        <span className="pill pill-info">
          <Clock size={14} aria-hidden="true" />
          <span>{t(`status.${status}`)}</span>
        </span>
      );
    case 'review_required':
      return (
        <span className="pill pill-warn">
          <AlertTriangle size={14} aria-hidden="true" />
          <span>{t(`status.${status}`)}</span>
        </span>
      );
    case 'closed':
    case 'withdrawn':
    default:
      return (
        <span className="pill pill-bad">
          <XCircle size={14} aria-hidden="true" />
          <span>{t(`status.${status}`)}</span>
        </span>
      );
  }
}

export function MatchStatusBadge({ status }: { status: CriterionMatchStatus }) {
  const { t } = useTranslation();

  switch (status) {
    case 'MATCH':
      return (
        <span className="pill pill-good">
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>{t(`detail.selfCheck.badges.${status}`)}</span>
        </span>
      );
    case 'MISMATCH':
      return (
        <span className="pill pill-bad">
          <XCircle size={14} aria-hidden="true" />
          <span>{t(`detail.selfCheck.badges.${status}`)}</span>
        </span>
      );
    case 'NEEDS_CONFIRMATION':
      return (
        <span className="pill pill-warn">
          <AlertTriangle size={14} aria-hidden="true" />
          <span>{t(`detail.selfCheck.badges.${status}`)}</span>
        </span>
      );
    case 'UNKNOWN':
    default:
      return (
        <span className="pill pill-neutral">
          <HelpCircle size={14} aria-hidden="true" />
          <span>{t(`detail.selfCheck.badges.${status}`)}</span>
        </span>
      );
  }
}

export function InferenceSourceBadge({
  source,
  modelId,
}: {
  source: ObservedInferenceSource;
  modelId?: string;
}) {
  const { t } = useTranslation();

  if (source === 'ON_DEVICE') {
    return (
      <span className="pill pill-good" data-inference-source="ON_DEVICE">
        <Sparkles size={14} aria-hidden="true" />
        <span>{t('ai.badge.ON_DEVICE')}</span>
      </span>
    );
  }

  if (source === 'IN_CLOUD') {
    return (
      <span className="pill pill-cloud" data-inference-source="IN_CLOUD">
        <Sparkles size={14} aria-hidden="true" />
        <span>{t('ai.badge.IN_CLOUD', { model: modelId ?? 'Gemini' })}</span>
      </span>
    );
  }

  return (
    <span className="pill pill-neutral" data-inference-source="UNVERIFIED">
      <HelpCircle size={14} aria-hidden="true" />
      <span>{t('ai.badge.UNVERIFIED')}</span>
    </span>
  );
}
