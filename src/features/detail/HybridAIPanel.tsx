import {
  AlertTriangle,
  Check,
  Cloud,
  Cpu,
  Download,
  FileText,
  GitCompare,
  ListPlus,
  Send,
  ShieldAlert,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { useImperativeHandle, useMemo, useState, type Ref } from 'react';
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

export interface HybridAIPanelHandle {
  /** Sends one specific requirement clause to the assistant (contextual action). */
  askAboutRequirement: (clauseText: string) => void;
}

type UiMode = 'auto' | 'local' | 'cloud';

function toUiMode(pref: HybridInferencePreference): UiMode {
  if (pref === 'ONLY_ON_DEVICE') return 'local';
  if (pref === 'PREFER_IN_CLOUD' || pref === 'ONLY_IN_CLOUD') return 'cloud';
  return 'auto';
}

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
  ref,
}: {
  opportunity: Opportunity;
  comparisonCandidates: readonly Opportunity[];
  ref?: Ref<HybridAIPanelHandle>;
}) {
  const { t } = useTranslation();
  const {
    aiOrchestrator,
    capabilities,
    clearDownloadError,
    downloadError,
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

  const [structuredLoading, setStructuredLoading] = useState(false);
  const [structuredResult, setStructuredResult] = useState<StructuredAIResult | null>(null);
  const [structuredError, setStructuredError] = useState<{ code: string; details: string } | null>(
    null,
  );
  const [focusedRequirement, setFocusedRequirement] = useState<string | null>(null);
  const [stepLimitFeedback, setStepLimitFeedback] = useState(false);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareTargetId, setCompareTargetId] = useState('');
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<{ code: string; details: string } | null>(null);

  const localAvailability = capabilities?.onDeviceAvailability ?? 'unsupported';
  const uiMode = toUiMode(preferences.inferencePreference);
  const consentNeeded =
    structuredError?.code === 'CLOUD_CONSENT_REQUIRED' ||
    structuredError?.code === 'CLOUD_CONSENT_REQUIRED_FOR_FALLBACK' ||
    chatError?.code === 'CLOUD_CONSENT_REQUIRED';
  const consentReason =
    structuredError?.code === 'CLOUD_CONSENT_REQUIRED_FOR_FALLBACK'
      ? t('ai.consent.fallbackReason', {
          availability: t(`settings.localAvailabilityLabels.${localAvailability}`),
        })
      : t('ai.consent.cloudModeReason');

  // Same-category and already-saved opportunities first: the most likely comparisons.
  const orderedCandidates = useMemo(() => {
    const rank = (c: Opportunity) =>
      (route.saved[c.id] ? 0 : 2) + (c.category === opportunity.category ? 0 : 1);
    return [...comparisonCandidates].sort((a, b) => rank(a) - rank(b));
  }, [comparisonCandidates, opportunity.category, route.saved]);

  const selectMode = (mode: UiMode) => {
    setStructuredError(null);
    setChatError(null);
    if (mode === 'auto') setInferencePreference('PREFER_ON_DEVICE');
    else if (mode === 'local') setInferencePreference('ONLY_ON_DEVICE');
    else if (uiMode !== 'cloud') setInferencePreference('ONLY_IN_CLOUD');
  };

  const runStructured = async (
    kind: 'EXPLAIN_REQUIREMENTS' | 'PREPARE_NEXT_STEPS',
    note = '',
  ) => {
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
        userFocusNote: note,
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

  useImperativeHandle(ref, () => ({
    askAboutRequirement: (clauseText: string) => {
      const clause = clauseText.slice(0, 190);
      setFocusedRequirement(clause);
      void runStructured(
        'EXPLAIN_REQUIREMENTS',
        t('ai.copilot.focusNote', { text: clause }),
      );
    },
  }));

  const sendCloudQuestion = async (question: string, compared?: Opportunity) => {
    const trimmed = question.trim();
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
      text: compared
        ? t('ai.copilot.compareUserTurn', { title: compared.title[locale] })
        : trimmed,
      timestamp: new Date().toISOString(),
    };
    const previousHistory = chatHistory;
    setChatHistory([...previousHistory, userTurn]);
    if (!compared) setChatQuestion('');
    setChatLoading(true);

    try {
      const res = await aiOrchestrator.runCloudFollowUp({
        locale,
        opportunity,
        comparedOpportunity: compared,
        history: previousHistory,
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
      setChatHistory(previousHistory);
      setChatQuestion((curr) => curr || (compared ? '' : trimmed));
      if (info.code !== 'REQUEST_CANCELLED') {
        setChatError(info);
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    void sendCloudQuestion(chatQuestion);
  };

  const runCompare = () => {
    const target = orderedCandidates.find((c) => c.id === compareTargetId);
    if (!target) return;
    void sendCloudQuestion(t('ai.copilot.compareQuestion'), target);
  };

  const statusLine = (() => {
    if (uiMode === 'cloud') {
      if (!isOnline) return { cls: 'pill-neutral', text: t('ai.panel.cloudOfflineShort'), icon: 'cloud' as const };
      if (!capabilities?.firebaseConfigured)
        return { cls: 'pill-neutral', text: t('ai.badge.setupPill'), icon: 'cloud' as const };
      return {
        cls: 'pill-cloud',
        text: preferences.cloudConsentGranted
          ? t('ai.copilot.cloudGranted')
          : t('ai.copilot.cloudNeedsPermission'),
        icon: 'cloud' as const,
      };
    }
    if (localAvailability === 'available')
      return { cls: 'pill-good', text: t('ai.copilot.localReady'), icon: 'cpu' as const };
    if (localAvailability === 'downloadable' || localAvailability === 'downloading')
      return { cls: 'pill-info', text: t('ai.copilot.localDownloadable'), icon: 'cpu' as const };
    return { cls: 'pill-neutral', text: t('ai.copilot.localUnavailable'), icon: 'cpu' as const };
  })();

  return (
    <section className="copilot stack-md" aria-labelledby="hybrid-ai-heading">
      <div className="copilot-head">
        <h2 id="hybrid-ai-heading">
          <Sparkles size={18} aria-hidden="true" />
          <span>{t('ai.copilot.title')}</span>
        </h2>
      </div>

      <div
        className="ai-mode-group"
        role="radiogroup"
        aria-label={t('ai.copilot.modeLabel')}
        data-testid="ai-mode-group"
      >
        <label className={`ai-mode-option${uiMode === 'auto' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name="ai-ui-mode"
            checked={uiMode === 'auto'}
            onChange={() => selectMode('auto')}
          />
          <span className="ai-mode-title">
            <Wand2 size={15} aria-hidden="true" />
            {t('ai.copilot.modeAuto')}
          </span>
          <span className="ai-mode-sub">{t('ai.copilot.modeAutoSub')}</span>
        </label>
        <label className={`ai-mode-option is-local${uiMode === 'local' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name="ai-ui-mode"
            checked={uiMode === 'local'}
            onChange={() => selectMode('local')}
          />
          <span className="ai-mode-title">
            <Cpu size={15} aria-hidden="true" />
            {t('ai.copilot.modeLocal')}
          </span>
          <span className="ai-mode-sub">{t('ai.copilot.privateOnDevice')}</span>
        </label>
        <label className={`ai-mode-option is-cloud${uiMode === 'cloud' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name="ai-ui-mode"
            checked={uiMode === 'cloud'}
            onChange={() => selectMode('cloud')}
          />
          <span className="ai-mode-title">
            <Cloud size={15} aria-hidden="true" />
            {t('ai.copilot.modeCloud')}
          </span>
          <span className="ai-mode-sub">{t('ai.copilot.onlineWithPermission')}</span>
        </label>
      </div>

      <p className={`pill ${statusLine.cls} ai-status-pill`} role="status">
        {statusLine.icon === 'cloud' ? (
          <Cloud size={14} aria-hidden="true" />
        ) : (
          <Cpu size={14} aria-hidden="true" />
        )}
        <span>{statusLine.text}</span>
      </p>

      {uiMode !== 'cloud' && localAvailability === 'downloadable' && capabilities?.firebaseConfigured && (
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

      {downloadError && (
        <div className="banner banner-bad stack-sm" role="alert">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
            <span>
              {t(`ai.errors.${downloadError.code}`, {
                defaultValue: downloadError.details,
                details: downloadError.details,
              })}
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearDownloadError}>
              <X size={14} aria-hidden="true" />
              <span>{t('common.close')}</span>
            </button>
          </div>
        </div>
      )}

      {isDownloadingModel && (
        <div className="subtle-card stack-sm" role="status" aria-live="polite">
          <span>
            {t('ai.panel.downloadProgress', { percent: Math.round((downloadProgress ?? 0) * 100) })}
          </span>
          <progress max={1} value={downloadProgress ?? 0} style={{ width: '100%', height: '10px' }} />
        </div>
      )}

      {consentNeeded && (
        <div className="banner banner-warn stack-sm" role="region" aria-label={t('ai.consent.bannerTitle')} style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <ShieldAlert size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div className="stack-sm">
              <strong>{t('ai.consent.bannerTitle')}</strong>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                {t('ai.consent.bannerBody', { reason: consentReason })}
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
                {structuredError && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ai-actions" role="group" aria-label={t('ai.copilot.actionsLabel')}>
        <button
          type="button"
          className="ai-action"
          disabled={structuredLoading}
          onClick={() => {
            setFocusedRequirement(null);
            void runStructured('EXPLAIN_REQUIREMENTS');
          }}
        >
          <Sparkles size={16} aria-hidden="true" />
          <span>{t('ai.panel.explainBtn')}</span>
        </button>
        <button
          type="button"
          className="ai-action"
          disabled={structuredLoading}
          onClick={() => {
            setFocusedRequirement(null);
            void runStructured('EXPLAIN_REQUIREMENTS', t('ai.copilot.docsNote'));
          }}
        >
          <FileText size={16} aria-hidden="true" />
          <span>{t('ai.copilot.docsBtn')}</span>
        </button>
        <button
          type="button"
          className="ai-action"
          disabled={structuredLoading}
          onClick={() => {
            setFocusedRequirement(null);
            void runStructured('PREPARE_NEXT_STEPS');
          }}
        >
          <ListPlus size={16} aria-hidden="true" />
          <span>{t('ai.copilot.stepsBtn')}</span>
        </button>
        <button
          type="button"
          className="ai-action"
          aria-expanded={compareOpen}
          onClick={() => setCompareOpen((v) => !v)}
        >
          <GitCompare size={16} aria-hidden="true" />
          <span>{t('ai.copilot.compareBtn')}</span>
        </button>
      </div>

      {compareOpen && (
        <div className="subtle-card stack-sm">
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
              <option value="">{t('ai.copilot.comparePick')}</option>
              {orderedCandidates.map((cand) => (
                <option key={cand.id} value={cand.id}>
                  {cand.title[locale]}
                </option>
              ))}
            </select>
          </div>
          <p className="pill pill-cloud" style={{ margin: 0, alignSelf: 'flex-start' }}>
            <Cloud size={14} aria-hidden="true" />
            <span>{t('ai.copilot.compareCloudOnly')}</span>
          </p>
          <div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!compareTargetId || chatLoading || !isOnline}
              onClick={runCompare}
            >
              <GitCompare size={15} aria-hidden="true" />
              <span>{t('ai.copilot.compareRun')}</span>
            </button>
          </div>
        </div>
      )}

      {structuredLoading && (
        <div className="subtle-card ai-running" role="status" aria-live="polite">
          <span>{t('ai.panel.running')}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => aiOrchestrator.cancelActiveRequests()}
          >
            <X size={15} aria-hidden="true" />
            <span>{t('ai.panel.cancelBtn')}</span>
          </button>
        </div>
      )}

      {structuredError && !consentNeeded && (
        <div className="banner banner-bad" role="alert" style={{ marginBottom: 0 }}>
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
        <div className="banner banner-warn" role="status" aria-live="polite" style={{ marginBottom: 0 }}>
          <span>
            {t('ai.panel.stepLimitReached')} <Link to="/route">{t('nav.route')}</Link>
          </span>
        </div>
      )}

      {structuredResult && (
        <div
          className={`ai-result stack-md ${
            structuredResult.inferenceSource === 'IN_CLOUD' ? 'is-cloud' : 'is-local'
          }`}
          data-testid="structured-ai-result"
          aria-live="polite"
        >
          <InferenceSourceBadge
            source={structuredResult.inferenceSource}
            modelId={structuredResult.modelId}
          />

          {focusedRequirement && (
            <p className="ai-focus-banner">
              {t('ai.copilot.focusBanner', { text: focusedRequirement })}
            </p>
          )}

          <p style={{ margin: 0 }}>{structuredResult.summary}</p>

          {structuredResult.suggestedActions.length > 0 && (
            <div className="stack-sm">
              <h3 className="ai-subheading">{t('ai.panel.suggestedHeading')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                {structuredResult.suggestedActions.map((action, idx) => {
                  const alreadyInRoute = route.tasks.some(
                    (task) => task.opportunityId === opportunity.id && task.text === action.text,
                  );
                  return (
                    <li key={`${action.text}-${idx}`} className="ai-step-row">
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
                          {alreadyInRoute ? t('ai.panel.addedStepToRoute') : t('ai.panel.addStepToRoute')}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {structuredResult.unknowns.length > 0 && (
            <div className="stack-sm">
              <h3 className="ai-subheading">{t('ai.panel.unknownsHeading')}</h3>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                {structuredResult.unknowns.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {structuredResult.groundedRequirements.length > 0 && (
            <details className="ai-evidence">
              <summary>
                {t('ai.copilot.evidenceSummary', {
                  count: structuredResult.groundedRequirements.length,
                })}
              </summary>
              <ul style={{ margin: '8px 0 0', paddingLeft: '18px', display: 'grid', gap: '8px' }}>
                {structuredResult.groundedRequirements.map((item, idx) => (
                  <li key={`${item.text}-${idx}`}>
                    <span>{item.text} </span>
                    <span className="pill pill-neutral">
                      {item.evidenceIds.length > 0
                        ? t('ai.panel.evidenceTag', { ids: item.evidenceIds.join(', ') })
                        : t('ai.panel.noEvidence')}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="ai-latency">
                {t('ai.panel.latencyMeta', {
                  source: structuredResult.inferenceSource,
                  ms: structuredResult.latencyMs,
                })}
              </p>
            </details>
          )}

          <p className="ai-caution">{structuredResult.cautionNote}</p>
        </div>
      )}

      {chatHistory.length > 0 && (
        <div className="stack-sm" aria-live="polite">
          {chatHistory.map((turn) => (
            <div key={turn.id} className={turn.role === 'user' ? 'subtle-card' : 'ai-result is-cloud'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.84rem' }}>
                  {turn.role === 'user' ? t('ai.panel.userTurnLabel') : t('ai.panel.cloudTurnLabel')}
                </strong>
                {turn.inferenceSource && (
                  <InferenceSourceBadge source={turn.inferenceSource} modelId={turn.modelId} />
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem' }} className="wrap-text">
                {turn.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {chatError && chatError.code !== 'CLOUD_CONSENT_REQUIRED' && (
        <div className="banner banner-bad" role="alert" style={{ marginBottom: 0 }}>
          <span>
            {t(`ai.errors.${chatError.code}`, {
              defaultValue: chatError.details,
              details: chatError.details,
            })}
          </span>
        </div>
      )}

      <details className="ai-own-question">
        <summary>{t('ai.copilot.askOwn')}</summary>
        <form onSubmit={handleSendFollowUp} className="stack-sm" style={{ marginTop: '10px' }}>
          <span className="pill pill-cloud" style={{ alignSelf: 'flex-start' }}>
            <Cloud size={14} aria-hidden="true" />
            <span>{t('ai.copilot.onlineWithPermission')}</span>
          </span>
          <label htmlFor="ai-followup-input" className="sr-only">
            {t('ai.copilot.askOwn')}
          </label>
          <textarea
            id="ai-followup-input"
            className="textarea-input"
            maxLength={400}
            value={chatQuestion}
            placeholder={t('ai.panel.followUpPlaceholder')}
            onChange={(e) => setChatQuestion(e.target.value)}
          />
          {!isOnline && (
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>
              {t('ai.panel.offlineChatHint')}
            </p>
          )}
          <div className="card-actions">
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={chatLoading || !isOnline || !chatQuestion.trim()}
            >
              <Send size={15} aria-hidden="true" />
              <span>{chatLoading ? t('ai.panel.followUpSending') : t('ai.panel.followUpSend')}</span>
            </button>
          </div>
        </form>
      </details>

      <p className="ai-disclaimer">{t('ai.copilot.neverDecides')}</p>
    </section>
  );
}
