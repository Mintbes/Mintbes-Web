import i18n from './i18n';

// ISO 3166-1 alpha-2 codes for Spanish-speaking / Latin American countries
export const SPANISH_SPEAKING_COUNTRIES = new Set([
  'ES', // España
  'MX', // México
  'AR', // Argentina
  'CO', // Colombia
  'CL', // Chile
  'PE', // Perú
  'VE', // Venezuela
  'EC', // Ecuador
  'GT', // Guatemala
  'CU', // Cuba
  'BO', // Bolivia
  'DO', // República Dominicana
  'HN', // Honduras
  'PY', // Paraguay
  'SV', // El Salvador
  'NI', // Nicaragua
  'CR', // Costa Rica
  'PA', // Panamá
  'UY', // Uruguay
  'PR', // Puerto Rico
  'GQ', // Guinea Ecuatorial
]);

export const MANUAL_LANG_KEY = 'mintbes_user_lang_manual';
export const GEO_LANG_KEY = 'mintbes_geo_lang';

/**
 * Fetch the user's country code based on their public IP address
 */
export async function detectCountryByIP() {
  // Strategy 1: api.country.is (fast, worldwide Cloudflare edge, CORS enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://api.country.is/', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.country) {
        return data.country.toUpperCase();
      }
    }
  } catch (err) {
    // Failover to secondary provider
  }

  // Strategy 2: ipwho.is (reliable fallback)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.country_code) {
        return data.country_code.toUpperCase();
      }
    }
  } catch (err) {
    // Network or adblocker failure
  }

  return null;
}

/**
 * Automatically determine and set language based on IP
 * Spanish-speaking countries -> 'es', all other countries -> 'en'
 */
export async function initGeoLanguage() {
  if (typeof window === 'undefined') return;

  // 1. If user previously made a manual choice in the navbar, respect it
  const manualChoice = localStorage.getItem(MANUAL_LANG_KEY);
  if (manualChoice) {
    if (i18n.language !== manualChoice) {
      i18n.changeLanguage(manualChoice);
    }
    return;
  }

  // 2. If geo language was already resolved on a previous visit, apply it immediately
  const cachedGeo = localStorage.getItem(GEO_LANG_KEY);
  if (cachedGeo) {
    if (i18n.language !== cachedGeo) {
      i18n.changeLanguage(cachedGeo);
    }
    return;
  }

  // 3. First-time visit: detect by IP
  const countryCode = await detectCountryByIP();
  if (countryCode) {
    const targetLang = SPANISH_SPEAKING_COUNTRIES.has(countryCode) ? 'es' : 'en';
    localStorage.setItem(GEO_LANG_KEY, targetLang);

    // Make sure user didn't manually pick a language while request was in-flight
    if (!localStorage.getItem(MANUAL_LANG_KEY)) {
      i18n.changeLanguage(targetLang);
    }
  } else {
    // 4. Fallback if IP service is unreachable: check browser language
    const browserLang = (navigator.language || '').substring(0, 2).toLowerCase();
    const fallbackLang = browserLang === 'es' ? 'es' : 'en';
    if (!localStorage.getItem(MANUAL_LANG_KEY)) {
      i18n.changeLanguage(fallbackLang);
    }
  }
}
