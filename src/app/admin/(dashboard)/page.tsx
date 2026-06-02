import { getDashboardStats } from '../../actions/admin';
import {
    Users,
    UserCheck,
    BarChart3,
    Activity,
    ArrowUpRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default async function AdminDashboard() {
    const data = await getDashboardStats();

    if (data.error || !data.stats) {
        return <div className="text-red-500 p-8 bg-red-50 rounded-2xl border border-red-100">{data.error}</div>;
    }

    const stats = data.stats;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div>
                <h1 className="font-archivo text-3xl italic uppercase tracking-tighter text-[#0A0A14]">Vue d'ensemble</h1>
                <p className="text-slate-400 text-sm mt-1">Gérez les inscriptions et suivez l'affluence en temps réel.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Inscrits', value: stats.totalParticipants, icon: <Users />, color: 'bg-blue-500', trend: '+12%' },
                    { label: 'Participants Venus', value: stats.participantsComing, icon: <UserCheck />, color: 'bg-green-500', trend: `${stats.conversionRate}%` },
                    { label: 'Présences Aujourd\'hui', value: stats.attendancesToday, icon: <Activity />, color: 'bg-yellow-500', trend: 'Live' },
                    { label: 'Présences Cumulées', value: stats.totalAttendances, icon: <BarChart3 />, color: 'bg-purple-500', trend: 'Total' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${kpi.color} text-white group-hover:scale-110 transition-transform`}>
                                {kpi.icon}
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${kpi.trend === 'Live' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                                {kpi.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                        <p className="font-archivo text-3xl italic text-[#0A0A14]">{kpi.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Derniers Scans (2/3 de largeur) */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-archivo text-lg italic uppercase tracking-tighter flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" /> Flux en direct
                        </h3>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">10 derniers scans</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {data.recentScans?.map((scan: any) => (
                            <div key={scan.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${scan.result === 'SUCCES' ? 'bg-green-50 text-green-600' :
                                            scan.result === 'DEJA_SCANNE' ? 'bg-yellow-50 text-yellow-600' :
                                                'bg-red-50 text-red-600'
                                        }`}>
                                        {scan.result === 'SUCCES' ? <CheckCircle2 size={18} /> :
                                            scan.result === 'DEJA_SCANNE' ? <AlertCircle size={18} /> :
                                                <XCircle size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-none">
                                            {scan.participant ? `${scan.participant.firstName} ${scan.participant.lastName}` : `Code: ${scan.badgeCode}`}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {scan.result === 'SUCCES' ? 'Entrée validée' : scan.message || scan.result}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-400">
                                        {formatDistanceToNow(new Date(scan.scanTime), { addSuffix: true, locale: fr })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {data.recentScans?.length === 0 && (
                            <div className="p-12 text-center text-slate-400 italic text-sm">
                                Aucun scan enregistré pour le moment.
                            </div>
                        )}
                    </div>
                </div>

                {/* Répartition Professions (1/3 de largeur) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="font-archivo text-lg italic uppercase tracking-tighter">Répartition</h3>
                    <div className="space-y-4">
                        {data.professionStats?.map((item, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span className="text-slate-400">{item.name}</span>
                                    <span className="text-slate-900">{item.value}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#0A0A14] rounded-full"
                                        style={{ width: `${(item.value / stats.totalParticipants * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
