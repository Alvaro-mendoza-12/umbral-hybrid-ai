import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="stack-lg">
      <section className="surface-card stack-sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)' }}>
          <ShieldCheck size={22} aria-hidden="true" />
          <h1 style={{ margin: 0, fontSize: 'clamp(1.38rem, 2.4vw, 1.85rem)' }}>
            {t('privacy.heading')}
          </h1>
        </div>
        <p style={{ margin: 0, color: 'var(--ink-secondary)', maxWidth: '72ch' }}>
          {t('privacy.intro')}
        </p>
      </section>

      <div className="two-col-form">
        <article className="surface-card stack-sm">
          <h2 style={{ margin: 0, fontSize: '1.08rem' }}>
            {t('privacy.cards.localFirstTitle')}
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t('privacy.cards.localFirstBody')}
          </p>
        </article>

        <article className="surface-card stack-sm">
          <h2 style={{ margin: 0, fontSize: '1.08rem' }}>
            {t('privacy.cards.onDeviceTitle')}
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t('privacy.cards.onDeviceBody')}
          </p>
        </article>

        <article className="surface-card stack-sm">
          <h2 style={{ margin: 0, fontSize: '1.08rem' }}>
            {t('privacy.cards.cloudBoundaryTitle')}
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t('privacy.cards.cloudBoundaryBody')}
          </p>
        </article>

        <article className="surface-card stack-sm">
          <h2 style={{ margin: 0, fontSize: '1.08rem' }}>
            {t('privacy.cards.honestyTitle')}
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t('privacy.cards.honestyBody')}
          </p>
        </article>
      </div>

      <div>
        <Link to="/settings" className="btn btn-primary">
          {t('nav.settings')}
        </Link>
      </div>
    </div>
  );
}
