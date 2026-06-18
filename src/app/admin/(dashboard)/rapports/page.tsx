import { getDailyStats } from '@/app/actions/admin';
import { 
    Calendar, 
    UserPlus, 
    Users, 
    Activity, 
    TrendingUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import RapportExportButton from './RapportExportButton';

export default async function RapportsPage() {
    const res = await getDailyStats();

    if (res.error || !res.reports) {
        return (
            <div className="text-red-500 p-8 bg-red-50 rounded-2xl border border-red-100">
                {res.error || "Une erreur est survenue."}
            </div>
        );
    }

    const reports = res.reports;
    
    // Calculate overall stats
    const totalDays = reports.length;
    const totalRegs = reports.reduce((acc, curr) => acc + curr.registrations, 0);
    const totalPresents = reports.reduce((acc, curr) => acc + curr.uniquePresent, 0);
    const totalScans = reports.reduce((acc, curr) => acc + curr.totalScans, 0);
    
    const avgRegs = totalDays > 0 ? (totalRegs / totalDays).toFixed(1) : '0';
    const avgPresents = totalDays > 0 ? (totalPresents / totalDays).toFixed(1) : '0';

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="font-archivo text-3xl italic uppercase tracking-tighter text-[#0A0A14]">
                        Rapports Journaliers
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Analyse comparative des inscriptions, présences uniques et flux d'activité par jour.
                    </p>
                </div>
                
                <RapportExportButton 
                    exportId="rapports-journaliers" 
                    label="Exporter le rapport global (CSV)" 
                    variant="primary"
                />
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Jours Actifs', value: totalDays, icon: <Calendar />, color: 'bg-indigo-500' },
                    { label: 'Total Inscriptions', value: totalRegs, icon: <UserPlus />, color: 'bg-blue-500' },
                    { label: 'Cumul Présents (Uniques)', value: totalPresents, icon: <Users />, color: 'bg-green-500' },
                    { label: 'Activité Globale (Scans)', value: totalScans, icon: <Activity />, color: 'bg-purple-500' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${kpi.color} text-white group-hover:scale-110 transition-transform`}>
                                {kpi.icon}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                        <p className="font-archivo text-3xl italic text-[#0A0A14]">{kpi.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Averages Section */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moyenne d'Inscriptions / Jour</p>
                        <p className="font-archivo text-3xl italic text-[#0A0A14] mt-1">{avgRegs}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moyenne de Présents / Jour</p>
                        <p className="font-archivo text-3xl italic text-[#0A0A14] mt-1">{avgPresents}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                        <Users size={24} />
                    </div>
                </div>
            </div>

            {/* Daily stats table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-archivo text-lg italic uppercase tracking-tighter">Historique par Jour</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Date</th>
                                <th className="px-6 py-4 text-center">Nouveaux Inscrits</th>
                                <th className="px-6 py-4 text-center">Présents Uniques</th>
                                <th className="px-6 py-4 text-center">Activité (Scans)</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((row) => {
                                const parsedDate = parseISO(row.date);
                                const formattedDate = format(parsedDate, 'EEEE d MMMM yyyy', { locale: fr });
                                
                                return (
                                    <tr key={row.date} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                                                    <Calendar size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 capitalize">{formattedDate}</p>
                                                    <p className="text-[10px] font-mono text-slate-400 leading-none">{row.date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                                +{row.registrations}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                                {row.uniquePresent}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm font-semibold font-mono text-slate-600">
                                                {row.totalScans}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/presences?date=${row.date}`}
                                                    className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all border border-slate-200"
                                                >
                                                    Voir présences
                                                </Link>
                                                <RapportExportButton 
                                                    exportId={`presences?date=${row.date}`}
                                                    label="Présences CSV"
                                                    variant="secondary"
                                                    customFilename={`presences-${row.date}`}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar size={32} className="text-slate-200" />
                                        </div>
                                        <p className="font-archivo text-slate-300 italic">Aucune donnée enregistrée</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
