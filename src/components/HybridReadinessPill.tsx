import { Cloud, Cpu, Download, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useApp } from '../app/appContextStore';

export function HybridReadinessPill() {
  const { t } = useTranslation();
  const {
    capabilities,
    isDownloadingModel,
    downloadProgress,
    initializeOnDeviceModel,
    preferences,
  } = useApp();

  if (isDownloadingModel) {
    const percent = Math.round((downloadProgress ?? 0) * 100);
    return (
      <span
        className="pill pill-info"
        data-tour="hybrid-status"
        role="status"
        aria-live="polite"
      >
        <Download size={14} aria-hidden="true" />
        <span>{t('ai.badge.downloadingPill', { percent })}</span>
      </span>
    );
  }

  const avail = capabilities?.onDeviceAvailability ?? 'unsupported';

  if (avail === 'available') {
    return (
      <Link
        to="/settings"
        className="pill pill-good"
        style={{ textDecoration: 'none' }}
        data-tour="hybrid-status"
      >
        <Cpu size={14} aria-hidden="true" />
        <span>{t('ai.badge.localPill')}</span>
      </Link>
    );
  }

  if (avail === 'downloadable' && capabilities?.firebaseConfigured) {
    return (
      <button
        type="button"
        className="pill pill-info"
        style={{ cursor: 'pointer' }}
        data-tour="hybrid-status"
        onClick={() => void initializeOnDeviceModel()}
      >
        <Download size={14} aria-hidden="true" />
        <span>{t('ai.badge.downloadPill')}</span>
      </button>
    );
  }

  if (capabilities?.firebaseConfigured && preferences.inferencePreference !== 'ONLY_ON_DEVICE') {
    return (
      <Link
        to="/settings"
        className="pill pill-cloud"
        style={{ textDecoration: 'none' }}
        data-tour="hybrid-status"
      >
        <Cloud size={14} aria-hidden="true" />
        <span>{t('ai.badge.cloudPill')}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/settings"
      className="pill pill-neutral"
      style={{ textDecoration: 'none' }}
      data-tour="hybrid-status"
    >
      <Wrench size={14} aria-hidden="true" />
      <span>{t('ai.badge.setupPill')}</span>
    </Link>
  );
}
