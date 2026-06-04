import { supabase } from '@/lib/supabase';
import { Users, History, Tag, FileText, BarChart3 } from 'lucide-react';
import ExportButton from './ExportButton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

async function getExportStats() {
    const today = new Date().toISOString().split('T')[0];
    const [
        { count: totalParticipants },
        { count: totalAttendances },
        { count: totalBadges },
        { count: today_attendances },
    ] = await Promise.all([
        supabase.from('participants').select('*', { count: 'exact', head: true }),
        supabase.from('attendances').select('*', { count: 'exact', head: true }),
        supabase.from('badges').select('*', { count: 'exact', head: true }),
        supabase.from('attendances').select('*', { count: 'exact', head: true }).eq('date', today),
    ]);
    return { totalParticipants, totalAttendances, totalBadges, today_attendances };
}

export default async function ExportsPage() {
    const stats = await getExportStats();
    const now = format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr });

    const exports = [
        {
            id: 'participants',
            icon: <Users size={24} />,
            color: 'bg-blue-500',
            title: 'Liste des Participants',
            description: 'Tous les inscrits avec leurs informations (nom, téléphone, profession, n° badge, date inscription).',
            count: stats.totalParticipants ?? 0,
            unit: 'participants',
            format: 'CSV',
        },
        {
            id: 'presences',
            icon: <History size={24} />,
            color: 'bg-green-500',
            title: 'Journal des Présences',
            description: 'Historique complet de tous les scans et accès validés à la Fan Zone.',
            count: stats.totalAttendances ?? 0,
            unit: 'présences',
            format: 'CSV',
        },
        {
            id: 'badges',
            icon: <Tag size={24} />,
            color: 'bg-yellow-500',
            title: 'Pool de Badges',
            description: 'Liste de tous les badges QR générés avec leur statut (Libre, Attribué, Inactif).',
            count: stats.totalBadges ?? 0,
            unit: 'badges',
            format: 'CSV',
        },
        {
            id: 'rapport',
            icon: <BarChart3 size={24} />,
            color: 'bg-purple-500',
            title: 'Rapport Quotidien',
            description: `Résumé statistique de la journée du ${now}. Présences, taux de conversion, top participants.`,
            count: stats.today_attendances ?? 0,
            unit: "entrées aujourd'hui",
            format: 'CSV',
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="font-archivo text-3xl italic uppercase tracking-tighter text-[#0A0A14]">
                        Exports de Données
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Téléchargez vos données en format CSV — mis à jour en temps réel.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de données en ligne</span>
                </div>
            </div>

            {/* Info banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-4">
                <FileText size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-black text-yellow-800 uppercase tracking-wide">Export CSV — Format universel</p>
                    <p className="text-sm text-yellow-700 mt-1 leading-relaxed">
                        Les fichiers sont générés à la volée depuis la base de données live. Compatibles avec Excel, Google Sheets et tout logiciel tableur. L'encodage est UTF-8 avec BOM pour la compatibilité Windows.
                    </p>
                </div>
            </div>

            {/* Export Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {exports.map((exp) => (
                    <div key={exp.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 ${exp.color} rounded-2xl flex items-center justify-center text-white`}>
                                {exp.icon}
                            </div>
                            <span className="text-[10px] font-black bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                {exp.format}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-archivo text-xl italic uppercase tracking-tighter text-[#0A0A14]">
                                {exp.title}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{exp.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                                <p className="font-archivo text-2xl italic text-[#0A0A14]">{exp.count.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.unit}</p>
                            </div>
                            <ExportButton exportId={exp.id} label={`Télécharger`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
