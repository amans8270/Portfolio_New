'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { getResumeInfo, getResumeDownloadUrl } from '@/lib/api';

export default function Resume() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [available, setAvailable] = useState(false);
    const [uploadedAt, setUploadedAt] = useState<string | null>(null);

    useEffect(() => {
        getResumeInfo()
            .then((res) => {
                setAvailable(res.data.available);
                if (res.data.uploaded_at) setUploadedAt(res.data.uploaded_at);
            })
            .catch(() => { });
    }, []);

    const highlights = [
        'B.Tech Computer Science',
        'React + Next.js 14 Expert',
        'FastAPI & Python Backend',
        'LangChain / AI Integration',
        'System Design & Scalability',
        'Open to Full-time & Internships',
    ];

    return (
        <section id="resume" className="section-padding px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">Credentials</p>
                    <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Resume</h2>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        A summary of my skills, experience, and achievements — ready to download.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="glass rounded-3xl border border-white/5 p-8 md:p-12"
                >
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-sky-600/30 border border-indigo-500/30 flex items-center justify-center glow-purple">
                            <FileText className="w-14 h-14 text-indigo-300" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">Aman Singh</h3>
                            <p className="text-slate-400 mb-5">Software Developer · Full-Stack · AI/ML</p>

                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {highlights.map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            {available ? (
                                <a
                                    href={getResumeDownloadUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:scale-105"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Resume (PDF)
                                </a>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10 text-slate-400 text-sm">
                                    Resume upload coming soon
                                </div>
                            )}
                            {uploadedAt && (
                                <p className="mt-2 text-xs text-slate-500">
                                    Last updated: {new Date(uploadedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
