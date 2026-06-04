'use client';

import { useState } from 'react';
import { deactivateBadge } from '@/app/actions/badge-pool';
import { ShieldOff, Loader2 } from 'lucide-react';

export default function BadgeDeactivateButton({ badgeCode }: { badgeCode: string }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function handleDeactivate() {
        if (!confirm(`Désactiver le badge ${badgeCode} ? Cette action empêchera l'accès à la Fan Zone.`)) return;
        setLoading(true);
        const res = await deactivateBadge(badgeCode);
        if (res.success) {
            setDone(true);
            setTimeout(() => window.location.reload(), 800);
        }
        setLoading(false);
    }

    if (done) return <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Désactivé</span>;

    return (
        <button
            onClick={handleDeactivate}
            disabled={loading}
            title="Désactiver ce badge"
            className="p-2 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-40"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
        </button>
    );
}
