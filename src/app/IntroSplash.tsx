import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UmbralMark } from '../components/UmbralMark';
import { prefersReducedMotion, useApp } from './appContextStore';

function IntroSplashStage({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'pulse' | 'dock' | 'fade'>('pulse');
  const [dockTransform, setDockTransform] = useState<string>(
    'translate(-50%, -50%) scale(1.8)',
  );

  useEffect(() => {
    if (prefersReducedMotion()) {
      onDismiss();
      return;
    }

    const dockTimer = window.setTimeout(() => {
      const anchor = document.querySelector('[data-brand-anchor="header"]');
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const anchorCenterX = rect.left + rect.width / 2;
        const anchorCenterY = rect.top + rect.height / 2;
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const dx = anchorCenterX - viewportCenterX;
        const dy = anchorCenterY - viewportCenterY;
        const targetScale = rect.width > 0 ? rect.width / 48 : 0.83;
        setDockTransform(
          `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${targetScale.toFixed(2)})`,
        );
      } else {
        setDockTransform('translate(calc(-50% - 35vw), calc(-50% - 42vh)) scale(0.83)');
      }
      setPhase('dock');
    }, 320);

    const fadeTimer = window.setTimeout(() => {
      setPhase('fade');
    }, 640);

    const doneTimer = window.setTimeout(() => {
      onDismiss();
    }, 860);

    const handleUserInterrupt = (e: Event) => {
      if (
        e instanceof KeyboardEvent &&
        (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta')
      ) {
        return;
      }
      onDismiss();
    };

    window.addEventListener('keydown', handleUserInterrupt, { once: true });
    window.addEventListener('wheel', handleUserInterrupt, { once: true, passive: true });

    return () => {
      window.clearTimeout(dockTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener('keydown', handleUserInterrupt);
      window.removeEventListener('wheel', handleUserInterrupt);
    };
  }, [onDismiss]);

  return (
    <div
      className={`intro-overlay${phase === 'fade' ? ' is-fading' : ''}`}
      role="status"
      aria-label={t('intro.label')}
      data-testid="intro-splash"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onDismiss();
        }
      }}
    >
      <button
        type="button"
        className="btn btn-secondary btn-sm intro-skip-btn"
        onClick={onDismiss}
      >
        {t('intro.skip')}
      </button>

      <div
        className={`intro-logo-stage${
          phase === 'pulse' ? ' is-pulsing' : ' is-docking'
        }`}
        style={phase === 'pulse' ? undefined : { transform: dockTransform }}
      >
        <UmbralMark size={48} />
        {phase === 'pulse' && (
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.12em',
              color: 'var(--brand-primary)',
            }}
          >
            UMBRAL
          </span>
        )}
      </div>
    </div>
  );
}

export function IntroSplash() {
  const { introActive, dismissIntro } = useApp();

  if (!introActive) {
    return null;
  }

  return <IntroSplashStage onDismiss={dismissIntro} />;
}
