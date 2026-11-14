import { Compass, Route as RouteIcon, Settings, ShieldCheck, WifiOff } from 'lucide-react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { HybridReadinessPill } from '../components/HybridReadinessPill';
import { UmbralMark } from '../components/UmbralMark';
import { useApp } from './appContextStore';
import { IntroSplash } from './IntroSplash';
import { OnboardingTour } from './OnboardingTour';

export function Shell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { locale, setLocale, route, isOnline, storageWarning } = useApp();
  const savedCount = Object.keys(route.saved).length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t('app.skipToContent')}
      </a>

      <IntroSplash />

      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand-link">
            <span data-brand-anchor="header">
              <UmbralMark size={38} />
            </span>
            <span className="brand-wordmark">
              <span className="brand-title">{t('app.name')}</span>{' '}
              <span className="brand-sub">{t('app.subtitle')}</span>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label={t('nav.primaryLabel')}>
            <NavLink to="/" end className="nav-link">
              <Compass size={16} aria-hidden="true" />
              <span>{t('nav.explore')}</span>
            </NavLink>

            <NavLink
              to="/route"
              className="nav-link"
              data-tour="my-route-nav"
            >
              <RouteIcon size={16} aria-hidden="true" />
              <span>{t('nav.route')}</span>
              {savedCount > 0 && (
                <span
                  className="nav-count-badge"
                  aria-label={t('nav.savedBadge', { count: savedCount })}
                >
                  {savedCount}
                </span>
              )}
            </NavLink>

            <NavLink to="/settings" className="nav-link">
              <Settings size={16} aria-hidden="true" />
              <span>{t('nav.settings')}</span>
            </NavLink>

            <NavLink to="/privacy" className="nav-link">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{t('nav.privacy')}</span>
            </NavLink>
          </nav>

          <div className="header-actions">
            <HybridReadinessPill />

            <div className="lang-switch" role="group" aria-label={t('settings.languageSection')}>
              <button
                type="button"
                className="lang-btn"
                aria-pressed={locale === 'en'}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
              <button
                type="button"
                className="lang-btn"
                aria-pressed={locale === 'es'}
                onClick={() => setLocale('es')}
              >
                ES
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="main-content" tabIndex={-1}>
        {!isOnline && (
          <div className="banner banner-info" role="status" aria-live="polite">
            <WifiOff size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{t('app.offlineBanner')}</span>
          </div>
        )}

        {storageWarning && (
          <div className="banner banner-warn" role="alert">
            <span>{t('app.storageWarning')}</span>
          </div>
        )}

        {children}
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>{t('app.disclaimerFooter')}</span>
          <div className="footer-links">
            <Link to="/privacy">{t('nav.privacy')}</Link>
            <Link to="/settings">{t('nav.settings')}</Link>
          </div>
        </div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label={t('nav.primaryLabel')}>
        <NavLink to="/" end className="mobile-nav-item">
          <Compass size={20} aria-hidden="true" />
          <span>{t('nav.explore')}</span>
        </NavLink>

        <NavLink
          to="/route"
          className="mobile-nav-item"
          data-tour="my-route-nav"
        >
          <RouteIcon size={20} aria-hidden="true" />
          <span>{t('nav.route')}</span>
          {savedCount > 0 && (
            <span
              className="mobile-nav-badge"
              aria-label={t('nav.savedBadge', { count: savedCount })}
            >
              {savedCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/settings" className="mobile-nav-item">
          <Settings size={20} aria-hidden="true" />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </nav>

      <OnboardingTour />
    </div>
  );
}
