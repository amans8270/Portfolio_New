'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, Sparkles } from 'lucide-react';

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), { ssr: false });

const skills = ['React', 'Next.js', 'FastAPI', 'Java', 'LangChain', 'MongoDB', 'MySQL', 'Docker'];

export default function Hero() {
    return (
        <section
            id="about"
            className="relative min-h-screen flex items-center justify-center animated-bg overflow-hidden"
        >
            {/* 3D Scene */}
            <HeroScene />

            {/* Gradient orbs (CSS) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-sky-600/10 blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm mb-8"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Available for opportunities (Freelancing / Job)</span>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </motion.div>

                {/* Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
                >
                    Hi, I&apos;m{' '}
                    <span className="gradient-text">Aman Singh</span>
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-400 mb-6 max-w-2xl mx-auto"
                >
                    Full-Stack Developer &amp; AI Engineer — building{' '}
                    <span className="text-white font-medium">scalable products</span> and{' '}
                    <span className="text-white font-medium">intelligent systems</span>
                </motion.p>

                {/* Skills chips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-2 mb-10"
                >
                    {skills.map((skill, i) => (
                        <motion.span
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="px-3 py-1 text-xs rounded-full glass border border-white/10 text-slate-300"
                        >
                            {skill}
                        </motion.span>
                    ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex items-center justify-center flex-wrap gap-4 mb-12"
                >
                    <a
                        href="#projects"
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
                    >
                        View My Work
                    </a>
                    <a
                        href="#contact"
                        className="px-6 py-3 rounded-full glass border border-white/10 text-white hover:border-indigo-400/50 hover:bg-white/5 font-medium transition-all duration-200"
                    >
                        Get in Touch
                    </a>
                </motion.div>

                {/* Social links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-4"
                >
                    {[
                        { href: 'https://github.com/amans8270', icon: Github, label: 'GitHub' },
                        { href: 'https://www.linkedin.com/in/aman-singh-03571713a/', icon: Linkedin, label: 'LinkedIn' },
                        { href: 'mailto:amans8270@gmail.com', icon: Mail, label: 'Email' },
                    ].map(({ href, icon: Icon, label }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="p-3 rounded-xl glass border border-white/10 text-slate-400 hover:text-white hover:border-indigo-400/40 transition-all duration-200 hover:scale-110"
                        >
                            <Icon className="w-5 h-5" />
                        </a>
                    ))}
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <ArrowDown className="w-5 h-5" />
            </motion.div>
        </section>
    );
}
