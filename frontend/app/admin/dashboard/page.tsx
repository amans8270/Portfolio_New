'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Plus, Trash2, Pencil, LogOut, Code2, FolderKanban,
    Upload, Save, X, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject, uploadResume, getResumeInfo } from '@/lib/api';

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

const emptyForm = {
    title: '',
    description: '',
    tech_stack_raw: '',
    github_url: '',
    live_url: '',
    image_url: '',
    featured: false,
    order: 0,
};

export default function AdminDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [resumeInfo, setResumeInfo] = useState<{ available: boolean; uploaded_at?: string } | null>(null);
    const [resumeUploading, setResumeUploading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) { router.push('/admin/login'); return; }
        loadProjects();
        loadResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadProjects = async () => {
        try {
            const res = await getProjects();
            setProjects(res.data);
        } catch { showToast('Failed to load projects', 'error'); }
        finally { setLoading(false); }
    };

    const loadResume = async () => {
        try { const r = await getResumeInfo(); setResumeInfo(r.data); } catch { /* noop */ }
    };

    const logout = () => { localStorage.removeItem('admin_token'); router.push('/admin/login'); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: form.title,
            description: form.description,
            tech_stack: form.tech_stack_raw.split(',').map(t => t.trim()).filter(Boolean),
            github_url: form.github_url || undefined,
            live_url: form.live_url || undefined,
            image_url: form.image_url || undefined,
            featured: form.featured,
            order: form.order,
        };
        try {
            if (editId) {
                await updateProject(editId, payload);
                showToast('Project updated!', 'success');
            } else {
                await createProject(payload);
                showToast('Project created!', 'success');
            }
            setForm(emptyForm);
            setEditId(null);
            setShowForm(false);
            loadProjects();
        } catch { showToast('Failed to save project', 'error'); }
    };

    const handleEdit = (p: Project) => {
        setForm({
            title: p.title,
            description: p.description,
            tech_stack_raw: p.tech_stack.join(', '),
            github_url: p.github_url || '',
            live_url: p.live_url || '',
            image_url: p.image_url || '',
            featured: p.featured,
            order: p.order,
        });
        setEditId(p.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this project?')) return;
        try {
            await deleteProject(id);
            showToast('Project deleted', 'success');
            loadProjects();
        } catch { showToast('Failed to delete', 'error'); }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setResumeUploading(true);
        try {
            await uploadResume(file);
            showToast('Resume uploaded!', 'success');
            loadResume();
        } catch { showToast('Failed to upload resume', 'error'); }
        finally { setResumeUploading(false); }
    };

    const inputClass = 'w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all bg-transparent';

    return (
        <div className="min-h-screen animated-bg">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm shadow-xl ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-60 glass border-r border-white/5 p-6 flex flex-col z-40 hidden md:flex">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center">
                        <Code2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold gradient-text">Admin Panel</span>
                </div>

                <nav className="flex-1 space-y-1">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
                        <FolderKanban className="w-4 h-4" /> Projects
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-colors">
                        <FileText className="w-4 h-4" /> Resume
                    </button>
                </nav>

                <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors mt-auto">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </aside>

            {/* Main content */}
            <main className="md:ml-60 p-6 md:p-10">
                {/* Mobile header */}
                <div className="flex items-center justify-between mb-8 md:hidden">
                    <span className="font-bold gradient-text">Admin Panel</span>
                    <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Page header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Projects</h1>
                        <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 && 's'} total</p>
                    </div>
                    <button
                        id="add-project-btn"
                        onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                    >
                        {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showForm ? 'Cancel' : 'Add Project'}
                    </button>
                </div>

                {/* Resume section */}
                <div className="glass rounded-2xl border border-white/5 p-6 mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-1">Resume</h2>
                            <p className="text-slate-400 text-sm">
                                {resumeInfo?.available
                                    ? `Active · Uploaded ${new Date(resumeInfo.uploaded_at!).toLocaleDateString()}`
                                    : 'No resume uploaded yet'}
                            </p>
                        </div>
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-white text-sm cursor-pointer transition-all">
                            <Upload className={`w-4 h-4 ${resumeUploading ? 'animate-bounce' : ''}`} />
                            {resumeUploading ? 'Uploading...' : 'Upload PDF'}
                            <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} disabled={resumeUploading} />
                        </label>
                    </div>
                </div>

                {/* Project form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl border border-indigo-500/20 p-6 mb-8"
                    >
                        <h2 className="text-lg font-semibold text-white mb-5">
                            {editId ? 'Edit Project' : 'New Project'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input id="project-title" required placeholder="Project title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
                                <input id="project-tech" required placeholder="Tech stack (comma separated)" value={form.tech_stack_raw} onChange={e => setForm({ ...form, tech_stack_raw: e.target.value })} className={inputClass} />
                            </div>
                            <textarea required placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="GitHub URL (optional)" value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} className={inputClass} />
                                <input placeholder="Live URL (optional)" value={form.live_url} onChange={e => setForm({ ...form, live_url: e.target.value })} className={inputClass} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className={inputClass} />
                                <input type="number" placeholder="Display order" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                                Mark as Featured
                            </label>
                            <button id="save-project-btn" type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                                <Save className="w-4 h-4" />
                                {editId ? 'Save Changes' : 'Create Project'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Projects table */}
                {loading ? (
                    <div className="text-center py-16 text-slate-400">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-16 glass rounded-2xl border border-white/5">
                        <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No projects yet. Add your first one!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projects.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass rounded-xl border border-white/5 p-5 flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-white truncate">{p.title}</h3>
                                        {p.featured && <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">Featured</span>}
                                    </div>
                                    <p className="text-slate-400 text-sm truncate">{p.description}</p>
                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                        {p.tech_stack.slice(0, 4).map(t => (
                                            <span key={t} className="px-2 py-0.5 text-xs rounded-full glass border border-white/10 text-slate-400">{t}</span>
                                        ))}
                                        {p.tech_stack.length > 4 && <span className="text-xs text-slate-500">+{p.tech_stack.length - 4}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-indigo-400 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
