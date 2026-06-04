'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAddMatch, adminUpdateMatchScore, adminDrawWinner, getMatchesAndPredictions } from '@/app/actions/predictions';
import { getTeams, type Team } from '@/app/actions/teams';
import { Trophy, Plus, Calendar, Award, Phone, CheckCircle2, AlertCircle, Loader2, Sparkles, ChevronDown } from 'lucide-react';

export default function AdminPronosticsPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Formulaire d'ajout de match
    const [showAddForm, setShowAddForm] = useState(false);
    const [teamHome, setTeamHome] = useState('');
    const [teamAway, setTeamAway] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [venue, setVenue] = useState('');

    // Formulaire d'édition de score
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const [scoreHome, setScoreHome] = useState<number>(0);
    const [scoreAway, setScoreAway] = useState<number>(0);
    const [matchStatus, setMatchStatus] = useState<'UPCOMING' | 'LIVE' | 'FINISHED'>('UPCOMING');

    // Résultat du tirage au sort
    const [drawWinner, setDrawWinner] = useState<any | null>(null);
    const [drawingForMatchId, setDrawingForMatchId] = useState<string | null>(null);

    const showMsg = (msg: string, isError = false) => {
        if (isError) { setError(msg); setSuccessMessage(null); }
        else { setSuccessMessage(msg); setError(null); }
        setTimeout(() => { setError(null); setSuccessMessage(null); }, 5000);
    };

    useEffect(() => {
        fetchMatches();
        // Load teams for dropdowns
        getTeams().then(res => { if (res.success) setTeams(res.teams); });
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        const res = await getMatchesAndPredictions('00000000-0000-0000-0000-000000000000');
        if (res.success && res.matches) {
            setMatches(res.matches);
        } else {
            showMsg(res.error || 'Impossible de récupérer les matchs.', true);
        }
        setLoading(false);
    };

    const handleAddMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamHome || !teamAway || !matchDate) return;
        if (teamHome === teamAway) {
            showMsg('Les deux équipes ne peuvent pas être identiques.', true);
            return;
        }
        setActionLoading('add');
        const res = await adminAddMatch(teamHome, teamAway, matchDate);
        if (res.success) {
            showMsg('Match créé avec succès !');
            setTeamHome(''); setTeamAway(''); setMatchDate(''); setVenue('');
            setShowAddForm(false);
            await fetchMatches();
        } else {
            showMsg(res.error || "Erreur lors de l'ajout.", true);
        }
        setActionLoading(null);
    };

    const handleStartEdit = (m: any) => {
        setEditingMatchId(m.id);
        setScoreHome(m.scoreHome ?? 0);
        setScoreAway(m.scoreAway ?? 0);
        setMatchStatus(m.status);
    };

    const handleUpdateScore = async (matchId: string) => {
        setActionLoading(matchId);
        const res = await adminUpdateMatchScore(matchId, scoreHome, scoreAway, matchStatus);
        if (res.success) {
            showMsg('Match mis à jour !');
            setEditingMatchId(null);
            await fetchMatches();
        } else {
            showMsg(res.error || 'Erreur lors de la mise à jour.', true);
        }
        setActionLoading(null);
    };

    const handleDrawWinner = async (matchId: string) => {
        setDrawingForMatchId(matchId);
        setDrawWinner(null);
        setError(null);

        // Simulation de chargement/animation de tirage au sort (2 secondes d'animation style premium)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const res = await adminDrawWinner(matchId);
        if (res.success && res.winner) {
            setDrawWinner(res.winner);
            await fetchMatches();
        } else {
            setError(res.error || "Impossible d'effectuer le tirage au sort. Vérifiez s'il y a des pronostics corrects.");
        }
        setDrawingForMatchId(null);
    };

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-archivo text-3xl italic uppercase tracking-tight text-slate-900">
                        Gestion des <span className="text-yellow-500">Matchs</span> & Pronostics
                    </h1>
                    <p className="text-sm text-slate-500">
                        Créez les matchs, mettez à jour les scores en direct, et tirez au sort les gagnants.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 bg-[#0A0A14] text-white hover:bg-yellow-400 hover:text-black font-bold text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl transition-all"
                    >
                        <Plus size={16} /> {showAddForm ? 'Fermer' : 'Créer un match'}
                    </button>
                </div>
            </div>

            {/* Alertes */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {/* Formulaire ajout de match */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden"
                    >
                        <h3 className="font-archivo text-lg italic uppercase text-slate-800 mb-5">Nouveau Match</h3>
                        <form onSubmit={handleAddMatch} className="grid md:grid-cols-2 gap-4">
                            {/* Équipe Domicile */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipe Domicile</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={teamHome}
                                        onChange={e => setTeamHome(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 pr-10"
                                    >
                                        <option value="">-- Sélectionner une équipe --</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.name}>
                                                {t.flag} {t.name} (Groupe {t.group_letter})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Équipe Extérieur */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipe Extérieur</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={teamAway}
                                        onChange={e => setTeamAway(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 pr-10"
                                    >
                                        <option value="">-- Sélectionner une équipe --</option>
                                        {teams.filter(t => t.name !== teamHome).map(t => (
                                            <option key={t.id} value={t.name}>
                                                {t.flag} {t.name} (Groupe {t.group_letter})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Date et heure */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure du Match</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={matchDate}
                                    onChange={e => setMatchDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400"
                                />
                            </div>

                            {/* Aperçu + Submit */}
                            <div className="flex flex-col gap-3">
                                {teamHome && teamAway && (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-center">
                                        <span className="text-sm font-bold text-slate-700">
                                            {teams.find(t=>t.name===teamHome)?.flag} {teamHome}
                                            <span className="text-yellow-500 mx-2">vs</span>
                                            {teamAway} {teams.find(t=>t.name===teamAway)?.flag}
                                        </span>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={actionLoading === 'add'}
                                    className="bg-yellow-400 hover:bg-slate-900 hover:text-white text-black font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    {actionLoading === 'add' ? <Loader2 size={16} className="animate-spin" /> : 'Créer le match'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal/Animation Tirage au Sort */}
            <AnimatePresence>
                {(drawingForMatchId || drawWinner) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#0A0A14]/85 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-2xl text-center space-y-6 relative overflow-hidden">
                            {drawingForMatchId ? (
                                <div className="py-12 space-y-6">
                                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                        <Trophy size={48} className="text-yellow-400 animate-bounce" />
                                        <div className="absolute inset-0 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-archivo text-2xl italic uppercase text-slate-800">Tirage au sort en cours</h3>
                                        <p className="text-xs text-slate-500">Sélection d'un gagnant au hasard parmi les bons pronostics...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600 animate-pulse">
                                        <Trophy size={36} />
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400/20 text-yellow-800 px-3 py-1 rounded-full">
                                            Gagnant Sélectionné !
                                        </span>
                                        <h3 className="font-archivo text-3xl italic uppercase text-slate-900 mt-2">
                                            {drawWinner.firstName} {drawWinner.lastName}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-mono mt-2">
                                            <Phone size={14} /> {drawWinner.phone}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date du Tirage</p>
                                        <p className="text-xs font-bold text-slate-700">
                                            {new Date(drawWinner.drawnAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setDrawWinner(null)}
                                        className="w-full bg-[#0A0A14] text-white hover:bg-yellow-400 hover:text-black font-bold py-4 rounded-xl text-sm transition-all"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Liste des matchs */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-archivo text-lg italic uppercase text-slate-800">Matchs programmés</h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <Loader2 size={32} className="animate-spin text-yellow-400" />
                        Chargement des matchs...
                    </div>
                ) : matches.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        Aucun match configuré. Ajoutez un match pour démarrer.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {matches.map((m) => {
                            const isEditing = editingMatchId === m.id;

                            return (
                                <div key={m.id} className="p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                                    {/* Match Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-archivo text-md italic uppercase text-slate-800">
                                                    {m.teamHome} vs {m.teamAway}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                    m.status === 'UPCOMING'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : m.status === 'LIVE'
                                                        ? 'bg-red-100 text-red-800 animate-pulse'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {m.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(m.matchDate).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Score Config / Affichage */}
                                    <div className="flex items-center gap-4">
                                        {isEditing ? (
                                            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={scoreHome}
                                                    onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
                                                    className="w-12 text-center font-bold bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                                                />
                                                <span className="font-bold text-slate-400">-</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={scoreAway}
                                                    onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
                                                    className="w-12 text-center font-bold bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                                                />
                                                <select
                                                    value={matchStatus}
                                                    onChange={(e: any) => setMatchStatus(e.target.value)}
                                                    className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold"
                                                >
                                                    <option value="UPCOMING">À VENIR</option>
                                                    <option value="LIVE">EN DIRECT</option>
                                                    <option value="FINISHED">TERMINÉ</option>
                                                </select>
                                                <button
                                                    onClick={() => handleUpdateScore(m.id)}
                                                    disabled={actionLoading === m.id}
                                                    className="bg-[#0A0A14] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400 hover:text-black transition-all"
                                                >
                                                    Enregistrer
                                                </button>
                                                <button
                                                    onClick={() => setEditingMatchId(null)}
                                                    className="text-slate-400 hover:text-slate-600 text-xs px-2"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 font-mono font-bold text-slate-700">
                                                    Score : {m.scoreHome !== null && m.scoreAway !== null ? `${m.scoreHome} - ${m.scoreAway}` : '—'}
                                                </div>
                                                <button
                                                    onClick={() => handleStartEdit(m)}
                                                    className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-2 rounded-xl transition-all"
                                                >
                                                    Modifier score
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Tirage au Sort */}
                                    <div className="w-full lg:w-auto flex justify-end">
                                        {m.status === 'FINISHED' ? (
                                            m.winner ? (
                                                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-xl text-xs font-medium">
                                                    <Award size={16} className="text-yellow-600 shrink-0" />
                                                    <div>
                                                        <p className="font-bold">Gagnant : {m.winner.firstName} {m.winner.lastName}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">{m.winner.phone}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDrawWinner(m.id)}
                                                    className="flex items-center gap-2 bg-yellow-400 text-black hover:bg-[#0A0A14] hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-md shadow-yellow-400/10"
                                                >
                                                    <Trophy size={14} /> Tirage au Sort
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                disabled
                                                className="bg-slate-100 text-slate-400 text-xs px-4 py-3 rounded-xl cursor-not-allowed"
                                            >
                                                Tirage (En attente de fin)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
