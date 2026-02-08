import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
    return (
        <section id="hero" className="relative w-full h-screen overflow-hidden flex items-center justify-center text-white">
            {/* Image Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="hero-bq.jpg"
                    alt="Mintbes Harmony Validator"
                    className="w-full h-full object-cover"
                />
                {/* Overlay for better text readability - slightly stronger for static image */}
                <div className="absolute inset-0 bg-green-950/60 backdrop-blur-[1px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
                        Mintbes 🌿: Secure and trusted <span className="text-mintbes-300">Harmony Validator</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 font-light text-gray-100">
                        Earn <span className="font-semibold text-white">12%+ APR</span> by delegating your ONE tokens to a trusted eco-friendly node.
                    </p>

                    <motion.a
                        href="https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center px-8 py-4 bg-mintbes-500 hover:bg-mintbes-400 text-white font-semibold rounded-full text-lg transition-all shadow-lg hover:shadow-mintbes-500/50"
                    >
                        Delegate your ONE tokens
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </motion.a>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
