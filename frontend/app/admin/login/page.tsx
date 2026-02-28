'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Code2 } from 'lucide-react';
import { adminLogin } from '@/lib/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await adminLogin(email, password);
            localStorage.setItem('admin_token', res.data.access_token);
            router.push('/admin/dashboard');
        } catch {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all duration-200 bg-transparent text-sm';

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold gradient-text">Portfolio Admin</span>
                </div>

                <div className="glass rounded-2xl border border-white/5 p-8">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mx-auto mb-5">
                        <Lock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-white mb-1">Admin Login</h1>
                    <p className="text-slate-400 text-sm text-center mb-6">Restricted access · Portfolio management</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                            <input
                                id="admin-email"
                                type="email"
                                placeholder="Admin email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                            <input
                                id="admin-password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClass} pl-10 pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        <button
                            id="admin-login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium transition-all duration-200 disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
