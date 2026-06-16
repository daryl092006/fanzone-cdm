'use client';

import { useState } from 'react';
import { registerPresenceByPhone } from '../actions/scan';
import Image from 'next/image';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, UserCheck, Phone } from 'lucide-react';

export default function ScanPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    async function handleRegisterPresence(phoneStr: string) {
        if (!phoneStr.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await registerPresenceByPhone(phoneStr);
            setResult(res);
        } catch {
            setResult({ error: "Erreur de connexion au serveur." });
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-[#0A0A14] font-space py-10 px-4">
            <div className="max-w-lg mx-auto space-y-6">

                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center">
                            <ShieldCheck size={20} className="text-yellow-400" />
                        </div>
                        <div>
                            <p className="font-archivo text-white text-sm italic uppercase tracking-tighter">Contrôle d'accès</p>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Complexe Sportif d&apos;Akodesséwa-Kpota (Terrain GER)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg px-2 py-1"><Image src="/logo-mairie.png" alt="Mairie" width={48} height={20} className="object-contain" /></div>
                        <div className="bg-white rounded-lg px-2 py-1"><Image src="/logo-escen.png" alt="ESCEN" width={48} height={20} className="object-contain" /></div>
                        <div className="bg-white rounded-lg px-2 py-1"><Image src="/logo-adn.png" alt="ADN" width={28} height={28} className="object-contain" /></div>
                    </div>
                </div>

                {/* Carte Enregistrement */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">

                    <div className="bg-[#0F1020] px-6 py-5 border-b border-white/5">
                        <h1 className="font-archivo text-white text-lg italic uppercase tracking-tighter flex items-center gap-3">
                            <UserCheck size={20} className="text-yellow-400" /> Enregistrement Présence
                        </h1>
                    </div>

                    <div className="p-6 space-y-6 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-[#0A0A14]/90 z-10 flex flex-col items-center justify-center rounded-b-3xl">
                                <Loader2 size={36} className="animate-spin text-yellow-400 mb-3" />
                                <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest">Enregistrement...</p>
                            </div>
                        )}

                        {/* Formulaire Principal (Visible s'il n'y a pas de résultat de validation) */}
                        {!result && (
                            <div className="space-y-6">
                                <div className="text-center py-6 space-y-3">
                                    <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center mx-auto">
                                        <Phone size={24} className="text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-archivo text-white text-md italic uppercase tracking-tighter">Saisie du téléphone</p>
                                        <p className="text-xs text-white/40">Entrez le numéro du participant pour valider sa présence.</p>
                                    </div>
                                </div>

                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleRegisterPresence(phoneNumber);
                                    }}
                                    className="flex gap-3"
                                >
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Ex: 90123456"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-yellow-400 hover:bg-white text-black px-6 rounded-xl transition-all font-bold flex items-center justify-center"
                                    >
                                        Valider <ArrowRight size={16} className="ml-2" />
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Résultat d'enregistrement */}
                        {result && (
                            <div className="space-y-6">
                                <div className={`flex items-start gap-4 p-5 rounded-2xl border ${result.success
                                    ? 'bg-green-400/10 border-green-400/20'
                                    : result.warning
                                        ? 'bg-yellow-400/10 border-yellow-400/20'
                                        : 'bg-red-400/10 border-red-400/20'
                                    }`}>
                                    <div className={`p-2 rounded-xl flex-shrink-0 ${result.success ? 'bg-green-500'
                                        : result.warning ? 'bg-yellow-400'
                                            : 'bg-red-500'
                                        }`}>
                                        {result.success
                                            ? <CheckCircle2 size={22} className="text-white" />
                                            : <AlertCircle size={22} className={result.warning ? 'text-black' : 'text-white'} />
                                        }
                                    </div>
                                    <div>
                                        <p className={`font-archivo text-base italic uppercase tracking-tighter ${result.success ? 'text-green-400'
                                            : result.warning ? 'text-yellow-400'
                                                : 'text-red-400'
                                            }`}>
                                            {result.success ? 'Présence Enregistrée' : result.warning ? 'Déjà enregistré' : 'Erreur'}
                                        </p>
                                        <p className="text-sm text-white/60 mt-1">
                                            {result.error || result.warning || 'Présence validée pour aujourd\'hui.'}
                                        </p>
                                    </div>
                                </div>

                                {result.participant && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Supporter</p>
                                        <p className="font-archivo text-white text-xl italic uppercase tracking-tighter">
                                            {result.participant.firstName} {result.participant.lastName}
                                        </p>
                                        <p className="text-xs text-yellow-400/80 font-bold">{result.participant.profession}</p>
                                        <p className="text-xs text-white/40 font-mono">Tél: {result.participant.phone}</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setPhoneNumber('');
                                    }}
                                    className="w-full bg-yellow-400 hover:bg-white text-black font-bold py-4 rounded-xl text-sm transition-all"
                                >
                                    Suivant →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
