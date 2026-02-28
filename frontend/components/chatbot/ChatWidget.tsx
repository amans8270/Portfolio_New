'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const WELCOME_MSG: Message = {
    role: 'assistant',
    content: "👋 Hi! I'm Aman's AI assistant. Ask me anything about his skills, experience, or projects!",
};

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streaming]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    const getHistory = () =>
        messages
            .filter((m) => m.role !== 'assistant' || m.content !== WELCOME_MSG.content)
            .reduce<string[][]>((acc, msg, i, arr) => {
                if (msg.role === 'user' && arr[i + 1]?.role === 'assistant') {
                    acc.push([msg.content, arr[i + 1].content]);
                }
                return acc;
            }, []);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || streaming) return;

        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setStreaming(true);

        const botMessage: Message = { role: 'assistant', content: '' };
        setMessages((prev) => [...prev, botMessage]);

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, chat_history: getHistory() }),
            });

            if (!res.ok) throw new Error('Failed');

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const token = line.slice(6);
                        if (token === '[DONE]') break;
                        setMessages((prev) => {
                            const updated = [...prev];
                            updated[updated.length - 1] = {
                                ...updated[updated.length - 1],
                                content: updated[updated.length - 1].content + token,
                            };
                            return updated;
                        });
                    }
                }
            }
        } catch {
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: 'Sorry, I encountered an error. Please try again.',
                };
                return updated;
            });
        } finally {
            setStreaming(false);
        }
    };

    return (
        <>
            {/* FAB */}
            <motion.button
                id="chat-fab"
                onClick={() => setOpen(true)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-110 transition-transform ${open ? 'hidden' : 'flex'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open AI Chatbot"
            >
                <MessageCircle className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#030712] animate-pulse" />
            </motion.button>

            {/* Chat window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-80px)] flex flex-col rounded-2xl glass-strong border border-white/10 shadow-2xl shadow-black/60 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600/20 to-sky-600/20 border-b border-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Aman&apos;s AI</p>
                                    <p className="text-xs text-green-400">Online · Powered by GPT-4o mini</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    aria-label="Minimize"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-600/30">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center ${msg.role === 'assistant'
                                                ? 'bg-gradient-to-br from-indigo-500 to-sky-400'
                                                : 'bg-gradient-to-br from-slate-600 to-slate-500'
                                            }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        ) : (
                                            <User className="w-3.5 h-3.5 text-white" />
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'assistant'
                                                ? 'glass border border-white/5 text-slate-200 rounded-tl-sm'
                                                : 'bg-indigo-600 text-white rounded-tr-sm'
                                            }`}
                                    >
                                        {msg.content}
                                        {streaming && i === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
                                            <span className="flex gap-1 mt-1">
                                                {[0, 1, 2].map(j => (
                                                    <span key={j} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.1}s` }} />
                                                ))}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/5">
                            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-white/10 focus-within:border-indigo-500/40 transition-colors">
                                <input
                                    ref={inputRef}
                                    id="chat-input"
                                    type="text"
                                    placeholder="Ask anything about Aman..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    maxLength={500}
                                    disabled={streaming}
                                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
                                />
                                <button
                                    id="chat-send"
                                    onClick={sendMessage}
                                    disabled={!input.trim() || streaming}
                                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                                    aria-label="Send message"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-center text-xs text-slate-600 mt-2">AI answers about Aman only · Powered by RAG</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
