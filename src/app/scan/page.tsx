'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { processScan } from '../actions/scan';
import Image from 'next/image';
import { Camera, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ScanPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;

        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            rememberLastUsedCamera: true
        }, false);

        scanner.render(async (decodedText) => {
            await handleScan(decodedText);
        }, () => { });

        // Style natif de la lib adapté au thème vert sombre
        const style = document.createElement('style');
        style.innerHTML = `
      #reader { border: none !important; background: transparent !important; }
      #reader video { border-radius: 16px; }
      #reader__dashboard_section_csr button {
        background-color: #EAB308 !important;
        color: black !important;
        border: none !important;
        padding: 10px 20px !important;
        border-radius: 12px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        margin: 4px !important;
      }
      #reader__camera_selection {
        padding: 8px 12px !important;
        border-radius: 12px !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        font-size: 13px !important;
        margin-bottom: 8px !important;
        background: rgba(255,255,255,0.05) !important;
        color: white !important;
      }
      #reader__status_span { display: none !important; }
      #reader__header_message { display: none !important; }
    `;
        document.head.appendChild(style);

        return () => { try { scanner.clear(); } catch (e) { } };
    }, [hasStarted]);

    async function handleScan(code: string) {
        if (loading) return;
        setLoading(true);
        try {
            const res = await processScan(code);
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
                        <Image src="/logo-adn.png" alt="ADN" width={28} height={28} className="object-contain" />
                        <Image src="/logo-escen.png" alt="ESCEN" width={48} height={20} className="object-contain" />
                        <Image src="/logo-mairie.png" alt="Mairie" width={48} height={20} className="object-contain" />
                    </div>
                </div>

                {/* Carte Scanner */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">

                    <div className="bg-[#0F1020] px-6 py-5 border-b border-white/5">
                        <h1 className="font-archivo text-white text-lg italic uppercase tracking-tighter flex items-center gap-3">
                            <Camera size={20} className="text-yellow-400" /> Scanner un Badge
                        </h1>
                    </div>

                    <div className="p-6 space-y-6 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-[#0A0A14]/90 z-10 flex flex-col items-center justify-center rounded-b-3xl">
                                <Loader2 size={36} className="animate-spin text-yellow-400 mb-3" />
                                <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest">Vérification...</p>
                            </div>
                        )}

                        {/* Démarrage */}
                        {!hasStarted && !result && (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center mx-auto">
                                    <Camera size={34} className="text-yellow-400" />
                                </div>
                                <div>
                                    <p className="font-archivo text-white text-lg italic uppercase tracking-tighter">Prêt à scanner ?</p>
                                    <p className="text-sm text-white/40 mt-2">Activez la caméra pour valider les entrées.</p>
                                </div>
                                <button
                                    onClick={() => setHasStarted(true)}
                                    className="bg-yellow-400 hover:bg-white text-black font-bold px-8 py-4 rounded-xl transition-all flex items-center gap-3 mx-auto text-sm"
                                >
                                    <Camera size={18} /> Activer la caméra
                                </button>
                            </div>
                        )}

                        {/* Scanner actif */}
                        {hasStarted && !result && (
                            <div className="space-y-4">
                                <div id="reader" className="w-full rounded-2xl overflow-hidden"></div>
                                <button
                                    onClick={() => setHasStarted(false)}
                                    className="text-xs text-white/20 hover:text-red-400 transition-colors w-full text-center py-1"
                                >
                                    Fermer la caméra
                                </button>
                            </div>
                        )}

                        {/* Résultat */}
                        {result && (
                            <div className="space-y-4">
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
                                            {result.success ? 'Accès Accordé' : result.warning ? 'Déjà scanné aujourd\'hui' : 'Accès Refusé'}
                                        </p>
                                        <p className="text-sm text-white/50 mt-1">
                                            {result.error || result.warning || 'Badge valide — Bienvenue !'}
                                        </p>
                                    </div>
                                </div>

                                {result.participant && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Supporter identifié</p>
                                                <p className="font-archivo text-white text-xl italic uppercase tracking-tighter">
                                                    {result.participant.firstName} {result.participant.lastName}
                                                </p>
                                                <p className="text-xs text-yellow-400/80 font-bold mt-0.5">{result.participant.profession}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Visites</p>
                                                <p className="font-archivo text-white text-xl italic">{result.totalVisits}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] text-white/30 pt-3 border-t border-white/5">
                                            <span className="font-mono bg-white/5 px-2 py-1 rounded">{result.participant.badgeCode}</span>
                                            {result.lastVisit && (
                                                <span>Dernier passage: <b className="text-white/50">{result.lastVisit}</b></span>
                                            )}
                                        </div>
                                    </div>
                                )}


                                <button
                                    onClick={() => { setResult(null); }}
                                    className="w-full bg-yellow-400 hover:bg-white text-black font-bold py-4 rounded-xl text-sm transition-all"
                                >
                                    Scanner le suivant →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Saisie Manuelle */}
                {!result && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <div>
                            <p className="text-sm font-bold text-white/60">Saisie manuelle du code</p>
                            <p className="text-xs text-white/30 mt-1">Si le scan caméra ne fonctionne pas.</p>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                placeholder="FZ26-XXXX-XXXX"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                            />
                            <button
                                onClick={() => handleScan(manualCode)}
                                className="bg-yellow-400 hover:bg-white text-black px-5 rounded-xl transition-all font-bold"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
