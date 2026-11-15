import { ChevronDown, ChevronUp, ExternalLink, Info, RotateCcw, Sparkles, UserPen } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../app/appContextStore';
import { MatchStatusBadge } from '../../components/StatusBadge';
import { isSafeHttpsUrl } from '../../domain/catalogRules';
import { evaluateOpportunityFit } from '../../domain/matcher';
import type {
  CriterionMatchStatus,
  EducationLevel,
  ExperienceLevel,
  Locale,
  Opportunity,
  RequirementCriterion,
  SelfCheckProfile,
} from '../../domain/types';

const RESIDENCE_COUNTRIES: readonly NonNullable<SelfCheckProfile['residenceCountry']>[] = [
  'PE',
  'CO',
  'MX',
  'ES',
  'US',
  'OTHER',
];

const EDUCATION_LEVELS: readonly EducationLevel[] = [
  '',
  'primary',
  'secondary',
  'student_enrolled',
  'technical',
  'bachelor',
  'postgrad',
];

const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = ['', 'none', 'under_1y', '1_to_3y', '3y_plus'];

const STATUS_ORDER: readonly CriterionMatchStatus[] = [
  'MATCH',
  'MISMATCH',
  'NEEDS_CONFIRMATION',
  'UNKNOWN',
];

const STATUS_CHIP_CLASS: Record<CriterionMatchStatus, string> = {
  MATCH: 'pill-good',
  MISMATCH: 'pill-bad',
  NEEDS_CONFIRMATION: 'pill-warn',
  UNKNOWN: 'pill-neutral',
};

/**
 * Single presentation of an opportunity's requirements, merged with the
 * deterministic self-check (MATCH / MISMATCH / NEEDS_CONFIRMATION / UNKNOWN).
 * The profile is collapsed into a compact bar and edited only on demand.
 */
export function UnifiedRequirementsCheck({
  opportunity,
  onAskAi,
}: {
  opportunity: Opportunity;
  onAskAi: (requirement: RequirementCriterion) => void;
}) {
  const { t } = useTranslation();
  const { locale, profile, updateProfile, resetProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState<CriterionMatchStatus | 'ALL'>('ALL');
  const editorId = useId();

  const summary = useMemo(
    () => evaluateOpportunityFit(opportunity, profile),
    [opportunity, profile],
  );

  const filledProfileCount = [
    profile.residenceCountry,
    profile.workOrStudyAuthorizedInTarget,
    profile.educationLevel,
    profile.experienceLevel,
    profile.preferredModality,
    profile.languages.length > 0 ? 'yes' : '',
  ].filter(Boolean).length;

  const profileSummaryParts = [
    profile.residenceCountry ? t(`countries.${profile.residenceCountry}`) : '',
    profile.educationLevel ? t(`detail.selfCheck.educationOptions.${profile.educationLevel}`) : '',
    profile.languages.length > 0 ? profile.languages.map((l) => l.toUpperCase()).join('/') : '',
  ].filter(Boolean);

  const toggleLanguage = (lang: Locale) => {
    const exists = profile.languages.includes(lang);
    const nextLangs = exists
      ? profile.languages.filter((l) => l !== lang)
      : [...profile.languages, lang];
    updateProfile({ ...profile, languages: nextLangs });
  };

  const visibleRequirements = opportunity.requirements
    .map((req, index) => ({ req, evalItem: summary.evaluations[index] }))
    .filter(
      (row): row is { req: RequirementCriterion; evalItem: NonNullable<typeof row.evalItem> } =>
        Boolean(row.evalItem) && (filter === 'ALL' || row.evalItem?.status === filter),
    );

  return (
    <section className="detail-section requirements-section" aria-labelledby="requirements-heading">
      <div className="section-heading-row">
        <h2 id="requirements-heading">{t('detail.section.requirements')}</h2>
        <span className="pill pill-neutral">
          {t('detail.requirementsCount', { count: opportunity.requirements.length })}
        </span>
      </div>

      <div className="profile-bar" data-testid="profile-bar">
        <div className="profile-bar-text">
          <UserPen size={16} aria-hidden="true" />
          <span>
            {profileSummaryParts.length > 0
              ? t('detail.profile.summary', { summary: profileSummaryParts.join(' · ') })
              : t('detail.profile.empty')}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          aria-expanded={editing}
          aria-controls={editorId}
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
          <span>
            {editing
              ? t('detail.profile.done')
              : t('detail.profile.edit', { filled: filledProfileCount })}
          </span>
        </button>
      </div>

      {editing && (
        <div id={editorId} className="profile-editor stack-md">
          <div className="profile-editor-head">
            <span className="profile-note">
              <Info size={15} aria-hidden="true" />
              <span>{t('detail.selfCheck.disclaimer')}</span>
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetProfile}>
              <RotateCcw size={14} aria-hidden="true" />
              <span>{t('detail.selfCheck.clearBtn')}</span>
            </button>
          </div>

          <div className="two-col-form">
            <div className="field-group">
              <label htmlFor="sc-country" className="field-label">
                {t('detail.selfCheck.countryLabel')}
              </label>
              <select
                id="sc-country"
                className="select-input"
                value={profile.residenceCountry}
                onChange={(e) =>
                  updateProfile({
                    ...profile,
                    residenceCountry: e.target.value as SelfCheckProfile['residenceCountry'],
                  })
                }
              >
                <option value="">{t('detail.selfCheck.countrySelect')}</option>
                {RESIDENCE_COUNTRIES.map((code) => (
                  <option key={code} value={code}>
                    {t(`countries.${code}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="sc-auth" className="field-label">
                {t('detail.selfCheck.authLabel')}
              </label>
              <select
                id="sc-auth"
                className="select-input"
                value={profile.workOrStudyAuthorizedInTarget}
                onChange={(e) =>
                  updateProfile({
                    ...profile,
                    workOrStudyAuthorizedInTarget: e.target
                      .value as SelfCheckProfile['workOrStudyAuthorizedInTarget'],
                  })
                }
              >
                <option value="">{t('detail.selfCheck.authOptions.unselected')}</option>
                <option value="yes">{t('common.yes')}</option>
                <option value="no">{t('common.no')}</option>
                <option value="unsure">{t('common.unsure')}</option>
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="sc-edu" className="field-label">
                {t('detail.selfCheck.educationLabel')}
              </label>
              <select
                id="sc-edu"
                className="select-input"
                value={profile.educationLevel}
                onChange={(e) =>
                  updateProfile({ ...profile, educationLevel: e.target.value as EducationLevel })
                }
              >
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level || 'empty'} value={level}>
                    {t(`detail.selfCheck.educationOptions.${level}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="sc-exp" className="field-label">
                {t('detail.selfCheck.experienceLabel')}
              </label>
              <select
                id="sc-exp"
                className="select-input"
                value={profile.experienceLevel}
                onChange={(e) =>
                  updateProfile({ ...profile, experienceLevel: e.target.value as ExperienceLevel })
                }
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level || 'empty'} value={level}>
                    {t(`detail.selfCheck.experienceOptions.${level}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="sc-modality" className="field-label">
                {t('detail.selfCheck.modalityLabel')}
              </label>
              <select
                id="sc-modality"
                className="select-input"
                value={profile.preferredModality}
                onChange={(e) =>
                  updateProfile({
                    ...profile,
                    preferredModality: e.target.value as SelfCheckProfile['preferredModality'],
                  })
                }
              >
                <option value="">{t('modality.all')}</option>
                <option value="online">{t('modality.online')}</option>
                <option value="onsite">{t('modality.onsite')}</option>
                <option value="hybrid">{t('modality.hybrid')}</option>
              </select>
            </div>

            <fieldset className="field-group" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="field-label">{t('detail.selfCheck.languagesLabel')}</legend>
              <div style={{ display: 'flex', gap: '16px', minHeight: '44px', alignItems: 'center' }}>
                <label className="check-row" style={{ minHeight: 'auto' }}>
                  <input
                    type="checkbox"
                    checked={profile.languages.includes('es')}
                    onChange={() => toggleLanguage('es')}
                  />
                  <span>Español (ES)</span>
                </label>
                <label className="check-row" style={{ minHeight: 'auto' }}>
                  <input
                    type="checkbox"
                    checked={profile.languages.includes('en')}
                    onChange={() => toggleLanguage('en')}
                  />
                  <span>English (EN)</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
      )}

      {summary.contradictions.length > 0 && (
        <div className="banner banner-warn stack-sm" role="alert" style={{ marginBottom: 0 }}>
          {summary.contradictions.map((note, idx) => (
            <p key={idx} style={{ margin: 0, fontSize: '0.88rem' }}>
              {note[locale]}
            </p>
          ))}
        </div>
      )}

      <div
        className="match-scoreboard"
        role="group"
        aria-label={t('detail.filter.groupLabel')}
        data-testid="match-scoreboard"
      >
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            className={`match-score-chip ${STATUS_CHIP_CLASS[status]}`}
            aria-pressed={filter === status}
            onClick={() => setFilter((prev) => (prev === status ? 'ALL' : status))}
          >
            <span className="match-score-value">{summary.counts[status]}</span>{' '}
            <span className="match-score-label">{t(`detail.selfCheck.badges.${status}`)}</span>
          </button>
        ))}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {t('detail.selfCheck.summaryCounts', {
          match: summary.counts.MATCH,
          mismatch: summary.counts.MISMATCH,
          confirm: summary.counts.NEEDS_CONFIRMATION,
          unknown: summary.counts.UNKNOWN,
        })}
      </p>

      {filter !== 'ALL' && (
        <button type="button" className="btn btn-ghost btn-sm filter-reset" onClick={() => setFilter('ALL')}>
          <RotateCcw size={14} aria-hidden="true" />
          <span>{t('detail.filter.showAll')}</span>
        </button>
      )}

      <ul className="requirement-list">
        {visibleRequirements.map(({ req, evalItem }) => (
          <li
            key={req.id}
            className="requirement-row"
            data-match-status={evalItem.status}
            data-testid="requirement-row"
          >
            <div className="requirement-main">
              <div className="requirement-title-row">
                <strong>{req.text[locale]}</strong>
                <span className="pill pill-neutral">
                  {req.mandatory
                    ? t('detail.selfCheck.mandatoryBadge')
                    : t('detail.selfCheck.optionalBadge')}
                </span>
              </div>
              <span className="requirement-reason">{evalItem.reason[locale]}</span>
              {req.prerequisiteGuide && isSafeHttpsUrl(req.prerequisiteGuide.officialUrl) && (
                <details className="prereq-guide" data-testid={`prereq-guide-${req.id}`}>
                  <summary className="prereq-guide-summary">
                    <span>{req.prerequisiteGuide.title[locale]}</span>
                  </summary>
                  <div className="prereq-guide-body">
                    <ol className="prereq-steps">
                      {req.prerequisiteGuide.steps.map((step, index) => (
                        <li key={index}>{step[locale]}</li>
                      ))}
                    </ol>
                    <a
                      href={req.prerequisiteGuide.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prereq-official-link"
                    >
                      <span>{req.prerequisiteGuide.officialLabel[locale]}</span>
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </div>
                </details>
              )}
            </div>
            <div className="requirement-side">
              <MatchStatusBadge status={evalItem.status} />
              <div className="requirement-actions">
                {evalItem.status === 'UNKNOWN' && !editing && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditing(true)}
                  >
                    <UserPen size={14} aria-hidden="true" />
                    <span>{t('detail.requirement.completeData')}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label={t('detail.requirement.askAiAria', { text: req.text[locale] })}
                  onClick={() => onAskAi(req)}
                >
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{t('detail.requirement.askAi')}</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
