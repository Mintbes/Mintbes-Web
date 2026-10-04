import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Play, Pause, Volume2, VolumeX, Maximize2, Film, X, Type, Loader2, Youtube, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SHOWCASE_ITEMS, findVideoByIdOrAlias, getInitialVideoFromUrl } from '../data/showcaseItems';

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

const VideoCard = ({ item, onInspect, onCopyPrompt, copiedId, isPlaying, onTogglePlay }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);

  // Handle playback state sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isPlaying && !video.paused) {
      video.pause();
      setIsBuffering(false);
    } else if (isPlaying && video.paused) {
      video.muted = isMuted;
      video.playsInline = true;
      video.play().catch(() => {});
    }
  }, [isPlaying, isMuted]);

  // Auto-pause if scrolled far out of view (350px margin)
  useEffect(() => {
    if (!isPlaying) return;
    const card = cardRef.current;
    if (!card) return;

    let initialCheckDone = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!initialCheckDone) {
            initialCheckDone = true;
            return;
          }
          if (!entry.isIntersecting) {
            setIsBuffering(false);
            onTogglePlay(null);
          }
        });
      },
      { threshold: 0, rootMargin: '350px 0px 350px 0px' }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [isPlaying, onTogglePlay]);

  // Watchdog recovery: if video is playing but stalled/buffered without time progression
  useEffect(() => {
    if (!isPlaying) return;
    const video = videoRef.current;
    if (!video) return;

    let lastTime = video.currentTime;
    const interval = setInterval(() => {
      if (!isPlaying) return;
      if (video.paused || (video.currentTime === lastTime && !video.ended)) {
        // Nudge playback if stalled
        video.play().catch(() => {});
      }
      lastTime = video.currentTime;
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsBuffering(false);
      onTogglePlay(null);
    } else {
      setIsBuffering(false);
      video.muted = isMuted;
      video.defaultMuted = true;
      video.playsInline = true;

      // Play synchronously within user gesture for instant response on desktop & mobile
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay policy fallback:", err);
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
      onTogglePlay(item.id);
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    const nextMuted = !isMuted;
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    setIsMuted(nextMuted);
  };

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col aspect-[9/16] rounded-3xl overflow-hidden bg-[#0B0F17] border border-white/10 hover:border-[#00AEE9]/50 shadow-xl hover:shadow-[0_0_30px_rgba(0,174,233,0.25)] transition-all duration-500 cursor-pointer w-full max-w-[320px] sm:max-w-none mx-auto select-none"
      style={{
        transform: 'translateZ(0)',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        isolation: 'isolate'
      }}
    >
      {/* Video Media Layer */}
      <video
        ref={videoRef}
        src={resolveMediaUrl(item.src)}
        poster={resolveMediaUrl(item.poster)}
        loop
        muted={isMuted}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        preload={isPlaying ? "auto" : "none"}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onTimeUpdate={() => {
          if (isBuffering) setIsBuffering(false);
        }}
        onClick={togglePlay}
        className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-700 pointer-events-auto"
      />

      {/* Gradient Overlays */}
      <div 
        onClick={togglePlay}
        className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-black/40 pointer-events-auto" 
      />

      {/* Top Badges & Controls */}
      <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between z-10 pointer-events-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#69FABD]">
          {isBuffering ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin text-[#69FABD]" />
          ) : (
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#69FABD] animate-ping' : 'bg-[#00AEE9]'}`} />
          )}
          <span>{item.duration}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#69FABD] active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
            title={isPlaying ? "Pausar video" : "Reproducir video"}
          >
            {isBuffering ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#69FABD]" />
            ) : isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-[#69FABD]" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#69FABD] active:scale-95 transition-all cursor-pointer"
            aria-label="Mute/Unmute"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#69FABD]" />}
          </button>
        </div>
      </div>

      {/* Bottom Info & Quick Actions */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-10 space-y-2 pointer-events-auto">
        {/* Title */}
        <div 
          onClick={() => onInspect(item)}
          className="text-left cursor-pointer"
        >
          <h3 className="text-sm font-bold text-white group-hover:text-[#69FABD] transition-colors line-clamp-1">
            {item.title}
          </h3>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyPrompt(item.id, item.prompt);
            }}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-[#00AEE9]/30 border border-white/20 text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Copiar prompt"
          >
            {copiedId === item.id ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-300" />
                <span>Prompt</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspect(item);
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-[#00AEE9]/30 border border-white/20 text-slate-200 hover:text-white transition-all cursor-pointer"
            title="Inspeccionar Desglose"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};


const VideoShowcase = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(getInitialVideoFromUrl);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const openModal = useCallback((item) => {
    setPlayingVideoId(null);
    setSelectedItem(item);
    setCopiedLink(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('video', item.id);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Fallback
    }
  }, []);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
    setCopiedLink(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('video');
      url.searchParams.delete('v');
      let cleanPath = url.pathname;
      if (cleanPath.startsWith('/v/') || cleanPath.startsWith('/video/')) {
        cleanPath = '/';
      }
      const targetUrl = (cleanPath === '/' ? '' : cleanPath) + (url.hash && !url.hash.includes('video=') ? url.hash : '/#showcase');
      window.history.replaceState({}, '', targetUrl || '/');
    } catch {
      // Fallback
    }
  }, []);

  // Synchronize with URL changes (back / forward or external hash/query changes)
  useEffect(() => {
    const syncFromUrl = () => {
      const item = getInitialVideoFromUrl();
      if (item) {
        setSelectedItem(item);
      }
    };

    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);

    // Initial scroll check: if opened via permalink, ensure showcase section is in view when modal closes
    const initialItem = getInitialVideoFromUrl();
    if (initialItem) {
      setSelectedItem(initialItem);
      const el = document.getElementById('showcase');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }

    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, []);

  // Prevent background scroll while modal lightbox is active
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  const handleShareVideo = async () => {
    if (!selectedItem) return;
    const origin = (typeof window !== 'undefined' && window.location.origin && window.location.origin.includes('mintbes.country'))
      ? window.location.origin
      : 'https://mintbes.country';
    const shareUrl = `${origin}/v/${selectedItem.id}`;
    const shareData = {
      title: `${selectedItem.title} — Mintbes 🌿`,
      text: `${selectedItem.title} (9:16 AI Cinema) — mintbes.country`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const categories = [
    { id: 'all', label: t('showcase.filterAll') },
    { id: 'photorealism', label: t('showcase.filterPhotorealism') },
    { id: 'scifi', label: t('showcase.filterScifi') },
    { id: 'fashion', label: t('showcase.filterFashion') },
    { id: 'motion', label: t('showcase.filterMotion') },
    { id: 'macro', label: t('showcase.filterMacro') },
  ].filter(cat => cat.id === 'all' || SHOWCASE_ITEMS.some(item => item.category.includes(cat.id)));

  const filteredItems = activeTab === 'all'
    ? SHOWCASE_ITEMS
    : SHOWCASE_ITEMS.filter((item) => item.category.includes(activeTab));

  const handleCopyPrompt = (id, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTogglePlay = useCallback((id) => {
    setPlayingVideoId(id);
  }, []);

  return (
    <section id="showcase" className="relative w-full pt-20 sm:pt-24 pb-20 sm:pb-24 bg-[#070A0F] text-white overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AEE9]/5 rounded-full blur-[160px] pointer-events-none max-w-full" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#69FABD]/5 rounded-full blur-[140px] pointer-events-none max-w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B0F17] border border-[#00AEE9]/30 text-xs font-mono text-[#69FABD] mb-4">
            <Film className="w-3.5 h-3.5 text-[#00AEE9]" />
            <span>{t('showcase.badge')}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display mb-4">
            {t('showcase.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEE9] to-[#69FABD]">
              {t('showcase.titleHighlight')}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
            {t('showcase.subtitle')}
          </p>

          <div className="flex items-center justify-center">
            <a
              href="https://www.youtube.com/@mintbes6411/shorts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 hover:border-red-500/60 text-xs sm:text-sm font-semibold text-white transition-all shadow-sm group"
              title="Canal YouTube Shorts"
            >
              <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <span>{t('showcase.youtubeChannel')}</span>
            </a>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setPlayingVideoId(null);
              }}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-gradient-to-r from-[#00AEE9] to-[#69FABD] text-[#070A0F] shadow-lg shadow-[#00AEE9]/20 scale-105'
                  : 'bg-[#0B0F17]/80 text-slate-300 border border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 9:16 Bento Grid - Curated Native Videos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 max-w-7xl mx-auto mb-0">
          {filteredItems.map((item) => (
            <VideoCard
              key={item.id}
              item={item}
              isPlaying={playingVideoId === item.id}
              onTogglePlay={handleTogglePlay}
              onInspect={openModal}
              onCopyPrompt={handleCopyPrompt}
              copiedId={copiedId}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Prompt Breakdown mounted into document.body */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedItem && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl"
              onClick={closeModal}
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0B0F17] border border-[#00AEE9]/30 rounded-3xl p-4 sm:p-8 shadow-2xl text-left"
            >
              {/* Top Controls: Share & Close */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 z-10">
                <button
                  onClick={handleShareVideo}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
                  }`}
                  title={copiedLink ? t('showcase.videoLinkCopied') : t('showcase.shareVideo')}
                  aria-label="Share video link"
                >
                  {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5 text-[#00AEE9]" />}
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 pt-4 sm:pt-0">
                {/* Visual Left Preview (9:16) */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[220px] sm:max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative bg-black">
                    <video
                      src={resolveMediaUrl(selectedItem.src)}
                      poster={resolveMediaUrl(selectedItem.poster)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      preload="auto"
                      className="w-full h-full object-contain bg-black"
                    />
                  </div>
                </div>

                {/* Prompt Details Right */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00AEE9]/15 text-[#69FABD] border border-[#00AEE9]/30 text-xs font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[#00AEE9]" />
                        <span>{selectedItem.engine} • {selectedItem.duration}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 border border-[#00AEE9]/30 text-xs font-mono">
                        <Type className="w-3.5 h-3.5 text-[#00AEE9]" />
                        <span>{selectedItem.workflow || 'Text-to-Video'}</span>
                      </div>
                      {selectedItem.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-xs font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
                      {selectedItem.title}
                    </h3>

                    {/* Master Prompt Full Box */}
                    <div className="bg-black/60 border border-white/10 rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-[#00AEE9] font-bold uppercase tracking-wider">
                          Full Master Prompt
                        </span>
                        <button
                          onClick={() => handleCopyPrompt(selectedItem.id, selectedItem.prompt)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#00AEE9]/30 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedId === selectedItem.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-300" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed select-all">
                        {selectedItem.prompt}
                      </p>
                    </div>

                    {/* Temporal Breakdown Accordion / Pills */}
                    {selectedItem.breakdown && (
                      <div className="space-y-2.5 text-xs font-sans">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="font-mono text-[#69FABD] font-bold block mb-1">
                            {selectedItem.duration === '45s' ? '⏱ 0–15s Establishing:' : selectedItem.duration === '30s' ? '⏱ 0–10s Establishing:' : '⏱ 0–5s Establishing:'}
                          </span>
                          <span className="text-slate-300">{selectedItem.breakdown.timing05}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="font-mono text-[#00AEE9] font-bold block mb-1">
                            {selectedItem.duration === '45s' ? '⚡ 15–30s Dynamic Motion:' : selectedItem.duration === '30s' ? '⚡ 10–20s Dynamic Motion:' : '⚡ 5–10s Dynamic Motion:'}
                          </span>
                          <span className="text-slate-300">{selectedItem.breakdown.timing510}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="font-mono text-purple-400 font-bold block mb-1">
                            {selectedItem.duration === '45s' ? '✨ 30–45s Climax & Texture:' : selectedItem.duration === '30s' ? '✨ 20–30s Climax & Texture:' : '✨ 10–15s Climax & Texture:'}
                          </span>
                          <span className="text-slate-300">{selectedItem.breakdown.timing1015}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="font-mono text-amber-300 font-bold block mb-1">
                            🔊 Sound (Integrated Foley):
                          </span>
                          <span className="text-slate-300">{selectedItem.breakdown.sound}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <a
                      href="#prompt-vault"
                      onClick={closeModal}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-[#070A0F] bg-gradient-to-r from-[#00AEE9] to-[#69FABD] shadow-lg shadow-[#00AEE9]/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t('showcase.ctaCardBtn')}</span>
                    </a>

                    <button
                      onClick={handleShareVideo}
                      className={`inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        copiedLink
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                          : 'text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30'
                      }`}
                      title={t('showcase.shareVideo')}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{t('showcase.videoLinkCopied')}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-[#00AEE9]" />
                          <span>{t('showcase.shareVideo')}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={selectedItem.youtubeUrl || "https://www.youtube.com/@mintbes6411/shorts"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 hover:border-red-500/70 transition-all cursor-pointer group"
                      title="Ver en YouTube Shorts"
                    >
                      <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                      <span>{t('showcase.watchOnYoutube')}</span>
                    </a>

                    <button
                      onClick={closeModal}
                      className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                    >
                      {t('showcase.closeModal')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </section>
  );
};

export default VideoShowcase;
