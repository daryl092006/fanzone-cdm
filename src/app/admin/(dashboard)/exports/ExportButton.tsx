'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function ExportButton({ exportId, label }: { exportId: string; label: string }) {
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
            a.download = `fanzone-${exportId}-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            alert('Erreur lors de l\'export. Réessayez.');
        } finally {
            setLoading(false);
        }
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
