'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { registerParticipant } from '../actions/register';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, QrCode, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function InscriptionPage() {
    const [hasEmail, setHasEmail] = useState('non');
    const [profession, setProfession] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await registerParticipant(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else if (result.participantId) {
            setSuccess(true);
            setTimeout(() => {
                router.push(`/badge/${result.participantId}`);
            }, 1800);
        }
    }

    const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all";

    return (
        <div className="min-h-screen bg-slate-50 font-space selection:bg-yellow-200">

            {/* Header */}
            <div className="px-6 py-4 lg:px-16 border-b border-slate-200 bg-white shadow-sm">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <Link href="/" className="group flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retour
                    </Link>
                    <div className="flex items-center gap-3">
                        <Image src="/logo-adn.png" alt="ADN" width={48} height={48} className="object-contain" />
                        <div className="w-px h-6 bg-slate-200"></div>
                        <Image src="/logo-escen.png" alt="ESCEN" width={64} height={28} className="object-contain" />
                        <div className="w-px h-6 bg-slate-200"></div>
                        <Image src="/logo-mairie.png" alt="Mairie" width={56} height={28} className="object-contain" />
                    </div>
                </div>
            </div>

            {/* Bandeau institutionnel */}
            <div className="px-6 py-3 lg:px-16 border-b border-slate-200 bg-slate-100">
                <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Fan Zone Coupe du Monde 2026 · <span className="text-yellow-600 font-black">Mairie du Golfe 1 × ADN × ESCEN</span>
                </p>
            </div>

            {/* Contenu */}
            <div className="py-12 px-6">
                <div className="max-w-lg mx-auto space-y-8">

                    {/* En-tête */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-3"
                    >
                        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-700 px-4 py-2 rounded-full mb-2">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Accès Gratuit · Officiel</span>
                        </div>
                        <h1 className="font-archivo text-3xl md:text-4xl italic tracking-tighter uppercase text-slate-900">
                            Inscription <span className="text-yellow-500">Supporter</span>
                        </h1>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Créez votre badge d&apos;accès en moins d&apos;une minute. Aucun email requis.
                        </p>
                    </motion.div>

                    {/* État Succès */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-200 rounded-3xl p-10 text-center space-y-4"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={36} className="text-green-500" />
                                </div>
                                <h2 className="font-archivo text-2xl italic uppercase text-slate-900 tracking-tighter">Inscription réussie !</h2>
                                <p className="text-sm text-slate-500">Votre badge est en cours de génération…</p>
                                <div className="flex justify-center">
                                    <Loader2 size={20} className="animate-spin text-yellow-500" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Formulaire */}
                    {!success && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl shadow-xl shadow-slate-200 overflow-hidden border border-slate-100"
                        >
                            <form action={handleSubmit} className="p-8 md:p-10 space-y-6">

                                {/* Mode fixé à online — caché */}
                                <input type="hidden" name="registrationMode" value="online" />

                                {/* Erreur */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-start gap-3">
                                        <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
                                        <p className="leading-relaxed">{error}</p>
                                    </div>
                                )}

                                {/* Nom & Prénom */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            Nom de famille <span className="text-red-400">*</span>
                                        </label>
                                        <input required type="text" name="lastName" placeholder="Votre nom" minLength={2} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            Prénom <span className="text-red-400">*</span>
                                        </label>
                                        <input required type="text" name="firstName" placeholder="Votre prénom" minLength={2} className={inputClass} />
                                    </div>
                                </div>

                                {/* Téléphone */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        Numéro de téléphone <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        placeholder="90 00 00 00"
                                        pattern="[\d\s\-\+]{8,15}"
                                        className={inputClass}
                                    />
                                    <p className="text-[10px] text-slate-400 pl-1">
                                        Utilisé pour l&apos;identification à l&apos;entrée. Ne peut pas être changé après inscription.
                                    </p>
                                </div>

                                {/* Profession */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        Profession / Statut <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        required
                                        name="profession"
                                        value={profession}
                                        onChange={(e) => setProfession(e.target.value)}
                                        className={inputClass + " appearance-none cursor-pointer"}
                                    >
                                        <option value="">Sélectionner...</option>
                                        <option value="Étudiant">Étudiant(e)</option>
                                        <option value="Élève / Lycéen">Élève / Lycéen(ne)</option>
                                        <option value="Fonctionnaire">Fonctionnaire</option>
                                        <option value="Salarié du privé">Salarié(e) du privé</option>
                                        <option value="Entrepreneur">Entrepreneur / Commerçant(e)</option>
                                        <option value="Artisan">Artisan</option>
                                        <option value="Profession libérale">Profession libérale</option>
                                        <option value="Sans emploi">Sans emploi</option>
                                        <option value="Retraité">Retraité(e)</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>

                                {/* Précision si Autre */}
                                {profession === 'Autre' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            Précisez votre activité <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            name="otherProfession"
                                            placeholder="Décrivez votre activité"
                                            minLength={2}
                                            className={inputClass}
                                        />
                                        <p className="text-[10px] text-slate-400 pl-1">Cette valeur sera affichée sur votre badge.</p>
                                    </motion.div>
                                )}

                                {/* Email Toggle */}
                                <div className="space-y-3 p-5 bg-slate-50 rounded-2xl">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                                        Possédez-vous une adresse email ?
                                    </label>
                                    <div className="flex gap-3">
                                        {['non', 'oui'].map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setHasEmail(opt)}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${hasEmail === opt
                                                    ? 'bg-[#0A0A14] text-white border-[#0A0A14] shadow-md'
                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                                            >
                                                {opt === 'oui' ? '✓ Oui' : '✗ Non'}
                                            </button>
                                        ))}
                                    </div>
                                    <input type="hidden" name="hasEmail" value={hasEmail} />

                                    {hasEmail === 'oui' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2 pt-2"
                                        >
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Adresse Email <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                placeholder="votre@email.com"
                                                className={inputClass}
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Consentement */}
                                <div className="flex items-start gap-4 p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                                    <input
                                        required
                                        type="checkbox"
                                        id="consent"
                                        className="mt-0.5 h-5 w-5 rounded accent-yellow-600 cursor-pointer shrink-0"
                                    />
                                    <label htmlFor="consent" className="text-xs text-yellow-800 leading-relaxed cursor-pointer">
                                        Je confirme que mes informations sont exactes et complètes. J&apos;accepte les conditions d&apos;accès à la Fan Zone Coupe du Monde 2026. Je sais que mon badge est personnel et doit être présenté à chaque entrée.
                                        <span className="text-red-500"> *</span>
                                    </label>
                                </div>

                                {/* Bouton */}
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-yellow-400 text-black font-bold text-sm py-5 rounded-xl hover:bg-[#0A0A14] hover:text-white disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-400/20"
                                >
                                    {loading
                                        ? <><Loader2 size={20} className="animate-spin" /> Vérification en cours...</>
                                        : <><QrCode size={20} /> Créer mon Badge Gratuit</>
                                    }
                                </button>

                                <p className="text-center text-[10px] text-slate-400">
                                    Les champs marqués d&apos;un <span className="text-red-400">*</span> sont obligatoires.
                                </p>

                            </form>
                        </motion.div>
                    )}

                    <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        © 2026 Mairie du Golfe 1 · ADN × ESCEN
                    </p>
                </div>
            </div>
        </div>
    );
}
