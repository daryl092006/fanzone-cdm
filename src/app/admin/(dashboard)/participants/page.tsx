import { getParticipants } from '@/app/actions/admin-list';
import {
    User,
    Search,
    Download,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import ParticipantsSearchForm from './ParticipantsSearchForm';

export default async function ParticipantsPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams;
    const query = q || '';

    const data = await getParticipants(query);
    const participants = data.participants || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="font-archivo text-3xl italic uppercase tracking-tighter text-[#0A0A14]">Participants</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {query ? `${participants.length} résultat(s) pour « ${query} »` : `${participants.length} inscrits au total`}
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <ParticipantsSearchForm defaultValue={query} />
                    <a
                        href="/api/exports/participants"
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-[#0A0A14] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-md"
                    >
                        <Download size={14} /> CSV
                    </a>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Participant</th>
                            <th className="px-6 py-4">N° Pass</th>
                            <th className="px-6 py-4">Profession</th>
                            <th className="px-6 py-4">Visites</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {participants.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-archivo italic">
                                            {p.firstName[0]}{p.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{p.firstName} {p.lastName}</p>
                                            <p className="text-xs text-slate-400 font-mono">{p.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-600">
                                        {p.registrationNumber}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-600 font-medium italic">{p.profession}</span>
                                </td>
                                <td className="px-6 py-4 text-center pr-12">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${Math.min(p._count.attendances * 10, 100)}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{p._count.attendances}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.badgeStatus === 'ACTIF' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                        {p.badgeStatus === 'ACTIF' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                        {p.badgeStatus}
                                    </div>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-1">
                                    <Link
                                        href={`/admin/participants/${p.id}`}
                                        className="p-2 text-slate-400 hover:text-[#0A0A14] transition-colors"
                                        title="Voir la fiche détaillée"
                                    >
                                        <Eye size={18} />
                                    </Link>
                                    <Link
                                        href={`/badge/${p.id}`}
                                        target="_blank"
                                        className="p-2 text-slate-400 hover:text-[#0A0A14] transition-colors"
                                        title="Voir le badge"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {participants.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="max-w-xs mx-auto space-y-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                            <User size={32} className="text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-archivo text-slate-400 italic">Aucun participant trouvé</p>
                                            <p className="text-xs text-slate-300 mt-1">Essayez une autre recherche ou vérifiez la base de données.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
