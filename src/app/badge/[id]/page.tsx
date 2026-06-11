import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import QRCodeClient from './QRCodeClient';
import Image from 'next/image';
import { Printer, Home, Share2, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import BadgeActions from './BadgeActions';

export default async function BadgePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: participantData, error: participantError } = await supabase
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
            )
        `)
        .eq('id', id)
        .single();

    if (participantError || !participantData) {
        notFound();
    }

    const participant = {
        id: participantData.id,
        firstName: participantData.first_name,
        lastName: participantData.last_name,
        phone: participantData.phone,
        createdAt: participantData.created_at,
        profession: participantData.profession,
        registrationNumber: (participantData.badges as any)?.badge_code || '',
        badgeStatus: (participantData.badges as any)?.status === 'ASSIGNE' ? 'ACTIF' : 'INACTIF'
    };

    // Masquage partiel du téléphone : afficher que les 4 derniers chiffres
    const phoneMasked = participant.phone
        ? '**** ' + participant.phone.slice(-4)
        : '—';

    // Date d'inscription formatée
    const dateInscription = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(participant.createdAt));

    const isActive = participant.badgeStatus === 'ACTIF';

    return (
        <div className="min-h-screen bg-slate-50 font-space flex flex-col items-center py-12 px-6 print:bg-white print:py-4">

            {/* Header — masqué à l'impression */}
            <div className="w-full max-w-sm mb-10 flex justify-between items-center print:hidden">
                <Link href="/" className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                    <Home size={14} /> Accueil
                </Link>
                <div className="flex items-center gap-3">
                    <Image src="/logo-adn.png" alt="ADN" width={48} height={48} className="object-contain" />
                    <Image src="/logo-escen.png" alt="ESCEN" width={64} height={28} className="object-contain" />
                    <Image src="/logo-mairie.png" alt="Mairie" width={56} height={28} className="object-contain" />
                </div>
            </div>

            {/* Titre — masqué à l'impression */}
            <div className="text-center mb-8 space-y-2 print:hidden">
                <div className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full ${isActive ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-600' : 'bg-red-400/10 border-red-400/20 text-red-600'}`}>
                    {isActive
                        ? <><CheckCircle2 size={14} className="text-yellow-600" /> <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600">Badge Actif</span></>
                        : <><XCircle size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Badge Annulé</span></>
                    }
                </div>
                <h1 className="font-archivo text-2xl italic tracking-tighter uppercase text-slate-900">
                    Votre Pass <span className="text-yellow-500">Officiel</span>
                </h1>
                <p className="text-sm text-slate-500">Présentez ce QR code à l'entrée chaque jour.</p>
            </div>

            {/* ===== LE BADGE ===== */}
            {/* Alerte si badge annulé */}
            {!isActive && (
                <div className="w-full max-w-xs mb-6 bg-red-950/10 border border-red-500/20 rounded-2xl p-5 text-center print:hidden">
                    <XCircle size={28} className="text-red-600 mx-auto mb-2" />
                    <p className="font-bold text-red-700 text-sm">Badge annulé</p>
                    <p className="text-red-600/60 text-xs mt-1">Ce badge ne permet plus l'accès à la Fan Zone. Contactez un agent d'assistance.</p>
                </div>
            )}

            <div id="badge-card" className="w-full max-w-xs bg-white rounded-3xl shadow-2xl shadow-slate-200 overflow-hidden print:shadow-none print:rounded-none print:max-w-full border border-slate-100">

                {/* Header du badge */}
                <div className="bg-slate-50 border-b border-slate-100 px-8 py-7 text-center space-y-3 print:bg-white print:border-b-2 print:border-black">
                    <div className="flex justify-center items-center gap-3">
                        <Image src="/logo-adn.png" alt="ADN" width={48} height={48} className="object-contain" />
                        <Image src="/logo-escen.png" alt="ESCEN" width={80} height={36} className="object-contain" />
                        <Image src="/logo-mairie.png" alt="Mairie" width={72} height={32} className="object-contain" />
                    </div>
                    <div>
                        <h2 className="font-archivo text-slate-900 text-base italic uppercase tracking-tighter print:text-black">Ici le Mondial Golfe 1 Digital Fan Zone</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 print:text-black">Badge Officiel · Mairie du Golfe 1 · ADN × ESCEN</p>
                    </div>

                    {/* Statut du badge — Visible sur le badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {isActive ? 'Actif' : 'Annulé'}
                    </div>
                </div>

                {/* Corps du badge */}
                <div className="p-8 space-y-6">

                    {/* Nom & infos */}
                    <div className="text-center space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titulaire du Badge</p>
                        <p className="font-archivo text-2xl italic uppercase text-[#0A0A0A] tracking-tight leading-tight">
                            {participant.firstName} {participant.lastName}
                        </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center bg-slate-50 p-5 rounded-2xl border border-slate-100 print:border-black print:border-2">
                        <QRCodeClient
                            value={participant.registrationNumber}
                            size={160}
                        />
                    </div>

                    {/* Informations détaillées */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">N° Pass</p>
                                <p className="text-xs font-mono font-bold text-slate-700">{participant.registrationNumber}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Profession</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{participant.profession}</p>
                            </div>
                            {/* CORRECTION AUDIT #1 : Téléphone masqué */}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Téléphone</p>
                                <p className="text-xs font-mono font-bold text-slate-700">{phoneMasked}</p>
                            </div>
                            {/* CORRECTION AUDIT #6 : Date d'inscription */}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Inscrit le</p>
                                <p className="text-xs font-bold text-slate-700">{dateInscription}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rappel quotidien */}
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 leading-relaxed uppercase tracking-wide">
                        <Info size={12} className="shrink-0" /> À présenter à chaque entrée · Valable toute la durée de l'événement
                    </div>
                </div>

                {/* Footer du badge */}
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center print:bg-white print:border-t-2 print:border-black">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Mairie du Golfe 1 · ADN × ESCEN · Ici le Mondial Golfe 1 Digital Fan Zone</p>
                </div>
            </div>

            {/* Boutons d'action — masqués à l'impression */}
            <div className="w-full max-w-xs mt-8 space-y-3 print:hidden">
                <BadgeActions
                    participantId={id}
                    registrationNumber={participant.registrationNumber}
                    firstName={participant.firstName}
                    lastName={participant.lastName}
                    phoneMasked={phoneMasked}
                    profession={participant.profession}
                    dateInscription={dateInscription}
                    isActive={isActive}
                />
                <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl text-sm transition-all"
                >
                    <Home size={16} /> Retour à l'accueil
                </Link>
            </div>

            <p className="mt-10 text-[10px] text-white/15 uppercase tracking-widest font-bold print:hidden">
                © 2026 Mairie du Golfe 1 · Tous Droits Réservés
            </p>
        </div>
    );
}
