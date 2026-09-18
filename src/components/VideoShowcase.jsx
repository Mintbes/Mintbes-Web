import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Play, Pause, Volume2, VolumeX, Maximize2, Film, X, Type, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SHOWCASE_ITEMS = [
  {
    id: 'walking-in-harmony',
    title: 'Walking in Harmony',
    workflow: 'Text-to-Video',
    category: ['photorealism', 'fashion'],
    type: 'video',
    src: 'videosAI/compressed/walking.mp4',
    poster: 'videosAI/walking_poster.jpg',
    duration: '15s',
    engine: 'Harmony AI Video',
    tags: ['4K UHD', '9:16 Vertical', 'Foley Audio', 'Kodak 500T'],
    prompt: '0-5s: Medium-full vertical shot of an enigmatic figure walking calmly down a rainy neon-lit street in Neo-Kyoto. 5-10s: Slow gimbal dolly back as puddles reflect prismatic cyan and emerald holographic billboards. 10-15s: Subtle head turn toward camera, soft natural lens flare, Kodak Vision3 color grading, photorealistic micro-textures on damp jacket. Sound: rhythmic footsteps on wet asphalt, distant muffled synth drone, gentle rain patter.',
    breakdown: {
      timing05: 'Medium-full vertical shot of an enigmatic figure walking calmly down a rainy neon-lit street in Neo-Kyoto.',
      timing510: 'Slow gimbal dolly back as puddles reflect prismatic cyan and emerald holographic billboards.',
      timing1015: 'Subtle head turn toward camera, soft natural lens flare, Kodak Vision3 color grading, photorealistic micro-textures on damp jacket.',
      cinematography: 'Cooke Anamorphic 35mm T2.3, Kodak Vision3 500T, Arri Alexa 65 sensor, volumetric wet street reflections.',
      sound: 'Rhythmic footsteps on wet asphalt, distant muffled synth drone, gentle rain patter on nylon jacket.'
    }
  },
  {
    id: 'mediterranean-golden-hour',
    title: 'Mediterranean Golden Hour',
    category: ['photorealism', 'fashion'],
    type: 'video',
    src: 'videosAI/compressed/0rxo1dkv2g.mp4',
    poster: 'videosAI/0rxo1dkv2g_poster.jpg',
    duration: '30s',
    engine: 'Harmony AI Video',
    tags: ['4K UHD', '9:16 Vertical', 'Natural Light', 'Foley Audio'],
    prompt: '0-10s: Handheld iPhone-style vertical POV looking directly at a charming woman walking backward across a historic sun-drenched cobblestone square. 10-20s: Warm Mediterranean golden-hour sun creates soft hair rim-lighting as seaside cafes and passersby pass in the background. 20-30s: Natural radiant smile, spontaneous micro-gestures, lively eyes, authentic lifelike skin tone and gentle handheld stabilization. Sound: ambient coastal chatter, distant laughter, gentle sea breeze, outdoor footsteps on stone.',
    breakdown: {
      timing05: 'Handheld iPhone-style vertical POV looking directly at a charming woman walking backward across a historic sun-drenched cobblestone square.',
      timing510: 'Warm Mediterranean golden-hour sun creates soft hair rim-lighting as seaside cafes and passersby pass in the background.',
      timing1015: 'Natural radiant smile, spontaneous micro-gestures, lively eyes, authentic lifelike skin tone and gentle handheld stabilization.',
      cinematography: '35mm T1.8 optical equivalent, natural golden-hour direct sunlight, soft highlight rolloff, smooth optical image stabilization.',
      sound: 'Ambient coastal chatter, distant laughter, gentle sea breeze, outdoor footsteps on stone.'
    },
    workflow: 'Text-to-Video'
  },
  {
    id: 'basque-tavern-passage',
    title: 'Basque Tavern Passage',
    workflow: 'Text-to-Video',
    category: ['photorealism', 'motion'],
    type: 'video',
    src: 'videosAI/compressed/caafdgckz.mp4',
    poster: 'videosAI/caafdgckz_poster.jpg',
    duration: '15s',
    engine: 'Harmony AI Video',
    tags: ['4K UHD', '9:16 Vertical', 'Atmospheric Interior', 'Smooth Tracking'],
    prompt: '0-5s: Over-the-shoulder smooth forward tracking shot following a man walking down a warm, cozy traditional tavern with exposed rustic dark wood ceiling beams. 5-10s: Ambient glowing vintage pendant lamps cast amber reflections, pintxo counter and beer tap on the left with fresh tapas under warm spotlights. 10-15s: Steady glide toward the bright exterior doorway, soft shallow depth of field, authentic hospitality warmth. Sound: ambient bar murmurs, muffled clinking glasses, gentle footsteps on hardwood floor.',
    breakdown: {
      timing05: 'Over-the-shoulder smooth forward tracking shot following a man walking down a warm, cozy traditional tavern with exposed rustic dark wood ceiling beams.',
      timing510: 'Ambient glowing vintage pendant lamps cast amber reflections, pintxo counter and beer tap on the left with fresh tapas under warm spotlights.',
      timing1015: 'Steady glide toward the bright exterior doorway, soft shallow depth of field, authentic hospitality warmth.',
      cinematography: '28mm prime lens, tungsten and amber warm interior lighting, soft background bokeh, 3-axis smooth gimbal tracking.',
      sound: 'Ambient bar murmurs, muffled clinking glasses, gentle footsteps on hardwood floor.'
    }
  },
  {
    id: 'sylvan-elven-archer',
    title: 'Sylvan Elven Archer',
    workflow: 'Text-to-Video',
    category: ['photorealism', 'motion', 'scifi'],
    type: 'video',
    src: 'videosAI/compressed/obkqvw1fhq.mp4',
    poster: 'videosAI/obkqvw1fhq_poster.jpg',
    duration: '15s',
    engine: 'Harmony AI Video',
    tags: ['4K UHD', '9:16 Vertical', 'Fantasy Cinema', 'Foley Audio'],
    prompt: '0-5s: Extreme cinematic close-up of a silver-haired elven archer with sharp piercing green eyes, drawing a recurve bow in an enchanted sun-dappled forest. 5-10s: Micro-focus on her fingers gripping the bowstring and arrow nock, tension building with photorealistic skin micro-textures, freckles, and soft wind rustling fine white hair strands. 10-15s: Smooth release of the arrow, subtle camera recoil, intense focused stare, shallow depth of field with soft bokeh background. Sound: creaking bowstring wood tension, soft forest breeze, sharp whoosh on arrow release, distant bird call.',
    breakdown: {
      timing05: 'Extreme cinematic close-up of a silver-haired elven archer with sharp piercing green eyes, drawing a recurve bow in an enchanted sun-dappled forest.',
      timing510: 'Micro-focus on her fingers gripping the bowstring and arrow nock, tension building with photorealistic skin micro-textures, freckles, and soft wind rustling fine white hair strands.',
      timing1015: 'Smooth release of the arrow, subtle camera recoil, intense focused stare, shallow depth of field with soft bokeh background.',
      cinematography: '85mm T1.5 portrait cine lens, natural volumetric forest backlight, creamy bokeh, Arri Alexa Mini LF sensor.',
      sound: 'Creaking bowstring wood tension, soft forest breeze, sharp whoosh on arrow release, distant bird call.'
    }
  },
  {
    id: 'astoturfer-live-concert',
    title: 'Astoturfer Live Concert',
    workflow: 'Text-to-Video',
    category: ['photorealism', 'motion'],
    type: 'video',
    src: 'videosAI/compressed/wybs4dhnzo.mp4',
    poster: 'videosAI/wybs4dhnzo_poster.jpg',
    duration: '15s',
    engine: 'Harmony AI Video',
    tags: ['4K UHD', '9:16 Vertical', 'Crowd Energy', 'Live Concert', 'Foley Audio'],
    prompt: '0-5s: Ultra-realistic handheld selfie video POV of an ecstatic fan shouting lyrics in the front row of a packed rock festival, holding a plastic beer cup high while wearing a black Astoturfer donkey cutoff shirt. 5-10s: Stage lights sweep overhead casting warm amber and smoky beams across the cheering crowd, fans chanting and raising beers together. 10-15s: He throws the iconic rock horns hand sign directly into the lens with euphoric energy, sweat glistening under stage strobes with photorealistic facial micro-expressions. Sound: thunderous live guitar riffs, heavy drum kicks, roaring festival crowd singing along, beer plastic cups rustle.',
    breakdown: {
      timing05: 'Ultra-realistic handheld selfie video POV of an ecstatic fan shouting lyrics in the front row of a packed rock festival, holding a plastic beer cup high while wearing a black Astoturfer donkey cutoff shirt.',
      timing510: 'Stage lights sweep overhead casting warm amber and smoky beams across the cheering crowd, fans chanting and raising beers together.',
      timing1015: 'He throws the iconic rock horns hand sign directly into the lens with euphoric energy, sweat glistening under stage strobes with photorealistic facial micro-expressions.',
      cinematography: 'Handheld smartphone POV 24mm equivalent, concert strobe lighting, dynamic stage spotlights, motion blur and authentic sweat micro-textures.',
      sound: 'Thunderous live guitar riffs, heavy drum kicks, roaring festival crowd singing along, beer plastic cups rustle.'
    }
  },
  {
    id: 'lantern-festival-elegance',
    title: 'Lantern Festival Elegance',
    workflow: 'Text-to-Video',
    category: ['photorealism', 'fashion'],
    type: 'video',
    src: 'videosAI/compressed/j3cxte1mze.mp4',
    poster: 'videosAI/j3cxte1mze_poster.jpg',
    duration: '15s',
    engine: 'Harmony AI Video',
    tags: ['4K UHD', '9:16 Vertical', 'Hanfu Silk', 'Lantern Festival', 'Volumetric Glow'],
    prompt: '0-5s: Medium portrait of a graceful young woman adorned in an ornate ivory and gold silk Hanfu, jade hairpin in her hair, standing beside a softly glowing traditional silk lantern at dusk. 5-10s: Gentle night breeze rustles delicate falling cherry blossom petals, luminous orbs float into the misty evening sky casting warm golden candle highlights on porcelain skin. 10-15s: Subtle glance upward with a serene radiant expression, rich silk fabric micro-textures, cinematic slow-motion floating lanterns bokeh. Sound: soft traditional guzheng resonance, gentle night wind whisper, distant festive chimes.',
    breakdown: {
      timing05: 'Medium portrait of a graceful young woman adorned in an ornate ivory and gold silk Hanfu, jade hairpin in her hair, standing beside a softly glowing traditional silk lantern at dusk.',
      timing510: 'Gentle night breeze rustles delicate falling cherry blossom petals, luminous orbs float into the misty evening sky casting warm golden candle highlights on porcelain skin.',
      timing1015: 'Subtle glance upward with a serene radiant expression, rich silk fabric micro-textures, cinematic slow-motion floating lanterns bokeh.',
      cinematography: '50mm T1.2 portrait prime, warm candlelight volumetric falloff, creamy circular bokeh, cinematic color grading with jade and amber tones.',
      sound: 'Soft traditional guzheng resonance, gentle night wind whisper, distant festive chimes.'
    }
  },
  {
    id: 'autumn-couture-creator',
    title: 'Autumn Couture Creator',
    workflow: 'Text-to-Video',
    category: ['photorealism', 'fashion', 'motion'],
    type: 'video',
    src: 'videosAI/compressed/b2pxmpxb03.mp4',
    poster: 'videosAI/b2pxmpxb03_poster.jpg',
    duration: '15s',
    engine: 'Harmony AI Video',
    tags: ['4K UHD', '9:16 Vertical', 'Digital Atelier', 'Autumn Mood', 'Foley Audio'],
    prompt: '0-5s: Medium profile shot of a stylish woman in a dark tailored charcoal coat and cream knit sweater smiling as she works on her laptop on a wet park bench under weeping willows. 5-10s: Smooth dynamic over-the-shoulder camera push focusing into her laptop display revealing a vibrant sculpted scarlet red haute couture silk gown rendered in digital 3D. 10-15s: Delicate hand adjusting touchpad controls, raindrops glistening on wood and asphalt, soft autumn park foliage depth of field. Sound: crisp keyboard typing clicks, soft park drizzle, gentle bird song, distant city hum.',
    breakdown: {
      timing05: 'Medium profile shot of a stylish woman in a dark tailored charcoal coat and cream knit sweater smiling as she works on her laptop on a wet park bench under weeping willows.',
      timing510: 'Smooth dynamic over-the-shoulder camera push focusing into her laptop display revealing a vibrant sculpted scarlet red haute couture silk gown rendered in digital 3D.',
      timing1015: 'Delicate hand adjusting touchpad controls, raindrops glistening on wood and asphalt, soft autumn park foliage depth of field.',
      cinematography: '35mm T2.0 cine lens, soft diffused overcast morning light, shallow depth of field, rain reflections and natural skin tones.',
      sound: 'Crisp keyboard typing clicks, soft park drizzle, gentle bird song, distant city hum.'
    }
  },
  {
    id: 'dwarven-slayer-clash',
    title: 'Dwarven Slayer Clash',
    workflow: 'Text-to-Video',
    category: ['photorealism', 'motion', 'scifi'],
    type: 'video',
    src: 'videosAI/compressed/xyejgwdceq.mp4',
    poster: 'videosAI/xyejgwdceq_poster.jpg',
    duration: '15s',
    engine: 'Harmony AI Video',
    tags: ['4K UHD', '9:16 Vertical', 'High Fantasy', 'Combat Choreography', 'Foley Audio'],
    prompt: '0-5s: Intense medium profile shot of a ferocious red-mohawked dwarven slayer locked in brutal close-quarters combat against two snarling goblins in an ancient underground stone vault. 5-10s: With thunderous force, his heavy iron battleaxe cleaves directly through an enemy wooden shield, sending splintering timber chunks and bright fiery embers into the air. 10-15s: Slow camera orbit capturing the dwarf\'s war cry, beaded braided beard, muscular tattooed arms strained under torchlight, sparks showering off stone pillars. Sound: heavy metallic clashing impact, splintering wooden shield fracture, guttural dwarven roar, crackling dungeon braziers.',
    breakdown: {
      timing05: 'Intense medium profile shot of a ferocious red-mohawked dwarven slayer locked in brutal close-quarters combat against two snarling goblins in an ancient underground stone vault.',
      timing510: 'With thunderous force, his heavy iron battleaxe cleaves directly through an enemy wooden shield, sending splintering timber chunks and bright fiery embers into the air.',
      timing1015: 'Slow camera orbit capturing the dwarf\'s war cry, beaded braided beard, muscular tattooed arms strained under torchlight, sparks showering off stone pillars.',
      cinematography: 'Arri Alexa Mini LF 40mm T1.8, warm underground torchlight and brazier fire embers, high-speed combat shutter, tactile wood and metal debris physics.',
      sound: 'Heavy metallic clashing impact, splintering wooden shield fracture, guttural dwarven roar, crackling dungeon braziers.'
    }
  }
];

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
        src={item.src}
        poster={item.poster}
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const categories = [
    { id: 'all', label: t('showcase.filterAll') },
    { id: 'photorealism', label: t('showcase.filterPhotorealism') },
    { id: 'scifi', label: t('showcase.filterScifi') },
    { id: 'fashion', label: t('showcase.filterFashion') },
    { id: 'motion', label: t('showcase.filterMotion') },
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

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            {t('showcase.subtitle')}
          </p>
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
              onInspect={(selected) => {
                setPlayingVideoId(null);
                setSelectedItem(selected);
              }}
              onCopyPrompt={handleCopyPrompt}
              copiedId={copiedId}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Prompt Breakdown */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0B0F17] border border-[#00AEE9]/30 rounded-3xl p-4 sm:p-8 shadow-2xl text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 pt-4 sm:pt-0">
                {/* Visual Left Preview (9:16) */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[220px] sm:max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative bg-black">
                    <video
                      src={selectedItem.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="w-full h-full object-cover"
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
                            {selectedItem.duration === '30s' ? '⏱ 0–10s Establishing:' : '⏱ 0–5s Establishing:'}
                          </span>
                          <span className="text-slate-300">{selectedItem.breakdown.timing05}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="font-mono text-[#00AEE9] font-bold block mb-1">
                            {selectedItem.duration === '30s' ? '⚡ 10–20s Dynamic Motion:' : '⚡ 5–10s Dynamic Motion:'}
                          </span>
                          <span className="text-slate-300">{selectedItem.breakdown.timing510}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="font-mono text-purple-400 font-bold block mb-1">
                            {selectedItem.duration === '30s' ? '✨ 20–30s Climax & Texture:' : '✨ 10–15s Climax & Texture:'}
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
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-[#070A0F] bg-gradient-to-r from-[#00AEE9] to-[#69FABD] shadow-lg shadow-[#00AEE9]/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t('showcase.ctaCardBtn')}</span>
                    </a>

                    <button
                      onClick={() => setSelectedItem(null)}
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
      </AnimatePresence>
    </section>
  );
};

export default VideoShowcase;
