'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, Github, Star } from 'lucide-react';
import { getProjects } from '@/lib/api';

interface Project {
    id: string;
    title: string;
    description: string;
    tech_stack: string[];
    github_url?: string;
    live_url?: string;
    image_url?: string;
    featured: boolean;
    order: number;
}

const techColors: Record<string, string> = {
    'React': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    'Next.js': 'bg-white/5 text-white border-white/10',
    'FastAPI': 'bg-green-500/10 text-green-300 border-green-500/20',
    'Python': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    'TypeScript': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    'MongoDB': 'bg-green-600/10 text-green-400 border-green-600/20',
    'MySQL': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    'Java': 'bg-red-500/10 text-red-300 border-red-500/20',
    'LangChain': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    'Docker': 'bg-blue-600/10 text-blue-300 border-blue-600/20',
    'Tailwind CSS': 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    'default': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
};

function getTechColor(tech: string) {
    return techColors[tech] || techColors['default'];
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.article
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass rounded-2xl border border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 hover:glow-purple flex flex-col"
        >
            {/* Image or gradient placeholder */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-900/40 to-slate-900/60">
                {project.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-sky-500/30 border border-white/10 flex items-center justify-center">
                            <span className="text-3xl font-bold gradient-text">{project.title[0]}</span>
                        </div>
                    </div>
                )}
                {project.featured && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                    {project.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">{project.description}</p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {project.tech_stack.map((tech) => (
                        <span
                            key={tech}
                            className={`px-2 py-0.5 text-xs rounded-full border ${getTechColor(tech)}`}
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Links */}
                <div className="flex gap-3">
                    {project.github_url && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg glass border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
                        >
                            <Github className="w-3.5 h-3.5" />
                            Code
                        </a>
                    )}
                    {project.live_url && (
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-all"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Live Demo
                        </a>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

// Fallback projects shown before API loads
const FALLBACK_PROJECTS: Project[] = [
    {
        id: '1',
        title: '3D AI Portfolio Platform',
        description: 'Production-grade portfolio with 3D animations, AI chatbot (RAG), admin dashboard, JWT auth, and resume management.',
        tech_stack: ['Next.js', 'FastAPI', 'MongoDB', 'LangChain', 'React', 'Tailwind CSS'],
        github_url: 'https://github.com/amansingh',
        live_url: '#',
        featured: true,
        order: 0,
    },
    {
        id: '2',
        title: 'More Projects Coming',
        description: 'Aman is actively building more projects. Add them via the Admin Dashboard.',
        tech_stack: ['React', 'FastAPI', 'Python'],
        featured: false,
        order: 1,
    },
];

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        getProjects()
            .then((res) => {
                if (res.data.length > 0) setProjects(res.data);
            })
            .catch(() => { });
    }, []);

    return (
        <section id="projects" className="section-padding px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">Portfolio</p>
                    <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Featured Projects</h2>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        Real-world applications built with modern technology and a product-first mindset.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, i) => (
                        <ProjectCard key={project.id} project={project} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
