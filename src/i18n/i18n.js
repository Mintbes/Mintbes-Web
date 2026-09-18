import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  const manual = localStorage.getItem('mintbes_user_lang_manual');
  if (manual === 'es' || manual === 'en') return manual;
  const geo = localStorage.getItem('mintbes_geo_lang');
  if (geo === 'es' || geo === 'en') return geo;
  const browserLang = (navigator.language || '').substring(0, 2).toLowerCase();
  return browserLang === 'es' ? 'es' : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
