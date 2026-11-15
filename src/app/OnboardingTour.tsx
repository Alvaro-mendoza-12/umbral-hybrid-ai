import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion, useApp } from './appContextStore';

interface TourStepDef {
  id: 'finder' | 'hybridStatus' | 'detailCard' | 'myRouteNav';
  selector: string;
}

const TOUR_STEPS: readonly TourStepDef[] = [
  { id: 'finder', selector: '[data-tour="finder"]' },
  { id: 'hybridStatus', selector: '[data-tour="hybrid-status"]' },
  { id: 'detailCard', selector: '[data-tour="detail-card"]' },
  { id: 'myRouteNav', selector: '[data-tour="my-route-nav"]' },
];

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

function findVisibleTarget(selector: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const candidates = document.querySelectorAll<HTMLElement>(selector);
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return el;
    }
  }
  return null;
}

function OnboardingTourStage({
  onClose,
}: {
  onClose: (status: 'completed' | 'dismissed') => void;
}) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [box, setBox] = useState<HighlightBox | null>(null);
  const [popoverHeight, setPopoverHeight] = useState(140);
  const [heroCtaBottom, setHeroCtaBottom] = useState(0);
  const popoverRef = useRef<HTMLElement | null>(null);

  const currentStep = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0]!;

  const syncPosition = useCallback(() => {
    const measuredH = popoverRef.current?.offsetHeight;
    if (measuredH && measuredH > 0) {
      setPopoverHeight((prev) => (prev === measuredH ? prev : measuredH));
    }
    const ctas = document.querySelectorAll('[data-testid="hero-tour-cta"]');
    let maxCtaBottom = 0;
    ctas.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.bottom > maxCtaBottom) {
        maxCtaBottom = Math.ceil(r.bottom);
      }
    });
    setHeroCtaBottom((prev) => (prev === maxCtaBottom ? prev : maxCtaBottom));

    const target = findVisibleTarget(currentStep.selector);
    if (!target) {
      setBox(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    const pad = 6;
    setBox({
      top: Math.max(8, rect.top - pad),
      left: Math.max(8, rect.left - pad),
      width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
      height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
    });
  }, [currentStep.selector]);

  useEffect(() => {
    const target = findVisibleTarget(currentStep.selector);
    if (stepIndex > 0 && target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({
        block: 'nearest',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }

    const frameId = window.requestAnimationFrame(syncPosition);
    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose('dismissed');
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const targetEl = e.target as Element | null;
      if (!targetEl) return;
      if (
        targetEl.closest('[data-testid="onboarding-tour"]') ||
        targetEl.closest('header.site-header') ||
        targetEl.closest('[data-testid="hero-tour-cta"]')
      ) {
        return;
      }
      onClose('dismissed');
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [currentStep.selector, onClose, stepIndex, syncPosition]);

  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const popH = popoverHeight;
  const fitsBelow = box ? box.top + box.height + 12 + popH <= viewportH - 8 : false;
  const bottomReserved = viewportW < 768 ? 76 : 14;
  const maxTop = Math.max(76, viewportH - bottomReserved - popH);
  const safeFinderTop =
    heroCtaBottom > 0 ? Math.min(Math.max(heroCtaBottom + 10, maxTop), maxTop) : maxTop;

  const rawPopoverTop = box
    ? fitsBelow
      ? box.top + box.height + 10
      : currentStep.id === 'finder'
        ? safeFinderTop
        : Math.max(76, box.top - popH - 12)
    : 84;
  const popoverTop = Math.min(rawPopoverTop, maxTop);
  const popoverLeft = box
    ? !fitsBelow && currentStep.id === 'finder'
      ? Math.max(12, viewportW - 376)
      : !fitsBelow && box.width > 520
        ? Math.max(12, Math.min(box.left + box.width - 360, viewportW - 372))
        : Math.min(Math.max(12, box.left), Math.max(12, viewportW - 372))
    : 16;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  return (
    <>
      {box && (
        <div
          className="tour-highlight-ring"
          aria-hidden="true"
          style={{
            top: `${box.top}px`,
            left: `${box.left}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
          }}
        />
      )}

      <aside
        ref={popoverRef}
        className="tour-popover"
        role="region"
        aria-label={t('tour.dialogLabel')}
        data-testid="onboarding-tour"
        style={{
          top: `${popoverTop}px`,
          left: `${popoverLeft}px`,
        }}
      >
        <div className="stack-sm">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
              aria-live="polite"
            >
              {t('tour.stepCounter', {
                current: stepIndex + 1,
                total: TOUR_STEPS.length,
              })}
            </span>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onClose('dismissed')}
            >
              {t('tour.skip')}
            </button>
          </div>

          <h2 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {t(`tour.steps.${currentStep.id}.title`)}
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: '0.92rem',
              color: 'var(--ink-secondary)',
            }}
          >
            {t(`tour.steps.${currentStep.id}.body`)}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: isFirst ? 'flex-end' : 'space-between',
              gap: '8px',
              marginTop: '6px',
            }}
          >
            {!isFirst && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              >
                {t('tour.back')}
              </button>
            )}

            {isLast ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onClose('completed')}
              >
                {t('tour.finish')}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() =>
                  setStepIndex((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1))
                }
              >
                {t('tour.next')}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export function OnboardingTour() {
  const { pathname } = useLocation();
  const { introActive, tourActive, closeTour } = useApp();

  if (!tourActive || introActive || pathname !== '/') {
    return null;
  }

  return <OnboardingTourStage onClose={closeTour} />;
}
