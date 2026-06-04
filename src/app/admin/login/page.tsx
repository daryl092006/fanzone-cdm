'use client';

import { useState } from 'react';
import { login } from '@/app/actions/auth';
import Image from 'next/image';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // Si succès → redirect() dans l'action gère la navigation
    }

    return (
        <div className="min-h-screen bg-[#0A0A14] flex items-center justify-center px-4">

            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-violet-900/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md space-y-8">

                {/* Logo */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center">
                            <ShieldCheck size={28} className="text-yellow-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="font-archivo text-2xl text-white italic uppercase tracking-tighter">
                            Espace Administrateur
                        </h1>
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-1">
                            Ici c&apos;est le Mondial · Accès Restreint
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6">

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-black text-white/40 uppercase tracking-widest">
                                Adresse email
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                    <Mail size={16} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="admin@fanzone2026.tg"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-xs font-black text-white/40 uppercase tracking-widest">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                    <Lock size={16} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition-all"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            id="login-submit-btn"
                            className="w-full bg-yellow-400 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-white/5 text-center">
                        <p className="text-xs text-white/20">
                            Accès réservé au personnel autorisé.<br />
                            Problème de connexion ? Contactez l&apos;administrateur système.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 opacity-60">
                    <Image src="/logo-adn.png" alt="ADN" width={64} height={32} className="object-contain" />
                    <span className="text-white/20 text-xs">×</span>
                    <Image src="/logo-escen.png" alt="ESCEN" width={72} height={32} className="object-contain" />
                    <span className="text-white/20 text-xs">×</span>
                    <Image src="/logo-mairie.png" alt="Mairie" width={72} height={32} className="object-contain" />
                </div>
            </div>
        </div>
    );
}
