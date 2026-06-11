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

            // Fond gris clair de l'en-tête du badge
            doc.setFillColor(248, 250, 252); // #F8FAFC
            doc.rect(0, 0, 85, 28, 'F');
            doc.setDrawColor(226, 232, 240); // Bordure #E2E8F0
            doc.line(0, 28, 85, 28);

            // Titre principal de la Fan Zone
            doc.setTextColor(15, 16, 32); // Couleur sombre #0F1020
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text("Ici le Mondial Golfe 1 Digital Fan Zone", 42.5, 9, { align: 'center' });

            // Sous-titre
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.setTextColor(100, 116, 139); // Gris ardoise #64748B
            doc.text("Badge Officiel - Mairie du Golfe 1 - ADN x ESCEN", 42.5, 14, { align: 'center' });

            // Badge Statut
            if (isActive) {
                doc.setFillColor(254, 249, 195); // Fond jaune clair #FEF9C3
                doc.rect(32.5, 18, 20, 4.5, 'F');
                // Dessiner une petite bordure jaune or
                doc.setDrawColor(254, 240, 138);
                doc.rect(32.5, 18, 20, 4.5, 'S');
                
                doc.setTextColor(133, 77, 14); // Texte jaune foncé #854D0E
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6);
                doc.text("ACTIF", 42.5, 21.2, { align: 'center' });
            } else {
                doc.setFillColor(254, 226, 226); // Fond rouge clair #FEE2E2
                doc.rect(32.5, 18, 20, 4.5, 'F');
                // Dessiner une petite bordure rouge
                doc.setDrawColor(252, 165, 165);
                doc.rect(32.5, 18, 20, 4.5, 'S');
                
                doc.setTextColor(153, 27, 27); // Texte rouge foncé #991B1B
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
            doc.text("Terrain GER, Lomé", 45, 113);

            // Footer du PDF
            doc.setFillColor(245, 247, 250);
            doc.rect(0, 118, 85, 7, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(5);
            doc.setTextColor(150, 150, 150);
            doc.text("Mairie du Golfe 1 - ADN x ESCEN - Ici le Mondial Golfe 1 Digital Fan Zone", 42.5, 122.5, { align: 'center' });

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
                    title: 'Mon Badge - Ici le Mondial Golfe 1 Digital Fan Zone',
                    text: `Badge #${registrationNumber} — Ici le Mondial Golfe 1 Digital Fan Zone`,
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
