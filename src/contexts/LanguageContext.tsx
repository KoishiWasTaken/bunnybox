'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'fr', 'ja', 'zh', 'it', 'vi', 'de', 'ko', 'pt', 'ru'];

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language.toLowerCase();

  // Direct matches
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('vi')) return 'vi';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('ru')) return 'ru';

  // Default to English
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage or auto-detect
    const storedLanguage = localStorage.getItem('bunnybox_language') as Language | null;
    if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    } else {
      // Auto-detect on first load
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
      localStorage.setItem('bunnybox_language', detected);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Save to localStorage
      localStorage.setItem('bunnybox_language', language);
    }
  }, [language, mounted]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t: translations[language]
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
