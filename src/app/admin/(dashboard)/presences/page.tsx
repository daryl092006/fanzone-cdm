import { getPresences } from '@/app/actions/admin-list';
import {
    History,
    MapPin,
    User,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default async function PresencesPage() {
    const data = await getPresences();
    const presences = data.presences || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-archivo text-3xl italic uppercase tracking-tighter text-[#0A0A14]">Journal des Présences</h1>
                <p className="text-slate-400 text-sm mt-1">Historique des accès à la Fan Zone en temps réel.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest px-8 py-4">
                    <div className="col-span-4">Participant</div>
                    <div className="col-span-3 text-center">Date</div>
                    <div className="col-span-3 text-center">Heure de Scan</div>
                    <div className="col-span-2 text-right">Statut</div>
                </div>

                <div className="divide-y divide-slate-50">
                    {presences.map((att) => (
                        <div key={att.id} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-slate-50 transition-colors">
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 italic font-archivo text-xs">
                                    {att.participant.firstName[0]}{att.participant.lastName[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{att.participant.firstName} {att.participant.lastName}</p>
                                    <p className="text-[10px] font-mono text-slate-400 leading-none">{att.participant.registrationNumber}</p>
                                </div>
                            </div>

                            <div className="col-span-3 text-center">
                                <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                    <Calendar size={12} className="text-slate-300" /> {att.date}
                                </div>
                            </div>

                            <div className="col-span-3 text-center">
                                <span className="text-sm font-mono font-bold text-slate-600">
                                    {format(new Date(att.scanTime), 'HH:mm:ss')}
                                </span>
                            </div>

                            <div className="col-span-2 text-right">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-100">
                                    <CheckCircle2 size={12} /> {att.status}
                                </div>
                            </div>
                        </div>
                    ))}

                    {presences.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <History size={32} className="text-slate-200" />
                            </div>
                            <p className="font-archivo text-slate-300 italic">Aucune présence enregistrée</p>
                            <p className="text-xs text-slate-200 mt-1">Les scanners n'ont pas encore été activés.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
