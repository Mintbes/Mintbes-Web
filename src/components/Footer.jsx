import React from 'react';
import { ExternalLink, Copyright } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// X (Twitter) Icon Component
const XIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const Footer = () => {
    const { t } = useTranslation();

    const quickLinks = [
        { title: t('nav.active'), href: '#active' },
        { title: t('nav.arcade'), href: '#mintbes-arcade' },
        { title: t('nav.staking'), href: '#staking' },
        { title: t('nav.gallery'), href: '#gallery' }
    ];

    return (
        <footer className="bg-gray-900 text-gray-300 py-16">
            <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-white mb-6">
                        <span className="text-2xl font-bold tracking-wide">Mintbes 🌿</span>
                    </div>
                    <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                        {t('footer.description')}
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="https://x.com/MintbuilderES"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-800 rounded-full hover:bg-mintbes-600 hover:text-white transition-colors"
                            aria-label="Mintbes Twitter"
                        >
                            <XIcon className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="text-white font-bold mb-6">{t('footer.quickLinks')}</h4>
                    <ul className="space-y-3">
                        {quickLinks.map((item, idx) => (
                            <li key={idx}>
                                <a
                                    href={item.href}
                                    className="hover:text-mintbes-400 transition-colors"
                                >
                                    {item.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* External */}
                <div>
                    <h4 className="text-white font-bold mb-6">{t('footer.harmonyEcosystem')}</h4>
                    <ul className="space-y-3">
                        <li>
                            <a
                                href="https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-mintbes-400 transition-colors"
                            >
                                {t('footer.displayDashboard')} <ExternalLink className="w-4 h-4" />
                            </a>
                        </li>
                        <li className="flex items-center gap-2 mt-4">
                            <img
                                src="harmony-one-logo.png"
                                alt="Harmony ONE"
                                className="w-20 h-auto"
                            />
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-6 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p className="flex items-center gap-1">
                    <Copyright className="w-4 h-4" /> {t('footer.copyright')}
                </p>
                <p className="mt-2 md:mt-0">
                    {t('footer.designedFor')}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
