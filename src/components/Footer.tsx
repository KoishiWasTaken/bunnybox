'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const [showTooltip, setShowTooltip] = useState(false);
  const { t } = useLanguage();

  return (
    <footer className="py-6 text-center">
      <p className="text-sm text-black dark:text-white">
        {t.footer.madeWith} ❤️ {t.footer.by}{' '}
        <span
          className="relative inline-block cursor-help"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          @.koishi
          {showTooltip && (
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg whitespace-nowrap z-50">
              @.koishi on Discord
            </span>
          )}
        </span>
      </p>
      <p className="text-sm text-black dark:text-white mt-1">
        If you liked my service, feel free to share it with others! ^^
      </p>
    </footer>
  );
}
