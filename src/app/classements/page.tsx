'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Trophy, TrendingUp, ChevronDown, BarChart2,
  GitBranch, Loader2, AlertCircle, Star
} from 'lucide-react';
import type { WCAStanding } from '@/lib/worldcup-api';
import { WC2026_GROUPS, WC2026_GROUPS_TEAMS, type WC2026Group } from '@/lib/worldcup-api';
import type { KOMatch } from '@/app/api/wca/knockout/route';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'groupes' | 'knockout';

// ─── Données groupes pour sidebar ─────────────────────────────────────────────
const GROUP_TEAMS_PREVIEW: Record<WC2026Group, string[]> = WC2026_GROUPS_TEAMS as any;

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ClassementsPage() {
  const [tab, setTab] = useState<Tab>('groupes');
  const [activeGroup, setActiveGroup] = useState<WC2026Group>('A');
  const [standings, setStandings] = useState<WCAStanding[]>([]);
  const [koMatches, setKoMatches] = useState<KOMatch[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [loadingKO, setLoadingKO] = useState(false);
  const [errorStandings, setErrorStandings] = useState<string | null>(null);
  const [errorKO, setErrorKO] = useState<string | null>(null);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);

  const loadStandings = useCallback(async (group: WC2026Group) => {
    setLoadingStandings(true);
    setErrorStandings(null);
    try {
      const res = await fetch(`/api/wca/standings?group=${group}`);
      const json = await res.json();
      if (json.success) {
        setStandings(Array.isArray(json.data) ? json.data : []);
      } else {
        setErrorStandings(json.error ?? 'Erreur de chargement');
      }
    } catch {
      setErrorStandings('Impossible de charger le classement');
    } finally {
      setLoadingStandings(false);
    }
  }, []);

  const loadKO = useCallback(async () => {
    setLoadingKO(true);
    setErrorKO(null);
    try {
      const res = await fetch('/api/wca/knockout');
      const json = await res.json();
      if (json.success) {
        setKoMatches(Array.isArray(json.data) ? json.data : []);
      } else {
        setErrorKO(json.error ?? 'Erreur de chargement');
      }
    } catch {
      setErrorKO('Impossible de charger les phases éliminatoires');
    } finally {
      setLoadingKO(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'groupes') {
      loadStandings(activeGroup);
    } else {
      loadKO();
    }
  }, [tab, activeGroup, loadStandings, loadKO]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-space">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Accueil
            </Link>
            <span className="text-slate-200 text-xs">|</span>
            <div className="flex items-center gap-2">
              <Image src="/logo-mairie.png" alt="Mairie" width={64} height={28} className="object-contain" />
              <span className="text-slate-200 text-xs">×</span>
              <Image src="/logo-escen.png" alt="ESCEN" width={64} height={28} className="object-contain" />
              <span className="text-slate-200 text-xs">×</span>
              <Image src="/logo-adn.png" alt="ADN" width={36} height={36} className="object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-yellow-400 px-4 py-2 rounded-full">
            <Trophy size={14} className="text-black" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black">FIFA World Cup 2026</span>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <div className="bg-[#0A0A14] py-14 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #facc15 0%, transparent 50%), radial-gradient(circle at 80% 50%, #22c55e 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-3">FIFA World Cup 2026</p>
          <h1 className="font-archivo text-5xl md:text-6xl italic uppercase tracking-tighter text-white mb-4">
            Classements &<br /><span className="text-yellow-400">Phases Éliminatoires</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Suivez en temps réel les classements des 12 groupes et le tableau des phases éliminatoires de la Coupe du Monde 2026.
          </p>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8">
        <div className="flex gap-2 border-b border-slate-200 mb-10">
          <TabButton active={tab === 'groupes'} onClick={() => setTab('groupes')} icon={<BarChart2 size={16} />}>
            Phase de Groupes
          </TabButton>
          <TabButton active={tab === 'knockout'} onClick={() => setTab('knockout')} icon={<GitBranch size={16} />}>
            Phases Éliminatoires
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'groupes' ? (
            <motion.div
              key="groupes"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="pb-20"
            >
              <GroupsView
                activeGroup={activeGroup}
                setActiveGroup={(g) => { setActiveGroup(g); setGroupDropdownOpen(false); }}
                standings={standings}
                loading={loadingStandings}
                error={errorStandings}
                groupDropdownOpen={groupDropdownOpen}
                setGroupDropdownOpen={setGroupDropdownOpen}
              />
            </motion.div>
          ) : (
            <motion.div
              key="knockout"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="pb-20"
            >
              <KnockoutView matches={koMatches} loading={loadingKO} error={errorKO} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({
  active, onClick, icon, children
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-5 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all
        ${active
          ? 'border-yellow-400 text-yellow-600 bg-yellow-50/50'
          : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}

// ─── Groups View ──────────────────────────────────────────────────────────────
function GroupsView({
  activeGroup, setActiveGroup, standings, loading, error,
  groupDropdownOpen, setGroupDropdownOpen
}: {
  activeGroup: WC2026Group;
  setActiveGroup: (g: WC2026Group) => void;
  standings: WCAStanding[];
  loading: boolean;
  error: string | null;
  groupDropdownOpen: boolean;
  setGroupDropdownOpen: (v: boolean) => void;
}) {
  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8">

      {/* Sidebar — liste des groupes */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">
          Sélectionner un groupe
        </p>
        {WC2026_GROUPS.map(g => {
          const teams = GROUP_TEAMS_PREVIEW[g] ?? [];
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`
                w-full text-left p-4 rounded-2xl border transition-all
                ${activeGroup === g
                  ? 'bg-[#0A0A14] text-white border-[#0A0A14] shadow-lg shadow-slate-900/10'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-archivo text-lg italic uppercase ${activeGroup === g ? 'text-yellow-400' : 'text-slate-900'}`}>
                  Groupe {g}
                </span>
                {activeGroup === g && (
                  <span className="text-[9px] font-black text-yellow-400/60 uppercase tracking-widest">Actif</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {teams.map(team => (
                  <span
                    key={team}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeGroup === g
                        ? 'bg-white/10 text-white/60'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {team}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tableau de classement */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-archivo text-3xl italic uppercase tracking-tighter">
              Groupe {activeGroup}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {GROUP_TEAMS_PREVIEW[activeGroup]?.join(' · ')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
              Qualifié
            </div>
          </div>
        </div>

        {loading ? (
          <StandingsLoading />
        ) : error ? (
          <ErrorBlock message={error} />
        ) : standings.length === 0 ? (
          <EmptyStandings group={activeGroup} />
        ) : (
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0A0A14] px-6 py-4 flex items-center gap-3">
              <Trophy size={16} className="text-yellow-400" />
              <span className="font-archivo text-white uppercase italic tracking-tight text-lg">
                Groupe {activeGroup} — Classement
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <TrendingUp size={12} className="text-white/30" />
                <span className="text-[9px] text-white/30 uppercase tracking-widest">FIFA 2026 Officiel</span>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2.5rem_1fr_repeat(7,3rem)] gap-0 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
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

            {/* Rows */}
            {standings.map((s, i) => (
              <StandingRow key={s.team?.id ?? i} standing={s} index={i} total={standings.length} />
            ))}

            {/* Legend */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span><span className="text-yellow-600">Q</span> = Qualifié en 8e de finale</span>
              <span>J=Joués · G=Gagnés · N=Nuls · P=Perdus · BP=Buts Pour · +/-=Diff.</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StandingRow({ standing, index, total }: { standing: WCAStanding; index: number; total: number }) {
  const isQualified = index < 2;
  const isThird = index === 2;

  return (
    <div className={`
      grid grid-cols-[2.5rem_1fr_repeat(7,3rem)] gap-0 px-6 py-4 text-sm items-center transition-colors hover:bg-slate-50
      ${index < total - 1 ? 'border-b border-slate-50' : ''}
      ${isQualified ? 'border-l-4 border-yellow-400' : isThird ? 'border-l-4 border-yellow-200' : 'border-l-4 border-transparent'}
    `}>
      {/* Position */}
      <span className={`text-[11px] font-black ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : 'text-slate-300'}`}>
        {standing.position ?? index + 1}
      </span>

      {/* Team */}
      <div className="flex items-center gap-2 overflow-hidden">
        {standing.team?.flag && (
          <span className="text-base shrink-0">{standing.team.flag}</span>
        )}
        <span className="font-bold text-slate-800 text-xs truncate uppercase">
          {standing.team?.name ?? '???'}
        </span>
        {isQualified && (
          <span className="ml-1 text-[8px] font-black text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full shrink-0 hidden sm:block">Q</span>
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
        <span key={j} className="text-center text-[11px] text-slate-500 font-medium tabular-nums">{v ?? '-'}</span>
      ))}

      {/* Points */}
      <span className="text-center text-sm font-black text-slate-900 tabular-nums">
        {standing.points ?? '-'}
      </span>
    </div>
  );
}

// ─── Knockout View ────────────────────────────────────────────────────────────
function KnockoutView({ matches, loading, error }: { matches: KOMatch[]; loading: boolean; error: string | null }) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
      <Loader2 size={36} className="animate-spin text-yellow-400" />
      <p className="text-sm font-bold">Chargement du tableau éliminatoire...</p>
    </div>
  );

  if (error) return <ErrorBlock message={error} />;

  const r16 = matches.filter(m => m.round === 'R16').sort((a, b) => a.match_number - b.match_number);
  const qf  = matches.filter(m => m.round === 'QF').sort((a, b) => a.match_number - b.match_number);
  const sf  = matches.filter(m => m.round === 'SF').sort((a, b) => a.match_number - b.match_number);
  const tp  = matches.filter(m => m.round === '3P');
  const fin = matches.filter(m => m.round === 'F');

  const allTBD = matches.every(m => !m.home_team && !m.away_team);

  return (
    <div className="space-y-10 pb-20">
      {/* Message si pas encore commencé */}
      {allTBD && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4 text-blue-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-blue-500" />
          <div>
            <p className="font-bold text-sm">Phase éliminatoire à venir</p>
            <p className="text-xs mt-1 text-blue-500">
              Les équipes qualifiées seront connues à l'issue de la phase de groupes (à partir du 2 juillet 2026). Le tableau sera mis à jour automatiquement.
            </p>
          </div>
        </div>
      )}

      {/* Bracket visuel */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px] flex gap-6 items-start justify-center">

          {/* Huitièmes — colonne gauche (4 matchs) */}
          <div className="flex flex-col gap-4 w-52 shrink-0">
            <RoundHeader label="Huitièmes" count={8} />
            {r16.slice(0, 4).map(m => <KOCard key={m.id} match={m} />)}
          </div>

          {/* Quarts — colonne gauche (2 matchs) */}
          <div className="flex flex-col gap-4 w-52 shrink-0 mt-[calc(theme(spacing.4)+theme(spacing.24)/2)]">
            <RoundHeader label="Quarts" count={4} />
            {qf.slice(0, 2).map(m => <KOCard key={m.id} match={m} />)}
          </div>

          {/* Demi-finales — colonne centrale */}
          <div className="flex flex-col gap-4 w-52 shrink-0 mt-[calc(theme(spacing.4)+theme(spacing.40))]">
            <RoundHeader label="Demies" count={2} />
            {sf.map(m => <KOCard key={m.id} match={m} featured />)}

            {/* Finale 3e place */}
            {tp[0] && (
              <div className="mt-4">
                <RoundHeader label="3e Place" count={1} color="text-amber-600" />
                <KOCard match={tp[0]} />
              </div>
            )}
          </div>

          {/* Quarts — colonne droite */}
          <div className="flex flex-col gap-4 w-52 shrink-0 mt-[calc(theme(spacing.4)+theme(spacing.24)/2)]">
            <RoundHeader label="Quarts" count={4} />
            {qf.slice(2, 4).map(m => <KOCard key={m.id} match={m} />)}
          </div>

          {/* Huitièmes — colonne droite */}
          <div className="flex flex-col gap-4 w-52 shrink-0">
            <RoundHeader label="Huitièmes" count={8} />
            {r16.slice(4, 8).map(m => <KOCard key={m.id} match={m} />)}
          </div>
        </div>
      </div>

      {/* FINALE au centre en dessous */}
      {fin[0] && (
        <div className="flex justify-center mt-8">
          <div className="w-80">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star size={16} className="text-yellow-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-yellow-600">
                Grande Finale · 19 Juillet 2026
              </span>
              <Star size={16} className="text-yellow-500" />
            </div>
            <KOCard match={fin[0]} featured grand />
          </div>
        </div>
      )}

      {/* Tableau en liste complète */}
      <div className="mt-16">
        <h3 className="font-archivo text-2xl italic uppercase tracking-tighter text-slate-900 mb-6">
          Tableau Complet des Matchs
        </h3>
        {['R16', 'QF', 'SF', '3P', 'F'].map(round => {
          const roundMatches = matches.filter(m => m.round === round);
          if (!roundMatches.length) return null;
          const roundLabel = roundMatches[0].round_label;
          return (
            <div key={round} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                  round === 'F'  ? 'bg-yellow-400 text-black' :
                  round === 'SF' ? 'bg-slate-900 text-white' :
                  round === '3P' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{roundLabel}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {roundMatches.map(m => (
                  <KOListCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoundHeader({ label, count, color = 'text-slate-500' }: { label: string; count: number; color?: string }) {
  return (
    <div className="text-center mb-1">
      <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</p>
      <p className="text-[9px] text-slate-300 uppercase tracking-widest">{count} matchs</p>
    </div>
  );
}

function KOCard({ match, featured, grand }: { match: KOMatch; featured?: boolean; grand?: boolean }) {
  const hasTeams = !!match.home_team || !!match.away_team;
  const isFinished = match.status === 'FINISHED';
  const isPen = match.home_score_pen !== null && match.away_score_pen !== null;

  return (
    <div className={`
      rounded-2xl border overflow-hidden transition-all hover:shadow-md
      ${grand ? 'border-yellow-400 shadow-xl shadow-yellow-400/20' :
        featured ? 'border-slate-900 bg-[#0A0A14] text-white shadow-lg' :
        'border-slate-200 bg-white'
      }
    `}>
      <div className={`px-4 py-2.5 border-b ${
        grand ? 'bg-yellow-400 border-yellow-300' :
        featured ? 'border-white/10 bg-white/5' :
        'bg-slate-50 border-slate-100'
      }`}>
        <p className={`text-[9px] font-black uppercase tracking-widest ${
          grand ? 'text-black' : featured ? 'text-white/50' : 'text-slate-400'
        }`}>
          {match.round_label} · #{match.match_number}
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Team 1 */}
        <KOTeamRow
          flag={match.home_flag}
          name={match.home_team}
          score={isFinished ? match.home_score : null}
          scorePen={isPen ? match.home_score_pen : null}
          isWinner={isFinished && match.home_score !== null && match.away_score !== null && match.home_score > match.away_score}
          dark={featured || grand}
        />
        <div className={`h-px ${featured || grand ? 'bg-white/5' : 'bg-slate-100'}`} />
        {/* Team 2 */}
        <KOTeamRow
          flag={match.away_flag}
          name={match.away_team}
          score={isFinished ? match.away_score : null}
          scorePen={isPen ? match.away_score_pen : null}
          isWinner={isFinished && match.home_score !== null && match.away_score !== null && match.away_score > match.home_score}
          dark={featured || grand}
        />

        {isPen && (
          <p className="text-center text-[9px] text-yellow-400 font-black uppercase tracking-widest">
            Tirs au but : {match.home_score_pen} – {match.away_score_pen}
          </p>
        )}
      </div>
    </div>
  );
}

function KOTeamRow({ flag, name, score, scorePen, isWinner, dark }: {
  flag: string; name: string | null; score: number | null;
  scorePen?: number | null; isWinner?: boolean; dark?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 ${isWinner ? (dark ? 'opacity-100' : 'opacity-100') : 'opacity-60'}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm shrink-0">{flag}</span>
        <span className={`text-xs font-bold truncate uppercase ${dark ? 'text-white' : 'text-slate-800'} ${!name ? 'italic opacity-40' : ''}`}>
          {name ?? 'À déterminer'}
        </span>
      </div>
      {score !== null && (
        <span className={`text-sm font-black tabular-nums shrink-0 ${
          isWinner ? (dark ? 'text-yellow-400' : 'text-yellow-600') : (dark ? 'text-white/50' : 'text-slate-400')
        }`}>
          {score}
        </span>
      )}
    </div>
  );
}

function KOListCard({ match }: { match: KOMatch }) {
  const isFinished = match.status === 'FINISHED';
  const isPen = match.home_score_pen !== null && match.away_score_pen !== null;

  return (
    <div className={`bg-white border rounded-2xl p-5 space-y-3 ${
      match.round === 'F' ? 'border-yellow-300 bg-yellow-50/50' :
      match.round === 'SF' ? 'border-slate-300' :
      'border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {match.round_label} · Match {match.match_number}
        </span>
        {match.match_date && (
          <span className="text-[9px] text-slate-300 font-bold">
            {new Date(match.match_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: 'Africa/Lome' })}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">{match.home_flag}</span>
          <span className={`font-bold text-sm uppercase ${!match.home_team ? 'text-slate-300 italic' : 'text-slate-800'}`}>
            {match.home_team ?? 'TBD'}
          </span>
        </div>
        <div className="px-4 py-2 bg-[#0A0A14] text-white rounded-xl font-black text-base font-mono mx-3 shrink-0">
          {isFinished ? `${match.home_score} – ${match.away_score}` : 'vs'}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end text-right">
          <span className={`font-bold text-sm uppercase ${!match.away_team ? 'text-slate-300 italic' : 'text-slate-800'}`}>
            {match.away_team ?? 'TBD'}
          </span>
          <span className="text-lg">{match.away_flag}</span>
        </div>
      </div>
      {isPen && (
        <p className="text-center text-[9px] text-yellow-600 font-black uppercase tracking-widest">
          Tab : {match.home_score_pen} – {match.away_score_pen}
        </p>
      )}
      {match.venue && (
        <p className="text-[9px] text-slate-300 text-center uppercase tracking-widest">📍 {match.venue}</p>
      )}
    </div>
  );
}

// ─── Loading / Error / Empty states ──────────────────────────────────────────
function StandingsLoading() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="bg-slate-200 h-14" />
      <div className="bg-slate-100 h-10" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
          <div className="w-5 h-4 bg-slate-200 rounded" />
          <div className="flex-1 h-4 bg-slate-200 rounded" />
          {Array.from({ length: 7 }).map((_, j) => (
            <div key={j} className="w-8 h-4 bg-slate-100 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-start gap-4">
      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
      <div>
        <p className="font-bold text-red-700 text-sm">Erreur de chargement</p>
        <p className="text-red-500 text-xs mt-1">{message}</p>
      </div>
    </div>
  );
}

function EmptyStandings({ group }: { group: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
      <Trophy size={48} className="text-slate-200 mb-4" />
      <p className="font-bold text-slate-600">Classement Groupe {group} pas encore disponible</p>
      <p className="text-sm text-slate-400 mt-2">
        Le classement sera mis à jour dès que les matchs de ce groupe commenceront.
      </p>
    </div>
  );
}
