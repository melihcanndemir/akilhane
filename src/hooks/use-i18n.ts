'use client';

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function useI18n(namespaces: string | string[] = 'common') {
  const { t, i18n, ready } = useTranslation(namespaces);

  useEffect(() => {
    // Ensure the language is persisted
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return {
    t,
    i18n,
    ready,
    currentLanguage: i18n.language,
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
    languages: i18n.languages,
  };
}