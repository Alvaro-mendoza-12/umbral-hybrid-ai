import { Compass } from 'lucide-react';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ExplorePage } from '../features/explore/ExplorePage';
import { AppProvider } from './AppContext';
import type { AppPorts } from './appContextStore';
import { Shell } from './Shell';

const OpportunityDetailPage = lazy(() =>
  import('../features/detail/OpportunityDetailPage').then((m) => ({
    default: m.OpportunityDetailPage,
  })),
);
const MyRoutePage = lazy(() =>
  import('../features/route/MyRoutePage').then((m) => ({
    default: m.MyRoutePage,
  })),
);
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
);
const PrivacyPage = lazy(() =>
  import('../features/privacy/PrivacyPage').then((m) => ({
    default: m.PrivacyPage,
  })),
);

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundView() {
  const { t } = useTranslation();
  return (
    <section className="surface-card not-found-card stack-md animate-enter">
      <span className="pill pill-neutral" style={{ alignSelf: 'flex-start' }}>
        <Compass size={14} aria-hidden="true" />
        <span>404</span>
      </span>
      <h1 style={{ margin: 0 }}>{t('app.notFoundTitle')}</h1>
      <p style={{ margin: 0, color: 'var(--ink-secondary)', maxWidth: '52ch' }}>
        {t('app.notFoundBody')}
      </p>
      <div className="card-actions">
        <Link to="/" className="btn btn-primary">
          <Compass size={16} aria-hidden="true" />
          <span>{t('common.backToExplore')}</span>
        </Link>
        <Link to="/route" className="btn btn-secondary">
          {t('nav.route')}
        </Link>
      </div>
    </section>
  );
}

function RouteLoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="surface-card" role="status">
      {t('common.loading')}
    </div>
  );
}

export function AppRoutes() {
  return (
    <Shell>
      <ScrollToTopOnNavigate />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="/route" element={<MyRoutePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}

export function App({
  ports,
  skipInitialCapabilityProbe,
}: {
  ports?: Partial<AppPorts>;
  skipInitialCapabilityProbe?: boolean;
}) {
  return (
    <AppProvider
      ports={ports}
      skipInitialCapabilityProbe={skipInitialCapabilityProbe}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
