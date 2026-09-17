import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar = ({ onOpenDashboard }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { title: t('nav.showcase'), href: '#showcase' },
    { title: t('nav.promptVault'), href: '#prompt-vault' },
    { title: t('nav.ecosystem'), href: '#ecosystem' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070A0F]/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center group">
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#69FABD] transition-colors flex items-center gap-1.5">
            Mintbes <span className="text-lg">🌿</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0B0F17]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              {link.title}
            </a>
          ))}
        </nav>

        {/* Desktop Action & Language */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenDashboard}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white bg-[#0B0F17]/80 hover:bg-[#00AEE9]/15 border border-[#00AEE9]/40 hover:border-[#00AEE9]/80 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(0,174,233,0.25)] cursor-pointer"
            title="MintMax Operator Portal"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#69FABD] animate-pulse" />
            <span className="tracking-wide">MintMax</span>
          </button>
          <LanguageSelector />
        </div>

        {/* Mobile Hamburger & Language */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenDashboard}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-slate-200 bg-[#0B0F17]/80 border border-[#00AEE9]/40"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#69FABD] animate-pulse" />
            <span>MintMax</span>
          </button>
          <LanguageSelector />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#070A0F]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-white/5 hover:text-[#69FABD] transition-all"
              >
                {link.title}
              </a>
            ))}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenDashboard?.();
              }}
              className="mt-2 w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-white bg-white/5 border border-white/10 hover:border-[#00AEE9]/40 flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#69FABD] animate-pulse" />
                MintMax
              </span>
              <span className="text-xs font-mono text-slate-400">Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
