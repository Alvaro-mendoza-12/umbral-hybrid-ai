import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../locales/en/translation.json';
import esTranslation from '../locales/es/translation.json';
import type { Locale } from '../domain/types';

export const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
} as const;

let initialized = false;

export function ensureI18nInitialized(initialLocale: Locale = 'en') {
  if (!initialized && !i18n.isInitialized) {
    initialized = true;
    void i18n.use(initReactI18next).init({
      resources,
      lng: initialLocale,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  } else if (i18n.language !== initialLocale) {
    void i18n.changeLanguage(initialLocale);
  }
  return i18n;
}

export default i18n;
