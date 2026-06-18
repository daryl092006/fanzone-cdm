'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface RapportExportButtonProps {
    exportId: string;
    label: string;
    variant?: 'primary' | 'secondary';
    customFilename?: string;
}

export default function RapportExportButton({ 
    exportId, 
    label, 
    variant = 'primary',
    customFilename
}: RapportExportButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleExport() {
        setLoading(true);
        try {
            const res = await fetch(`/api/exports/${exportId}`);
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const name = customFilename || exportId.replace(/[?&=]/g, '-');
            a.download = `fanzone-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export. Réessayez.');
        } finally {
            setLoading(false);
        }
    }

    if (variant === 'secondary') {
        return (
            <button
                onClick={handleExport}
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-[#0A0A14] hover:bg-yellow-400 hover:text-black text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                {loading ? 'Export...' : label}
            </button>
        );
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0A0A14] hover:bg-yellow-400 hover:text-black text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {loading ? 'Export...' : label}
        </button>
    );
}
