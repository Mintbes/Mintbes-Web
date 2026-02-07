import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calculator, CheckCircle2 } from 'lucide-react';

const StakingInfo = () => {
    return (
        <section id="staking" className="py-24 bg-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-mintbes-50/50 -skew-x-12 transform translate-x-20"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Simple Staking. <br />
                            <span className="text-mintbes-600">Transparent Rewards.</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Delegating is the smartest way to hold ONE. You help secure the network and earn compound interest on your crypto assets without technical headaches.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                "12%+ Annual Percentage Rate (APR)",
                                "Rewards paid mainly in ONE tokens",
                                "Unstake anytime (7-epoch unlocking period)",
                                "Full transparency on fees and performance"
                            ].map((text, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-mintbes-500 shrink-0" />
                                    <span className="text-gray-700 font-medium">{text}</span>
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition shadow-lg"
                        >
                            Start Staking Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </a>
                    </motion.div>

                    {/* Right: Steps/Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100"
                    >
                        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                            <div className="p-3 bg-mintbes-100/50 rounded-xl text-mintbes-600">
                                <Calculator className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">How to Delegate</h3>
                                <p className="text-sm text-gray-500">3 simple steps to start earning</p>
                            </div>
                        </div>

                        <div className="space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100"></div>

                            {[
                                {
                                    step: '1',
                                    title: 'Create a Wallet',
                                    desc: (
                                        <>
                                            Use MetaMask. Connect to Harmony Mainnet Shard 0 via{' '}
                                            <a
                                                href="https://chainlist.org/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-mintbes-600 hover:text-mintbes-700 font-semibold underline"
                                            >
                                                chainlist.org
                                            </a>.
                                        </>
                                    )
                                },
                                {
                                    step: '2',
                                    title: 'Get ONE Tokens',
                                    desc: 'You can buy ONE tokens on practically any CEX or DEX.'
                                },
                                {
                                    step: '3',
                                    title: 'Delegate to Mintbes',
                                    desc: 'Visit the staking dashboard and confirm your delegation.'
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="relative flex gap-6">
                                    <div className="w-8 h-8 bg-white border-2 border-mintbes-500 text-mintbes-600 rounded-full flex items-center justify-center font-bold z-10 shrink-0">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default StakingInfo;
