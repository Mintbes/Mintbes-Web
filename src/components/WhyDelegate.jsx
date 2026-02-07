import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Ghost, TrendingUp, Scissors, ArrowRight, ExternalLink } from 'lucide-react';

const Arcade = () => {
    const games = [
        {
            id: 1,
            title: "Whack-a-FUD",
            description: "Smash the FUD bears! A fast-paced arcade clicker where you protect the ecosystem. Earn $ONE based on your score.",
            image: "/Whack-a-FUD_16x9.png",
            color: "bg-purple-50",
            status: "Live",
            link: "https://mintbes.github.io/WAF/",
            xLink: "https://x.com/MintbuilderES/status/2002518227612819841"
        },
        {
            id: 2,
            title: "Rock Paper Scissors",
            description: "The classic Rock Paper Scissors game, reimagined for the blockchain. Challenge the protocol and prove your luck on-chain.",
            image: "/RPC.jpg",
            color: "bg-blue-50",
            status: "Live",
            link: "https://mintbes.github.io/HarmonyRPS/",
            xLink: "https://x.com/MintbuilderES/status/2001304606429569067"
        },
        {
            id: 3,
            title: "Green Candle",
            description: "Navigate the volatile markets! A Snake-style game where you grow your portfolio by eating green candles. Don't crash!",
            image: "/Green candle.png",
            color: "bg-green-50",
            status: "Live",
            link: "https://mintbes.github.io/GreenCandle/",
            xLink: "https://x.com/MintbuilderES/status/2002042007338860894"
        }
    ];

    return (
        <section id="mintbes-arcade" className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-mintbes-100 text-mintbes-700 px-4 py-2 rounded-full mb-4">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Play & Earn</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
                        Mintbes <span className="text-mintbes-600">Arcade</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Experience the thrill of Harmony Web3 Gaming. Play, compete, and <span className="font-bold text-mintbes-600">earn $ONE</span> directly in your browser. Turn your skills into crypto rewards!
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 1, y: 0 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group flex flex-col"
                        >
                            {game.image ? (
                                <div className="mb-6 overflow-hidden rounded-xl">
                                    <img
                                        src={game.image}
                                        alt={game.title}
                                        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            ) : (
                                <div className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    {game.icon}
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">{game.title}</h3>
                                <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-green-100 text-green-700">
                                    {game.status}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-8 leading-relaxed flex-grow">
                                {game.description}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <a
                                    href={game.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center font-semibold text-mintbes-600 hover:text-mintbes-700 transition-colors group/link"
                                >
                                    Play Now
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </a>

                                {game.xLink && (
                                    <a
                                        href={game.xLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-black transition-colors"
                                        title="View announcement on X"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Arcade;
