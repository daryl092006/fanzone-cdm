'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, ChevronLeft, ChevronRight, Info, AlertCircle } from 'lucide-react';
import type { WCAMatch } from '@/lib/worldcup-api';
import { formatScore, statusLabel, statusColor, WC2026_GROUPS } from '@/lib/worldcup-api';

const TABS = [
  { label: 'Tous', value: '' },
  { label: 'Groupe A', value: 'A' },
  { label: 'Groupe B', value: 'B' },
  { label: 'Groupe C', value: 'C' },
  { label: 'Groupe D', value: 'D' },
  { label: 'Groupe E', value: 'E' },
  { label: 'Groupe F', value: 'F' },
];

function formatMatchDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Africa/Lome' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lome' }),
  };
}

export default function FixturesSection() {
  const [matches, setMatches]     = useState<WCAMatch[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState('');
  const [page, setPage]           = useState(1);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeGroup) params.set('group', activeGroup);
        if (dateFilter)  params.set('date', dateFilter);
        if (page > 1)    params.set('page', String(page));

        const res = await fetch(`/api/wca/fixtures?${params}`);
        const json = await res.json();

        if (json.success) {
          setMatches(Array.isArray(json.data) ? json.data : []);
        } else {
          setError(json.error ?? 'Erreur de chargement');
        }
      } catch {
        setError('Impossible de charger les matchs');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeGroup, page, dateFilter]);

  return (
    <section id="matchs" className="py-28 px-6 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">
              Diffusion Officielle
            </p>
            <h2 className="font-archivo text-4xl md:text-5xl tracking-tighter italic uppercase">
              Les Matchs
            </h2>
            <p className="text-sm text-slate-400">
              Tous les matchs de la Coupe du Monde 2026 diffusés sur écrans géants.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Projection Live</span>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Filtre par groupe */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => { setActiveGroup(tab.value); setPage(1); }}
                className={`
                  text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all
                  ${activeGroup === tab.value
                    ? 'bg-[#0A0A14] text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filtre par date */}
          <div className="flex items-center gap-2 ml-auto">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setPage(1); }}
              min="2026-06-11"
              max="2026-07-19"
              className="text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
              >
                ✕ Effacer
              </button>
            )}
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorState error={error} />
        ) : matches.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-5">
              {matches.map((match, i) => (
                <MatchCard key={match.id} match={match} highlight={i === 0} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 text-[11px] font-bold px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={14} /> Préc.
              </button>
              <span className="text-[11px] font-bold text-slate-500">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={matches.length < 10}
                className="flex items-center gap-2 text-[11px] font-bold px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                Suiv. <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function MatchCard({ match, highlight }: { match: WCAMatch; highlight?: boolean }) {
  const { date, time } = formatMatchDate(match.date);
  const isLive = match.status === 'live';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl p-7 space-y-5 transition-all hover:shadow-xl
        ${highlight ? 'bg-[#0A0A14] text-white' : 'bg-slate-50 border border-slate-100'}
      `}
    >
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <span className={`
          text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full
          ${isLive
            ? 'bg-red-600 text-white animate-pulse'
            : highlight
              ? 'bg-white/10 text-white/60'
              : statusColor(match.status)
          }
        `}>
          {isLive ? `🔴 ${match.minute ?? ''}' EN DIRECT` : statusLabel(match.status)}
        </span>

        <div className="text-right">
          {match.group && (
            <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${highlight ? 'text-white/30' : 'text-slate-300'}`}>
              Groupe {match.group}
            </p>
          )}
          <p className={`text-[10px] font-bold ${highlight ? 'text-white/30' : 'text-slate-300'}`}>
            {date} · {time}
          </p>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center justify-between font-archivo uppercase italic tracking-tight">
        <div className="flex items-center gap-3 flex-1">
          {match.home_team?.flag && <span className="text-2xl">{match.home_team.flag}</span>}
          <span className="text-xl md:text-2xl leading-tight">
            {match.home_team?.name ?? '???'}
          </span>
        </div>

        <div className={`
          px-5 py-3 rounded-xl font-black text-xl mx-4 tabular-nums shrink-0
          ${highlight ? 'bg-yellow-400 text-black' : 'bg-[#0A0A14] text-white'}
        `}>
          {formatScore(match)}
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-xl md:text-2xl leading-tight text-right">
            {match.away_team?.name ?? '???'}
          </span>
          {match.away_team?.flag && <span className="text-2xl">{match.away_team.flag}</span>}
        </div>
      </div>

      {/* Lieu */}
      {match.venue && (
        <p className={`text-[10px] ${highlight ? 'text-white/20' : 'text-slate-300'} uppercase tracking-widest`}>
          📍 {match.venue}{match.city ? `, ${match.city}` : ''}
        </p>
      )}
    </motion.div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-7 bg-slate-100 animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-24 bg-slate-200 rounded-full" />
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-8 w-28 bg-slate-200 rounded-lg" />
            <div className="h-10 w-16 bg-slate-200 rounded-xl" />
            <div className="h-8 w-28 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-start gap-4">
      <Info className="text-red-500 shrink-0 mt-0.5" size={20} />
      <div>
        <p className="font-bold text-red-700 text-sm">Erreur de chargement</p>
        <p className="text-red-500 text-xs mt-1">{error}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
      <AlertCircle size={40} className="text-slate-300 mb-4" />
      <p className="font-bold text-slate-600">Aucun match trouvé</p>
      <p className="text-sm text-slate-400 mt-1">
        Essaie un autre filtre ou reviens plus tard.
      </p>
    </div>
  );
}
