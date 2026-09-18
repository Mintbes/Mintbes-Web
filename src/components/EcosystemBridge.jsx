import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Layers, ExternalLink, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const EcosystemBridge = ({ onOpenDashboard }) => {
  const { t } = useTranslation();

  return (
    <section id="ecosystem" className="relative w-full py-20 sm:py-24 bg-[#070A0F] text-white border-t border-white/10 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AEE9]/5 rounded-full blur-[150px] pointer-events-none max-w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B0F17] border border-[#00AEE9]/30 text-xs font-mono text-[#69FABD] mb-4">
            <Layers className="w-3.5 h-3.5 text-[#00AEE9]" />
            <span>{t('ecosystem.badge')}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display mb-4">
            {t('ecosystem.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEE9] to-[#69FABD]">
              {t('ecosystem.titleHighlight')}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            {t('ecosystem.subtitle')}
          </p>
        </div>

        {/* 3 Ecosystem Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1: Genesis Heritage */}
          <div className="p-8 rounded-3xl bg-[#0B0F17]/80 border border-white/10 hover:border-[#00AEE9]/40 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#00AEE9]/15 border border-[#00AEE9]/30 flex items-center justify-center text-[#00AEE9] group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                  {t('ecosystem.card1Badge')}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 font-display">
                {t('ecosystem.card1Title')}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('ecosystem.card1Desc')}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Genesis Block: 2019</span>
              <span className="text-[#69FABD]">Millions Validated</span>
            </div>
          </div>

          {/* Card 2: Ethereum Governance */}
          <div className="p-8 rounded-3xl bg-[#0B0F17]/80 border border-white/10 hover:border-[#69FABD]/40 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#69FABD]/15 border border-[#69FABD]/30 flex items-center justify-center text-[#69FABD] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#69FABD]">
                  {t('ecosystem.card2Badge')}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 font-display">
                {t('ecosystem.card2Title')}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('ecosystem.card2Desc')}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Fiduciary Trust</span>
              <span className="text-[#00AEE9]">Official Governor</span>
            </div>
          </div>

          {/* Card 3: AI Video Acceleration */}
          <div className="p-8 rounded-3xl bg-[#0B0F17]/80 border border-white/10 hover:border-purple-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-purple-300">
                  {t('ecosystem.card3Badge')}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 font-display">
                {t('ecosystem.card3Title')}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('ecosystem.card3Desc')}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Harmony AI Video</span>
              <span className="text-purple-400">High-Throughput</span>
            </div>
          </div>

        </div>


      </div>
    </section>
  );
};

export default EcosystemBridge;
