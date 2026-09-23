"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  isSupportedLanguage,
  languageFromBrowser,
  translations,
  type Language,
  type TranslationKey,
} from "@/i18n/translations";

export const LANGUAGE_STORAGE_KEY = "are-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const nextLanguage = isSupportedLanguage(saved)
      ? saved
      : languageFromBrowser(navigator.languages?.length ? navigator.languages : [navigator.language]);

    queueMicrotask(() => {
      setLanguageState(nextLanguage);
      document.documentElement.lang = nextLanguage;
    });
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translations[language][key] || translations.en[key],
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
