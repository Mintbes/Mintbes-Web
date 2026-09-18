import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Film, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HERO_VIDEOS = [
  {
    id: 'walking-in-harmony',
    src: 'videosAI/compressed/walking.mp4',
    poster: 'videosAI/walking_poster.jpg'
  },
  {
    id: 'sylvan-elven-archer',
    src: 'videosAI/compressed/obkqvw1fhq.mp4',
    poster: 'videosAI/obkqvw1fhq_poster.jpg'
  }
];

const HeroVideoCard = ({ video, isHeroInView }) => {
  const videoRef = useRef(null);

  // Auto-play immediately on mount and handle pause/resume when scrolled in/out of view
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;
    vid.defaultMuted = true;
    vid.playsInline = true;

    if (isHeroInView) {
      const p = vid.play();
      if (p !== undefined) {
        p.catch(() => {
          vid.muted = true;
          vid.play().catch(() => {});
        });
      }
    } else {
      vid.pause();
    }
  }, [isHeroInView]);

  // Watchdog recovery: ensures continuous smooth playback without stalls
  useEffect(() => {
    if (!isHeroInView) return;
    const vid = videoRef.current;
    if (!vid) return;

    let lastTime = vid.currentTime;
    const interval = setInterval(() => {
      if (!isHeroInView) return;
      if (vid.paused || (vid.currentTime === lastTime && !vid.ended)) {
        vid.muted = true;
        vid.play().catch(() => {});
      }
      lastTime = vid.currentTime;
    }, 2000);

    return () => clearInterval(interval);
  }, [isHeroInView]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      vid.muted = true;
      vid.playsInline = true;
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  };

  return (
    <div
      onClick={togglePlay}
      className="w-[84vw] max-w-[280px] sm:w-[270px] lg:w-[310px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-[#00AEE9]/40 hover:border-[#69FABD]/60 shadow-[0_0_40px_rgba(0,174,233,0.25)] hover:shadow-[0_0_50px_rgba(105,250,189,0.3)] bg-[#0B0F17] relative z-20 group select-none transition-all duration-500 cursor-pointer"
      style={{
        transform: 'translateZ(0)',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        isolation: 'isolate'
      }}
    >
      <video
        ref={videoRef}
        src={video.src}
        poster={video.poster}
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        preload="auto"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    </div>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const [isHeroInView, setIsHeroInView] = useState(true);
  const heroRef = useRef(null);

  // Auto-pause Hero videos when scrolled out of view to release hardware decoders for mobile
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const tickerItems = t('hero.ticker', { returnObjects: true }) || [
    "Harmony AI Video Engine",
    "Native 9:16 Vertical Video",
    "15s Hyper-Realistic Motion",
    "Integrated Foley Soundscape",
    "Temporal Cinematography Control",
    "Backed by Harmony Ecosystem",
    "Official Governor Mintbes"
  ];

  return (
    <section ref={heroRef} className="relative w-full min-h-screen pt-28 pb-12 flex flex-col justify-between overflow-hidden bg-[#070A0F]">
      {/* Background Ambience & Radial Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00AEE9]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#69FABD]/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#151D2C_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col items-center justify-center text-center">
        
        {/* Top Official Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#0B0F17]/90 border border-[#00AEE9]/30 text-xs sm:text-sm font-medium text-slate-200 backdrop-blur-md shadow-lg shadow-[#00AEE9]/10 mb-6 max-w-full text-center"
        >
          <span className="w-2 h-2 rounded-full bg-[#69FABD] animate-pulse shrink-0" />
          <ShieldCheck className="w-4 h-4 text-[#00AEE9] shrink-0" />
          <span className="truncate sm:overflow-visible">{t('hero.badge')}</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.15] mb-6 font-display break-words"
        >
          {t('hero.titlePrefix')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEE9] via-[#69FABD] to-[#00AEE9] animate-gradient">
            {t('hero.titleHighlight')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl leading-relaxed mb-8 font-light"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Dual Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto"
        >
          <a
            href="#showcase"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-bold text-[#070A0F] bg-gradient-to-r from-[#00AEE9] to-[#69FABD] shadow-xl shadow-[#00AEE9]/25 hover:shadow-[#00AEE9]/45 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          >
            <Film className="w-5 h-5 text-[#070A0F]" />
            <span>{t('hero.primaryCta')}</span>
            <ArrowRight className="w-5 h-5 text-[#070A0F]" />
          </a>

          <a
            href="#prompt-vault"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-base font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/15 backdrop-blur-md hover:border-white/30 transition-all duration-300"
          >
            <Terminal className="w-4 h-4 text-[#69FABD]" />
            <span>{t('hero.secondaryCta')}</span>
          </a>
        </motion.div>

        {/* 9:16 Video Showcase Centerpiece - Dual Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 relative"
        >
          {HERO_VIDEOS.map((video) => (
            <HeroVideoCard
              key={video.id}
              video={video}
              isHeroInView={isHeroInView}
            />
          ))}
        </motion.div>

      </div>

      {/* Infinite Marquee Ribbon */}
      <div className="relative w-full overflow-hidden py-3 bg-[#0B0F17]/80 border-y border-white/10 backdrop-blur-md mt-6">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-mono tracking-wider text-slate-300">
              <span className="text-[#00AEE9]">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
