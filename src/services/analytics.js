// MintMax Web Analytics & Traffic Intelligence Engine
// Tracks real visits, video interactions, prompt copies, referrers, and audience telemetry.

const STORAGE_KEY = 'mintmax_analytics_events';
const SESSION_KEY = 'mintmax_session_id';
const SEED_KEY = 'mintmax_seed_initialized_v8';

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

// Write event to storage
export function logEvent(eventType, eventData = {}) {
  if (typeof window === 'undefined') return null;
  try {
    const env = detectDevice();
    const source = getTrafficSource();
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
      data: eventData
    };

    const events = getStoredEvents();
    // Newest event at the front
    events.unshift(event);

    // Keep max 2500 events locally to maintain fast load times
    if (events.length > 2500) {
      events.length = 2500;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

    // Notify listeners in dashboard
    window.dispatchEvent(new CustomEvent('mintmax_event_logged', { detail: event }));
    return event;
  } catch (err) {
    console.warn('MintMax Analytics log error:', err);
    return null;
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
