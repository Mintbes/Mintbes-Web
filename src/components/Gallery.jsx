import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Maximize2 } from 'lucide-react';

const media = [
    {
        url: 'Harmony1st.mp4',
        title: 'First AI surprise',
        type: 'video'
    },
    { url: 'flower.jpg', title: 'Just in Harmony', type: 'image' },
    { url: 'Pixel.jpg', title: 'Pixel to life', type: 'image' },
    { url: 'pepabeer.jpg', title: 'PeppaBeer a tope', type: 'image' },
    { url: 'wage.jpg', title: 'Always in company', type: 'image' },
    { url: 'moon.jpg', title: 'To the moon', type: 'image' },
    { url: 'wale.jpg', title: 'Waiting for you', type: 'image' },
    { url: 'cpu.jpg', title: 'Tech firts', type: 'image' },
    { url: 'server.jpg', title: 'Harmony Power', type: 'image' }
];

const Gallery = () => {
    const [selectedMedia, setSelectedMedia] = useState(null);

    return (
        <section id="gallery" className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        Harmony Gallery <span className="text-mintbes-600">AI Images</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Explore the visual journey of Mintbes Validator. From community educational content to ecosystem celebrations, here we share the media we create to support and grow the Harmony network.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {media.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="relative group overflow-hidden rounded-2xl shadow-xl bg-black aspect-video cursor-pointer"
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
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                            <Play className="w-8 h-8 text-white fill-white" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover opacity-90 transform group-hover:scale-110 transition-transform duration-700"
                                />
                            )}

                            {/* Hover Overlay Text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 p-6 flex flex-col justify-end">
                                <p className="text-white font-semibold text-lg drop-shadow-md">{item.title}</p>
                                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 className="w-4 h-4 text-mintbes-400" />
                                    <span className="text-xs text-mintbes-400 font-medium uppercase tracking-wider">Click to Expand</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <motion.button
                            className="absolute top-6 right-6 text-white/70 hover:text-white z-[110]"
                            whileHover={{ rotate: 90 }}
                            onClick={() => setSelectedMedia(null)}
                        >
                            <X size={32} />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl max-h-full rounded-2xl overflow-hidden bg-black shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedMedia.type === 'video' ? (
                                <video
                                    className="w-full h-auto max-h-[80vh]"
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
                                    className="w-full h-auto max-h-[80vh] object-contain"
                                />
                            )}

                            <div className="p-6 bg-gray-900 border-t border-white/10">
                                <h3 className="text-xl font-bold text-white mb-1">{selectedMedia.title}</h3>
                                <p className="text-gray-400 text-sm">Media created for the Harmony Ecosystem</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Gallery;
