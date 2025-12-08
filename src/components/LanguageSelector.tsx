'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languageNames, languageFlags, type Language } from '@/lib/translations';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const languages: Language[] = ['en', 'es', 'fr', 'ja', 'zh', 'it', 'vi', 'de', 'ko', 'pt', 'ru'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-pink-200 dark:bg-pink-900/50 hover:bg-pink-300 dark:hover:bg-pink-800/50 transition-all flex items-center gap-1"
        aria-label="Select language"
      >
        <span className="text-lg">{languageFlags[language]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-pink-200 dark:border-pink-900/30 z-50">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full px-4 py-2 text-left hover:bg-pink-100 dark:hover:bg-pink-950/30 transition-all flex items-center gap-3 ${
                language === lang
                  ? 'bg-pink-200 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200'
                  : 'text-black dark:text-white'
              }`}
            >
              <span className="text-lg">{languageFlags[lang]}</span>
              <span className="font-medium">{languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
