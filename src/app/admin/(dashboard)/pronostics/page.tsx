'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    adminAddMatch, adminUpdateMatchScore,
    adminDrawPresenceWinner, adminDrawPredictionWinner,
    getMatchesAndPredictions, adminDeleteMatch,
    adminClearAllMatches, adminSyncScoresFromGoogle, getLastSyncTime
} from '@/app/actions/predictions';
import { getTeams, type Team } from '@/app/actions/teams';
import {
    Trophy, Plus, Calendar, Award, Phone,
    CheckCircle2, AlertCircle, Loader2, ChevronDown, Trash2, MapPin
} from 'lucide-react';

export default function AdminPronosticsPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
    const [timeAgo, setTimeAgo] = useState<string>('');

    // Formulaire ajout
    const [showAddForm, setShowAddForm] = useState(false);
    const [teamHome, setTeamHome] = useState('');
    const [teamAway, setTeamAway] = useState('');
    const [matchDate, setMatchDate] = useState('');

    // Formulaire édition score
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const [scoreHome, setScoreHome] = useState<number>(0);
    const [scoreAway, setScoreAway] = useState<number>(0);
    const [matchStatus, setMatchStatus] = useState<'UPCOMING' | 'LIVE' | 'FINISHED'>('UPCOMING');
    const [editingMatchDate, setEditingMatchDate] = useState<string>('');

    // Tirage au sort
    const [drawWinner, setDrawWinner] = useState<any | null>(null);
    const [drawWinnerType, setDrawWinnerType] = useState<string | null>(null);
    const [drawingForMatchId, setDrawingForMatchId] = useState<string | null>(null);

    const showMsg = (msg: string, isError = false) => {
        if (isError) { setError(msg); setSuccessMessage(null); }
        else { setSuccessMessage(msg); setError(null); }
        setTimeout(() => { setError(null); setSuccessMessage(null); }, 5000);
    };

    const updateTimeAgo = useCallback((syncTimeStr: string | null) => {
        if (!syncTimeStr) { setTimeAgo(''); return; }
        const diffMs = new Date().getTime() - new Date(syncTimeStr).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) setTimeAgo("il y a moins d'une minute");
        else if (diffMins < 60) setTimeAgo(`il y a ${diffMins} min`);
        else {
            const h = Math.floor(diffMins / 60);
            if (h < 24) setTimeAgo(`il y a ${h} h`);
            else setTimeAgo(new Date(syncTimeStr).toLocaleDateString('fr-FR'));
        }
    }, []);

    useEffect(() => {
        fetchMatches();
        getLastSyncTime().then(setLastSyncTime);
        getTeams().then(res => { if (res.success) setTeams(res.teams); });
    }, []);

    useEffect(() => {
        updateTimeAgo(lastSyncTime);
        const interval = setInterval(() => updateTimeAgo(lastSyncTime), 30000);
        return () => clearInterval(interval);
    }, [lastSyncTime, updateTimeAgo]);

    const fetchMatches = async () => {
        setLoading(true);
        const res = await getMatchesAndPredictions('00000000-0000-0000-0000-000000000000');
        if (res.success && res.matches) setMatches(res.matches);
        else showMsg(res.error || 'Impossible de récupérer les matchs.', true);
        setLoading(false);
    };

    const handleDeleteMatch = async (matchId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce match ?')) return;
        setActionLoading(matchId);
        const res = await adminDeleteMatch(matchId);
        if (res.success) { showMsg('Match supprimé !'); await fetchMatches(); }
        else showMsg(res.error || 'Erreur.', true);
        setActionLoading(null);
    };

    const handleClearAllMatches = async () => {
        if (!confirm('⚠️ Supprimer TOUS les matchs ?')) return;
        setActionLoading('clear');
        const res = await adminClearAllMatches();
        if (res.success) { showMsg('Tous les matchs supprimés !'); await fetchMatches(); }
        else showMsg(res.error || 'Erreur.', true);
        setActionLoading(null);
    };

    const handleAddMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamHome || !teamAway || !matchDate) return;
        if (teamHome === teamAway) { showMsg('Les deux équipes ne peuvent pas être identiques.', true); return; }
        setActionLoading('add');
        const res = await adminAddMatch(teamHome, teamAway, matchDate);
        if (res.success) {
            showMsg('Match créé !');
            setTeamHome(''); setTeamAway(''); setMatchDate('');
            setShowAddForm(false);
            await fetchMatches();
        } else showMsg(res.error || "Erreur.", true);
        setActionLoading(null);
    };

    const handleStartEdit = (m: any) => {
        setEditingMatchId(m.id);
        setScoreHome(m.scoreHome ?? 0);
        setScoreAway(m.scoreAway ?? 0);
        setMatchStatus(m.status);
        if (m.matchDate) {
            const d = new Date(m.matchDate);
            const yyyy = d.getUTCFullYear();
            const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(d.getUTCDate()).padStart(2, '0');
            const hh = String(d.getUTCHours()).padStart(2, '0');
            const min = String(d.getUTCMinutes()).padStart(2, '0');
            setEditingMatchDate(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
        } else setEditingMatchDate('');
    };

    const handleUpdateScore = async (matchId: string) => {
        setActionLoading(matchId);
        const res = await adminUpdateMatchScore(matchId, scoreHome, scoreAway, matchStatus, editingMatchDate);
        if (res.success) { showMsg('Match mis à jour !'); setEditingMatchId(null); await fetchMatches(); }
        else showMsg(res.error || 'Erreur.', true);
        setActionLoading(null);
    };

    const handleDrawWinner = async (matchId: string, type: 'PRESENCE' | 'PREDICTION') => {
        setDrawingForMatchId(matchId);
        setDrawWinner(null);
        setDrawWinnerType(type);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const res = type === 'PRESENCE'
            ? await adminDrawPresenceWinner(matchId)
            : await adminDrawPredictionWinner(matchId);
        if (res.success && res.winner) {
            setDrawWinner(res.winner);
            await fetchMatches();
        } else {
            setError(res.error || `Tirage impossible.`);
        }
        setDrawingForMatchId(null);
    };

    const handleSyncScores = async () => {
        setActionLoading('sync');
        const res = await adminSyncScoresFromGoogle();
        if (res.success) {
            showMsg(res.message || 'Scores synchronisés !');
            await fetchMatches();
            const newSync = await getLastSyncTime();
            setLastSyncTime(newSync);
        } else showMsg(res.error || 'Erreur.', true);
        setActionLoading(null);
    };

    // Grouper les matchs par jour (heure de Lomé)
    const matchesByDay = (() => {
        const grouped: { label: string; matches: any[] }[] = [];
        const seen: Record<string, number> = {};
        for (const m of matches) {
            const dayKey = new Date(m.matchDate).toLocaleDateString('fr-FR', {
                timeZone: 'Africa/Lome',
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
            });
            if (seen[dayKey] === undefined) {
                seen[dayKey] = grouped.length;
                grouped.push({ label: dayKey, matches: [] });
            }
            grouped[seen[dayKey]].matches.push(m);
        }
        return grouped;
    })();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-archivo text-3xl italic uppercase tracking-tight text-slate-900">
                        Gestion des <span className="text-yellow-500">Matchs</span> &amp; Pronostics
                    </h1>
                    <p className="text-sm text-slate-500">
                        Créez les matchs, mettez à jour les scores et lancez les tirages au sort.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {timeAgo ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Synchro {timeAgo}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Synchro auto en attente
                        </span>
                    )}
                    <button
                        onClick={handleSyncScores}
                        disabled={actionLoading === 'sync'}
                        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all"
                    >
                        {actionLoading === 'sync' ? <Loader2 size={16} className="animate-spin" /> : '⟳'} Sync scores
                    </button>
                    <button
                        onClick={handleClearAllMatches}
                        disabled={actionLoading === 'clear'}
                        className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all"
                    >
                        {actionLoading === 'clear' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Vider
                    </button>
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

            {/* Formulaire ajout */}
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
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipe Domicile</label>
                                <div className="relative">
                                    <select required value={teamHome} onChange={e => setTeamHome(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 pr-10">
                                        <option value="">-- Sélectionner --</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.name}>{t.flag} {t.name} (Groupe {t.group_letter})</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipe Extérieur</label>
                                <div className="relative">
                                    <select required value={teamAway} onChange={e => setTeamAway(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 pr-10">
                                        <option value="">-- Sélectionner --</option>
                                        {teams.filter(t => t.name !== teamHome).map(t => (
                                            <option key={t.id} value={t.name}>{t.flag} {t.name} (Groupe {t.group_letter})</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date &amp; Heure (UTC)</label>
                                <input type="datetime-local" required value={matchDate} onChange={e => setMatchDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400" />
                            </div>
                            <div className="flex flex-col gap-3">
                                {teamHome && teamAway && (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-center text-sm font-bold text-slate-700">
                                        {teams.find(t => t.name === teamHome)?.flag} {teamHome}
                                        <span className="text-yellow-500 mx-2">vs</span>
                                        {teamAway} {teams.find(t => t.name === teamAway)?.flag}
                                    </div>
                                )}
                                <button type="submit" disabled={actionLoading === 'add'}
                                    className="bg-yellow-400 hover:bg-slate-900 hover:text-white text-black font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                                    {actionLoading === 'add' ? <Loader2 size={16} className="animate-spin" /> : 'Créer le match'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Tirage au Sort */}
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
                                        <div className="absolute inset-0 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-archivo text-2xl italic uppercase text-slate-800">Tirage en cours…</h3>
                                        <p className="text-xs text-slate-500">
                                            {drawWinnerType === 'PRESENCE'
                                                ? "Sélection d'un gagnant parmi les présents à la FanZone…"
                                                : "Sélection d'un gagnant parmi les pronostics corrects…"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600 animate-pulse">
                                        <Trophy size={36} />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400/20 text-yellow-800 px-3 py-1 rounded-full">
                                            {drawWinnerType === 'PRESENCE' ? 'Gagnant Présence !' : 'Gagnant Pronostic Exact !'}
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
                                                day: 'numeric', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setDrawWinner(null); setDrawWinnerType(null); }}
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

            {/* Liste des matchs par jour */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-archivo text-lg italic uppercase text-slate-800">Matchs programmés</h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <Loader2 size={32} className="animate-spin text-yellow-400" />
                        Chargement des matchs…
                    </div>
                ) : matches.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        Aucun match configuré. Ajoutez un match pour démarrer.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {matchesByDay.map(({ label, matches: dayMatches }) => {
                            // Dernier match du jour (chronologique)
                            const sorted = [...dayMatches].sort((a, b) =>
                                new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
                            );
                            const lastMatch = sorted[sorted.length - 1];

                            // Tirage présence : dernier match LIVE ou FINISHED
                            const lastMatchActive = lastMatch.status === 'LIVE' || lastMatch.status === 'FINISHED';
                            const dayPresenceWinner = dayMatches.find(m => m.winnerPresence)?.winnerPresence ?? null;

                            // Tirage pronostic : tous les matchs du jour FINISHED
                            const allFinished = dayMatches.every(m => m.status === 'FINISHED');
                            const dayPredictionWinner = dayMatches.find(m => m.winnerPrediction)?.winnerPrediction ?? null;

                            return (
                                <div key={label}>
                                    {/* En-tête du jour */}
                                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                        <Calendar size={13} className="text-yellow-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{label}</span>
                                        <span className="ml-auto text-[10px] font-bold text-slate-400">
                                            {dayMatches.length} match{dayMatches.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Matchs du jour — score uniquement */}
                                    {dayMatches.map((m) => {
                                        const isEditing = editingMatchId === m.id;
                                        return (
                                            <div key={m.id} className="p-6 flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-slate-50 last:border-b-0">
                                                {/* Info match */}
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-archivo text-md italic uppercase text-slate-800">
                                                                {m.teamHome} vs {m.teamAway}
                                                            </span>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                                m.status === 'UPCOMING' ? 'bg-yellow-100 text-yellow-800'
                                                                    : m.status === 'LIVE' ? 'bg-red-100 text-red-800 animate-pulse'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {m.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {new Date(m.matchDate).toLocaleTimeString('fr-FR', {
                                                                hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lome'
                                                            })} (heure Lomé)
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex-wrap">
                                                            <input type="number" min="0" value={scoreHome}
                                                                onChange={e => setScoreHome(parseInt(e.target.value) || 0)}
                                                                className="w-12 text-center font-bold bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none" />
                                                            <span className="font-bold text-slate-400">-</span>
                                                            <input type="number" min="0" value={scoreAway}
                                                                onChange={e => setScoreAway(parseInt(e.target.value) || 0)}
                                                                className="w-12 text-center font-bold bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none" />
                                                            <select value={matchStatus} onChange={(e: any) => setMatchStatus(e.target.value)}
                                                                className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold">
                                                                <option value="UPCOMING">À VENIR</option>
                                                                <option value="LIVE">EN DIRECT</option>
                                                                <option value="FINISHED">TERMINÉ</option>
                                                            </select>
                                                            <input type="datetime-local" value={editingMatchDate}
                                                                onChange={e => setEditingMatchDate(e.target.value)}
                                                                className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-medium focus:outline-none" />
                                                            <button onClick={() => handleUpdateScore(m.id)} disabled={actionLoading === m.id}
                                                                className="bg-[#0A0A14] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400 hover:text-black transition-all">
                                                                Enregistrer
                                                            </button>
                                                            <button onClick={() => setEditingMatchId(null)}
                                                                className="text-slate-400 hover:text-slate-600 text-xs px-2">
                                                                Annuler
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 font-mono font-bold text-slate-700">
                                                                {m.scoreHome !== null && m.scoreAway !== null
                                                                    ? `${m.scoreHome} – ${m.scoreAway}`
                                                                    : 'Score : —'}
                                                            </div>
                                                            <button onClick={() => handleStartEdit(m)}
                                                                className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-2 rounded-xl transition-all">
                                                                Modifier
                                                            </button>
                                                            <button onClick={() => handleDeleteMatch(m.id)} disabled={actionLoading === m.id}
                                                                className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 p-2.5 rounded-xl transition-all flex items-center justify-center"
                                                                title="Supprimer">
                                                                {actionLoading === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* ════ Pied de journée : Tirages au sort ════ */}
                                    <div className="border-t-2 border-slate-100">

                                        {/* 🟢 Tirage PRÉSENCE — mi-temps du dernier match */}
                                        <div className="px-6 py-4 bg-emerald-50/70 border-b border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <MapPin size={15} className="text-emerald-600 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">🟢 Tirage Présence · Journée</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        À la mi-temps de{' '}
                                                        <span className="font-bold text-slate-600">{lastMatch.teamHome} vs {lastMatch.teamAway}</span>
                                                        {' '}({new Date(lastMatch.matchDate).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lome'
                                                        })})
                                                    </p>
                                                </div>
                                            </div>
                                            {dayPresenceWinner ? (
                                                <div className="flex items-center gap-2 bg-white border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-medium shrink-0">
                                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-[10px] uppercase text-emerald-600 tracking-wider">Gagnant</p>
                                                        <p className="font-bold">{dayPresenceWinner.firstName} {dayPresenceWinner.lastName}</p>
                                                        <p className="text-[9px] text-slate-400 font-mono">{dayPresenceWinner.phone}</p>
                                                    </div>
                                                </div>
                                            ) : lastMatchActive ? (
                                                <button
                                                    onClick={() => handleDrawWinner(lastMatch.id, 'PRESENCE')}
                                                    className="shrink-0 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-sm"
                                                >
                                                    <MapPin size={14} /> Lancer le Tirage Présence
                                                </button>
                                            ) : (
                                                <span className="shrink-0 text-[10px] text-slate-400 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider">
                                                    En attente du dernier match
                                                </span>
                                            )}
                                        </div>

                                        {/* 🏆 Tirage PRONOSTIC — le lendemain avant le 1er match */}
                                        <div className="px-6 py-4 bg-yellow-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Trophy size={15} className="text-yellow-600 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-700">🏆 Tirage Pronostic · Journée</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        Le lendemain avant le 1er match · Tous les matchs du jour doivent être terminés
                                                    </p>
                                                </div>
                                            </div>
                                            {dayPredictionWinner ? (
                                                <div className={`shrink-0 flex items-center gap-2 border px-4 py-2.5 rounded-xl text-xs font-medium ${
                                                    dayPredictionWinner.isPresent
                                                        ? 'bg-white border-yellow-200 text-yellow-800'
                                                        : 'bg-red-50 border-red-100 text-red-800'
                                                }`}>
                                                    <Award size={16} className={`${dayPredictionWinner.isPresent ? 'text-yellow-600' : 'text-red-600'} shrink-0`} />
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Gagnant</p>
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                                dayPredictionWinner.isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {dayPredictionWinner.isPresent ? 'Présent ✓' : 'Absent (Annulé)'}
                                                            </span>
                                                        </div>
                                                        <p className="font-bold">{dayPredictionWinner.firstName} {dayPredictionWinner.lastName}</p>
                                                        <p className="text-[9px] text-slate-400 font-mono">{dayPredictionWinner.phone}</p>
                                                    </div>
                                                </div>
                                            ) : allFinished ? (
                                                <button
                                                    onClick={() => handleDrawWinner(lastMatch.id, 'PREDICTION')}
                                                    className="shrink-0 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-[#0A0A14] hover:text-white text-black font-bold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-sm"
                                                >
                                                    <Trophy size={14} /> Lancer le Tirage Pronostic
                                                </button>
                                            ) : (
                                                <span className="shrink-0 text-[10px] text-slate-400 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider">
                                                    En attente de la fin de tous les matchs
                                                </span>
                                            )}
                                        </div>

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
