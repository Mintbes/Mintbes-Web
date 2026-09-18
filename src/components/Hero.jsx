import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Pause, Volume2, VolumeX, Copy, Check, Terminal, ShieldCheck, Film, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HERO_VIDEOS = [
  {
    id: 'walking-in-harmony',
    title: 'Walking in Harmony',
    subtitle: '15s Native 9:16 UHD',
    src: 'videosAI/compressed/walking.mp4',
    poster: 'videosAI/walking_poster.jpg',
    prompt: '0-5s: Medium-full vertical shot of an enigmatic figure walking calmly down a rainy neon-lit street in Neo-Kyoto. 5-10s: Slow gimbal dolly back as puddles reflect prismatic cyan and emerald holographic billboards. 10-15s: Subtle head turn toward camera, soft natural lens flare, Kodak Vision3 color grading, photorealistic micro-textures on damp jacket. Sound: rhythmic footsteps on wet asphalt, distant muffled synth drone, gentle rain patter on nylon jacket.'
  },
  {
    id: 'sylvan-elven-archer',
    title: 'Sylvan Elven Archer',
    subtitle: '15s Native 9:16 UHD',
    src: 'videosAI/compressed/obkqvw1fhq.mp4',
    poster: 'videosAI/obkqvw1fhq_poster.jpg',
    prompt: '0-5s: Extreme cinematic close-up of a silver-haired elven archer with sharp piercing green eyes, drawing a recurve bow in an enchanted sun-dappled forest. 5-10s: Micro-focus on her fingers gripping the bowstring and arrow nock, tension building with photorealistic skin micro-textures, freckles, and soft wind rustling fine white hair strands. 10-15s: Smooth release of the arrow, subtle camera recoil, intense focused stare, shallow depth of field with soft bokeh background. Sound: creaking bowstring wood tension, soft forest breeze, sharp whoosh on arrow release, distant bird call.'
  }
];

const HeroVideoCard = ({ video, activePromptId, setActivePromptId, copiedId, onCopy, t }) => {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const wasPlayingRef = useRef(true);

  // Auto-pause when scrolled out of view to release hardware decoders for Showcase on mobile
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const vid = videoRef.current;
        if (!vid) return;

        if (!entry.isIntersecting) {
          if (!vid.paused) {
            wasPlayingRef.current = true;
            vid.pause();
            setIsPlaying(false);
          }
        } else {
          if (wasPlayingRef.current) {
            vid.muted = true;
            vid.playsInline = true;
            const p = vid.play();
            if (p !== undefined) {
              p.then(() => setIsPlaying(true)).catch(() => {});
            }
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const togglePlay = (e) => {
    e?.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (isPlaying) {
      wasPlayingRef.current = false;
      vid.pause();
      setIsPlaying(false);
    } else {
      wasPlayingRef.current = true;
      vid.muted = isMuted;
      vid.defaultMuted = true;
      vid.playsInline = true;
      const p = vid.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch((err) => {
          console.warn("Hero video play error:", err);
          vid.muted = true;
          setIsMuted(true);
          vid.play().then(() => setIsPlaying(true)).catch(() => {});
        });
      }
    }
  };

  const toggleAudio = (e) => {
    e?.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    const nextMuted = !isMuted;
    vid.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const isPromptOpen = activePromptId === video.id;

  return (
    <div
      ref={cardRef}
      className="w-[84vw] max-w-[280px] sm:w-[270px] lg:w-[310px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-[#00AEE9]/40 hover:border-[#69FABD]/60 shadow-[0_0_40px_rgba(0,174,233,0.25)] hover:shadow-[0_0_50px_rgba(105,250,189,0.3)] bg-[#0B0F17] relative z-20 group select-none transition-all duration-500"
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
        muted={isMuted}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        preload="metadata"
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Video Overlay Gradient */}
      <div 
        onClick={togglePlay}
        className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-black/30 cursor-pointer pointer-events-auto" 
      />

      {/* Top Bar on Video */}
      <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between z-10 pointer-events-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-semibold text-white">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#69FABD] animate-ping' : 'bg-[#00AEE9]'}`} />
          <span>Harmony AI Video</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#69FABD] active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? "Pausar video" : "Reproducir video"}
            aria-label="Toggle Play/Pause"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#69FABD]" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <button
            onClick={toggleAudio}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#69FABD] active:scale-95 transition-all cursor-pointer"
            title={isMuted ? t('showcase.playAudio') : t('showcase.muteAudio')}
            aria-label="Toggle Foley Audio"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#69FABD]" />}
          </button>
        </div>
      </div>

      {/* Bottom Card Controls & Prompt Reveal Toggle */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-10 space-y-2 pointer-events-auto">
        <div className="flex items-center justify-between text-left bg-black/65 backdrop-blur-md p-2.5 rounded-2xl border border-white/15">
          <div className="pr-2 truncate">
            <h3 className="text-xs font-bold text-white truncate">{video.title}</h3>
            <p className="text-[10px] text-slate-300 font-mono">{video.subtitle}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActivePromptId(isPromptOpen ? null : video.id);
            }}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-[#00AEE9]/30 border border-white/25 text-[11px] font-semibold text-white transition-all flex items-center gap-1 cursor-pointer"
          >
            <Terminal className="w-3 h-3 text-[#69FABD]" />
            <span>{isPromptOpen ? t('hero.promptToggleHide') : t('hero.promptToggleShow')}</span>
          </button>
        </div>
      </div>

      {/* Master Prompt Modal / Overlay on Card */}
      <AnimatePresence>
        {isPromptOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-[#070A0F]/95 backdrop-blur-xl p-4 sm:p-5 z-30 flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#69FABD]">
                  <Terminal className="w-3.5 h-3.5 text-[#00AEE9]" />
                  <span>{t('hero.samplePromptTag')}</span>
                </div>
                <button
                  onClick={() => setActivePromptId(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/10 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-[11px] leading-relaxed text-slate-200 font-mono bg-black/50 p-3 rounded-xl border border-white/10 max-h-52 overflow-y-auto">
                <p className="text-[#00AEE9] mb-1 font-bold">[Timeline: 0-15s UHD]</p>
                <p className="mb-2 select-all">{video.prompt}</p>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10">
              <button
                onClick={() => onCopy(video.id, video.prompt)}
                className="w-full py-2 px-3 rounded-xl bg-[#00AEE9]/20 hover:bg-[#00AEE9]/30 border border-[#00AEE9]/40 text-xs font-bold text-[#69FABD] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedId === video.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('showcase.promptCopied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('showcase.copyPrompt')}</span>
                  </>
                )}
              </button>

              <a
                href="#prompt-vault"
                onClick={() => setActivePromptId(null)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#00AEE9] to-[#69FABD] text-xs font-bold text-[#070A0F] flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('hero.secondaryCta')}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const [activePromptId, setActivePromptId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

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
    <section className="relative w-full min-h-screen pt-28 pb-12 flex flex-col justify-between overflow-hidden bg-[#070A0F]">
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
              activePromptId={activePromptId}
              setActivePromptId={setActivePromptId}
              copiedId={copiedId}
              onCopy={handleCopy}
              t={t}
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
