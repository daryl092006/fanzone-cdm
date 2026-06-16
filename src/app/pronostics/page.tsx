'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginParticipant, getMatchesAndPredictions, submitPrediction, AuthParticipant } from '@/app/actions/predictions';
import { Trophy, ArrowLeft, Loader2, LogOut, CheckCircle2, AlertCircle, Calendar, Award, Zap, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function isPlaceholderTeam(name: string | null | undefined): boolean {
    if (!name) return true;
    const n = name.toLowerCase();
    return n.includes('gr.') || n.startsWith('vq.') || n.startsWith('perd.') || n === 'tbd' || n === 'tbc';
}

export default function PronosticsPage() {
    const [identifier, setIdentifier] = useState('');
    const [participant, setParticipant] = useState<AuthParticipant | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [predInputs, setPredInputs] = useState<Record<string, { home: number; away: number }>>({});

    // Charger le participant depuis localStorage
    useEffect(() => {
        const saved = localStorage.getItem('fz26_participant');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setParticipant(parsed);
                fetchData(parsed.id);
            } catch (e) {
                localStorage.removeItem('fz26_participant');
            }
        }
    }, []);

    const fetchData = async (id: string) => {
        setLoading(true);
        const res = await getMatchesAndPredictions(id);
        if (res.success && res.matches) {
            setMatches(res.matches);
        } else {
            setError(res.error || "Impossible de récupérer les matchs.");
        }
        setLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return;
        setLoading(true);
        setError(null);

        const res = await loginParticipant(identifier);
        if (res.success && res.participant) {
            setParticipant(res.participant);
            localStorage.setItem('fz26_participant', JSON.stringify(res.participant));
            await fetchData(res.participant.id);
        } else {
            setError(res.error || "Une erreur est survenue.");
        }
        setLoading(false);
    };

    const handleLogout = () => {
        setParticipant(null);
        setMatches([]);
        localStorage.removeItem('fz26_participant');
    };

    const handlePredict = async (matchId: string, homeScore: number, awayScore: number) => {
        if (!participant) return;
        setSubmitting(matchId);
        setError(null);
        setSuccessMessage(null);

        const res = await submitPrediction(participant.id, matchId, homeScore, awayScore);
        if (res.success) {
            setSuccessMessage("Votre pronostic a été enregistré avec succès !");
            await fetchData(participant.id);
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            setError(res.error || "Une erreur s'est produite.");
        }
        setSubmitting(null);
    };

    const updateLocalInput = (matchId: string, side: 'home' | 'away', val: number) => {
        const current = predInputs[matchId] || { home: 0, away: 0 };
        const newVal = Math.max(0, current[side] + val);
        setPredInputs({ ...predInputs, [matchId]: { ...current, [side]: newVal } });
    };

    // Grouper les matchs par jour (heure de Lomé = UTC+0)
    const matchesByDay = useMemo(() => {
        const grouped: { label: string; matches: any[] }[] = [];
        const seen: Record<string, number> = {};
        for (const m of matches) {
            const dayKey = new Date(m.matchDate).toLocaleDateString('fr-FR', {
                timeZone: 'Africa/Lome',
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
            if (seen[dayKey] === undefined) {
                seen[dayKey] = grouped.length;
                grouped.push({ label: dayKey, matches: [] });
            }
            grouped[seen[dayKey]].matches.push(m);
        }
        return grouped;
    }, [matches]);

    return (
        <div className="min-h-screen bg-[#0A0A14] text-white font-space py-12 px-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-4xl mb-12 flex justify-between items-center border-b border-white/5 pb-6">
                <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-yellow-400 transition-colors uppercase tracking-widest">
                    <ArrowLeft size={14} /> Accueil
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-archivo text-xs italic uppercase tracking-wider">
                        <Trophy size={14} /> Espace Pronostics
                    </div>
                </div>
            </div>

            <main className="w-full max-w-4xl flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {!participant ? (
                        /* ================= PORTAIL CONNEXION ================= */
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-md w-full mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
                        >
                            <div className="text-center space-y-2">
                                <h1 className="font-archivo text-3xl italic uppercase tracking-tight text-white">
                                    Vos <span className="text-yellow-400">Pronostics</span>
                                </h1>
                                <p className="text-sm text-slate-400">
                                    Faites vos pronostics et participez au tirage au sort des gagnants !
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        N° Téléphone
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 90 00 00 00"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full bg-[#14142B] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-yellow-400 text-black hover:bg-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/10"
                                >
                                    {loading ? (
                                        <><Loader2 size={16} className="animate-spin" /> Connexion...</>
                                    ) : (
                                        <>Accéder aux matchs <ChevronRight size={16} /></>
                                    )}
                                </button>
                            </form>

                            <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-500">
                                Pas encore inscrit ?{" "}
                                <Link href="/inscription" className="text-yellow-400 hover:underline">
                                    Créez votre Pass gratuit
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        /* ================= ESPACE PRONOSTICS ================= */
                        <motion.div
                            key="pronostics-dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            {/* Profil Supporter */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supporter Officiel</p>
                                        <h2 className="font-archivo text-xl italic uppercase text-white">
                                            {participant.firstName} {participant.lastName}
                                        </h2>
                                        <p className="text-xs text-slate-500 font-mono">Tél: {participant.phone}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/10 border border-white/5 px-4 py-2.5 rounded-xl"
                                >
                                    <LogOut size={14} /> Déconnexion
                                </button>
                            </div>

                            {/* Warning présence */}
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-5 rounded-2xl text-xs space-y-1">
                                <p className="font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                    <AlertCircle size={14} className="text-amber-400" /> Règle importante pour les tirages au sort
                                </p>
                                <p className="text-slate-300 leading-relaxed">
                                    Même si votre pronostic est exact, <strong>vous devez obligatoirement être présent à la Fan Zone le jour du match</strong> (avec votre numéro enregistré par nos agents à l'entrée). En cas d'absence physique sur place le jour du match, le tirage au sort pronostic est annulé pour vous et un nouveau gagnant sera tiré.
                                </p>
                            </div>

                            {/* Notifications */}
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2"
                                >
                                    <CheckCircle2 size={16} />
                                    <span>{successMessage}</span>
                                </motion.div>
                            )}

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Grille des matchs groupés par jour */}
                            <div className="space-y-10">
                                <h3 className="font-archivo text-lg italic uppercase text-slate-400 tracking-wider">
                                    Grille des Pronostics
                                </h3>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 text-sm">
                                        <Loader2 size={32} className="animate-spin text-yellow-400" />
                                        Chargement des matchs...
                                    </div>
                                ) : matches.length === 0 ? (
                                    <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 text-slate-400 text-sm">
                                        Aucun match programmé pour le moment.
                                    </div>
                                ) : (
                                    matchesByDay.map(({ label, matches: dayMatches }) => (
                                        <div key={label} className="space-y-4">
                                            {/* En-tête du jour */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full">
                                                    <Calendar size={13} />
                                                    <span className="text-xs font-black uppercase tracking-widest capitalize">{label}</span>
                                                </div>
                                                <div className="flex-1 h-px bg-white/5" />
                                            </div>

                                            {/* Matchs du jour */}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {dayMatches.map((m: any) => {
                                                    const isUpcoming = m.status === 'UPCOMING' && new Date() < new Date(m.matchDate);
                                                    const isPlaceholder = isPlaceholderTeam(m.teamHome) || isPlaceholderTeam(m.teamAway);
                                                    const currentInput = predInputs[m.id] || {
                                                        home: m.prediction?.predScoreHome ?? 0,
                                                        away: m.prediction?.predScoreAway ?? 0
                                                    };
                                                    const hasSubmitted = !!m.prediction;
                                                    const isExact = !isUpcoming && m.scoreHome !== null && m.scoreAway !== null &&
                                                        m.prediction?.predScoreHome === m.scoreHome &&
                                                        m.prediction?.predScoreAway === m.scoreAway;

                                                    return (
                                                        <div
                                                            key={m.id}
                                                            className={`border rounded-3xl p-6 transition-all space-y-5 ${
                                                                isUpcoming
                                                                    ? isPlaceholder
                                                                        ? 'bg-white/[0.02] border-white/5 opacity-70'
                                                                        : 'bg-white/5 border-white/10 hover:border-yellow-400/30'
                                                                    : 'bg-[#121225] border-white/5 opacity-90'
                                                            }`}
                                                        >
                                                            {/* Heure + Statut */}
                                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    {new Date(m.matchDate).toLocaleTimeString('fr-FR', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        timeZone: 'Africa/Lome'
                                                                    })}
                                                                </span>
                                                                <span className={`px-2 py-1 rounded-full text-[9px] ${
                                                                    isUpcoming
                                                                        ? isPlaceholder ? 'bg-slate-800 text-slate-400' : 'bg-yellow-400/10 text-yellow-400'
                                                                        : 'bg-red-400/10 text-red-400'
                                                                }`}>
                                                                    {isUpcoming ? (isPlaceholder ? 'Équipes à venir' : 'À venir') : 'Terminé'}
                                                                </span>
                                                            </div>

                                                            {/* Équipes */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex flex-col items-start w-2/5">
                                                                    <span className={`font-archivo text-md italic uppercase truncate w-full ${
                                                                        isPlaceholderTeam(m.teamHome) ? 'text-slate-500 font-medium' : 'text-white font-bold'
                                                                    }`}>{m.teamHome}</span>
                                                                </div>
                                                                <div className="flex items-center justify-center gap-2 bg-[#1C1C36] px-4 py-2 rounded-xl text-lg font-black text-white font-mono">
                                                                    {isUpcoming ? 'VS' : `${m.scoreHome} - ${m.scoreAway}`}
                                                                </div>
                                                                <div className="flex flex-col items-end w-2/5 text-right">
                                                                    <span className={`font-archivo text-md italic uppercase truncate w-full ${
                                                                        isPlaceholderTeam(m.teamAway) ? 'text-slate-500 font-medium' : 'text-white font-bold'
                                                                    }`}>{m.teamAway}</span>
                                                                </div>
                                                            </div>

                                                            {/* Pronostics */}
                                                            <div className="pt-4 border-t border-white/5 space-y-3">
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                                                                    <span>Votre pronostic :</span>
                                                                    {hasSubmitted && <span className="text-yellow-400 font-bold">Enregistré</span>}
                                                                </div>

                                                                {isPlaceholder ? (
                                                                    <div className="bg-white/5 border border-white/5 text-slate-400 px-4 py-3 rounded-xl text-xs text-center italic">
                                                                        Pronostics ouverts après qualification des équipes
                                                                    </div>
                                                                ) : isUpcoming ? (
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <button type="button" onClick={() => updateLocalInput(m.id, 'home', -1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold">-</button>
                                                                            <span className="w-6 text-center font-bold font-mono">{currentInput.home}</span>
                                                                            <button type="button" onClick={() => updateLocalInput(m.id, 'home', 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold">+</button>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <button type="button" onClick={() => updateLocalInput(m.id, 'away', -1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold">-</button>
                                                                            <span className="w-6 text-center font-bold font-mono">{currentInput.away}</span>
                                                                            <button type="button" onClick={() => updateLocalInput(m.id, 'away', 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold">+</button>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handlePredict(m.id, currentInput.home, currentInput.away)}
                                                                            disabled={submitting === m.id}
                                                                            className="bg-yellow-400 hover:bg-white text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-md shrink-0"
                                                                        >
                                                                            {submitting === m.id ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                                                                            Valider
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                                                        <div className="text-sm font-mono font-bold text-slate-300">
                                                                            Pronostic : {m.prediction ? `${m.prediction.predScoreHome} - ${m.prediction.predScoreAway}` : 'Aucun'}
                                                                        </div>
                                                                        {m.prediction && (
                                                                            <div className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                                                isExact ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                                            }`}>
                                                                                {isExact ? 'Exact (+ Tirage)' : 'Perdu'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Gagnant tirage */}
                                                            {m.winner && (
                                                                <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center gap-3">
                                                                    <Award size={18} className="text-yellow-400 shrink-0" />
                                                                    <div className="text-xs">
                                                                        <p className="font-bold text-yellow-400">Gagnant Tirage au sort</p>
                                                                        <p className="text-slate-300 font-mono text-[11px]">
                                                                            {m.winner.firstName} {m.winner.lastName} ({m.winner.phone})
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
