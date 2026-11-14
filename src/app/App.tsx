import { lazy, Suspense, useEffect } from 'react';
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
  return (
    <section className="surface-card stack-md">
      <h1 style={{ margin: 0 }}>404</h1>
      <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
        The requested view does not exist in UMBRAL Hybrid AI.
      </p>
      <div>
        <Link to="/" className="btn btn-primary">
          Back to Explore
        </Link>
      </div>
    </section>
  );
}

export function AppRoutes() {
  return (
    <Shell>
      <ScrollToTopOnNavigate />
      <Suspense fallback={<div className="surface-card" role="status">Loading…</div>}>
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
