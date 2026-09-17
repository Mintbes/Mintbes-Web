import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Maximize2, Sparkles, Film } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const featuredVideoData = {
    url: 'videosAI/compressed/walking.mp4',
    titleKey: 'aiStudio.featuredTitle',
    descKey: 'aiStudio.featuredDesc',
    type: 'video'
};

const mediaGrid = [
    {
        url: 'videosAI/compressed/Harmony1st.mp4',
        title: 'First AI surprise',
        type: 'video'
    },
    { url: 'flower.jpg', title: 'Just in Harmony', type: 'image' },
    { url: 'Pixel.jpg', title: 'Pixel to life', type: 'image' },
    { url: 'pepabeer.jpg', title: 'PeppaBeer a tope', type: 'image' },
    { url: 'wage.jpg', title: 'Always in company', type: 'image' },
    { url: 'moon.jpg', title: 'To the moon', type: 'image' },
    { url: 'wale.jpg', title: 'Waiting for you', type: 'image' },
    { url: 'cpu.jpg', title: 'Tech first', type: 'image' },
    { url: 'server.jpg', title: 'Harmony Power', type: 'image' }
];

const Gallery = () => {
    const { t } = useTranslation();
    const [selectedMedia, setSelectedMedia] = useState(null);
    const featuredVideoRef = useRef(null);

    const handleFeaturedHoverStart = () => {
        if (featuredVideoRef.current) {
            featuredVideoRef.current.play().catch(() => {});
        }
    };

    const handleFeaturedHoverEnd = () => {
        if (featuredVideoRef.current) {
            featuredVideoRef.current.pause();
        }
    };

    return (
        <section id="ai-studio" className="py-24 bg-slate-950 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('aiStudio.badge')}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        {t('aiStudio.title')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-green-300">
                            {t('aiStudio.titleHighlight')}
                        </span>
                    </h2>
                    <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                        {t('aiStudio.description')}
                    </p>
                </div>

                {/* FEATURED SPOTLIGHT VIDEO: walking.mp4 */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-5xl mx-auto mb-20"
                >
                    <div
                        onMouseEnter={handleFeaturedHoverStart}
                        onMouseLeave={handleFeaturedHoverEnd}
                        onClick={() => setSelectedMedia({
                            url: featuredVideoData.url,
                            title: t(featuredVideoData.titleKey),
                            type: 'video'
                        })}
                        className="group relative rounded-3xl overflow-hidden bg-slate-900/90 border border-emerald-500/30 shadow-2xl shadow-emerald-950/70 cursor-pointer hover:border-emerald-400/70 transition-all duration-500"
                    >
                        {/* Video Display Container */}
                        <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden bg-black">
                            <video
                                ref={featuredVideoRef}
                                className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity duration-500 transform group-hover:scale-102"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                            >
                                <source src={`${featuredVideoData.url}#t=0.5`} type="video/mp4" />
                            </video>

                            {/* Gradient Vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                            {/* Center Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-emerald-500/30 backdrop-blur-md rounded-full flex items-center justify-center border border-emerald-400/60 shadow-xl group-hover:scale-115 group-hover:bg-emerald-500 group-hover:border-emerald-300 transition-all duration-300">
                                    <Play className="w-9 h-9 text-white fill-white ml-1.5 transition-colors" />
                                </div>
                            </div>

                            {/* Top Badge: Featured AI Production */}
                            <div className="absolute top-6 left-6">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 shadow-md">
                                    <Film className="w-3.5 h-3.5 text-emerald-400" />
                                    {t('aiStudio.featuredBadge')}
                                </span>
                            </div>

                            {/* Bottom Info Bar inside Card */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="max-w-2xl">
                                    <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
                                        {t(featuredVideoData.titleKey)}
                                    </h3>
                                    <p className="text-slate-300 text-sm md:text-base leading-relaxed drop-shadow-sm">
                                        {t(featuredVideoData.descKey)}
                                    </p>
                                </div>
                                <div className="shrink-0">
                                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50">
                                        <Play className="w-4 h-4 fill-current" />
                                        {t('aiStudio.watchVideo')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sub-header for Archive Grid */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-10">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span>{t('aiStudio.gallerySubtitle')}</span>
                    </h3>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                        9 Artworks
                    </span>
                </div>

                {/* 3x3 Media Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mediaGrid.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.07, duration: 0.5 }}
                            className="relative group overflow-hidden rounded-2xl shadow-xl bg-slate-900 border border-slate-800 aspect-video cursor-pointer hover:border-emerald-500/50 transition-all duration-300"
                            onClick={() => setSelectedMedia(item)}
                        >
                            {/* Preview */}
                            {item.type === 'video' ? (
                                <div className="relative h-full w-full">
                                    <video
                                        className="w-full h-full object-cover opacity-80"
                                        poster={item.thumbnail || undefined}
                                        muted
                                        playsInline
                                        preload="metadata"
                                    >
                                        <source src={`${item.url}#t=0.5`} type="video/mp4" />
                                    </video>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-emerald-500/30 backdrop-blur-md rounded-full flex items-center justify-center border border-emerald-400/50 group-hover:scale-110 group-hover:bg-emerald-500/50 transition-all">
                                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover opacity-85 transform group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                            )}

                            {/* Hover Overlay Text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-90 p-6 flex flex-col justify-end">
                                <p className="text-white font-semibold text-lg drop-shadow-md">{item.title}</p>
                                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{t('aiStudio.clickToExpand')}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal Player */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-xl"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <motion.button
                            className="absolute top-6 right-6 text-white/70 hover:text-white z-[110] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            whileHover={{ rotate: 90 }}
                            onClick={() => setSelectedMedia(null)}
                            aria-label="Close modal"
                        >
                            <X size={28} />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-5xl max-h-full rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedMedia.type === 'video' ? (
                                <video
                                    className="w-full h-auto max-h-[78vh] bg-black"
                                    controls
                                    autoPlay
                                    playsInline
                                    poster={selectedMedia.thumbnail || undefined}
                                    preload="auto"
                                >
                                    <source src={selectedMedia.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img
                                    src={selectedMedia.url}
                                    alt={selectedMedia.title}
                                    className="w-full h-auto max-h-[78vh] object-contain mx-auto"
                                />
                            )}

                            <div className="p-5 md:p-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">{selectedMedia.title}</h3>
                                    <p className="text-slate-400 text-xs md:text-sm">{t('aiStudio.footerText')}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Gallery;
