'use client';

import { useState } from 'react';
import { generateBadgePool } from '@/app/actions/badge-pool';
import { Loader2, Zap, CheckCircle2 } from 'lucide-react';

export default function BadgeGeneratorForm() {
    const [count, setCount] = useState(50);
    const [prefix, setPrefix] = useState('A');
    const [batchName, setBatchName] = useState(`lot-${new Date().toISOString().slice(0, 10)}`);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; count?: number; batch?: string; error?: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        const res = await generateBadgePool(count, prefix.toUpperCase(), batchName);
        setResult(res as any);
        setLoading(false);
        if (res.success) {
            // Refresh page to update list
            setTimeout(() => window.location.reload(), 1500);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nombre de badges</label>
                <input
                    type="number"
                    min={1}
                    max={2000}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Préfixe (lettre série)</label>
                <input
                    type="text"
                    maxLength={3}
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="Ex: A, B, C..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
                <p className="text-[9px] text-slate-300">Les codes générés seront de type <span className="font-mono">FZ26-{prefix}482910</span> (chiffres aléatoires)</p>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nom du lot</label>
                <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="lot-2026-06-03"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
            </div>

            {result && (
                <div className={`p-4 rounded-xl text-sm font-bold ${result.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {result.success ? (
                        <span className="flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            {result.count} badges créés dans le lot « {result.batch} »
                        </span>
                    ) : result.error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#0A0A14] hover:bg-yellow-400 hover:text-black text-white font-bold py-4 rounded-xl text-sm transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                {loading ? 'Génération...' : `Générer ${count} badges`}
            </button>
        </form>
    );
}
