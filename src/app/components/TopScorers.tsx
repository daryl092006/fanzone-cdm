'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Medal } from 'lucide-react';
import type { WCAScorer } from '@/lib/worldcup-api';

export default function TopScorers() {
  const [scorers, setScorers] = useState<WCAScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch('/api/wca/goalscorers');
        const json = await res.json();
        if (json.success) {
          setScorers(Array.isArray(json.data) ? json.data.slice(0, 10) : []);
        } else {
          setError(json.error ?? 'Erreur');
        }
      } catch {
        setError('Impossible de charger le classement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section id="buteurs" className="py-28 px-6 lg:px-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">
              Soulier d'Or
            </p>
            <h2 className="font-archivo text-4xl md:text-5xl tracking-tighter italic uppercase">
              Top Buteurs
            </h2>
            <p className="text-sm text-slate-400">
              Classement des meilleurs buteurs de la Coupe du Monde 2026.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-700 px-5 py-2.5 rounded-full">
            <Target size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Top 10</span>
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <LoadingList />
        ) : error ? (
          <ErrorState error={error} />
        ) : scorers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {scorers.map((scorer, i) => (
              <ScorerCard key={`${scorer.player_name}-${i}`} scorer={scorer} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function ScorerCard({ scorer, rank }: { scorer: WCAScorer; rank: number }) {
  const isPodium = rank <= 3;

  const medalColor = {
    1: 'text-yellow-500',
    2: 'text-slate-400',
    3: 'text-amber-600',
  }[rank] ?? 'text-slate-300';

  const bgStyle = isPodium && rank === 1
    ? 'bg-[#0A0A14] text-white'
    : 'bg-slate-50 border border-slate-100';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (rank - 1) * 0.06 }}
      className={`flex items-center gap-5 p-5 rounded-2xl transition-all hover:shadow-md ${bgStyle}`}
    >
      {/* Rang */}
      <div className="w-10 shrink-0 text-center">
        {isPodium ? (
          <Medal size={22} className={medalColor} />
        ) : (
          <span className={`font-archivo text-xl font-black ${rank === 1 ? 'text-white/40' : 'text-slate-200'}`}>
            {rank}
          </span>
        )}
      </div>

      {/* Flag + Infos joueur */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {scorer.team?.flag && (
          <span className="text-2xl shrink-0">{scorer.team.flag}</span>
        )}
        <div className="min-w-0">
          <p className={`font-bold text-sm truncate uppercase ${rank === 1 ? 'text-white' : 'text-slate-800'}`}>
            {scorer.player_name}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${rank === 1 ? 'text-white/40' : 'text-slate-400'}`}>
            {scorer.team?.name ?? ''}
          </p>
        </div>
      </div>

      {/* Buts */}
      <div className="shrink-0 text-right">
        <div className={`
          inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
          ${rank === 1 ? 'bg-yellow-400 text-black' : 'bg-[#0A0A14] text-white'}
        `}>
          <Target size={12} />
          <span className="font-black text-sm tabular-nums">{scorer.goals}</span>
        </div>
        {scorer.assists !== undefined && scorer.assists > 0 && (
          <p className={`text-[9px] mt-1 font-bold ${rank === 1 ? 'text-white/30' : 'text-slate-300'}`}>
            {scorer.assists} passe{scorer.assists > 1 ? 's' : ''} déc.
          </p>
        )}
      </div>
    </motion.div>
  );
}

function LoadingList() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-5 p-5 rounded-2xl bg-slate-100 animate-pulse">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
          </div>
          <div className="w-16 h-9 bg-slate-200 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <p className="font-bold text-red-600">{error}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
      <Medal size={40} className="text-slate-300 mb-4" />
      <p className="font-bold text-slate-600">Classement pas encore disponible</p>
      <p className="text-sm text-slate-400 mt-1">Reviens dès le début de la compétition.</p>
    </div>
  );
}
