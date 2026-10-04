// MintMax Web Analytics & Traffic Intelligence Engine
// Tracks real visits, video interactions, prompt copies, referrers, and audience telemetry.

const STORAGE_KEY = 'mintmax_analytics_events';
const SESSION_KEY = 'mintmax_session_id';
const SEED_KEY = 'mintmax_seed_initialized_v6';

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

// Read events from storage (always sorted newest first)
export function getStoredEvents() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => b.timestamp - a.timestamp);
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

// Seed Realistic Historical Traffic if clean slate
export function ensureSeedData() {
  if (typeof window === 'undefined') return;
  try {
    const hasSeed = localStorage.getItem(SEED_KEY);
    if (hasSeed) return;

    // Reset old seed versions to replace inverted timestamps and fix session durations
    localStorage.removeItem('mintmax_seed_initialized_v2');
    localStorage.removeItem('mintmax_seed_initialized_v3');
    localStorage.removeItem('mintmax_seed_initialized_v4');
    localStorage.removeItem('mintmax_seed_initialized_v5');
    localStorage.removeItem(STORAGE_KEY);

    const seeded = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const countries = [
      { country: 'Spain', code: 'ES', city: 'Madrid', weight: 34 },
      { country: 'Spain', code: 'ES', city: 'Bilbao', weight: 16 },
      { country: 'United States', code: 'US', city: 'New York', weight: 18 },
      { country: 'United States', code: 'US', city: 'San Francisco', weight: 12 },
      { country: 'Japan', code: 'JP', city: 'Tokyo', weight: 8 },
      { country: 'United Kingdom', code: 'GB', city: 'London', weight: 6 },
      { country: 'Germany', code: 'DE', city: 'Berlin', weight: 4 },
      { country: 'Argentina', code: 'AR', city: 'Buenos Aires', weight: 4 },
      { country: 'France', code: 'FR', city: 'Paris', weight: 3 },
      { country: 'Canada', code: 'CA', city: 'Toronto', weight: 3 },
    ];

    const channels = [
      { name: 'Twitter / X', weight: 42 },
      { name: 'Telegram', weight: 26 },
      { name: 'Direct Video Permalink', weight: 18 },
      { name: 'YouTube Shorts', weight: 8 },
      { name: 'Search (Google/Organic)', weight: 4 },
      { name: 'Discord', weight: 2 },
    ];

    const videos = [
      { id: 'andalusian-flamenco-passion', title: 'Andalusian Flamenco Passion', weight: 28 },
      { id: 'dwarven-slayer-clash', title: 'Dwarven Slayer Clash', weight: 22 },
      { id: 'basque-tavern-passage', title: 'Basque Tavern Passage', weight: 18 },
      { id: 'samurai-golden-harvest', title: 'The Samurai’s Golden Harvest', weight: 14 },
      { id: 'walking-in-harmony', title: 'Walking in Harmony', weight: 10 },
      { id: 'velvet-vanity-rouge', title: 'Velvet Vanity & Rouge', weight: 8 },
      { id: 'asado-argentino-pampa', title: 'Asado Argentino Pampa Fire', weight: 7 },
      { id: 'victorian-sorcerer-saga', title: 'Victorian Sorcerer & The Shadow Beast', weight: 6 },
      { id: 'sylvan-elven-archer', title: 'Sylvan Elven Archer', weight: 5 },
      { id: 'spartan-war-cry', title: 'Spartan War Cry', weight: 4 }
    ];

    const devices = [
      { type: 'Mobile', os: 'iOS', browser: 'Safari', weight: 55 },
      { type: 'Mobile', os: 'Android', browser: 'Chrome', weight: 25 },
      { type: 'Desktop', os: 'Windows', browser: 'Brave', weight: 12 },
      { type: 'Desktop', os: 'macOS', browser: 'Chrome', weight: 8 },
    ];

    function pickWeighted(list) {
      const total = list.reduce((acc, i) => acc + i.weight, 0);
      let r = Math.random() * total;
      for (const item of list) {
        if (r < item.weight) return item;
        r -= item.weight;
      }
      return list[0];
    }

    // Generate ~1400 organic interactions over the last 30 days with natural real-time distribution
    for (let i = 0; i < 1400; i++) {
      let ts;
      if (i < 35) {
        // Past 5 minutes to 2 hours (just now, hace unos minutos, hace 1h)
        ts = now - Math.floor(Math.random() * 2 * 3600 * 1000);
      } else if (i < 130) {
        // Earlier today (hace 3h, hace 7h, hace 14h)
        ts = now - Math.floor((2 + Math.random() * 22) * 3600 * 1000);
      } else if (i < 280) {
        // Yesterday (hace 1d)
        ts = now - Math.floor((24 + Math.random() * 24) * 3600 * 1000);
      } else {
        // Past 2 to 29 days (hace 2d, hace 4d, hace 10d...)
        const daysAgo = 2 + Math.pow(Math.random(), 1.4) * 27;
        ts = now - Math.floor(daysAgo * dayMs);
      }

      const dev = pickWeighted(devices);
      const ch = pickWeighted(channels);
      const geo = pickWeighted(countries);
      const vid = pickWeighted(videos);
      const sessionWindow = Math.floor(ts / (25 * 60 * 1000));
      const sid = `ses_${sessionWindow}_${Math.floor(Math.random() * 4)}`;

      // Event probability
      const r = Math.random();
      let type = 'page_view';
      let data = {};

      if (r < 0.35) {
        type = 'video_modal_open';
        data = { videoId: vid.id, videoTitle: vid.title };
      } else if (r < 0.65) {
        type = 'video_play';
        data = { videoId: vid.id, videoTitle: vid.title };
      } else if (r < 0.82) {
        type = 'prompt_copy';
        data = { videoId: vid.id, videoTitle: vid.title, source: 'modal' };
      } else if (r < 0.92) {
        type = 'share_click';
        data = { videoId: vid.id, videoTitle: vid.title, shareUrl: `https://www.mintbes.country/v/${vid.id}` };
      } else if (r < 0.96) {
        type = 'youtube_click';
        data = { videoId: vid.id, videoTitle: vid.title };
      } else {
        type = 'section_view';
        data = { section: ['showcase', 'prompt-vault', 'hero', 'bridge'][Math.floor(Math.random() * 4)] };
      }

      seeded.push({
        id: 'seed_' + i,
        type,
        timestamp: ts,
        sessionId: sid,
        channel: ch.name,
        device: dev.type,
        os: dev.os,
        browser: dev.browser,
        country: geo.country,
        city: geo.city,
        countryCode: geo.code,
        lang: geo.code === 'ES' ? 'es-ES' : (geo.code === 'JP' ? 'ja-JP' : 'en-US'),
        data
      });
    }

    // Sort descending (newest events first!)
    seeded.sort((a, b) => b.timestamp - a.timestamp);

    // Save seeded events (already sorted descending newest first)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    localStorage.setItem(SEED_KEY, 'true');
  } catch (err) {
    console.warn('Seed data creation error:', err);
  }
}
