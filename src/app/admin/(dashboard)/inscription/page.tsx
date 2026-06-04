'use client';

import { useState } from 'react';
import { registerParticipant } from '@/app/actions/register';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, QrCode, CheckCircle2, UserPlus, Tag, AlertCircle } from 'lucide-react';

export default function AdminInscriptionPage() {
    const [hasEmail, setHasEmail] = useState('non');
    const [profession, setProfession] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<{ participantId: string; badgeCode: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await registerParticipant(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else if (result.participantId) {
            setSuccess({ participantId: result.participantId, badgeCode: result.badgeCode ?? '' });
            setLoading(false);
        }
    }

    function resetForm() {
        setSuccess(null);
        setError(null);
        setProfession('');
        setHasEmail('non');
    }

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all";

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* Header */}
            <div>
                <h1 className="font-archivo text-3xl italic uppercase tracking-tighter text-[#0A0A14]">
                    Inscrire un Participant
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Associez un badge physique pré-généré à un participant sur le terrain.
                </p>
            </div>

            <div className="max-w-2xl">

                {/* Succès */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-50 border border-green-200 rounded-3xl p-10 text-center space-y-6 mb-6"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={40} className="text-green-500" />
                            </div>
                            <div>
                                <h2 className="font-archivo text-2xl italic uppercase text-slate-900 tracking-tighter">
                                    Participant inscrit !
                                </h2>
                                <p className="text-slate-500 text-sm mt-2">Badge associé avec succès.</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 inline-block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Code du badge</p>
                                <p className="font-mono font-bold text-2xl text-[#0A0A14]">{success.badgeCode}</p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <a
                                    href={`/badge/${success.participantId}`}
                                    target="_blank"
                                    className="flex items-center gap-2 bg-[#0A0A14] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-all"
                                >
                                    <QrCode size={16} /> Voir le badge
                                </a>
                                <button
                                    onClick={resetForm}
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    <UserPlus size={16} /> Inscrire un autre
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Formulaire */}
                {!success && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                        {/* Bandeau info badge physique */}
                        <div className="px-8 py-5 bg-yellow-50 border-b border-yellow-100 flex items-start gap-4">
                            <Tag size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-black text-yellow-800 uppercase tracking-wide">Badge physique pré-généré</p>
                                <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
                                    Saisissez le code figurant au dos du badge remis au participant (ex: <span className="font-mono font-bold">FZ26-A001</span>). Ce badge doit être en statut <span className="font-bold">LIBRE</span> dans le pool.
                                </p>
                            </div>
                        </div>

                        <form action={handleSubmit} className="p-8 space-y-6">

                            {/* Mode fixé à agent */}
                            <input type="hidden" name="registrationMode" value="agent" />

                            {/* Erreur */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-start gap-3">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">{error}</p>
                                </div>
                            )}

                            {/* Code badge physique */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    Code du Badge Physique <span className="text-red-400">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="badgeCode"
                                    placeholder="FZ26-A001"
                                    className={inputClass + " uppercase font-mono font-bold text-lg tracking-widest"}
                                />
                            </div>

                            <div className="w-full h-px bg-slate-100" />

                            {/* Nom & Prénom */}
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        Nom de famille <span className="text-red-400">*</span>
                                    </label>
                                    <input required type="text" name="lastName" placeholder="Nom" minLength={2} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        Prénom <span className="text-red-400">*</span>
                                    </label>
                                    <input required type="text" name="firstName" placeholder="Prénom" minLength={2} className={inputClass} />
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

                            {profession === 'Autre' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2"
                                >
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        Précisez <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="otherProfession"
                                        placeholder="Décrivez l'activité"
                                        minLength={2}
                                        className={inputClass}
                                    />
                                </motion.div>
                            )}

                            {/* Email */}
                            <div className="space-y-3 p-5 bg-slate-50 rounded-2xl">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                                    Possède une adresse email ?
                                </label>
                                <div className="flex gap-3">
                                    {['non', 'oui'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setHasEmail(opt)}
                                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${hasEmail === opt
                                                ? 'bg-[#0A0A14] text-white border-[#0A0A14]'
                                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                                        >
                                            {opt === 'oui' ? '✓ Oui' : '✗ Non'}
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" name="hasEmail" value={hasEmail} />
                                {hasEmail === 'oui' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            Email <span className="text-red-400">*</span>
                                        </label>
                                        <input required type="email" name="email" placeholder="votre@email.com" className={inputClass} />
                                    </motion.div>
                                )}
                            </div>

                            {/* Bouton */}
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-yellow-400 text-black font-bold text-sm py-5 rounded-xl hover:bg-[#0A0A14] hover:text-white disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-md"
                            >
                                {loading
                                    ? <><Loader2 size={20} className="animate-spin" /> Enregistrement...</>
                                    : <><Tag size={20} /> Associer le badge et inscrire</>
                                }
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
