import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Sparkles, 
  Clock, 
  Camera, 
  Volume2, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Type, 
  Layers, 
  Wand2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PRESET_PROMPTS = [
  {
    id: 'walking-in-harmony',
    title: 'Neo-Kyoto Rain',
    duration: '15s',
    prompt: '0-5s: Medium-full vertical shot of an enigmatic figure walking calmly down a rainy neon-lit street in Neo-Kyoto. 5-10s: Slow gimbal dolly back as puddles reflect prismatic cyan and emerald holographic billboards. 10-15s: Subtle head turn toward camera, soft natural lens flare, Kodak Vision3 color grading, photorealistic micro-textures on damp jacket. Sound: rhythmic footsteps on wet asphalt, distant muffled synth drone, gentle rain patter.'
  },
  {
    id: 'mediterranean-golden-hour',
    title: 'Mediterranean Sun',
    duration: '30s',
    prompt: '0-10s: Handheld iPhone-style vertical POV looking directly at a charming woman walking backward across a historic sun-drenched cobblestone square. 10-20s: Warm Mediterranean golden-hour sun creates soft hair rim-lighting as seaside cafes and passersby pass in the background. 20-30s: Natural radiant smile, spontaneous micro-gestures, lively eyes, authentic lifelike skin tone and gentle handheld stabilization. Sound: ambient coastal chatter, distant laughter, gentle sea breeze, outdoor footsteps on stone.'
  },
  {
    id: 'basque-tavern-passage',
    title: 'Basque Tavern',
    duration: '15s',
    prompt: '0-5s: Over-the-shoulder smooth forward tracking shot following a man walking down a warm, cozy traditional tavern with exposed rustic dark wood ceiling beams. 5-10s: Ambient glowing vintage pendant lamps cast amber reflections, pintxo counter and beer tap on the left with fresh tapas under warm spotlights. 10-15s: Steady glide toward the bright exterior doorway, soft shallow depth of field, authentic hospitality warmth. Sound: ambient bar murmurs, muffled clinking glasses, gentle footsteps on hardwood floor.'
  },
  {
    id: 'quantum-core-genesis',
    title: 'Quantum Core',
    duration: '15s',
    prompt: '0-5s: Ultra macro push into an oscillating quantum core pulsing with emerald and electric cyan light rings. 5-10s: Particle acceleration creates a vortex of refracted hyper-dimensional geometric arcs. 10-15s: Sudden gravitational stabilization, energy lens flare, chromatic aberration, 8k raytraced specular reflection. Sound: low sub-bass hum ascending in frequency, electrical arcing crackle, crystalline chime resonance.'
  },
  {
    id: 'sylvan-elven-archer',
    title: 'Elven Archer',
    duration: '15s',
    prompt: '0-5s: Extreme cinematic close-up of a silver-haired elven archer with sharp piercing green eyes, drawing a recurve bow in an enchanted sun-dappled forest. 5-10s: Micro-focus on her fingers gripping the bowstring and arrow nock, tension building with photorealistic skin micro-textures, freckles, and soft wind rustling fine white hair strands. 10-15s: Smooth release of the arrow, subtle camera recoil, intense focused stare, shallow depth of field with soft bokeh background. Sound: creaking bowstring wood tension, soft forest breeze, sharp whoosh on arrow release, distant bird call.'
  },
  {
    id: 'astoturfer-live-concert',
    title: 'Live Rock Concert',
    duration: '15s',
    prompt: '0-5s: Ultra-realistic handheld selfie video POV of an ecstatic fan shouting lyrics in the front row of a packed rock festival, holding a plastic beer cup high while wearing a black Astoturfer donkey cutoff shirt. 5-10s: Stage lights sweep overhead casting warm amber and smoky beams across the cheering crowd, fans chanting and raising beers together. 10-15s: He throws the iconic rock horns hand sign directly into the lens with euphoric energy, sweat glistening under stage strobes with photorealistic facial micro-expressions. Sound: thunderous live guitar riffs, heavy drum kicks, roaring festival crowd singing along, beer plastic cups rustle.'
  },
  {
    id: 'lantern-festival-elegance',
    title: 'Hanfu Lanterns',
    duration: '15s',
    prompt: '0-5s: Medium portrait of a graceful young woman adorned in an ornate ivory and gold silk Hanfu, jade hairpin in her hair, standing beside a softly glowing traditional silk lantern at dusk. 5-10s: Gentle night breeze rustles delicate falling cherry blossom petals, luminous orbs float into the misty evening sky casting warm golden candle highlights on porcelain skin. 10-15s: Subtle glance upward with a serene radiant expression, rich silk fabric micro-textures, cinematic slow-motion floating lanterns bokeh. Sound: soft traditional guzheng resonance, gentle night wind whisper, distant festive chimes.'
  },
  {
    id: 'autumn-couture-creator',
    title: 'Autumn Couture',
    duration: '15s',
    prompt: '0-5s: Medium profile shot of a stylish woman in a dark tailored charcoal coat and cream knit sweater smiling as she works on her laptop on a wet park bench under weeping willows. 5-10s: Smooth dynamic over-the-shoulder camera push focusing into her laptop display revealing a vibrant sculpted scarlet red haute couture silk gown rendered in digital 3D. 10-15s: Delicate hand adjusting touchpad controls, raindrops glistening on wood and asphalt, soft autumn park foliage depth of field. Sound: crisp keyboard typing clicks, soft park drizzle, gentle bird song, distant city hum.'
  },
  {
    id: 'dwarven-slayer-clash',
    title: 'Dwarven Clash',
    duration: '15s',
    prompt: '0-5s: Intense medium profile shot of a ferocious red-mohawked dwarven slayer locked in brutal close-quarters combat against two snarling goblins in an ancient underground stone vault. 5-10s: With thunderous force, his heavy iron battleaxe cleaves directly through an enemy wooden shield, sending splintering timber chunks and bright fiery embers into the air. 10-15s: Slow camera orbit capturing the dwarf\'s war cry, beaded braided beard, muscular tattooed arms strained under torchlight, sparks showering off stone pillars. Sound: heavy metallic clashing impact, splintering wooden shield fracture, guttural dwarven roar, crackling dungeon braziers.'
  }
];

const DIRECTIVE_INJECTIONS = [
  { label: '+ Arri Alexa 65 Cine', snippet: ' Shot on Arri Alexa 65 large-format sensor with true cinematic dynamic range.' },
  { label: '+ Cooke Anamorphic 35mm', snippet: ' Filmed with Cooke Anamorphic /i Full Frame Plus 35mm T2.3 prime lens.' },
  { label: '+ Kodak Vision3 500T', snippet: ' Kodak Vision3 500T 5219 35mm film emulation, authentic fine analog grain.' },
  { label: '+ Foley Audio Atmosférico', snippet: ' Sound: synchronized immersive atmospheric foley, tactile environmental acoustics, subtle natural resonance.' },
  { label: '+ 9:16 Vertical Master', snippet: ' Native 9:16 vertical cinema framing, centered subject composition, soft shallow bokeh.' }
];

const PromptVault = () => {
  const { t } = useTranslation();
  const [activeWorkflow, setActiveWorkflow] = useState('t2v'); // 't2v', 'i2v', 'r2v'
  const [activePresetId, setActivePresetId] = useState('walking-in-harmony');
  const [customPrompt, setCustomPrompt] = useState(PRESET_PROMPTS[0].prompt);
  const [isCopied, setIsCopied] = useState(false);

  const opticsSpecs = t('promptVault.pillar2Specs', { returnObjects: true }) || [
    "Arri Alexa 65 Large-Format Sensor",
    "Cooke Anamorphic /i Full Frame Plus 35mm T2.3",
    "Kodak Vision3 500T 5219 Color Emulation",
    "Volumetric Mist & Atmospheric Depth",
    "Hyper-smooth 3-Axis Gimbal Tracking",
    "Natural Optical Lens Aberration"
  ];

  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setCustomPrompt(preset.prompt);
  };

  const handleClear = () => {
    setActivePresetId('custom');
    setCustomPrompt('');
  };

  const handleAppendDirective = (snippet) => {
    if (!customPrompt.includes(snippet.trim())) {
      setCustomPrompt((prev) => (prev ? `${prev.trim()}${snippet}` : snippet.trim()));
    }
  };

  const handleEnhance = () => {
    let enhanced = customPrompt.trim();
    if (!enhanced.toLowerCase().includes('arri') && !enhanced.toLowerCase().includes('cooke')) {
      enhanced += ' Arri Alexa 65, Cooke Anamorphic 35mm T2.3, Kodak Vision3 500T color grading.';
    }
    if (!enhanced.toLowerCase().includes('sound:')) {
      enhanced += ' Sound: authentic synchronized acoustic foley, tactile micro-textures, gentle atmospheric room tone.';
    }
    setCustomPrompt(enhanced);
  };

  const handleCopy = () => {
    if (!customPrompt) return;
    navigator.clipboard.writeText(customPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <section id="prompt-vault" className="relative w-full py-24 bg-[#0B0F17] text-white border-t border-white/10 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#00AEE9]/5 rounded-full blur-[140px] pointer-events-none max-w-full" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-[#69FABD]/5 rounded-full blur-[140px] pointer-events-none max-w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#070A0F] border border-[#00AEE9]/30 text-xs font-mono text-[#69FABD] mb-4 shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-[#00AEE9]" />
            <span>{t('promptVault.badge')}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display mb-4">
            {t('promptVault.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEE9] to-[#69FABD]">
              {t('promptVault.titleHighlight')}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            {t('promptVault.subtitle')}
          </p>
        </div>

        {/* The 3 Core Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Pillar 1: Temporal Progression */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#070A0F]/80 border border-white/10 hover:border-[#00AEE9]/40 transition-all duration-300 flex flex-col justify-between group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#00AEE9]/15 border border-[#00AEE9]/30 flex items-center justify-center text-[#00AEE9] mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                {t('promptVault.pillar1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                {t('promptVault.pillar1Desc')}
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                  <span className="text-[#69FABD] font-bold block mb-0.5">0–5s Estab:</span>
                  {t('promptVault.pillar1Step1')}
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                  <span className="text-[#00AEE9] font-bold block mb-0.5">5–10s Kinetic:</span>
                  {t('promptVault.pillar1Step2')}
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                  <span className="text-purple-400 font-bold block mb-0.5">10–15s Climax:</span>
                  {t('promptVault.pillar1Step3')}
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: Cinematography & Optics */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#070A0F]/80 border border-white/10 hover:border-[#69FABD]/40 transition-all duration-300 flex flex-col justify-between group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#69FABD]/15 border border-[#69FABD]/30 flex items-center justify-center text-[#69FABD] mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                {t('promptVault.pillar2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                {t('promptVault.pillar2Desc')}
              </p>

              <div className="space-y-2">
                {opticsSpecs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 font-mono">
                    <ChevronRight className="w-3.5 h-3.5 text-[#69FABD] shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pillar 3: Foley Soundscape */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#070A0F]/80 border border-white/10 hover:border-purple-400/40 transition-all duration-300 flex flex-col justify-between group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-6 group-hover:scale-110 transition-transform">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                {t('promptVault.pillar3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                {t('promptVault.pillar3Desc')}
              </p>

              <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/20 text-xs font-mono text-slate-300 leading-relaxed">
                <span className="text-purple-400 font-bold block mb-2">✦ Acoustic Directive Syntax:</span>
                <p className="text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                  {t('promptVault.pillar3Example')}
                </p>
                <div className="mt-3 text-[11px] text-slate-400">
                  Tip: Use physical descriptors like <span className="text-[#69FABD]">slick, damp, muffled, resonant</span> to trigger hyper-realistic acoustic synthesis in AI video generation.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive Prompt Studio Console (Point 1 + Workbench) */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#0F141E] to-[#070A0F] border border-[#00AEE9]/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Subtle Corner Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00AEE9]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#69FABD]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Console Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00AEE9]/15 border border-[#00AEE9]/30 text-xs font-mono text-[#69FABD] mb-2">
                <Terminal className="w-3.5 h-3.5 text-[#00AEE9]" />
                <span>{t('promptVault.studioBadge')}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                {t('promptVault.studioTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {t('promptVault.studioSubtitle')}
              </p>
            </div>

            {/* Workflow Mode Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveWorkflow('t2v')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activeWorkflow === 't2v'
                    ? 'bg-[#00AEE9] text-[#070A0F] shadow-lg shadow-[#00AEE9]/20 font-bold'
                    : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>{t('promptVault.tabTextToVideo')}</span>
              </button>

              <button
                onClick={() => setActiveWorkflow('i2v')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  activeWorkflow === 'i2v'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20 font-bold'
                    : 'bg-white/5 text-purple-300/80 hover:text-purple-200 border border-purple-500/30'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('promptVault.tabImageToVideo')}</span>
              </button>

              <button
                onClick={() => setActiveWorkflow('r2v')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  activeWorkflow === 'r2v'
                    ? 'bg-amber-500 text-[#070A0F] shadow-lg shadow-amber-500/20 font-bold'
                    : 'bg-white/5 text-amber-300/80 hover:text-amber-200 border border-amber-500/30'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t('promptVault.tabRefToVideo')}</span>
              </button>
            </div>
          </div>

          {/* Roadmap Info Banner (Shown for i2v and r2v) */}
          {activeWorkflow !== 't2v' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-3"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Workflow en Hoja de Ruta:</span>
                {t('promptVault.roadmapAlert')}
              </div>
            </motion.div>
          )}

          {/* Preset Selector Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                {t('promptVault.presetLabel')}
              </span>
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t('promptVault.customPreset')}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {PRESET_PROMPTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    activePresetId === preset.id
                      ? 'bg-white/15 text-[#69FABD] border border-[#69FABD]/40 shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{preset.title}</span>
                  <span className="ml-1.5 text-[10px] font-mono text-slate-400">({preset.duration})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Directives & Quick Enhancers */}
          <div className="mt-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
              {t('promptVault.opticsDirectives')}
            </span>
            <div className="flex flex-wrap gap-2">
              {DIRECTIVE_INJECTIONS.map((dir, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAppendDirective(dir.snippet)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 hover:text-cyan-300 border border-white/10 transition-all cursor-pointer"
                >
                  {dir.label}
                </button>
              ))}
              <button
                onClick={handleEnhance}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#00AEE9]/20 to-[#69FABD]/20 hover:from-[#00AEE9]/30 hover:to-[#69FABD]/30 text-[11px] font-mono font-bold text-[#69FABD] border border-[#69FABD]/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wand2 className="w-3 h-3 text-[#69FABD]" />
                <span>{t('promptVault.enhanceBtn')}</span>
              </button>
            </div>
          </div>

          {/* Live Prompt Workbench Textarea */}
          <div className="mt-6 relative">
            <div className="relative rounded-2xl bg-black/70 border border-white/15 focus-within:border-[#00AEE9]/70 focus-within:shadow-[0_0_25px_rgba(0,174,233,0.2)] transition-all">
              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  setActivePresetId('custom');
                }}
                rows={5}
                placeholder={t('promptVault.editorPlaceholder')}
                className="w-full bg-transparent p-4 sm:p-5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed select-all"
              />

              <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-black/40 rounded-b-2xl text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  <span>{customPrompt.length} caracteres</span>
                  <span>•</span>
                  <span className="text-[#69FABD]">
                    {customPrompt.toLowerCase().includes('30s') ? '⏱ Estimado: 30s' : '⏱ Estimado: 15s'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  Motor: Harmony AI Video (7.country)
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#69FABD]" />
              <span>Pega este blueprint en el generador oficial de Harmony para renderizar tu video.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                disabled={!customPrompt}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">{t('promptVault.blueprintCopied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>{t('promptVault.copyBlueprint')}</span>
                  </>
                )}
              </button>

              <a
                href="https://7.country/gov/t/BSxVEbuYuMKARGxM0oGUjfjWiyd7_Vsn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00AEE9] to-[#69FABD] text-[#070A0F] text-xs sm:text-sm font-bold shadow-lg shadow-[#00AEE9]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('promptVault.launchHarmony')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#070A0F]" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default PromptVault;
