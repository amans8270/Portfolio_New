import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import Projects from '@/components/sections/Projects';
import Resume from '@/components/sections/Resume';
import Contact from '@/components/sections/Contact';
import ChatWidget from '@/components/chatbot/ChatWidget';
import { Github, Linkedin, Code2, Mail } from 'lucide-react';

export default function HomePage() {
    return (
        <>
            <Navbar />

            <main>
                <Hero />
                <Projects />
                <Resume />
                <Contact />
            </main>

            <footer className="border-t border-white/5 py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center">
                            <Code2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold gradient-text">Aman Singh</span>
                    </div>
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} · Built with Next.js, FastAPI &amp; LangChain
                    </p>
                    <div className="flex items-center gap-3">
                        {[
                            { href: 'https://github.com/amans8270', icon: Github, label: 'GitHub' },
                            { href: 'https://www.linkedin.com/in/aman-singh-03571713a/', icon: Linkedin, label: 'LinkedIn' },
                            { href: 'mailto:amans8270@gmail.com', icon: Mail, label: 'Email' },
                        ].map(({ href, icon: Icon }) => (
                            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg glass border border-white/5 text-slate-500 hover:text-white hover:border-white/15 transition-all">
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </footer>

            {/* Floating AI Chatbot */}
            <ChatWidget />
        </>
    );
}
