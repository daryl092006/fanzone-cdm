'use client';

import { useState } from 'react';
import { Share2, CheckCircle2, Download, Loader2 } from 'lucide-react';

interface BadgeActionsProps {
    participantId: string;
    registrationNumber: string;
    firstName: string;
    lastName: string;
    phoneMasked: string;
    profession: string;
    dateInscription: string;
    isActive: boolean;
}

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
    });
}

export default function BadgeActions({
    participantId,
    registrationNumber,
    firstName,
    lastName,
    phoneMasked,
    profession,
    dateInscription,
    isActive
}: BadgeActionsProps) {
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    async function handleDownload() {
        setDownloading(true);
        try {
            // 1. Récupérer le QR code Canvas rendu par qrcode.react
            const canvasElement = document.querySelector('#badge-card canvas') as HTMLCanvasElement;
            if (!canvasElement) {
                alert("QR Code introuvable");
                setDownloading(false);
                return;
            }

            const qrPngDataUrl = canvasElement.toDataURL('image/png');

            // 2. Charger jsPDF via CDN pour éviter les bugs de compilation SSR Next.js
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
            
            // Récupérer le constructeur global
            const jsPDFClass = (window as any).jspdf.jsPDF;
            const doc = new jsPDFClass({
                orientation: 'portrait',
                unit: 'mm',
                format: [85, 125] // Taille de badge standard (85x125 mm)
            });

            // Fond bleu foncé de l'en-tête du badge
            doc.setFillColor(15, 16, 32); // #0F1020
            doc.rect(0, 0, 85, 28, 'F');

            // Titre principal de la Fan Zone
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text("Fan Zone Coupe du Monde 2026", 42.5, 9, { align: 'center' });

            // Sous-titre
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.setTextColor(180, 180, 180);
            doc.text("Badge Officiel - Mairie du Golfe 1 - ADN x ESCEN", 42.5, 14, { align: 'center' });

            // Badge Statut
            if (isActive) {
                doc.setFillColor(234, 179, 8); // Jaune or
                doc.rect(32.5, 18, 20, 4.5, 'F');
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6);
                doc.text("ACTIF", 42.5, 21.2, { align: 'center' });
            } else {
                doc.setFillColor(239, 68, 68); // Rouge
                doc.rect(32.5, 18, 20, 4.5, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6);
                doc.text("ANNULE", 42.5, 21.2, { align: 'center' });
            }

            // Nom du titulaire
            doc.setTextColor(10, 10, 20);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            const displayName = `${firstName} ${lastName}`.toUpperCase();
            doc.text(displayName, 42.5, 38, { align: 'center' });

            // Profession
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(profession, 42.5, 43, { align: 'center' });

            // Ajout du QR Code PNG centré
            doc.addImage(qrPngDataUrl, 'PNG', 22.5, 48, 40, 40);

            // Ligne de séparation
            doc.setDrawColor(230, 230, 230);
            doc.line(10, 94, 75, 94);

            // Colonne Gauche - N° PASS
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(140, 140, 140);
            doc.text("N° PASS", 12, 99);
            doc.setFont('courier', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(50, 50, 50);
            doc.text(registrationNumber, 12, 103);

            // Colonne Droite - TELEPHONE
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(140, 140, 140);
            doc.text("TELEPHONE", 45, 99);
            doc.setFont('courier', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(50, 50, 50);
            doc.text(phoneMasked, 45, 103);

            // Colonne Gauche 2 - DATE INSCRIPTION
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(140, 140, 140);
            doc.text("INSCRIT LE", 12, 109);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(50, 50, 50);
            doc.text(dateInscription, 12, 113);

            // Colonne Droite 2 - GOLFE 1 LOME
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(140, 140, 140);
            doc.text("LIEU", 45, 109);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(50, 50, 50);
            doc.text("Golfe 1, Lomé, Togo", 45, 113);

            // Footer du PDF
            doc.setFillColor(245, 247, 250);
            doc.rect(0, 118, 85, 7, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(5.5);
            doc.setTextColor(150, 150, 150);
            doc.text("Mairie du Golfe 1 - ADN x ESCEN - Fan Zone 2026", 42.5, 122.5, { align: 'center' });

            // Téléchargement du fichier
            doc.save(`badge-${registrationNumber}.pdf`);

        } catch (err) {
            console.error("Erreur globale téléchargement PDF:", err);
        } finally {
            setDownloading(false);
        }
    }

    async function handleShare() {
        const url = `${window.location.origin}/badge/${participantId}`;
        try {
            if (navigator.share) {
                // API native de partage (mobile)
                await navigator.share({
                    title: 'Mon Badge Fan Zone 2026',
                    text: `Badge #${registrationNumber} — Fan Zone Coupe du Monde 2026`,
                    url,
                });
            } else {
                // Fallback : copier dans le presse-papier
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            }
        } catch {
            // Ignore les erreurs d'annulation
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <button
                disabled={downloading}
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-slate-900 hover:text-white text-black font-bold py-4 rounded-xl text-sm transition-all disabled:opacity-50 shadow-md cursor-pointer animate-pulse"
            >
                {downloading ? (
                    <>
                        <Loader2 className="animate-spin" size={16} />
                        Génération du PDF...
                    </>
                ) : (
                    <>
                        <Download size={16} /> Télécharger le Badge (PDF)
                    </>
                )}
            </button>
            <button
                onClick={handleShare}
                className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl text-sm transition-all cursor-pointer ${copied ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-black hover:bg-yellow-400 hover:border-transparent'}`}
            >
                {copied
                    ? <><CheckCircle2 size={16} /> Lien copié !</>
                    : <><Share2 size={16} /> Partager le Badge</>
                }
            </button>
        </div>
    );
}
