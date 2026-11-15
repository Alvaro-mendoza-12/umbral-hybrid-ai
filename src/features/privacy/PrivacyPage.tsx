import { Cloud, Cpu, HardDrive, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="stack-lg animate-enter">
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)' }}>
            <HardDrive size={18} aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--ink-primary)' }}>
              {t('privacy.cards.localFirstTitle')}
            </h2>
          </div>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t('privacy.cards.localFirstBody')}
          </p>
        </article>

        <article className="surface-card stack-sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)' }}>
            <Cpu size={18} aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--ink-primary)' }}>
              {t('privacy.cards.onDeviceTitle')}
            </h2>
          </div>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t('privacy.cards.onDeviceBody')}
          </p>
        </article>

        <article className="surface-card stack-sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cloud-fg)' }}>
            <Cloud size={18} aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--ink-primary)' }}>
              {t('privacy.cards.cloudBoundaryTitle')}
            </h2>
          </div>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t('privacy.cards.cloudBoundaryBody')}
          </p>
        </article>

        <article className="surface-card stack-sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)' }}>
            <ShieldCheck size={18} aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--ink-primary)' }}>
              {t('privacy.cards.honestyTitle')}
            </h2>
          </div>
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
