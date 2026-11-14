import { Info, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../app/appContextStore';
import { MatchStatusBadge } from '../../components/StatusBadge';
import { evaluateOpportunityFit } from '../../domain/matcher';
import type {
  EducationLevel,
  ExperienceLevel,
  Locale,
  Opportunity,
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

const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = [
  '',
  'none',
  'under_1y',
  '1_to_3y',
  '3y_plus',
];

export function SelfCheckPanel({ opportunity }: { opportunity: Opportunity }) {
  const { t } = useTranslation();
  const { locale, profile, updateProfile, resetProfile } = useApp();

  const summary = useMemo(
    () => evaluateOpportunityFit(opportunity, profile),
    [opportunity, profile],
  );

  const toggleLanguage = (lang: Locale) => {
    const exists = profile.languages.includes(lang);
    const nextLangs = exists
      ? profile.languages.filter((l) => l !== lang)
      : [...profile.languages, lang];
    updateProfile({ ...profile, languages: nextLangs });
  };

  return (
    <section
      className="surface-card stack-md"
      aria-labelledby="self-check-heading"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <h2 id="self-check-heading" style={{ margin: 0, fontSize: '1.15rem' }}>
          {t('detail.selfCheck.heading')}
        </h2>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={resetProfile}
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>{t('detail.selfCheck.clearBtn')}</span>
        </button>
      </div>

      <div className="banner banner-info" style={{ marginBottom: 0 }}>
        <Info size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{t('detail.selfCheck.disclaimer')}</span>
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
            <option value="">{t('detail.selfCheck.educationOptions.')}</option>
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
              updateProfile({
                ...profile,
                educationLevel: e.target.value as EducationLevel,
              })
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
              updateProfile({
                ...profile,
                experienceLevel: e.target.value as ExperienceLevel,
              })
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
                preferredModality: e.target
                  .value as SelfCheckProfile['preferredModality'],
              })
            }
          >
            <option value="">{t('modality.all')}</option>
            <option value="online">{t('modality.online')}</option>
            <option value="onsite">{t('modality.onsite')}</option>
            <option value="hybrid">{t('modality.hybrid')}</option>
          </select>
        </div>

        <fieldset
          className="field-group"
          style={{ border: 0, padding: 0, margin: 0 }}
        >
          <legend className="field-label">
            {t('detail.selfCheck.languagesLabel')}
          </legend>
          <div style={{ display: 'flex', gap: '16px', minHeight: '44px', alignItems: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={profile.languages.includes('es')}
                onChange={() => toggleLanguage('es')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }}
              />
              <span>Español (ES)</span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={profile.languages.includes('en')}
                onChange={() => toggleLanguage('en')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }}
              />
              <span>English (EN)</span>
            </label>
          </div>
        </fieldset>
      </div>

      <p
        role="status"
        aria-live="polite"
        style={{
          margin: 0,
          fontSize: '0.88rem',
          fontWeight: 600,
          color: 'var(--ink-secondary)',
        }}
      >
        {t('detail.selfCheck.summaryCounts', {
          match: summary.counts.MATCH,
          mismatch: summary.counts.MISMATCH,
          confirm: summary.counts.NEEDS_CONFIRMATION,
          unknown: summary.counts.UNKNOWN,
        })}
      </p>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gap: '10px',
        }}
      >
        {opportunity.requirements.map((req, index) => {
          const evalItem = summary.evaluations[index];
          if (!evalItem) return null;
          return (
            <li key={req.id} className="subtle-card stack-sm">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <strong style={{ fontSize: '0.94rem' }}>{req.text[locale]}</strong>
                <MatchStatusBadge status={evalItem.status} />
              </div>
              <span style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
                {evalItem.reason[locale]}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
