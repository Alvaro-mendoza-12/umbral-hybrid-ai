import { useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/appContextStore';
import type { Locale } from '../domain/types';

interface LanguageSwitchProps {
  testId?: string;
}

export function LanguageSwitch({ testId = 'lang-switch' }: LanguageSwitchProps) {
  const { t } = useTranslation();
  const { locale, setLocale } = useApp();
  const esRef = useRef<HTMLButtonElement | null>(null);
  const enRef = useRef<HTMLButtonElement | null>(null);

  const selectLocale = (next: Locale, moveFocus = false) => {
    setLocale(next);
    if (moveFocus) {
      if (next === 'es') {
        esRef.current?.focus();
      } else {
        enRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      selectLocale('en', true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      selectLocale('es', true);
    }
  };

  return (
    <div
      className="lang-switch"
      role="group"
      aria-label={t('settings.languageSection')}
      data-testid={testId}
      data-active-locale={locale}
      onKeyDown={handleKeyDown}
    >
      <span
        className="lang-switch-thumb"
        aria-hidden="true"
        style={{
          transform: locale === 'es' ? 'translateX(0%)' : 'translateX(100%)',
        }}
      />
      <button
        ref={esRef}
        type="button"
        className="lang-btn"
        aria-pressed={locale === 'es'}
        onClick={() => selectLocale('es')}
      >
        ES
      </button>
      <button
        ref={enRef}
        type="button"
        className="lang-btn"
        aria-pressed={locale === 'en'}
        onClick={() => selectLocale('en')}
      >
        EN
      </button>
    </div>
  );
}
