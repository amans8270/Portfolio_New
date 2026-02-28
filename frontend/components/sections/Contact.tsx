'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Mail, User, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { sendContact } from '@/lib/api';

export default function Contact() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');
        try {
            await sendContact(form);
            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err: unknown) {
            setStatus('error');
            const axiosErr = err as { response?: { data?: { detail?: string } } };
            setErrorMsg(axiosErr?.response?.data?.detail || 'Failed to send. Please try again.');
        }
    };

    const inputClass =
        'w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 bg-transparent text-sm';

    return (
        <section id="contact" className="section-padding px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">Let&apos;s Talk</p>
                    <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Get in Touch</h2>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        Whether you have a role, project, or just want to connect — my inbox is always open.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="glass rounded-3xl border border-white/5 p-8 md:p-12"
                >
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <CheckCircle className="w-16 h-16 text-green-400" />
                            <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                            <p className="text-slate-400">I&apos;ll get back to you as soon as possible.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-4 px-6 py-2 rounded-xl glass border border-white/10 text-slate-300 hover:text-white text-sm transition-colors"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                                    <input
                                        id="contact-name"
                                        type="text"
                                        placeholder="Your name"
                                        required
                                        maxLength={100}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                                    <input
                                        id="contact-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                                <input
                                    id="contact-subject"
                                    type="text"
                                    placeholder="Subject"
                                    required
                                    maxLength={200}
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                            <textarea
                                id="contact-message"
                                placeholder="Your message..."
                                required
                                maxLength={2000}
                                rows={5}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                className={inputClass}
                            />

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 text-sm px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            <button
                                id="contact-submit"
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                            >
                                {status === 'loading' ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
