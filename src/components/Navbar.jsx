import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { MintbesLogo } from './Logos';

const Navbar = () => {
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
        { title: 'Active', href: '#active' },
        { title: 'Mintbes Arcade', href: '#mintbes-arcade' },
        { title: 'Staking', href: '#staking' },
        { title: 'Gallery', href: '#gallery' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <a href="#" className="flex items-center gap-3 group">
                    <MintbesLogo className="w-10 h-10 transition-transform group-hover:scale-110" />
                    <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-green-800' : 'text-white'
                        }`}>
                        Mintbes <span className="font-light">Validator</span>
                    </span>
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.title}
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
                        Delegate Now
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <X className={scrolled ? 'text-gray-900' : 'text-white'} />
                    ) : (
                        <Menu className={scrolled ? 'text-gray-900' : 'text-white'} />
                    )}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-4 px-6 flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.title}
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
                        Delegate Now
                    </a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
