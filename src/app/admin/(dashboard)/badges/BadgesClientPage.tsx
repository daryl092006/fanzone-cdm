'use client';

import { useState } from 'react';
import { Tag, CheckCircle2, XCircle, Package, Layers, Printer } from 'lucide-react';
import type { ReactElement } from 'react';
import BadgeGeneratorForm from './BadgeGeneratorForm';
import BadgeDeactivateButton from './BadgeDeactivateButton';
import PrintBadgesModal from './PrintBadgesModal';

interface Badge {
    id: string;
    badge_code: string;
    status: string;
    print_batch?: string;
    participants?: {
        first_name: string;
        last_name: string;
        phone: string;
    } | null;
}

interface BadgesClientPageProps {
    stats: { total: number; libre: number; assigne: number; inactif: number };
    badges: Badge[];
    statusFilter: string;
    batchFilter: string;
}

export default function BadgesClientPage({ stats, badges, statusFilter, batchFilter }: BadgesClientPageProps) {
    const [showPrintModal, setShowPrintModal] = useState(false);

    const statusColor: Record<string, string> = {
        LIBRE: 'bg-slate-50 text-slate-500 border-slate-100',
        ASSIGNE: 'bg-green-50 text-green-700 border-green-100',
        INACTIF: 'bg-red-50 text-red-700 border-red-100',
    };

    const statusIcon: Record<string, ReactElement> = {
        LIBRE: <Package size={12} />,
        ASSIGNE: <CheckCircle2 size={12} />,
        INACTIF: <XCircle size={12} />,
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-archivo text-3xl italic uppercase tracking-tighter text-[#0A0A14]">
                        Gestion des Badges QR
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Gérez le pool de badges physiques et numériques.
                    </p>
                </div>
                {badges.some(b => b.status === 'LIBRE') && (
                    <button
                        onClick={() => setShowPrintModal(true)}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-[#0A0A14] hover:text-white text-black font-bold text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl transition-all shadow-md shadow-yellow-400/20"
                    >
                        <Printer size={16} /> Imprimer les badges libres ({badges.filter(b => b.status === 'LIBRE').length})
                    </button>
                )}
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Total badges', value: stats.total ?? 0, color: 'bg-slate-700', icon: <Layers size={20} />, filter: '' },
                    { label: 'Libres', value: stats.libre ?? 0, color: 'bg-slate-500', icon: <Package size={20} />, filter: 'LIBRE' },
                    { label: 'Attribués', value: stats.assigne ?? 0, color: 'bg-green-500', icon: <CheckCircle2 size={20} />, filter: 'ASSIGNE' },
                    { label: 'Inactifs', value: stats.inactif ?? 0, color: 'bg-red-500', icon: <XCircle size={20} />, filter: 'INACTIF' },
                ].map((kpi, i) => (
                    <a
                        key={i}
                        href={kpi.filter ? `/admin/badges?status=${kpi.filter}` : '/admin/badges'}
                        className={`bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all group cursor-pointer ${statusFilter === kpi.filter || (!statusFilter && !kpi.filter) ? 'border-slate-300 ring-2 ring-slate-200' : 'border-slate-200'}`}
                    >
                        <div className={`w-10 h-10 ${kpi.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                            {kpi.icon}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                        <p className="font-archivo text-3xl italic text-[#0A0A14] mt-1">{kpi.value.toLocaleString()}</p>
                    </a>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Generateur */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                    <div>
                        <h2 className="font-archivo text-xl italic uppercase tracking-tighter text-[#0A0A14]">
                            Générer un Lot
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Créez des badges physiques pré-imprimés.
                        </p>
                    </div>
                    <BadgeGeneratorForm />
                </div>

                {/* Liste des badges */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-archivo text-lg italic uppercase tracking-tighter text-[#0A0A14] flex items-center gap-2">
                            <Tag size={18} className="text-slate-400" /> Liste des Badges
                        </h3>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            {badges.length} résultat{badges.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Filtres rapides */}
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex gap-2 flex-wrap">
                        {[
                            { label: 'Tous', value: '' },
                            { label: 'Libres', value: 'LIBRE' },
                            { label: 'Attribués', value: 'ASSIGNE' },
                            { label: 'Inactifs', value: 'INACTIF' },
                        ].map((f) => (
                            <a
                                key={f.value}
                                href={f.value ? `/admin/badges?status=${f.value}` : '/admin/badges'}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f.value || (!statusFilter && !f.value)
                                    ? 'bg-[#0A0A14] text-white'
                                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {f.label}
                            </a>
                        ))}
                    </div>

                    <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                        {badges.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Tag size={32} className="text-slate-200" />
                                </div>
                                <p className="font-archivo text-slate-300 italic">Aucun badge trouvé</p>
                            </div>
                        ) : (
                            badges.map((badge) => (
                                <div key={badge.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor[badge.status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            {statusIcon[badge.status]}
                                            {badge.status}
                                        </div>
                                        <div>
                                            <p className="text-sm font-mono font-bold text-slate-800">{badge.badge_code}</p>
                                            {badge.participants ? (
                                                <p className="text-xs text-slate-400">
                                                    {badge.participants.first_name} {badge.participants.last_name}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-300 italic">Non attribué</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {badge.print_batch && (
                                            <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded uppercase tracking-widest">
                                                {badge.print_batch}
                                            </span>
                                        )}
                                        {badge.status === 'ASSIGNE' && (
                                            <BadgeDeactivateButton badgeCode={badge.badge_code} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal d'impression */}
            {showPrintModal && (
                <PrintBadgesModal
                    badges={badges.filter(b => b.status === 'LIBRE')}
                    onClose={() => setShowPrintModal(false)}
                />
            )}
        </div>
    );
}
