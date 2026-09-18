import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Sparkles, Clock, Camera, Volume2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PromptVault = () => {
  const { t } = useTranslation();

  const opticsSpecs = t('promptVault.pillar2Specs', { returnObjects: true }) || [
    "Arri Alexa 65 Large-Format Sensor",
    "Cooke Anamorphic /i Full Frame Plus 35mm T2.3",
    "Kodak Vision3 500T 5219 Color Emulation",
    "Volumetric Mist & Atmospheric Depth",
    "Hyper-smooth 3-Axis Gimbal Tracking",
    "Natural Optical Lens Aberration"
  ];

  return (
    <section id="prompt-vault" className="relative w-full pt-20 sm:pt-24 pb-20 sm:pb-24 bg-[#0B0F17] text-white border-t border-white/10 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#00AEE9]/5 rounded-full blur-[140px] pointer-events-none max-w-full" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-[#69FABD]/5 rounded-full blur-[140px] pointer-events-none max-w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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

      </div>
    </section>
  );
};

export default PromptVault;
