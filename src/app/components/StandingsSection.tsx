'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, ChevronDown } from 'lucide-react';
import type { WCAStanding } from '@/lib/worldcup-api';
import { WC2026_GROUPS, type WC2026Group } from '@/lib/worldcup-api';

export default function StandingsSection() {
  const [group, setGroup]         = useState<WC2026Group>('A');
  const [standings, setStandings] = useState<WCAStanding[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [open, setOpen]           = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(`/api/wca/standings?group=${group}`);
        const json = await res.json();
        if (json.success) {
          setStandings(Array.isArray(json.data) ? json.data : []);
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
  }, [group]);

  return (
    <section id="classement" className="py-28 px-6 lg:px-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">
              FIFA World Cup 2026
            </p>
            <h2 className="font-archivo text-4xl md:text-5xl tracking-tighter italic uppercase">
              Classements
            </h2>
            <p className="text-sm text-slate-400">
              12 groupes · 48 équipes · Phase de groupes
            </p>
          </div>

          {/* Sélecteur de groupe */}
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-3 bg-[#0A0A14] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Trophy size={16} className="text-yellow-400" />
              Groupe {group}
              <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20 grid grid-cols-4 p-2 gap-1 w-48">
                {WC2026_GROUPS.map(g => (
                  <button
                    key={g}
                    onClick={() => { setGroup(g); setOpen(false); }}
                    className={`
                      py-2 text-[11px] font-black uppercase rounded-lg transition-colors
                      ${group === g
                        ? 'bg-yellow-400 text-black'
                        : 'text-slate-600 hover:bg-slate-100'
                      }
                    `}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tableau */}
        {loading ? (
          <LoadingTable />
        ) : error ? (
          <ErrorState error={error} />
        ) : standings.length === 0 ? (
          <EmptyState group={group} />
        ) : (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Titre du groupe */}
            <div className="bg-[#0A0A14] px-6 py-4 flex items-center gap-3">
              <Trophy size={16} className="text-yellow-400" />
              <span className="font-archivo text-white uppercase italic tracking-tight text-lg">
                Groupe {group}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <TrendingUp size={12} className="text-white/30" />
                <span className="text-[9px] text-white/30 uppercase tracking-widest">Classement Officiel</span>
              </div>
            </div>

            {/* En-têtes du tableau */}
            <div className="grid grid-cols-[2rem_1fr_repeat(7,3rem)] gap-0 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
              <span>#</span>
              <span>Équipe</span>
              <span className="text-center">J</span>
              <span className="text-center">G</span>
              <span className="text-center">N</span>
              <span className="text-center">P</span>
              <span className="text-center">BP</span>
              <span className="text-center">+/-</span>
              <span className="text-center font-black text-slate-700">Pts</span>
            </div>

            {/* Lignes */}
            {standings.map((s, i) => (
              <StandingRow key={s.team?.id ?? i} standing={s} index={i} total={standings.length} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function StandingRow({
  standing, index, total,
}: {
  standing: WCAStanding;
  index: number;
  total: number;
}) {
  // Les 2 premiers se qualifient (+ 4 meilleurs 3es)
  const isQualified = index < 2;
  const isLast      = index === total - 1;

  return (
    <div className={`
      grid grid-cols-[2rem_1fr_repeat(7,3rem)] gap-0 px-6 py-4 text-sm items-center
      transition-colors hover:bg-slate-50
      ${!isLast ? 'border-b border-slate-50' : ''}
      ${isQualified ? 'border-l-4 border-yellow-400' : 'border-l-4 border-transparent'}
    `}>
      {/* Position */}
      <span className={`
        text-[11px] font-black
        ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-500' : 'text-slate-300'}
      `}>
        {standing.position ?? index + 1}
      </span>

      {/* Équipe */}
      <div className="flex items-center gap-2 overflow-hidden">
        {standing.team?.flag && (
          <span className="text-base shrink-0">{standing.team.flag}</span>
        )}
        <span className="font-bold text-slate-800 text-xs truncate uppercase">
          {standing.team?.name ?? '???'}
        </span>
        {isQualified && (
          <span className="ml-1 text-[8px] font-black text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full shrink-0 hidden sm:block">
            Q
          </span>
        )}
      </div>

      {/* Stats */}
      {[
        standing.played,
        standing.won,
        standing.drawn,
        standing.lost,
        standing.goals_for,
        standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference,
      ].map((v, j) => (
        <span key={j} className="text-center text-[11px] text-slate-500 font-medium tabular-nums">
          {v ?? '-'}
        </span>
      ))}

      {/* Points */}
      <span className="text-center text-sm font-black text-slate-900 tabular-nums">
        {standing.points ?? '-'}
      </span>
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-slate-200 h-14" />
      <div className="bg-slate-100 h-10" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
          <div className="w-6 h-4 bg-slate-200 rounded" />
          <div className="flex-1 h-4 bg-slate-200 rounded" />
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="w-8 h-4 bg-slate-100 rounded" />
          ))}
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

function EmptyState({ group }: { group: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
      <Trophy size={40} className="text-slate-300 mb-3" />
      <p className="font-bold text-slate-600">
        Classement Groupe {group} pas encore disponible
      </p>
      <p className="text-sm text-slate-400 mt-1">
        Reviens dès le début de la compétition.
      </p>
    </div>
  );
}
