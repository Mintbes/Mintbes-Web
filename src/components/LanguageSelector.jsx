import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ scrolled = false }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.substring(0, 2).toLowerCase() : 'en';

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
      scrolled 
        ? 'bg-gray-100/90 border-gray-200 text-gray-700 shadow-sm' 
        : 'bg-white/10 backdrop-blur-md border-white/20 text-white'
    }`}>
      <Globe className="w-3.5 h-3.5 opacity-80 shrink-0" />
      <button
        onClick={() => changeLanguage('en')}
        className={`px-1.5 py-0.5 rounded transition-colors ${
          currentLang === 'en'
            ? 'bg-mintbes-600 text-white shadow-xs'
            : 'hover:text-mintbes-400 opacity-70'
        }`}
        aria-label="English language"
      >
        EN
      </button>
      <span className="opacity-40">|</span>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-1.5 py-0.5 rounded transition-colors ${
          currentLang === 'es'
            ? 'bg-mintbes-600 text-white shadow-xs'
            : 'hover:text-mintbes-400 opacity-70'
        }`}
        aria-label="Spanish language"
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSelector;
