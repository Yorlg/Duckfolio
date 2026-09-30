'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createInstance, type i18n } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import type { Messages } from '@/lib/locales';

type Language = 'zh-CN' | 'en';
const STORAGE_KEY = 'duckfolio-language';

export function LanguageProvider({ children, translations }: {
  children: ReactNode;
  translations: Record<Language, Messages>;
}) {
  const [instance] = useState<i18n>(() => {
    const client = createInstance();
    void client.use(initReactI18next).init({
      lng: 'zh-CN',
      fallbackLng: 'zh-CN',
      supportedLngs: ['zh-CN', 'en'],
      resources: {
        'zh-CN': { translation: translations['zh-CN'], admin: translations['zh-CN'].admin },
        en: { translation: translations.en, admin: translations.en.admin },
      },
      ns: ['translation', 'admin'],
      defaultNS: 'translation',
      interpolation: { escapeValue: false },
      initAsync: false,
    });
    return client;
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en') void instance.changeLanguage('en');
  }, [instance]);

  useEffect(() => {
    document.documentElement.lang = instance.language;
    const syncLanguage = (language: string) => {
      document.documentElement.lang = language;
      window.localStorage.setItem(STORAGE_KEY, language);
    };
    instance.on('languageChanged', syncLanguage);
    return () => instance.off('languageChanged', syncLanguage);
  }, [instance]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
