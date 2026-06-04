'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WCAMatch } from '@/lib/worldcup-api';
import { formatScore, statusLabel } from '@/lib/worldcup-api';

// Fallback si aucun match en direct
function NoLiveMatches() {
  return null; // Bandeau invisible quand aucun match en cours
}

export default function LiveScoresBanner() {
  const [matches, setMatches]   = useState<WCAMatch[]>([]);
  const [loading, setLoading]   = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/wca/livescores', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMatches(json.data);
        setLastUpdate(new Date());
      }
    } catch {
      // silencieux — on ne crash pas l'UI si l'API est indisponible
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 30_000); // refresh toutes les 30s
    return () => clearInterval(interval);
  }, [fetchLive]);

  if (loading || matches.length === 0) return <NoLiveMatches />;

  return (
    <div className="w-full bg-[#0A0A14] border-b border-white/5 overflow-hidden">
      {/* En-tête fixe */}
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-2 bg-red-600 px-4 py-2.5 z-10">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
            EN DIRECT
          </span>
        </div>

        {/* Défilement des matchs */}
        <div className="overflow-hidden flex-1">
          <div
            className="flex gap-0 animate-marquee whitespace-nowrap"
            style={{ animationDuration: `${Math.max(20, matches.length * 8)}s` }}
          >
            {/* Dupliqué pour boucle infinie */}
            {[...matches, ...matches].map((m, i) => (
              <MatchCard key={`${m.id}-${i}`} match={m} />
            ))}
          </div>
        </div>

        {/* Heure de mise à jour */}
        {lastUpdate && (
          <div className="shrink-0 px-4 text-[9px] text-white/20 hidden md:block">
            ↻ {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

function MatchCard({ match }: { match: WCAMatch }) {
  const isLive = match.status === 'live';

  return (
    <div className="inline-flex items-center gap-3 px-6 py-2.5 border-r border-white/5 shrink-0">
      {/* Équipe domicile */}
      <span className="text-white text-[11px] font-bold uppercase">
        {match.home_team?.flag && (
          <span className="mr-1.5">{match.home_team.flag}</span>
        )}
        {match.home_team?.short_name ?? match.home_team?.name ?? '???'}
      </span>

      {/* Score */}
      <div className={`
        px-3 py-1 rounded font-black text-xs tabular-nums
        ${isLive ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70'}
      `}>
        {formatScore(match)}
        {isLive && match.minute && (
          <span className="ml-1.5 text-[9px] font-bold text-red-200">
            {match.minute}&apos;
          </span>
        )}
      </div>

      {/* Équipe visiteur */}
      <span className="text-white text-[11px] font-bold uppercase">
        {match.away_team?.short_name ?? match.away_team?.name ?? '???'}
        {match.away_team?.flag && (
          <span className="ml-1.5">{match.away_team.flag}</span>
        )}
      </span>

      {/* Statut si pas live */}
      {!isLive && (
        <span className="text-white/30 text-[9px] font-bold uppercase ml-1">
          {statusLabel(match.status)}
        </span>
      )}
    </div>
  );
}
