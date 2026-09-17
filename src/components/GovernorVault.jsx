import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Vote, Users, ExternalLink, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GovernorVault = () => {
    const { t } = useTranslation();

    const valueCards = [
        {
            icon: ShieldCheck,
            title: t('vault.card1Title'),
            desc: t('vault.card1Desc'),
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
        },
        {
            icon: Vote,
            title: t('vault.card2Title'),
            desc: t('vault.card2Desc'),
            color: 'text-blue-600 bg-blue-50 border-blue-100'
        },
        {
            icon: Users,
            title: t('vault.card3Title'),
            desc: t('vault.card3Desc'),
            color: 'text-purple-600 bg-purple-50 border-purple-100'
        }
    ];

    const timelineSteps = [
        {
            num: '01',
            title: t('vault.step1Title'),
            desc: t('vault.step1Desc')
        },
        {
            num: '02',
            title: t('vault.step2Title'),
            desc: t('vault.step2Desc')
        },
        {
            num: '03',
            title: t('vault.step3Title'),
            desc: t('vault.step3Desc')
        }
    ];

    return (
        <section id="vault" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-0"></div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('vault.badge')}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        {t('vault.title')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                            {t('vault.titleHighlight')}
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {t('vault.description')}
                    </p>
                </motion.div>

                {/* 3 Pillars Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {valueCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.5 }}
                                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${card.color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {card.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {card.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Transition Flow Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="bg-gradient-to-br from-gray-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-emerald-500/20"
                >
                    <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-3">
                                <Layers className="w-5 h-5" />
                                <span>{t('vault.boxTitle')}</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                {t('vault.title')} {t('vault.titleHighlight')}
                            </h3>
                            <div className="space-y-6 mt-6">
                                {timelineSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                            {step.num}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-base">{step.title}</h4>
                                            <p className="text-gray-300 text-sm mt-1 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center max-w-sm w-full">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center mx-auto mb-4 border border-emerald-400/30">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold mb-2">Verified Governor Role</h4>
                            <p className="text-gray-300 text-xs mb-6 leading-relaxed">
                                Mintbes holds a formal governor role representing our delegators across the transition to Ethereum and generative AI.
                            </p>
                            <a
                                href="https://x.com/harmonyprotocol"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl transition text-sm shadow-lg shadow-emerald-500/30"
                            >
                                <span>{t('vault.ctaButton')}</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default GovernorVault;
