// MintMax Web Analytics & Traffic Intelligence Engine
// Tracks real visits, video interactions, prompt copies, referrers, and audience telemetry.

const STORAGE_KEY = 'mintmax_analytics_events';
const SESSION_KEY = 'mintmax_session_id';
const SEED_KEY = 'mintmax_seed_initialized_v8';

// Supabase Cloud Configuration
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://vdexezerriybsjijocyo.supabase.co';
const SUPABASE_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_mCn5VEdkNe5WOorC8KM66A_AVue_eGv';

// Background Geo IP Resolver
let cachedGeo = null;
let geoPromise = null;

function getCachedGeo() {
  if (cachedGeo) return cachedGeo;
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('mintmax_geo_cache');
    if (raw) {
      cachedGeo = JSON.parse(raw);
      return cachedGeo;
    }
  } catch {}
  return null;
}

export function initGeoTelemetry() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const existing = getCachedGeo();
  if (existing) return Promise.resolve(existing);
  if (geoPromise) return geoPromise;

  geoPromise = new Promise((resolve) => {
    // 800ms safety timeout so app initialization is never delayed
    const timer = setTimeout(() => {
      resolve(null);
    }, 800);

    fetch('https://freeipapi.com/api/json')
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timer);
        if (data && data.countryName) {
          cachedGeo = {
            country: data.countryName,
            city: data.cityName || 'Capital',
            countryCode: data.countryCode || 'ES'
          };
          sessionStorage.setItem('mintmax_geo_cache', JSON.stringify(cachedGeo));
          resolve(cachedGeo);
        } else {
          resolve(null);
        }
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });

  return geoPromise;
}

// Automatically resolve geo on module load
if (typeof window !== 'undefined') {
  initGeoTelemetry();
}

// Detect Device & Environment
function detectDevice() {
  if (typeof window === 'undefined') return { type: 'Desktop', os: 'Windows', browser: 'Chrome' };
  const ua = navigator.userAgent || '';
  
  // Device Type
  let type = 'Desktop';
  if (/mobile/i.test(ua)) type = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) type = 'Tablet';

  // Operating System
  let os = 'Windows';
  if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser
  let browser = 'Chrome';
  if (navigator.brave && typeof navigator.brave.isBrave === 'function') browser = 'Brave';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';

  return { type, os, browser };
}

// Classify Referrer & Source
function getTrafficSource() {
  if (typeof window === 'undefined') return { channel: 'Direct', referrer: '' };
  
  const ref = document.referrer ? document.referrer.toLowerCase() : '';
  const search = window.location.search ? window.location.search.toLowerCase() : '';
  const pathname = window.location.pathname.toLowerCase();

  const hostname = (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '');

  // Vanity Short Domain: m.country
  if (
    hostname === 'm.country' ||
    hostname.endsWith('.m.country') ||
    ref.includes('m.country') ||
    search.includes('m.country') ||
    search.includes('ref=m') ||
    search.includes('src=m')
  ) {
    return { channel: 'Short Domain (m.country)', referrer: ref || 'https://m.country/' };
  }

  // Campaign / Query parameters
  if (search.includes('utm_source=twitter') || search.includes('t.co') || ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) {
    return { channel: 'Twitter / X', referrer: ref || 'https://x.com/' };
  }
  if (search.includes('utm_source=telegram') || ref.includes('t.me') || ref.includes('telegram.org') || search.includes('tg=')) {
    return { channel: 'Telegram', referrer: ref || 'https://t.me/' };
  }
  if (search.includes('utm_source=youtube') || ref.includes('youtube.com') || ref.includes('youtu.be')) {
    return { channel: 'YouTube Shorts', referrer: ref || 'https://youtube.com/' };
  }
  if (search.includes('utm_source=discord') || ref.includes('discord.com') || ref.includes('discord.gg')) {
    return { channel: 'Discord', referrer: ref || 'https://discord.com/' };
  }
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('duckduckgo.')) {
    return { channel: 'Search (Google/Organic)', referrer: ref };
  }
  if (search.includes('utm_source=warpcast') || ref.includes('warpcast.com')) {
    return { channel: 'Warpcast (Web3)', referrer: ref || 'https://warpcast.com/' };
  }
  if (pathname.startsWith('/v/') || search.includes('video=') || search.includes('v=')) {
    return { channel: 'Direct Video Permalink', referrer: ref || 'Direct / Shared Link' };
  }
  if (ref && !ref.includes(window.location.host)) {
    try {
      const u = new URL(ref);
      return { channel: u.hostname.replace('www.', ''), referrer: ref };
    } catch {
      return { channel: 'Referral', referrer: ref };
    }
  }

  return { channel: 'Direct / Bookmarks', referrer: 'Direct Navigation' };
}

// Get or Create Session
function getSessionId() {
  if (typeof window === 'undefined') return 'srv_session';
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'ses_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return 'ses_' + Date.now();
  }
}

// Read events from storage (always sorted newest first, 100% real only)
export function getStoredEvents() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    // Enforce 100% real events: purge any simulated data
    const realOnly = list.filter((e) => e && e.id && !e.id.startsWith('seed_'));
    return realOnly.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.warn('MintMax Analytics read error:', err);
    return [];
  }
}

// Write event to storage & sync with Supabase cloud
export function logEvent(eventType, eventData = {}) {
  if (typeof window === 'undefined') return null;
  try {
    const env = detectDevice();
    const source = getTrafficSource();
    const geo = getCachedGeo() || {
      country: navigator.language?.startsWith('es') ? 'Spain' : 'International',
      city: navigator.language?.startsWith('es') ? 'Madrid' : 'Global',
      countryCode: navigator.language?.slice(-2).toUpperCase() || 'ES'
    };

    const event = {
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: eventType,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      path: window.location.pathname + window.location.search + window.location.hash,
      channel: source.channel,
      referrer: source.referrer,
      device: env.type,
      os: env.os,
      browser: env.browser,
      lang: navigator.language || 'es-ES',
      country: geo.country,
      city: geo.city,
      countryCode: geo.countryCode,
      data: eventData
    };

    const events = getStoredEvents();
    events.unshift(event);

    if (events.length > 2500) {
      events.length = 2500;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

    // Asynchronously send to Supabase in the background
    if (SUPABASE_URL && SUPABASE_KEY) {
      fetch(`${SUPABASE_URL}/rest/v1/mintmax_events`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          session_id: event.sessionId,
          path: event.path,
          channel: event.channel,
          referrer: event.referrer,
          device: event.device,
          os: event.os,
          browser: event.browser,
          lang: event.lang,
          country: event.country,
          city: event.city,
          country_code: event.countryCode,
          data: event.data
        }),
        keepalive: true
      }).catch((err) => {
        console.debug('Supabase background log error:', err);
      });
    }

    // Notify listeners in dashboard
    window.dispatchEvent(new CustomEvent('mintmax_event_logged', { detail: event }));
    return event;
  } catch (err) {
    console.warn('MintMax Analytics log error:', err);
    return null;
  }
}

// Fetch all unified real events from Supabase Cloud
export async function fetchRemoteEvents() {
  if (typeof window === 'undefined') return [];
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/mintmax_events?select=*&order=timestamp.desc&limit=2500`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data
      .filter((row) => row && row.id && !row.id.startsWith('test_') && !row.id.startsWith('seed_'))
      .map((row) => ({
      id: row.id,
      type: row.type,
      timestamp: Number(row.timestamp),
      sessionId: row.session_id,
      path: row.path,
      channel: row.channel,
      referrer: row.referrer,
      device: row.device,
      os: row.os,
      browser: row.browser,
      lang: row.lang,
      country: row.country || 'Spain',
      city: row.city || 'Madrid',
      countryCode: row.country_code || 'ES',
      data: row.data || {}
    }));
  } catch (err) {
    console.debug('Supabase fetch error:', err);
    return [];
  }
}

// Dedicated Trackers
export const analytics = {
  pageView: (path = window.location.pathname) => {
    return logEvent('page_view', { path, title: document.title });
  },

  sectionView: (sectionName) => {
    return logEvent('section_view', { section: sectionName });
  },

  videoModalOpen: (video) => {
    return logEvent('video_modal_open', {
      videoId: video.id,
      videoTitle: video.title,
      category: video.category,
      engine: video.engine,
      duration: video.duration
    });
  },

  videoPlay: (video) => {
    return logEvent('video_play', {
      videoId: video.id || video,
      videoTitle: video.title || video
    });
  },

  promptCopy: (video, source = 'showcase') => {
    return logEvent('prompt_copy', {
      videoId: video.id || video,
      videoTitle: video.title || video,
      source
    });
  },

  shareClick: (video, shareUrl) => {
    return logEvent('share_click', {
      videoId: video.id || video,
      videoTitle: video.title || video,
      shareUrl
    });
  },

  youtubeClick: (video) => {
    return logEvent('youtube_click', {
      videoId: video.id || video,
      videoTitle: video.title || video
    });
  },

  categoryFilter: (category) => {
    return logEvent('category_filter', { category });
  },

  languageToggle: (lang) => {
    return logEvent('language_toggle', { lang });
  }
};

// Ensure clean slate: Purges any residual simulated/seed data from previous versions
export function ensureSeedData() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('mintmax_seed_initialized_v2');
    localStorage.removeItem('mintmax_seed_initialized_v3');
    localStorage.removeItem('mintmax_seed_initialized_v4');
    localStorage.removeItem('mintmax_seed_initialized_v5');
    localStorage.removeItem('mintmax_seed_initialized_v6');
    localStorage.removeItem('mintmax_seed_initialized_v7');
    localStorage.removeItem('mintmax_seed_initialized_v8');
    localStorage.removeItem('mintmax_live_only');

    // Purge any simulated events from storage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const realOnly = list.filter((e) => e && e.id && !e.id.startsWith('seed_'));
      if (realOnly.length !== list.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
      }
    }
  } catch (err) {
    console.warn('Analytics cleanup error:', err);
  }
}

// Clear all recorded analytics
export function clearAllAnalytics() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('mintmax_event_logged', { detail: { type: 'cache_reset' } }));
}
