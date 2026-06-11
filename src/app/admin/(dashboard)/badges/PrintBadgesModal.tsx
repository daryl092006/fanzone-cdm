'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface PrintBadgesModalProps {
    badges: Array<{ id: string; badge_code: string; status: string; print_batch?: string }>;
    onClose: () => void;
}

export default function PrintBadgesModal({ badges, onClose }: PrintBadgesModalProps) {
    const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generateQRs() {
            const urls: Record<string, string> = {};
            for (const badge of badges) {
                try {
                    const url = await QRCode.toDataURL(badge.badge_code, {
                        margin: 2,
                        width: 150,
                        color: {
                            dark: '#0A0A14',
                            light: '#FFFFFF'
                        }
                    });
                    urls[badge.badge_code] = url;
                } catch (err) {
                    console.error('Failed to generate QR for', badge.badge_code, err);
                }
            }
            setQrUrls(urls);
            setLoading(false);
        }
        generateQRs();
    }, [badges]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0A0A14]/80 backdrop-blur-sm flex items-center justify-center p-6 print:p-0 print:bg-white print:static print:inset-auto">
            <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl print:shadow-none print:p-0 print:max-h-none print:overflow-visible">
                {/* Header screen only */}
                <div className="flex items-center justify-between mb-6 border-b pb-4 print:hidden">
                    <div>
                        <h2 className="font-archivo text-xl italic uppercase text-slate-900">
                            Impression des Badges Officiels
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Prêt à imprimer sur papier cartonné. ({badges.length} badges)
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-yellow-400 hover:bg-black hover:text-white text-black font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all"
                        >
                            Imprimer (CTRL + P)
                        </button>
                        <button
                            onClick={onClose}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all"
                        >
                            Fermer
                        </button>
                    </div>
                </div>

                {/* Print area */}
                {loading ? (
                    <div className="py-20 flex justify-center items-center text-slate-500">
                        Génération des QR Codes...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-2xl print:bg-white print:grid-cols-3 print:gap-8 print:p-0">
                        {badges.map((badge) => (
                            <div
                                key={badge.id}
                                className="relative w-72 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mx-auto print:shadow-none print:border-slate-300 print:break-inside-avoid print:my-4"
                            >
                                {/* Header du badge (avec les vrais logos de l'événement) */}
                                <div className="bg-slate-50 border-b border-slate-200 p-5 text-slate-800 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/logo-adn.png" alt="ADN" className="h-6 object-contain" />
                                            <span className="text-slate-200 text-xs">|</span>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/logo-escen.png" alt="ESCEN" className="h-4 object-contain" />
                                            <span className="text-slate-200 text-xs">|</span>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/logo-mairie.png" alt="Mairie" className="h-6 object-contain" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[6px] font-bold uppercase tracking-widest text-slate-400">Ici le Mondial Golfe 1 Digital Fan Zone</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Accès Fan Zone</p>
                                        <h3 className="font-archivo text-lg italic uppercase leading-none tracking-tight text-slate-900">SUPPORT SUR PLACE</h3>
                                    </div>
                                </div>

                                {/* Contenu principal (QR Code) */}
                                <div className="p-6 space-y-4 bg-white flex flex-col items-center">
                                    <div className="bg-slate-50 p-3 aspect-square rounded-2xl flex items-center justify-center relative border border-slate-100">
                                        {qrUrls[badge.badge_code] ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={qrUrls[badge.badge_code]}
                                                alt={badge.badge_code}
                                                className="w-32 h-32 object-contain"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-slate-300">
                                                QR
                                            </div>
                                        )}
                                        <span className="absolute bottom-2 font-bold text-[8px] uppercase tracking-widest bg-yellow-400 border border-yellow-500 px-2 py-1 rounded-full text-black shadow-sm">
                                            À SCANNER
                                        </span>
                                    </div>

                                    {/* Numéro du badge */}
                                    <div className="w-full bg-[#0A0A14] text-white rounded-xl py-2.5 text-center font-mono text-[11px] font-bold tracking-wider">
                                        {badge.badge_code}
                                    </div>

                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
                                        Badge pré-imprimé Libre<br />
                                        <span className="text-yellow-600">Série : {badge.print_batch || 'Lot'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* CSS style injected only for printing layout */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:static, .print\\:static * {
                        visibility: visible;
                    }
                    .print\\:static {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    header, footer, nav, aside {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
