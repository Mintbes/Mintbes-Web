import React from 'react';
import { ExternalLink, Copyright, ShieldCheck, Sparkles, Film, Terminal, Layers, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';


// X (Twitter) Icon Component
const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = ({ onOpenDashboard }) => {
  const { t } = useTranslation();

  const quickLinks = [
    { title: t('nav.showcase'), href: '#showcase', icon: Film },
    { title: t('nav.promptVault'), href: '#prompt-vault', icon: Terminal },
    { title: t('nav.ecosystem'), href: '#ecosystem', icon: Layers },
  ];

  return (
    <footer className="bg-[#070A0F] text-slate-300 py-16 border-t border-white/10 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#00AEE9]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
              Mintbes <span className="text-lg">🌿</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
              Official Harmony Governor
            </span>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
            {t('footer.description')}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://x.com/MintbuilderES"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-[#0B0F17] border border-white/10 text-slate-300 hover:text-white hover:border-[#00AEE9]/40 hover:bg-[#00AEE9]/15 transition-all"
              aria-label={t('footer.xProfile') || "Mintbes Twitter"}
              title="Mintbes en X (@MintbuilderES)"
            >
              <XIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.youtube.com/@mintbes6411"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-[#0B0F17] border border-white/10 text-slate-300 hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10 transition-all group"
              aria-label={t('footer.youtubeChannel') || "Mintbes YouTube Shorts"}
              title="Canal de YouTube @mintbes6411"
            >
              <Youtube className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
            </a>
            <a
              href="#showcase"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0B0F17] border border-[#00AEE9]/30 text-xs font-semibold text-[#69FABD] hover:bg-[#00AEE9]/15 transition-all"
            >
              <Film className="w-3.5 h-3.5 text-[#00AEE9]" />
              <span>{t('footer.launchStudio')}</span>
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-5">
            {t('footer.quickLinks')}
          </h4>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-[#69FABD] transition-colors"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Ecosystem & Authority Links */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-5">
            {t('footer.ecosystem')}
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="https://x.com/harmonyprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#00AEE9]" />
                <span>{t('footer.officialAnnouncement')}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li className="pt-3">
              <div className="flex items-center gap-3">
                <img
                  src="harmony-one-logo.png"
                  alt="Harmony ONE"
                  className="w-20 h-auto opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Legal / Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p className="flex items-center gap-1.5">
          <Copyright className="w-3.5 h-3.5" />
          <span>{t('footer.copyright')}</span>
        </p>
        <p className="text-center sm:text-right text-slate-400">
          {t('footer.designedFor')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
