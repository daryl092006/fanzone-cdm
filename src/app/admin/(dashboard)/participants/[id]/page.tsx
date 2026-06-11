import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Phone, Briefcase, Calendar, History, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default async function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: pData, error: pError } = await supabase
        .from('participants')
        .select(`
            id,
            first_name,
            last_name,
            phone,
            created_at,
            profession,
            badges (
                badge_code,
                status
            ),
            attendances (
                id,
                scan_time
            )
        `)
        .eq('id', id)
        .single();

    if (pError || !pData) notFound();

    const sortedAttendances = (pData.attendances || []).sort((a, b) => new Date(b.scan_time).getTime() - new Date(a.scan_time).getTime());

    const participant = {
        id: pData.id,
        firstName: pData.first_name,
        lastName: pData.last_name,
        phone: pData.phone,
        createdAt: new Date(pData.created_at),
        profession: pData.profession,
        registrationNumber: (pData.badges as any)?.badge_code || '',
        badgeStatus: (pData.badges as any)?.status === 'ASSIGNE' ? 'ACTIF' : 'INACTIF',
        attendances: sortedAttendances.map(att => ({
            id: att.id,
            scanTime: new Date(att.scan_time)
        })),
        _count: {
            attendances: pData.attendances?.length || 0
        }
    };

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header / Navigation */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/participants" className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à la liste
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${participant.badgeStatus === 'ACTIF' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            Badge {participant.badgeStatus}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Colonne Profil */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 sticky top-24 shadow-sm">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center rotate-3">
                                    <User size={48} className="text-black" />
                                </div>
                                <div>
                                    <h1 className="font-archivo text-2xl italic uppercase text-[#0A0A14] tracking-tighter">
                                        {participant.firstName} {participant.lastName}
                                    </h1>
                                    <p className="text-sm text-yellow-600 font-bold uppercase tracking-wider">{participant.profession}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone size={16} className="text-slate-400" />
                                    <span className="text-slate-600 font-medium">{participant.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span className="text-slate-600 font-medium">Inscrit le {format(participant.createdAt, 'dd MMMM yyyy', { locale: fr })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <ShieldCheck size={16} className="text-slate-400" />
                                    <span className="text-slate-600 font-medium">Code: <span className="font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{participant.registrationNumber}</span></span>
                                </div>
                            </div>

                            <Link
                                href={`/badge/${participant.id}`}
                                target="_blank"
                                className="w-full flex items-center justify-center gap-2 bg-[#0A0A14] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-md"
                            >
                                Visualiser le Badge
                            </Link>
                        </div>
                    </div>

                    {/* Colonne Activité */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Statistiques rapides */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Visites</p>
                                <p className="font-archivo text-3xl text-slate-900 italic">{participant._count.attendances}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernière visite</p>
                                <p className="font-archivo text-3xl text-slate-900 italic">
                                    {participant.attendances[0] ? format(participant.attendances[0].scanTime, 'dd/MM', { locale: fr }) : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Historique des Scans */}
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                                <History size={18} className="text-slate-400" />
                                <h3 className="font-archivo text-lg italic uppercase text-slate-900 tracking-tighter">Historique des Présences</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {participant.attendances.length > 0 ? (
                                    participant.attendances.map((scan) => (
                                        <div key={scan.id} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                                    <CheckCircle2 size={18} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 capitalize">{format(scan.scanTime, 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Terrain GER, Akodesséwa · Lomé</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-900">{format(scan.scanTime, 'HH:mm')}</p>
                                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Validé</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-60">
                                            <History size={32} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium italic">Aucun historique de présence pour ce participant.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
