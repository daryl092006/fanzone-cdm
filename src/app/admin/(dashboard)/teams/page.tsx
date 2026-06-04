'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getTeams, createTeam, updateTeam, deleteTeam, seedDefaultTeams,
    type Team
} from '@/app/actions/teams';
import {
    Shield, Plus, Pencil, Trash2, Loader2, CheckCircle2, AlertCircle,
    RefreshCw, Globe, ChevronDown, X
} from 'lucide-react';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const COMMON_FLAGS = [
    '🇲🇽','🇿🇦','🇰🇷','🇨🇿','🇨🇦','🇨🇭','🇶🇦','🇧🇦','🇧🇷','🇲🇦',
    '🏴󠁧󠁢󠁳󠁣󠁴󠁿','🇭🇹','🇺🇸','🇵🇾','🇦🇺','🇹🇷','🇩🇪','🇪🇨','🇨🇮','🇨🇼',
    '🇳🇱','🇯🇵','🇹🇳','🇸🇪','🇧🇪','🇮🇷','🇪🇬','🇳🇿','🇪🇸','🇺🇾',
    '🇸🇦','🇨🇻','🇫🇷','🇸🇳','🇳🇴','🇮🇶','🇦🇷','🇦🇹','🇩🇿','🇯🇴',
    '🇵🇹','🇨🇴','🇺🇿','🇨🇩','🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇭🇷','🇵🇦','🇬🇭','🇹🇬','🏳️',
];

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filter
    const [filterGroup, setFilterGroup] = useState<string>('ALL');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [formName, setFormName] = useState('');
    const [formFlag, setFormFlag] = useState('🏳️');
    const [formGroup, setFormGroup] = useState('A');
    const [formLoading, setFormLoading] = useState(false);

    // Delete
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        const res = await getTeams();
        if (res.success) setTeams(res.teams);
        else setError(res.error || 'Erreur de chargement.');
        setLoading(false);
    }, []);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);

    const showMsg = (msg: string, isError = false) => {
        if (isError) { setError(msg); setSuccess(null); }
        else { setSuccess(msg); setError(null); }
        setTimeout(() => { setError(null); setSuccess(null); }, 4000);
    };

    const resetForm = () => {
        setEditingTeam(null);
        setFormName('');
        setFormFlag('🏳️');
        setFormGroup('A');
        setShowForm(false);
    };

    const openEdit = (team: Team) => {
        setEditingTeam(team);
        setFormName(team.name);
        setFormFlag(team.flag);
        setFormGroup(team.group_letter);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);

        let res;
        if (editingTeam) {
            res = await updateTeam(editingTeam.id, formName, formFlag, formGroup);
        } else {
            res = await createTeam(formName, formFlag, formGroup);
        }

        if (res.success) {
            showMsg(editingTeam ? `Équipe "${formName}" mise à jour.` : `Équipe "${formName}" ajoutée !`);
            resetForm();
            await fetchTeams();
        } else {
            showMsg(res.error || 'Erreur.', true);
        }
        setFormLoading(false);
    };

    const handleDelete = async (team: Team) => {
        if (!confirm(`Supprimer "${team.name}" ? Cette action est irréversible.`)) return;
        setDeletingId(team.id);
        const res = await deleteTeam(team.id);
        if (res.success) {
            showMsg(`Équipe "${team.name}" supprimée.`);
            await fetchTeams();
        } else {
            showMsg(res.error || 'Erreur de suppression.', true);
        }
        setDeletingId(null);
    };

    const handleSeedDefault = async () => {
        if (!confirm('Réinitialiser avec les 48 équipes officielles FIFA 2026 ? Toutes les équipes actuelles seront remplacées.')) return;
        setSeeding(true);
        const res = await seedDefaultTeams();
        if (res.success) {
            showMsg(res.message || '48 équipes initialisées !');
            await fetchTeams();
        } else {
            showMsg(res.error || 'Erreur.', true);
        }
        setSeeding(false);
    };

    const filteredTeams = filterGroup === 'ALL'
        ? teams
        : teams.filter(t => t.group_letter === filterGroup);

    const groupedByLetter = GROUPS.reduce((acc, g) => {
        const groupTeams = filteredTeams.filter(t => t.group_letter === g);
        if (groupTeams.length > 0) acc[g] = groupTeams;
        return acc;
    }, {} as Record<string, Team[]>);

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-archivo text-3xl italic uppercase tracking-tight text-slate-900">
                        Gestion des <span className="text-yellow-500">Équipes</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {teams.length} équipes enregistrées · Les équipes sont utilisées dans les matchs, classements et pronostics.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleSeedDefault}
                        disabled={seeding}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all"
                    >
                        {seeding ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                        Initialiser FIFA 2026
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 bg-[#0A0A14] text-white hover:bg-yellow-400 hover:text-black font-bold text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl transition-all"
                    >
                        <Plus size={16} /> Ajouter une équipe
                    </button>
                </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>{success}</span>
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#0A0A14]/80 backdrop-blur-sm flex items-center justify-center p-6"
                        onClick={(e) => e.target === e.currentTarget && resetForm()}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-archivo text-xl italic uppercase text-slate-900">
                                    {editingTeam ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
                                </h2>
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-700 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Nom */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Nom de l'équipe
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex : France"
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                {/* Groupe */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Groupe
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {GROUPS.map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setFormGroup(g)}
                                                className={`py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                                                    formGroup === g
                                                        ? 'bg-yellow-400 text-black shadow-md'
                                                        : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Drapeau */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Drapeau — Sélectionné : <span className="text-2xl">{formFlag}</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                        {COMMON_FLAGS.map(flag => (
                                            <button
                                                key={flag}
                                                type="button"
                                                onClick={() => setFormFlag(flag)}
                                                className={`text-2xl p-1.5 rounded-lg transition-all hover:scale-110 ${
                                                    formFlag === flag ? 'bg-yellow-100 ring-2 ring-yellow-400' : 'hover:bg-slate-100'
                                                }`}
                                            >
                                                {flag}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ou saisir un emoji manuellement"
                                        value={formFlag}
                                        onChange={e => setFormFlag(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
                                    />
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={resetForm}
                                        className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={formLoading}
                                        className="flex-1 py-3.5 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-[#0A0A14] hover:text-white transition-all flex items-center justify-center gap-2">
                                        {formLoading ? <Loader2 size={16} className="animate-spin" /> : (editingTeam ? 'Enregistrer' : 'Ajouter')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter by group */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Groupe :</span>
                {['ALL', ...GROUPS].map(g => (
                    <button
                        key={g}
                        onClick={() => setFilterGroup(g)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                            filterGroup === g
                                ? 'bg-yellow-400 text-black'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        {g === 'ALL' ? 'Tous' : `Grp ${g}`}
                    </button>
                ))}
            </div>

            {/* Team list */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-yellow-400" />
                    <span className="text-sm">Chargement des équipes...</span>
                </div>
            ) : teams.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                    <Shield size={40} className="mx-auto text-slate-200" />
                    <div>
                        <p className="font-arquivo text-slate-500 text-lg font-bold">Aucune équipe enregistrée</p>
                        <p className="text-slate-400 text-sm mt-1">Cliquez sur <strong>Initialiser FIFA 2026</strong> pour charger les 48 équipes officielles.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedByLetter).map(([groupLetter, groupTeams]) => (
                        <div key={groupLetter} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                            {/* Group header */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center">
                                    <span className="font-archivo text-sm font-black text-black">{groupLetter}</span>
                                </div>
                                <span className="font-archivo text-sm italic uppercase tracking-wider text-slate-700">
                                    Groupe {groupLetter}
                                </span>
                                <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {groupTeams.length} équipe{groupTeams.length > 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Teams */}
                            <div className="divide-y divide-slate-50">
                                {groupTeams.map(team => (
                                    <div key={team.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                        <span className="text-2xl shrink-0">{team.flag}</span>
                                        <span className="font-bold text-slate-800 text-sm flex-1">{team.name}</span>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <button
                                                onClick={() => openEdit(team)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg transition-all hover:border-slate-400"
                                            >
                                                <Pencil size={12} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(team)}
                                                disabled={deletingId === team.id}
                                                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                {deletingId === team.id
                                                    ? <Loader2 size={12} className="animate-spin" />
                                                    : <Trash2 size={12} />
                                                }
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
