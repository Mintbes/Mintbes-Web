import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.substring(0, 2).toLowerCase() : 'en';

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border border-white/10 bg-[#0B0F17]/80 backdrop-blur-md text-slate-200 shadow-sm">
      <Globe className="w-3.5 h-3.5 text-[#00AEE9] shrink-0" />
      <button
        onClick={() => changeLanguage('en')}
        className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
          currentLang === 'en'
            ? 'bg-[#00AEE9]/25 text-[#69FABD] font-bold border border-[#00AEE9]/40'
            : 'hover:text-white opacity-70'
        }`}
        aria-label="English language"
      >
        EN
      </button>
      <span className="opacity-30 text-slate-400">|</span>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
          currentLang === 'es'
            ? 'bg-[#00AEE9]/25 text-[#69FABD] font-bold border border-[#00AEE9]/40'
            : 'hover:text-white opacity-70'
        }`}
        aria-label="Spanish language"
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSelector;
