import {
  Compass,
  Download,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../app/appContextStore';
import { LanguageSwitch } from '../../components/LanguageSwitch';
import type { HybridInferencePreference } from '../../domain/types';

const MODES: readonly HybridInferencePreference[] = [
  'PREFER_ON_DEVICE',
  'ONLY_ON_DEVICE',
  'PREFER_IN_CLOUD',
  'ONLY_IN_CLOUD',
];

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    aiLog,
    capabilities,
    capabilitiesLoading,
    clearAiLog,
    clearAllData,
    clearDownloadError,
    downloadError,
    downloadProgress,
    initializeOnDeviceModel,
    isDownloadingModel,
    locale,
    preferences,
    refreshCapabilities,
    replayIntro,
    setCloudConsent,
    setInferencePreference,
    startTour,
  } = useApp();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const avail = capabilities?.onDeviceAvailability ?? 'unsupported';
  const hasConfirmedCloudSuccess = aiLog.some(
    (entry) => entry.outcome === 'success' && entry.inferenceSource === 'IN_CLOUD',
  );
  const hasConfirmedLocalSuccess = aiLog.some(
    (entry) => entry.outcome === 'success' && entry.inferenceSource === 'ON_DEVICE',
  );
  const cloudVerificationStateKey = !capabilities?.firebaseConfigured
    ? 'STATE_A'
    : !capabilities?.appCheckConfigured
      ? 'STATE_B'
      : hasConfirmedCloudSuccess
        ? 'STATE_D'
        : 'STATE_C';

  return (
    <div className="stack-lg animate-enter">
      <section className="surface-card stack-sm">
        <h1 style={{ margin: 0, fontSize: 'clamp(1.38rem, 2.4vw, 1.85rem)' }}>
          {t('settings.heading')}
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
          {t('settings.subheading')}
        </p>
      </section>

      <section className="surface-card stack-sm" aria-labelledby="settings-privacy-heading">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div className="stack-sm" style={{ gap: '4px', maxWidth: '58ch' }}>
            <h2
              id="settings-privacy-heading"
              style={{ margin: 0, fontSize: '1.12rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{t('settings.privacySummaryTitle')}</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
              {t('settings.privacySummaryBody')}
            </p>
          </div>
          <Link to="/privacy" className="btn btn-secondary btn-sm">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>{t('settings.privacyViewLink')}</span>
          </Link>
        </div>
      </section>

      <section className="surface-card stack-sm" aria-labelledby="settings-lang-heading">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div className="stack-sm" style={{ gap: '4px' }}>
            <h2 id="settings-lang-heading" style={{ margin: 0, fontSize: '1.12rem' }}>
              {t('settings.languageSection')}
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
              {t('settings.languageHint')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="pill pill-neutral">
              {t('settings.activeLanguageLabel')}:{' '}
              {locale === 'es' ? 'Español (ES)' : 'English (EN)'}
            </span>
            <LanguageSwitch testId="settings-lang-switch" />
          </div>
        </div>
      </section>

      <section className="surface-card stack-md" aria-labelledby="settings-hybrid-heading">
        <h2 id="settings-hybrid-heading" style={{ margin: 0, fontSize: '1.12rem' }}>
          {t('settings.hybridSection')}
        </h2>

        <fieldset className="stack-sm" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="sr-only">{t('settings.hybridSection')}</legend>
          {MODES.map((mode) => (
            <label
              key={mode}
              className="subtle-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="hybrid-mode"
                value={mode}
                checked={preferences.inferencePreference === mode}
                onChange={() => setInferencePreference(mode)}
                style={{
                  marginTop: '4px',
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--brand-primary)',
                }}
              />
              <span className="stack-sm" style={{ gap: '2px' }}>
                <strong>{t(`ai.modes.${mode}.label`)}</strong>
                <span style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
                  {t(`ai.modes.${mode}.description`)}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <label
          className="subtle-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={preferences.cloudConsentGranted}
            onChange={(e) => setCloudConsent(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }}
          />
          <span style={{ fontWeight: 600 }}>{t('settings.consentToggle')}</span>
        </label>
      </section>

      <details className="surface-card disclosure" data-testid="tech-diagnostics-disclosure">
        <summary className="disclosure-summary" data-testid="tech-diagnostics-summary">
          <span>{t('settings.techDiagnosticsToggle')}</span>
        </summary>
        <div className="disclosure-body stack-lg" style={{ paddingTop: '14px' }}>
          <section className="subtle-card stack-md" aria-labelledby="settings-diag-heading">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <h2 id="settings-diag-heading" style={{ margin: 0, fontSize: '1.12rem' }}>
            {t('settings.diagnosticsSection')}
          </h2>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={capabilitiesLoading}
            onClick={() => void refreshCapabilities()}
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>{t('settings.diagRefresh')}</span>
          </button>
        </div>

        <dl
          style={{
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '10px',
          }}
        >
          <div className="subtle-card stack-sm" style={{ gap: '2px' }}>
            <dt style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {t('settings.diagBrowser')}
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {capabilities?.userAgentSummary ?? t('common.loading')}
            </dd>
          </div>

          <div className="subtle-card stack-sm" style={{ gap: '2px' }}>
            <dt style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {t('settings.diagPromptApi')}
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {capabilities?.browserSupportsPromptApi
                ? t('settings.yesSupported')
                : t('settings.noUnsupported')}
            </dd>
          </div>

          <div className="subtle-card stack-sm" style={{ gap: '2px' }}>
            <dt style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {t('settings.diagLocalModel')}
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {t(`settings.localAvailabilityLabels.${avail}`)}
            </dd>
          </div>

          <div className="subtle-card stack-sm" style={{ gap: '2px' }}>
            <dt style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {t('settings.diagFirebaseSdk')}
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {capabilities?.firebaseConfigured
                ? capabilities.firebaseProjectId
                  ? `${t('settings.configured')} (${capabilities.firebaseProjectId})`
                  : t('settings.configured')
                : t('settings.notConfigured')}
            </dd>
          </div>

          <div className="subtle-card stack-sm" style={{ gap: '2px' }}>
            <dt style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {t('settings.diagAppCheck')}
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {t(`settings.appCheckModes.${capabilities?.appCheckMode ?? 'unconfigured'}`)}
            </dd>
          </div>

          <div className="subtle-card stack-sm" style={{ gap: '2px' }}>
            <dt style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {t('settings.diagCloudModel')}
            </dt>
            <dd style={{ margin: 0, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {capabilities?.cloudModelId ?? 'gemini-3.5-flash-lite'}
            </dd>
          </div>

          <div
            className="subtle-card stack-sm"
            style={{ gap: '2px', gridColumn: '1 / -1' }}
          >
            <dt style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {t('settings.diagVerificationState')}
            </dt>
            <dd className="stack-sm" style={{ margin: 0, fontWeight: 600, gap: '4px' }}>
              <span>{t(`settings.verificationStates.${cloudVerificationStateKey}`)}</span>
              {avail === 'available' && hasConfirmedLocalSuccess && (
                <span>{t('settings.verificationStates.STATE_E')}</span>
              )}
            </dd>
          </div>
        </dl>

        {capabilities?.reason && (
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
            {capabilities.reason}
          </p>
        )}

        {avail === 'downloadable' && capabilities?.firebaseConfigured && (
          <div className="card-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={isDownloadingModel}
              onClick={() => void initializeOnDeviceModel()}
            >
              <Download size={15} aria-hidden="true" />
              <span>{t('ai.panel.downloadBtn')}</span>
            </button>
          </div>
        )}

        {(isDownloadingModel || avail === 'downloading') && (
          <progress
            max={1}
            value={isDownloadingModel ? (downloadProgress ?? 0) : undefined}
            style={{ width: '100%' }}
          />
        )}

        {downloadError && (
          <div className="banner banner-bad" role="alert">
            <span>
              {t(`ai.errors.${downloadError.code}`, {
                defaultValue: downloadError.details,
                details: downloadError.details,
              })}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={clearDownloadError}
            >
              <span>{t('common.close')}</span>
            </button>
          </div>
        )}
      </section>

      <section className="subtle-card stack-md" aria-labelledby="settings-audit-heading">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <h2 id="settings-audit-heading" style={{ margin: 0, fontSize: '1.12rem' }}>
            {t('settings.auditSection')}
          </h2>

          {aiLog.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={clearAiLog}
            >
              {t('settings.auditClear')}
            </button>
          )}
        </div>

        {aiLog.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t('settings.auditEmpty')}
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '8px',
            }}
          >
            {aiLog.map((entry) => (
              <li key={entry.requestId} className="subtle-card stack-sm" style={{ gap: '4px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                    fontSize: '0.85rem',
                  }}
                >
                  <strong>
                    {entry.kind} · {entry.requestedMode} → {entry.inferenceSource}
                  </strong>
                  <span style={{ color: 'var(--ink-muted)' }}>
                    {entry.outcome} · {entry.latencyMs} ms
                  </span>
                </div>
                {entry.note && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                    {entry.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
          </section>
        </div>
      </details>

      <section className="surface-card stack-sm" aria-labelledby="settings-exp-heading">
        <h2 id="settings-exp-heading" style={{ margin: 0, fontSize: '1.12rem' }}>
          {t('settings.experienceSection')}
        </h2>
        <div className="card-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              navigate('/');
              replayIntro();
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span>{t('settings.replayIntro')}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              navigate('/');
              startTour();
            }}
          >
            <Compass size={15} aria-hidden="true" />
            <span>{t('settings.replayTour')}</span>
          </button>
        </div>
      </section>

      <section className="surface-card stack-md" aria-labelledby="settings-danger-heading">
        <h2 id="settings-danger-heading" style={{ margin: 0, fontSize: '1.12rem' }}>
          {t('settings.dangerSection')}
        </h2>

        {!confirmClearOpen ? (
          <div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                setClearedNotice(false);
                setConfirmClearOpen(true);
              }}
            >
              <Trash2 size={15} aria-hidden="true" />
              <span>{t('settings.clearDataBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="banner banner-bad stack-sm" role="region" aria-label={t('settings.clearDataConfirmTitle')}>
            <strong>{t('settings.clearDataConfirmTitle')}</strong>
            <div className="card-actions">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  clearAllData();
                  setConfirmClearOpen(false);
                  setClearedNotice(true);
                }}
              >
                {t('settings.clearDataConfirmBtn')}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setConfirmClearOpen(false)}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {clearedNotice && (
          <p role="status" aria-live="polite" style={{ margin: 0, fontWeight: 600 }}>
            {t('settings.dataClearedNotice')}
          </p>
        )}
      </section>
    </div>
  );
}
