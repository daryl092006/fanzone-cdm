'use client';

import { useState, useEffect } from 'react';
import { registerParticipant } from '@/app/actions/register';
import { getMatchesAndPredictions, submitPrediction } from '@/app/actions/predictions';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, UserPlus, AlertCircle, Trophy, Calendar, Zap } from 'lucide-react';

export default function AdminInscriptionPage() {
    const [hasEmail, setHasEmail] = useState('non');
    const [profession, setProfession] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<{ participantId: string; badgeCode: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // États pour la saisie des pronostics à la volée
    const [matches, setMatches] = useState<any[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [matchesError, setMatchesError] = useState<string | null>(null);
    const [predInputs, setPredInputs] = useState<Record<string, { home: number; away: number }>>({});
    const [submittingPrediction, setSubmittingPrediction] = useState<string | null>(null);
    const [predictionSuccess, setPredictionSuccess] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (success?.participantId) {
            loadMatchesForParticipant(success.participantId);
        }
    }, [success]);

    async function loadMatchesForParticipant(id: string) {
        setLoadingMatches(true);
        setMatchesError(null);
        try {
            const res = await getMatchesAndPredictions(id);
            if (res.success && res.matches) {
                // Uniquement les matchs à venir (UPCOMING) sans équipes fictives
                const upcoming = res.matches.filter((m: any) => 
                    m.status === 'UPCOMING' && 
                    new Date() < new Date(m.matchDate) &&
                    !m.teamHome.toLowerCase().includes('gr.') && 
                    !m.teamAway.toLowerCase().includes('gr.') &&
                    !m.teamHome.toLowerCase().includes('vq.') &&
                    !m.teamAway.toLowerCase().includes('vq.')
                );
                setMatches(upcoming);
                
                // Pré-remplir les inputs
                const inputs: Record<string, { home: number; away: number }> = {};
                upcoming.forEach((m: any) => {
                    inputs[m.id] = {
                        home: m.prediction?.predScoreHome ?? 0,
                        away: m.prediction?.predScoreAway ?? 0
                    };
                });
                setPredInputs(inputs);
            } else {
                setMatchesError(res.error || "Erreur de chargement des matchs.");
            }
        } catch (err) {
            setMatchesError("Erreur de chargement des matchs.");
        } finally {
            setLoadingMatches(false);
        }
    }

    const updateLocalInput = (matchId: string, side: 'home' | 'away', val: number) => {
        const current = predInputs[matchId] || { home: 0, away: 0 };
        const newVal = Math.max(0, current[side] + val);
        setPredInputs(prev => ({
            ...prev,
            [matchId]: {
                ...current,
                [side]: newVal
            }
        }));
    };

    async function handlePredict(matchId: string, homeScore: number, awayScore: number) {
        if (!success?.participantId) return;
        setSubmittingPrediction(matchId);
        try {
            const res = await submitPrediction(success.participantId, matchId, homeScore, awayScore);
            if (res.success) {
                setPredictionSuccess(prev => ({ ...prev, [matchId]: true }));
                setTimeout(() => {
                    setPredictionSuccess(prev => ({ ...prev, [matchId]: false }));
                }, 3000);
                loadMatchesForParticipant(success.participantId);
            } else {
                alert(res.error || "Erreur lors de l'enregistrement.");
            }
        } catch (err) {
            alert("Une erreur s'est produite.");
        } finally {
            setSubmittingPrediction(null);
        }
    }

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
        setMatches([]);
        setPredInputs({});
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
                    Enregistrer manuellement un nouveau participant sur place.
                </p>
            </div>

            <div className="max-w-2xl">

                {/* Succès */}
                <AnimatePresence>
                    {success && (
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-200 rounded-3xl p-10 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={40} className="text-green-500" />
                                </div>
                                <div>
                                    <h2 className="font-archivo text-2xl italic uppercase text-slate-900 tracking-tighter">
                                        Participant inscrit !
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-2">Le participant a été inscrit avec succès dans le système.</p>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={resetForm}
                                        className="flex items-center gap-2 bg-[#0A0A14] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-all"
                                    >
                                        <UserPlus size={16} /> Inscrire un autre
                                    </button>
                                </div>
                            </motion.div>

                            {/* Section de pronostics immédiats */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm"
                            >
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-600">
                                        <Trophy size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-archivo text-lg italic uppercase text-slate-900 tracking-tight">Pronostics du jour</h3>
                                        <p className="text-xs text-slate-400">Enregistrer immédiatement les pronostics de ce participant.</p>
                                    </div>
                                </div>

                                {loadingMatches ? (
                                    <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-xs font-bold">
                                        <Loader2 size={16} className="animate-spin text-yellow-500" /> Chargement des matchs...
                                    </div>
                                ) : matchesError ? (
                                    <p className="text-xs text-red-500 text-center">{matchesError}</p>
                                ) : matches.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center italic py-4">Aucun match à venir ouvert aux pronostics aujourd'hui.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {matches.map((m) => {
                                            const currentInput = predInputs[m.id] || { home: 0, away: 0 };
                                            const isSaved = !!m.prediction || predictionSuccess[m.id];

                                            return (
                                                <div key={m.id} className="border border-slate-100 rounded-2xl p-4 space-y-4 hover:border-slate-200 transition-all">
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {new Date(m.matchDate).toLocaleDateString('fr-FR', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                timeZone: 'Africa/Lome'
                                                            })}
                                                        </span>
                                                        {isSaved && (
                                                            <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                                                Enregistré
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="text-sm font-bold text-slate-800 w-1/3 truncate text-left">{m.teamHome}</div>
                                                        
                                                        {/* Score home */}
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateLocalInput(m.id, 'home', -1)}
                                                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-5 text-center font-bold text-sm font-mono text-slate-900">{currentInput.home}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateLocalInput(m.id, 'home', 1)}
                                                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <div className="text-xs font-mono font-bold text-slate-300">VS</div>

                                                        {/* Score away */}
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateLocalInput(m.id, 'away', -1)}
                                                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-5 text-center font-bold text-sm font-mono text-slate-900">{currentInput.away}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateLocalInput(m.id, 'away', 1)}
                                                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <div className="text-sm font-bold text-slate-800 w-1/3 truncate text-right">{m.teamAway}</div>
                                                    </div>

                                                    <div className="flex justify-end pt-1">
                                                        <button
                                                            onClick={() => handlePredict(m.id, currentInput.home, currentInput.away)}
                                                            disabled={submittingPrediction === m.id}
                                                            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm ${
                                                                isSaved 
                                                                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                                                                    : 'bg-yellow-400 text-black hover:bg-black hover:text-white'
                                                            }`}
                                                        >
                                                            {submittingPrediction === m.id ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                <Zap size={12} />
                                                            )}
                                                            {isSaved ? 'Modifier' : 'Valider'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Formulaire */}
                {!success && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                        <form action={handleSubmit} className="p-8 space-y-6">

                            {/* Mode fixé à online pour générer automatiquement le badge virtuel */}
                            <input type="hidden" name="registrationMode" value="online" />
                            <input type="hidden" name="isAdminRegistration" value="true" />

                            {/* Erreur */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-start gap-3">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">{error}</p>
                                </div>
                            )}

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

                            {/* Code Agent / Partenaire */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    Code Agent / Présence (ex: escen)
                                </label>
                                <input
                                    type="text"
                                    name="agentCode"
                                    placeholder="Saisir 'escen' ou 'ecen' pour marquer présent"
                                    className={inputClass}
                                />
                            </div>

                            {/* Bouton */}
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-yellow-400 text-black font-bold text-sm py-5 rounded-xl hover:bg-[#0A0A14] hover:text-white disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-md"
                            >
                                {loading
                                    ? <><Loader2 size={20} className="animate-spin" /> Enregistrement...</>
                                    : <><UserPlus size={20} /> Inscrire le participant</>
                                }
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
