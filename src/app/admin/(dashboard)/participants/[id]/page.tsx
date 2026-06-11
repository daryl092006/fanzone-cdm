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
                    <Link href="/admin/participants" className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à la liste
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${participant.badgeStatus === 'ACTIF' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            Badge {participant.badgeStatus}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Colonne Profil */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 sticky top-24">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center rotate-3">
                                    <User size={48} className="text-black" />
                                </div>
                                <div>
                                    <h1 className="font-archivo text-2xl italic uppercase text-white tracking-tighter">
                                        {participant.firstName} {participant.lastName}
                                    </h1>
                                    <p className="text-sm text-yellow-400 font-bold uppercase tracking-wider">{participant.profession}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone size={16} className="text-white/20" />
                                    <span className="text-white/70">{participant.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar size={16} className="text-white/20" />
                                    <span className="text-white/70">Inscrit le {format(participant.createdAt, 'dd MMMM yyyy', { locale: fr })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <ShieldCheck size={16} className="text-white/20" />
                                    <span className="text-white/70">Code: <span className="font-mono">{participant.registrationNumber}</span></span>
                                </div>
                            </div>

                            <Link
                                href={`/badge/${participant.id}`}
                                target="_blank"
                                className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all"
                            >
                                Visualiser le Badge
                            </Link>
                        </div>
                    </div>

                    {/* Colonne Activité */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Statistiques rapides */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Visites</p>
                                <p className="font-archivo text-3xl text-white italic">{participant._count.attendances}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Dernière visite</p>
                                <p className="font-archivo text-3xl text-white italic">
                                    {participant.attendances[0] ? format(participant.attendances[0].scanTime, 'dd/MM', { locale: fr }) : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Historique des Scans */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                            <div className="px-8 py-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                <History size={18} className="text-yellow-400" />
                                <h3 className="font-archivo text-lg italic uppercase text-white tracking-tighter">Historique des Présences</h3>
                            </div>
                            <div className="divide-y divide-white/5">
                                {participant.attendances.length > 0 ? (
                                    participant.attendances.map((scan) => (
                                        <div key={scan.id} className="px-8 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                                    <CheckCircle2 size={18} className="text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white capitalize">{format(scan.scanTime, 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Terrain GER, Akodesséwa · Lomé</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{format(scan.scanTime, 'HH:mm')}</p>
                                                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Validé</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                            <History size={32} className="text-white" />
                                        </div>
                                        <p className="text-sm text-white/20 font-medium">Aucun historique de présence pour ce participant.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
