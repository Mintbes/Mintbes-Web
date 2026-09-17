import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Pause, Volume2, VolumeX, Copy, Check, Terminal, ShieldCheck, Film, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();
  const [showPromptOverlay, setShowPromptOverlay] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef(null);

  const samplePrompt = t('hero.samplePromptText');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.defaultMuted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isMuted]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
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

        {/* 9:16 Video Showcase Centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl mx-auto mb-10 flex justify-center relative"
        >
          {/* Center Card: Interactive 9:16 Video Player */}
          <div className="w-[84vw] max-w-[320px] sm:w-80 lg:w-[350px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-[#00AEE9]/50 shadow-[0_0_50px_rgba(0,174,233,0.35)] bg-[#0B0F17] relative z-20 group cursor-pointer select-none">
            <video
              ref={videoRef}
              src="videosAI/compressed/walking.mp4"
              poster="hero-bq.jpg"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onClick={togglePlay}
              className="w-full h-full object-cover"
            />

            {/* Video Overlay Gradient */}
            <div 
              onClick={togglePlay}
              className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-black/30" 
            />

            {/* Center Play Icon when Paused */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              >
                <div className="w-14 h-14 rounded-full bg-black/70 backdrop-blur-md border border-[#00AEE9]/50 flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-200">
                  <Play className="w-6 h-6 text-[#69FABD] ml-0.5" />
                </div>
              </div>
            )}

            {/* Top Bar on Video */}
            <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between z-10 pointer-events-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-[#00AEE9] animate-pulse" />
                <span>Harmony AI Video</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#69FABD] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? "Pausar video" : "Reproducir video"}
                  aria-label="Toggle Play/Pause"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAudio();
                  }}
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#69FABD] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isMuted ? t('showcase.playAudio') : t('showcase.muteAudio')}
                  aria-label="Toggle Foley Audio"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#69FABD]" />}
                </button>
              </div>
            </div>

            {/* Bottom Card Controls & Prompt Reveal Toggle */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-10 space-y-2 pointer-events-auto">
              <div className="flex items-center justify-between text-left bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/15">
                <div>
                  <h3 className="text-xs font-bold text-white">Walking in Harmony</h3>
                  <p className="text-[10px] text-slate-300 font-mono">15s Native 9:16 UHD</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPromptOverlay(!showPromptOverlay);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-[#00AEE9]/30 border border-white/25 text-[11px] font-semibold text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Terminal className="w-3 h-3 text-[#69FABD]" />
                  <span>{showPromptOverlay ? t('hero.promptToggleHide') : t('hero.promptToggleShow')}</span>
                </button>
              </div>
            </div>

            {/* Master Prompt Modal / Overlay on Card */}
            <AnimatePresence>
              {showPromptOverlay && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-[#070A0F]/92 backdrop-blur-xl p-5 z-30 flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#69FABD]">
                        <Terminal className="w-3.5 h-3.5 text-[#00AEE9]" />
                        <span>{t('hero.samplePromptTag')}</span>
                      </div>
                      <button
                        onClick={() => setShowPromptOverlay(false)}
                        className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/10"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-200 font-mono bg-black/50 p-3 rounded-xl border border-white/10 max-h-56 overflow-y-auto">
                      <p className="text-[#00AEE9] mb-1 font-bold">[Temporal Timeline: 0-15s]</p>
                      <p className="mb-2">{samplePrompt}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <button
                      onClick={handleCopy}
                      className="w-full py-2 px-3 rounded-xl bg-[#00AEE9]/20 hover:bg-[#00AEE9]/30 border border-[#00AEE9]/40 text-xs font-bold text-[#69FABD] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? t('showcase.promptCopied') : t('showcase.copyPrompt')}</span>
                    </button>

                    <a
                      href="#prompt-vault"
                      onClick={() => setShowPromptOverlay(false)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#00AEE9] to-[#69FABD] text-xs font-bold text-[#070A0F] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('hero.secondaryCta')}</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
