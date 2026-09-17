import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Sparkles, MessageSquare, Bot, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const renderMarkdown = (text) => {
    if (!text) return null;

    // Handle links: [text](url)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        parts.push(
            <a
                key={match.index}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
            >
                {match[1]}
            </a>
        );

        lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.map((part, i) => {
        if (typeof part !== 'string') return part;

        const boldRegex = /\*\*(.*?)\*\*/g;
        const boldParts = [];
        let bLastIndex = 0;
        let bMatch;

        while ((bMatch = boldRegex.exec(part)) !== null) {
            if (bMatch.index > bLastIndex) {
                boldParts.push(part.substring(bLastIndex, bMatch.index));
            }
            boldParts.push(<strong key={bMatch.index} className="text-white font-bold">{bMatch[1]}</strong>);
            bLastIndex = boldRegex.lastIndex;
        }

        if (bLastIndex < part.length) {
            boldParts.push(part.substring(bLastIndex));
        }

        return <React.Fragment key={i}>{boldParts}</React.Fragment>;
    });
};

const AIConcierge = () => {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: t('ai.initialMessage')
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Sync initial assistant message when language changes if only 1 message exists
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === 'assistant') {
            setMessages([
                {
                    role: 'assistant',
                    content: t('ai.initialMessage')
                }
            ]);
        }
    }, [i18n.language, t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (customText = null) => {
        const textToSend = (customText || inputMessage).trim();
        if (!textToSend || isLoading) return;

        setInputMessage('');

        setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
        setIsLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: textToSend,
                    lang: i18n.language || 'en'
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Failed to get response';
                const errorDetails = errorData.details ? ` (${errorData.details})` : '';
                throw new Error(`${errorMessage}${errorDetails}`);
            }

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response
            }]);
        } catch (error) {
            console.error('Error:', error);
            let displayError = '❌ Error al procesar tu consulta. Inténtalo de nuevo en unos momentos.';

            if (error.name === 'AbortError') {
                displayError = '⏳ La solicitud tardó demasiado. El servidor o la IA están ocupados. Por favor, reintenta.';
            } else if (error.message) {
                displayError = `❌ ${error.message}`;
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: displayError
            }]);
        } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickPills = [
        t('ai.quickPill1'),
        t('ai.quickPill2'),
        t('ai.quickPill3')
    ];

    return (
        <section id="ai-assistant" className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('ai.badge')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                        {t('ai.title')}
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        {t('ai.subtitle')}
                    </p>
                </div>

                {/* Main Integrated Chat Window */}
                <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                    {/* Top Bar with Quick Prompt Pills */}
                    <div className="p-4 md:p-6 border-b border-slate-800/80 bg-slate-950/50">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Temas rápidos / Quick topics:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {quickPills.map((pill, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(pill.replace(/^[^\w¿?]+/u, '').trim())}
                                    disabled={isLoading}
                                    className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/70 hover:border-emerald-500/60 hover:bg-slate-800/80 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                    {pill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="p-4 md:p-6 space-y-4 min-h-[260px] max-h-[420px] overflow-y-auto">
                        {messages.map((msg, index) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div
                                    key={index}
                                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isUser && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            isUser
                                                ? 'bg-emerald-600 text-white rounded-tr-xs shadow-md shadow-emerald-950/40'
                                                : 'bg-slate-900/90 text-slate-200 rounded-tl-xs border border-slate-800 shadow-sm'
                                        }`}
                                    >
                                        {!isUser ? (
                                            <div className="space-y-2">
                                                {msg.content.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                                                    <p key={i}>{renderMarkdown(line)}</p>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>

                                    {isUser && (
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                                            <User className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-slate-900 border border-slate-800 text-slate-400 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                    <span>{t('ai.thinking')}</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-950">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={t('ai.placeholder')}
                                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputMessage.trim() || isLoading}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-emerald-500/20 cursor-pointer"
                                aria-label="Send message"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2 text-center">
                            {t('ai.disclaimer')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIConcierge;
