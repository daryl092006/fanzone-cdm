'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getAllGroupStandings, getBestThirdPlaceTeams, type GroupStandings, type TeamStanding } from '@/app/actions/standings-engine';
import { RefreshCw, Trophy, CheckCircle2, Clock, Loader2, ChevronDown, ChevronUp, Award } from 'lucide-react';

export default function AdminClassementsPage() {
    const [standings, setStandings] = useState<GroupStandings[]>([]);
    const [best8Thirds, setBest8Thirds] = useState<TeamStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        const [standingsData, thirdsData] = await Promise.all([
            getAllGroupStandings(),
            getBestThirdPlaceTeams(),
        ]);

        setStandings(standingsData);
        setBest8Thirds(thirdsData);
        setLastRefresh(new Date());
        if (!silent) setLoading(false);
        else setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchData();
        // Auto-refresh toutes les 30s
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const toggleGroup = (group: string) => {
        setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const expandAll = () => {
        const all: Record<string, boolean> = {};
        standings.forEach(s => { all[s.group] = true; });
        setOpenGroups(all);
    };

    const collapseAll = () => setOpenGroups({});

    const completedGroups = standings.filter(s => s.isComplete).length;
    const totalGroups = standings.length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-500">
                <Loader2 size={40} className="animate-spin text-yellow-400" />
                <p className="text-sm">Calcul des classements en cours…</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-archivo text-3xl italic uppercase tracking-tight text-slate-900">
                        Classements <span className="text-yellow-500">Groupes</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Mis à jour automatiquement après chaque score · Dernier calcul :{' '}
                        <span className="font-mono text-xs text-slate-400">
                            {lastRefresh.toLocaleTimeString('fr-FR')}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={expandAll} className="text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5">
                        <ChevronDown size={14} /> Tout développer
                    </button>
                    <button onClick={collapseAll} className="text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5">
                        <ChevronUp size={14} /> Tout réduire
                    </button>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-[#0A0A14] text-white hover:bg-yellow-400 hover:text-black font-bold text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl transition-all"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* ── Progression ──────────────────────────────────────────────────── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Progression Phase de Groupes</p>
                    <span className="text-sm font-bold text-slate-700">{completedGroups}/{totalGroups} groupes terminés</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedGroups / Math.max(totalGroups, 1)) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        Terminé ({completedGroups})
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                        En cours ({totalGroups - completedGroups})
                    </div>
                </div>
            </div>

            {/* ── Grille des 12 groupes ────────────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-5">
                {standings.map((gs, idx) => {
                    const isOpen = openGroups[gs.group] !== false && openGroups[gs.group] !== undefined
                        ? openGroups[gs.group]
                        : true; // ouvert par défaut

                    return (
                        <motion.div
                            key={gs.group}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                        >
                            {/* En-tête du groupe */}
                            <button
                                onClick={() => toggleGroup(gs.group)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-[#0A0A14] rounded-xl flex items-center justify-center">
                                        <span className="text-yellow-400 font-black text-sm">{gs.group}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-archivo text-sm italic uppercase font-bold text-slate-800">
                                            Groupe {gs.group}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono">
                                            {gs.teams.filter(t => t.played > 0).length > 0
                                                ? `${gs.teams.reduce((sum, t) => sum + t.played, 0) / 2}/6 matchs joués`
                                                : 'Aucun match joué'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {gs.isComplete ? (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                                            <CheckCircle2 size={10} /> Terminé
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-full">
                                            <Clock size={10} /> En cours
                                        </span>
                                    )}
                                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </div>
                            </button>

                            {/* Tableau du classement */}
                            {isOpen && (
                                <div className="border-t border-slate-100">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="text-left px-4 py-2.5 w-6">#</th>
                                                <th className="text-left px-2 py-2.5">Équipe</th>
                                                <th className="text-center px-2 py-2.5 w-8" title="Matchs joués">MJ</th>
                                                <th className="text-center px-2 py-2.5 w-8" title="Gagné">G</th>
                                                <th className="text-center px-2 py-2.5 w-8" title="Nul">N</th>
                                                <th className="text-center px-2 py-2.5 w-8" title="Perdu">P</th>
                                                <th className="text-center px-2 py-2.5 w-8" title="Buts pour">BP</th>
                                                <th className="text-center px-2 py-2.5 w-8" title="Buts contre">BC</th>
                                                <th className="text-center px-2 py-2.5 w-10" title="Différence de buts">DB</th>
                                                <th className="text-center px-4 py-2.5 w-10 font-black text-slate-700">Pts</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {gs.teams.map((team, i) => {
                                                const qualifies = i < 2; // Top 2 qualifiés directement
                                                const maybeThird = i === 2; // 3e potentiellement qualifié

                                                return (
                                                    <tr
                                                        key={team.teamName}
                                                        className={`transition-colors ${
                                                            qualifies
                                                                ? 'bg-emerald-50/50 hover:bg-emerald-50'
                                                                : maybeThird
                                                                ? 'bg-yellow-50/30 hover:bg-yellow-50/50'
                                                                : 'hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3 font-black text-slate-400">
                                                            <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                                                                i === 0 ? 'bg-yellow-400 text-black' :
                                                                i === 1 ? 'bg-slate-700 text-white' :
                                                                i === 2 ? 'bg-orange-100 text-orange-600' :
                                                                'text-slate-300'
                                                            }`}>
                                                                {i + 1}
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base leading-none">{team.flag}</span>
                                                                <span className={`font-semibold truncate max-w-[110px] ${
                                                                    qualifies ? 'text-slate-800' : 'text-slate-600'
                                                                }`}>
                                                                    {team.teamName}
                                                                </span>
                                                                {qualifies && gs.isComplete && (
                                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">✓ KO</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-center px-2 py-3 text-slate-500">{team.played}</td>
                                                        <td className="text-center px-2 py-3 text-slate-500">{team.won}</td>
                                                        <td className="text-center px-2 py-3 text-slate-500">{team.drawn}</td>
                                                        <td className="text-center px-2 py-3 text-slate-500">{team.lost}</td>
                                                        <td className="text-center px-2 py-3 text-slate-500">{team.goalsFor}</td>
                                                        <td className="text-center px-2 py-3 text-slate-500">{team.goalsAgainst}</td>
                                                        <td className={`text-center px-2 py-3 font-bold ${
                                                            team.goalDiff > 0 ? 'text-emerald-600' :
                                                            team.goalDiff < 0 ? 'text-red-500' :
                                                            'text-slate-400'
                                                        }`}>
                                                            {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                                                        </td>
                                                        <td className="text-center px-4 py-3">
                                                            <span className={`font-black text-sm ${
                                                                qualifies ? 'text-slate-900' : 'text-slate-500'
                                                            }`}>
                                                                {team.points}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Légende qualification */}
                                    <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                                            Qualifié Tour de 32
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200" />
                                            Potentiellement qualifié (meilleur 3e)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Meilleurs 3es ─────────────────────────────────────────────────── */}
            {best8Thirds.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Award size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <h2 className="font-archivo text-base italic uppercase text-slate-800">
                                Meilleurs 3es — Classement FIFA
                            </h2>
                            <p className="text-[10px] text-slate-400">
                                Les 8 meilleurs 3es parmi les 12 groupes se qualifient pour le Tour de 32
                            </p>
                        </div>
                    </div>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="text-left px-5 py-2.5 w-8">#</th>
                                <th className="text-left px-2 py-2.5">Équipe</th>
                                <th className="text-center px-2 py-2.5">Groupe</th>
                                <th className="text-center px-2 py-2.5">MJ</th>
                                <th className="text-center px-2 py-2.5">DB</th>
                                <th className="text-center px-4 py-2.5 font-black text-slate-700">Pts</th>
                                <th className="text-center px-4 py-2.5">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {best8Thirds.map((team, i) => (
                                <tr key={`${team.group}-${team.teamName}`} className={i < 8 ? 'bg-orange-50/30' : 'bg-red-50/30'}>
                                    <td className="px-5 py-3 font-black text-orange-400 text-sm">{i + 1}</td>
                                    <td className="px-2 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{team.flag}</span>
                                            <span className="font-semibold text-slate-800">{team.teamName}</span>
                                        </div>
                                    </td>
                                    <td className="text-center px-2 py-3">
                                        <span className="bg-slate-900 text-yellow-400 font-black text-[10px] px-2 py-1 rounded">
                                            {team.group}
                                        </span>
                                    </td>
                                    <td className="text-center px-2 py-3 text-slate-500">{team.played}</td>
                                    <td className={`text-center px-2 py-3 font-bold ${team.goalDiff > 0 ? 'text-emerald-600' : team.goalDiff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                        {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                                    </td>
                                    <td className="text-center px-4 py-3 font-black text-slate-900">{team.points}</td>
                                    <td className="text-center px-4 py-3">
                                        {i < 8 ? (
                                            <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-1 rounded-full">✓ Qualifié</span>
                                        ) : (
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Éliminé</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {best8Thirds.length === 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
                    <Trophy size={32} className="text-orange-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-orange-600">Meilleurs 3es</p>
                    <p className="text-xs text-orange-400 mt-1">
                        Le classement des meilleurs 3es s'affichera au fur et à mesure des matchs.
                    </p>
                </div>
            )}
        </div>
    );
}
