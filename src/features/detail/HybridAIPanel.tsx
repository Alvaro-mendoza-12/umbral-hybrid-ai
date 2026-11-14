import {
  AlertTriangle,
  Check,
  Cloud,
  Download,
  ListPlus,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useApp } from '../../app/appContextStore';
import { InferenceSourceBadge } from '../../components/StatusBadge';
import type {
  ChatTurn,
  HybridInferencePreference,
  Opportunity,
  StructuredAIResult,
} from '../../domain/types';

const MODES: readonly HybridInferencePreference[] = [
  'PREFER_ON_DEVICE',
  'ONLY_ON_DEVICE',
  'PREFER_IN_CLOUD',
  'ONLY_IN_CLOUD',
];

function extractErrorInfo(err: unknown): { code: string; details: string } {
  if (err && typeof err === 'object') {
    const record = err as { code?: unknown; message?: unknown };
    return {
      code: typeof record.code === 'string' ? record.code : 'AI_EXECUTION_FAILED',
      details: typeof record.message === 'string' ? record.message : 'Unknown error',
    };
  }
  return { code: 'AI_EXECUTION_FAILED', details: 'Unknown error' };
}

export function HybridAIPanel({
  opportunity,
  comparisonCandidates,
}: {
  opportunity: Opportunity;
  comparisonCandidates: readonly Opportunity[];
}) {
  const { t } = useTranslation();
  const {
    aiOrchestrator,
    capabilities,
    downloadProgress,
    initializeOnDeviceModel,
    isDownloadingModel,
    isOnline,
    locale,
    preferences,
    setCloudConsent,
    setInferencePreference,
    route,
    addTask,
  } = useApp();

  const [focusNote, setFocusNote] = useState('');
  const [structuredLoading, setStructuredLoading] = useState(false);
  const [structuredResult, setStructuredResult] = useState<StructuredAIResult | null>(null);
  const [structuredError, setStructuredError] = useState<{ code: string; details: string } | null>(
    null,
  );
  const [stepLimitFeedback, setStepLimitFeedback] = useState(false);

  const [compareTargetId, setCompareTargetId] = useState('');
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<{ code: string; details: string } | null>(null);

  const localAvailability = capabilities?.onDeviceAvailability ?? 'unsupported';
  const showConsentPrompt =
    structuredError?.code === 'CLOUD_CONSENT_REQUIRED' ||
    structuredError?.code === 'CLOUD_CONSENT_REQUIRED_FOR_FALLBACK' ||
    chatError?.code === 'CLOUD_CONSENT_REQUIRED';

  const runStructured = async (kind: 'EXPLAIN_REQUIREMENTS' | 'PREPARE_NEXT_STEPS') => {
    setStructuredError(null);
    setStepLimitFeedback(false);
    setStructuredLoading(true);
    try {
      const result = await aiOrchestrator.runStructuredGuidance({
        kind,
        locale,
        opportunity,
        preference: preferences.inferencePreference,
        cloudConsentGranted: preferences.cloudConsentGranted,
        capabilities,
        userFocusNote: focusNote,
      });
      setStructuredResult(result);
    } catch (err) {
      const info = extractErrorInfo(err);
      if (info.code !== 'REQUEST_CANCELLED') {
        setStructuredError(info);
      }
    } finally {
      setStructuredLoading(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatQuestion.trim();
    if (!trimmed) return;
    setChatError(null);

    if (!preferences.cloudConsentGranted) {
      setChatError({
        code: 'CLOUD_CONSENT_REQUIRED',
        details: t('ai.consent.cloudModeReason'),
      });
      return;
    }

    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...chatHistory, userTurn];
    setChatHistory(nextHistory);
    setChatQuestion('');
    setChatLoading(true);

    const comparedOpportunity = compareTargetId
      ? comparisonCandidates.find((c) => c.id === compareTargetId)
      : undefined;

    try {
      const res = await aiOrchestrator.runCloudFollowUp({
        locale,
        opportunity,
        comparedOpportunity,
        history: chatHistory,
        question: trimmed,
        cloudConsentGranted: preferences.cloudConsentGranted,
      });

      setChatHistory((prev) => [
        ...prev,
        {
          id: res.requestId,
          role: 'model',
          text: res.answer,
          inferenceSource: res.inferenceSource,
          modelId: res.modelId,
          latencyMs: res.latencyMs,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const info = extractErrorInfo(err);
      if (info.code !== 'REQUEST_CANCELLED') {
        setChatError(info);
      }
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <section
      className="surface-card stack-md"
      aria-labelledby="hybrid-ai-heading"
    >
      <div className="stack-sm">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <h2 id="hybrid-ai-heading" style={{ margin: 0, fontSize: '1.15rem' }}>
            {t('ai.panel.heading')}
          </h2>

          <span
            className={preferences.cloudConsentGranted ? 'pill pill-cloud' : 'pill pill-good'}
          >
            {preferences.cloudConsentGranted
              ? t('ai.consent.grantedStatus')
              : t('ai.consent.notGrantedStatus')}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
          {t('ai.panel.subheading')}
        </p>
      </div>

      <div className="field-group">
        <label htmlFor="ai-mode-select" className="field-label">
          {t('ai.panel.currentMode')}
        </label>
        <select
          id="ai-mode-select"
          className="select-input"
          value={preferences.inferencePreference}
          onChange={(e) => {
            setStructuredError(null);
            setInferencePreference(e.target.value as HybridInferencePreference);
          }}
        >
          {MODES.map((mode) => (
            <option key={mode} value={mode}>
              {t(`ai.modes.${mode}.label`)}
            </option>
          ))}
        </select>
        <span style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
          {t(`ai.modes.${preferences.inferencePreference}.description`)}
        </span>
      </div>

      {localAvailability === 'downloadable' && capabilities?.firebaseConfigured && (
        <div className="subtle-card stack-sm">
          <span style={{ fontSize: '0.88rem' }}>{t('ai.panel.downloadPrompt')}</span>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={isDownloadingModel}
              onClick={() => void initializeOnDeviceModel()}
            >
              <Download size={15} aria-hidden="true" />
              <span>{t('ai.panel.downloadBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {isDownloadingModel && (
        <div className="subtle-card stack-sm" role="status" aria-live="polite">
          <span>
            {t('ai.panel.downloadProgress', {
              percent: Math.round((downloadProgress ?? 0) * 100),
            })}
          </span>
          <progress
            max={1}
            value={downloadProgress ?? 0}
            style={{ width: '100%', height: '10px' }}
          />
        </div>
      )}

      {showConsentPrompt && (
        <div className="banner banner-warn stack-sm" role="region" aria-label={t('ai.consent.bannerTitle')}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <ShieldAlert size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div className="stack-sm">
              <strong>{t('ai.consent.bannerTitle')}</strong>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                {t('ai.consent.bannerBody', {
                  reason:
                    preferences.inferencePreference === 'PREFER_ON_DEVICE'
                      ? t('ai.consent.fallbackReason', {
                          availability: t(`settings.localAvailabilityLabels.${localAvailability}`),
                        })
                      : t('ai.consent.cloudModeReason'),
                })}
              </p>
              <div className="card-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setCloudConsent(true);
                    setStructuredError(null);
                    setChatError(null);
                  }}
                >
                  {t('ai.consent.grant')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setCloudConsent(false);
                    setInferencePreference('ONLY_ON_DEVICE');
                    setStructuredError(null);
                    setChatError(null);
                  }}
                >
                  {t('ai.consent.keepLocalOnly')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="field-group">
        <label htmlFor="ai-focus-note" className="field-label">
          {t('ai.panel.focusLabel')}
        </label>
        <input
          id="ai-focus-note"
          type="text"
          maxLength={240}
          className="text-input"
          value={focusNote}
          placeholder={t('ai.panel.focusPlaceholder')}
          onChange={(e) => setFocusNote(e.target.value)}
        />
      </div>

      <div className="card-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={structuredLoading}
          onClick={() => void runStructured('EXPLAIN_REQUIREMENTS')}
        >
          <Sparkles size={16} aria-hidden="true" />
          <span>{t('ai.panel.explainBtn')}</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={structuredLoading}
          onClick={() => void runStructured('PREPARE_NEXT_STEPS')}
        >
          <ListPlus size={16} aria-hidden="true" />
          <span>{t('ai.panel.prepBtn')}</span>
        </button>

        {structuredLoading && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => aiOrchestrator.cancelActiveRequests()}
          >
            <X size={15} aria-hidden="true" />
            <span>{t('ai.panel.cancelBtn')}</span>
          </button>
        )}
      </div>

      {structuredLoading && (
        <div role="status" aria-live="polite" className="subtle-card">
          {t('ai.panel.running')}
        </div>
      )}

      {structuredError && !showConsentPrompt && (
        <div className="banner banner-bad" role="alert">
          <AlertTriangle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            {t(`ai.errors.${structuredError.code}`, {
              defaultValue: structuredError.details,
              details: structuredError.details,
            })}
          </span>
        </div>
      )}

      {stepLimitFeedback && (
        <div className="banner banner-warn" role="status" aria-live="polite">
          <span>
            {t('ai.panel.stepLimitReached')}{' '}
            <Link to="/route">{t('nav.route')}</Link>
          </span>
        </div>
      )}

      {structuredResult && (
        <div
          className="subtle-card stack-md"
          data-testid="structured-ai-result"
          aria-live="polite"
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
            <InferenceSourceBadge
              source={structuredResult.inferenceSource}
              modelId={structuredResult.modelId}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              {t('ai.panel.latencyMeta', {
                source: structuredResult.inferenceSource,
                ms: structuredResult.latencyMs,
              })}
            </span>
          </div>

          <div className="stack-sm">
            <h3 style={{ margin: 0, fontSize: '0.98rem' }}>
              {t('ai.panel.summaryHeading')}
            </h3>
            <p style={{ margin: 0 }}>{structuredResult.summary}</p>
          </div>

          {structuredResult.groundedRequirements.length > 0 && (
            <div className="stack-sm">
              <h3 style={{ margin: 0, fontSize: '0.98rem' }}>
                {t('ai.panel.groundedHeading')}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px' }}>
                {structuredResult.groundedRequirements.map((item, idx) => (
                  <li key={`${item.text}-${idx}`}>
                    <span>{item.text} </span>
                    <span className="pill pill-neutral" style={{ marginLeft: '4px' }}>
                      {item.evidenceIds.length > 0
                        ? t('ai.panel.evidenceTag', { ids: item.evidenceIds.join(', ') })
                        : t('ai.panel.noEvidence')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {structuredResult.suggestedActions.length > 0 && (
            <div className="stack-sm">
              <h3 style={{ margin: 0, fontSize: '0.98rem' }}>
                {t('ai.panel.suggestedHeading')}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                {structuredResult.suggestedActions.map((action, idx) => {
                  const alreadyInRoute = route.tasks.some(
                    (task) =>
                      task.opportunityId === opportunity.id && task.text === action.text,
                  );

                  return (
                    <li
                      key={`${action.text}-${idx}`}
                      className="surface-card stack-sm"
                      style={{ padding: '12px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{action.text}</span>
                        <button
                          type="button"
                          className={alreadyInRoute ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                          disabled={alreadyInRoute}
                          onClick={() => {
                            const res = addTask(action.text, { opportunityId: opportunity.id });
                            if (!res.ok && res.error === 'MAX_ACTIVE_TASKS_REACHED') {
                              setStepLimitFeedback(true);
                            }
                          }}
                        >
                          {alreadyInRoute ? (
                            <Check size={14} aria-hidden="true" />
                          ) : (
                            <ListPlus size={14} aria-hidden="true" />
                          )}
                          <span>
                            {alreadyInRoute
                              ? t('ai.panel.addedStepToRoute')
                              : t('ai.panel.addStepToRoute')}
                          </span>
                        </button>
                      </div>
                      {action.evidenceIds.length > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                          {t('ai.panel.evidenceTag', { ids: action.evidenceIds.join(', ') })}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {structuredResult.unknowns.length > 0 && (
            <div className="stack-sm">
              <h3 style={{ margin: 0, fontSize: '0.98rem' }}>
                {t('ai.panel.unknownsHeading')}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                {structuredResult.unknowns.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <p
            style={{
              margin: 0,
              fontSize: '0.84rem',
              color: 'var(--ink-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '10px',
            }}
          >
            {structuredResult.cautionNote}
          </p>
        </div>
      )}

      <hr style={{ border: 0, borderTop: '1px solid var(--border-subtle)', margin: '6px 0' }} />

      <div className="stack-md" aria-labelledby="cloud-followup-heading">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <h3 id="cloud-followup-heading" style={{ margin: 0, fontSize: '1.05rem' }}>
            {t('ai.panel.followUpHeading')}
          </h3>
          <span className="pill pill-cloud">
            <Cloud size={14} aria-hidden="true" />
            <span>{t('ai.panel.followUpBadge')}</span>
          </span>
        </div>

        <div className="field-group">
          <label htmlFor="ai-compare-select" className="field-label">
            {t('ai.panel.compareSelectLabel')}
          </label>
          <select
            id="ai-compare-select"
            className="select-input"
            value={compareTargetId}
            onChange={(e) => setCompareTargetId(e.target.value)}
          >
            <option value="">{t('ai.panel.compareNone')}</option>
            {comparisonCandidates.map((cand) => (
              <option key={cand.id} value={cand.id}>
                {cand.title[locale]}
              </option>
            ))}
          </select>
        </div>

        {chatHistory.length > 0 && (
          <div className="stack-sm" aria-live="polite">
            {chatHistory.map((turn) => (
              <div
                key={turn.id}
                className={turn.role === 'user' ? 'subtle-card' : 'surface-card'}
                style={{ padding: '12px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '6px',
                  }}
                >
                  <strong style={{ fontSize: '0.84rem' }}>
                    {turn.role === 'user' ? 'You' : 'UMBRAL Cloud AI'}
                  </strong>
                  {turn.inferenceSource && (
                    <InferenceSourceBadge
                      source={turn.inferenceSource}
                      modelId={turn.modelId}
                    />
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem' }} className="wrap-text">
                  {turn.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {chatError && !showConsentPrompt && (
          <div className="banner banner-bad" role="alert">
            <span>
              {t(`ai.errors.${chatError.code}`, {
                defaultValue: chatError.details,
                details: chatError.details,
              })}
            </span>
          </div>
        )}

        <form onSubmit={handleSendFollowUp} className="stack-sm">
          <label htmlFor="ai-followup-input" className="sr-only">
            {t('ai.panel.followUpHeading')}
          </label>
          <textarea
            id="ai-followup-input"
            className="textarea-input"
            maxLength={400}
            value={chatQuestion}
            placeholder={t('ai.panel.followUpPlaceholder')}
            onChange={(e) => setChatQuestion(e.target.value)}
          />
          <div className="card-actions">
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={chatLoading || !isOnline || !chatQuestion.trim()}
            >
              <Send size={15} aria-hidden="true" />
              <span>
                {chatLoading ? t('ai.panel.followUpSending') : t('ai.panel.followUpSend')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
