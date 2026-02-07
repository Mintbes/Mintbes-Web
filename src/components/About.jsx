import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, MessageCircle, Heart, Share2 } from 'lucide-react';
import { MintbesLogo } from './Logos';

// X (Twitter) Icon Component
const XIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const Active = () => {
    return (
        <section id="active" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1">
                            <Twitter className="w-3 h-3" /> Since Day One
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Championing Harmony <br />
                        <span className="text-mintbes-600">Across the Globe.</span>
                    </h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        Mintbes is more than a validator; we are a dedicated voice for the{' '}
                        <a
                            href="https://www.harmony.one/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mintbes-600 hover:text-mintbes-700 font-semibold underline"
                        >
                            Harmony ecosystem
                        </a>.
                        From the project's inception, we have been actively promoting, educating, and engaging with the community on X.
                    </p>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        We believe that a strong blockchain needs a loud voice. Our continuous social presence helps drive adoption and keeps the community informed.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://x.com/MintbuilderES"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-mintbes-600 text-white px-6 py-3 rounded-full hover:bg-mintbes-700 transition-colors group"
                        >
                            Follow Mintbes
                            <XIcon className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                        </a>

                        <a
                            href="https://x.com/harmonyprotocol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center border-2 border-mintbes-600 text-mintbes-600 px-6 py-3 rounded-full hover:bg-mintbes-600 hover:text-white transition-colors group"
                        >
                            Follow Harmony
                            <XIcon className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                </motion.div>

                {/* Visual: Stylized Social Media Feed */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative group"
                >
                    {/* Decorative background blob */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-mintbes-100 to-blue-50 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity"></div>

                    {/* Tweet Card Mockup - Clickable */}
                    <a
                        href="https://x.com/MintbuilderES"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500 hover:scale-[1.02] cursor-pointer"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-mintbes-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                                    <img src="/mintbes_leaf_transparent.png" alt="Mintbes" className="w-8 h-8 object-contain" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Mintbes Validator</h4>
                                    <p className="text-gray-500 text-sm">@MintbuilderES</p>
                                </div>
                            </div>
                            <Twitter className="text-blue-400 w-5 h-5" />
                        </div>

                        {/* Content */}
                        <p className="text-gray-800 text-lg mb-4">
                            Proud to support the <span className="text-blue-500">#HarmonyONE</span> ecosystem! 💙🌿
                            <br /><br />
                            Consistently validating blocks and spreading the word since the beginning. Together we build a sustainable future. 🚀
                        </p>

                        {/* Engagement Stats Mockup */}
                        <div className="flex items-center gap-6 text-gray-400 text-sm border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2 hover:text-blue-500 cursor-pointer">
                                <MessageCircle className="w-4 h-4" /> 24
                            </div>
                            <div className="flex items-center gap-2 hover:text-green-500 cursor-pointer">
                                <Share2 className="w-4 h-4" /> 12
                            </div>
                            <div className="flex items-center gap-2 hover:text-red-500 cursor-pointer">
                                <Heart className="w-4 h-4" /> 89
                            </div>
                        </div>
                    </a>

                    {/* Floating Badge */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3"
                    >
                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                            <span className="font-bold text-xl">24/7</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Activity</p>
                            <p className="font-bold text-gray-900">Community Focused</p>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
};

export default Active;
