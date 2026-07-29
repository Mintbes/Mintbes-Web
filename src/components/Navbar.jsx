import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { title: t('nav.active'), href: '#active' },
        { title: t('nav.arcade'), href: '#mintbes-arcade' },
        { title: t('nav.staking'), href: '#staking' },
        { title: t('nav.gallery'), href: '#gallery' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="w-full max-w-7xl mx-auto px-6 flex justify-between items-center relative">
                {/* Desktop Menu - Centered links */}
                <div className="hidden md:flex items-center gap-8 justify-center w-full">
                    {navLinks.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.href}
                            className={`text-sm font-medium hover:text-mintbes-500 transition-colors ${scrolled ? 'text-gray-600' : 'text-gray-200'
                                }`}
                        >
                            {link.title}
                        </a>
                    ))}
                    <a
                        href="https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-5 py-2 rounded-full font-medium transition-all ${scrolled
                            ? 'bg-mintbes-600 text-white hover:bg-mintbes-700'
                            : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                            }`}
                    >
                        {t('nav.delegateNow')}
                    </a>
                </div>

                {/* Language Selector - Positioned Top Right */}
                <div className="hidden md:block absolute right-6">
                    <LanguageSelector scrolled={scrolled} />
                </div>

                {/* Mobile Header Bar */}
                <div className="flex md:hidden items-center justify-between w-full">
                    <button
                        className="p-2"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {isOpen ? (
                            <X className={scrolled ? 'text-gray-900' : 'text-white'} />
                        ) : (
                            <Menu className={scrolled ? 'text-gray-900' : 'text-white'} />
                        )}
                    </button>
                    <LanguageSelector scrolled={scrolled} />
                </div>
            </div>

            {/* Mobile Dropdown */}
            {
                isOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-4 px-6 flex flex-col gap-4">
                        {navLinks.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-gray-700 hover:text-mintbes-600 font-medium py-2 border-b border-gray-50 last:border-0"
                            >
                                {link.title}
                            </a>
                        ))}
                        <a
                            href="https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-center bg-mintbes-600 text-white py-3 rounded-lg font-semibold hover:bg-mintbes-700 transition"
                        >
                            {t('nav.delegateNow')}
                        </a>
                    </div>
                )
            }
        </nav >
    );
};

export default Navbar;
