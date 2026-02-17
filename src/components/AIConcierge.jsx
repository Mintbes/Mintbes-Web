import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const renderMarkdown = (text) => {
    if (!text) return null;

    // Handle links: [text](url)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        // Add the link element
        parts.push(
            <a
                key={match.index}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mintbes-600 hover:text-mintbes-700 underline font-bold"
            >
                {match[1]}
            </a>
        );

        lastIndex = linkRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    // Now handle bold within the parts
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
            boldParts.push(<strong key={bMatch.index}>{bMatch[1]}</strong>);
            bLastIndex = boldRegex.lastIndex;
        }

        if (bLastIndex < part.length) {
            boldParts.push(part.substring(bLastIndex));
        }

        return <React.Fragment key={i}>{boldParts}</React.Fragment>;
    });
};

const AIConcierge = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '¿En qué puedo ayudarte hoy? 🌿 / How can I help you today? 🌿'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Call the Vercel serverless function
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Add AI response to chat
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, there was an error processing your message. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-mintbes-600 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-mintbes-700 transition-colors"
                aria-label="Open AI Chat Assistant"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageCircle className="w-6 h-6" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-mintbes-600 to-mintbes-700 text-white p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-2xl">🌿</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">Mintbes AI Assistant</h3>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-mintbes-600 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 rounded-bl-sm shadow-md border border-gray-100'
                                            }`}
                                    >
                                        <div className="text-sm">
                                            {msg.role === 'assistant' ? (
                                                <div className="space-y-2">
                                                    {msg.content.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                                                        <p key={i} className="leading-relaxed text-gray-800">
                                                            {renderMarkdown(line)}
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-mintbes-600" />
                                        <p className="text-sm text-gray-500">Thinking...</p>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me about delegation..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-mintbes-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="bg-mintbes-600 text-white p-2 rounded-full hover:bg-mintbes-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Send message"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                AI-generated responses. Verify important information.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIConcierge;
