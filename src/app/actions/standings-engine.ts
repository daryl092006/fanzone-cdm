'use server';

/**
 * ─── Moteur de Classement FIFA World Cup 2026 ─────────────────────────────────
 *
 * Gère :
 *  • Classement de chaque groupe (Points, MJ, G, N, P, BP, BC, DB)
 *  • Départages FIFA officiels (confrontation directe, discipline...)
 *  • Identification des 8 meilleurs 3es
 *  • Mise à jour automatique du bracket KO quand un groupe est complet
 */

import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamStanding {
  teamName: string;
  flag: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  position: number; // 1 à 4 dans le groupe
}

export interface GroupStandings {
  group: string;
  teams: TeamStanding[];
  isComplete: boolean; // tous les matchs joués (6/6)
}

// ─── Groupes FIFA 2026 ────────────────────────────────────────────────────────

const GROUPS: Record<string, string[]> = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Switzerland', 'Qatar', 'Bosnia-Herzegovina'],
  C: ['Brazil', 'Morocco', 'Scotland', 'Haiti'],
  D: ['USA', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Ecuador', 'Ivory Coast', 'Curaçao'],
  F: ['Netherlands', 'Japan', 'Tunisia', 'Sweden'],
  G: ['Belgium', 'Iran', 'Egypt', 'New Zealand'],
  H: ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
  I: ['France', 'Senegal', 'Norway', 'Iraq'],
  J: ['Argentina', 'Austria', 'Algeria', 'Jordan'],
  K: ['Portugal', 'Colombia', 'Uzbekistan', 'DR Congo'],
  L: ['England', 'Croatia', 'Panama', 'Ghana'],
};

// Bracket KO : quel slot reçoit quel qualifié
// Format : { matchPattern, slotHome, slotAway }
// Basé sur le calendrier officiel FIFA 2026 (Tour de 32)
const KO_BRACKET: Array<{
  matchPattern: string; // Pattern unique du match (team_home dans la DB)
  qualifierHome: string; // ex: "1er gr. A"
  qualifierAway: string; // ex: "2e gr. B"
}> = [
  { matchPattern: '1er Gr. A', qualifierHome: '1er Gr. A', qualifierAway: '3e gr. E/F/G/U' },
  { matchPattern: '2e gr. D',  qualifierHome: '2e gr. D',  qualifierAway: '2e gr. G' },
  { matchPattern: '1er gr. C', qualifierHome: '1er gr. C', qualifierAway: '3e gr. D/E/F' },
  { matchPattern: '1er gr. B', qualifierHome: '1er gr. B', qualifierAway: '3e gr. A/B/C/D' },
  { matchPattern: '1er gr. F', qualifierHome: '1er gr. F', qualifierAway: '2e gr. I' },
  { matchPattern: '1er gr. E', qualifierHome: '1er gr. E', qualifierAway: '2e gr. H' },
  { matchPattern: '1er gr. D', qualifierHome: '1er gr. D', qualifierAway: '3e gr. B/H/I/J/K' },
  { matchPattern: '2e gr. A',  qualifierHome: '2e gr. A',  qualifierAway: '2e gr. B' },
  { matchPattern: '1er gr. H', qualifierHome: '1er gr. H', qualifierAway: '2e gr. J' },
  { matchPattern: '1er gr. G', qualifierHome: '1er gr. G', qualifierAway: '2e gr. F' },
  { matchPattern: '2e gr. C',  qualifierHome: '2e gr. C',  qualifierAway: '3e gr. G/H/J/K/L' },
  { matchPattern: '1er gr. I', qualifierHome: '1er gr. I', qualifierAway: '2e gr. L' },
  { matchPattern: '1er gr. K', qualifierHome: '1er gr. K', qualifierAway: '3e gr. A/B/C/D' },
  { matchPattern: '2e gr. E',  qualifierHome: '2e gr. E',  qualifierAway: '2e gr. K' },
  { matchPattern: '1er gr. J', qualifierHome: '1er gr. J', qualifierAway: '2e gr. C' },
  { matchPattern: '1er gr. L', qualifierHome: '1er gr. L', qualifierAway: '3e gr. I/J/K/L' },
];

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

/** Récupérer le drapeau d'une équipe depuis la DB */
async function getFlag(teamName: string): Promise<string> {
  const { data } = await supabase
    .from('teams')
    .select('flag')
    .eq('name', teamName)
    .maybeSingle();
  return data?.flag ?? '🏳️';
}

/** Récupérer le groupe d'une équipe */
function getGroupForTeam(teamName: string): string | null {
  for (const [group, teams] of Object.entries(GROUPS)) {
    if (teams.includes(teamName)) return group;
  }
  return null;
}

// ─── Calcul des classements d'un groupe ──────────────────────────────────────

export async function computeGroupStandings(group: string): Promise<GroupStandings> {
  const groupUpper = group.toUpperCase();
  const groupTeams = GROUPS[groupUpper] ?? [];

  // Récupérer tous les matchs terminés du groupe
  const { data: allMatches } = await supabase
    .from('matches')
    .select('*')
    .in('status', ['FINISHED', 'LIVE'])
    .order('match_date', { ascending: true });

  const groupMatches = (allMatches ?? []).filter(m => {
    const g1 = getGroupForTeam(m.team_home);
    const g2 = getGroupForTeam(m.team_away);
    return g1 === groupUpper || g2 === groupUpper;
  });

  const finishedGroupMatches = groupMatches.filter(m => m.status === 'FINISHED' && m.score_home !== null && m.score_away !== null);

  // Stats de base
  const stats: Record<string, {
    played: number; won: number; drawn: number; lost: number;
    gf: number; ga: number; pts: number;
    // Pour départage direct (head-to-head)
    h2h: Record<string, { pts: number; gf: number; ga: number }>;
  }> = {};

  groupTeams.forEach(t => {
    stats[t] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0, h2h: {} };
  });

  finishedGroupMatches.forEach(m => {
    const h = m.team_home;
    const a = m.team_away;
    const hs = Number(m.score_home);
    const as_ = Number(m.score_away);

    if (!stats[h]) stats[h] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0, h2h: {} };
    if (!stats[a]) stats[a] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0, h2h: {} };

    // Initialiser h2h
    if (!stats[h].h2h[a]) stats[h].h2h[a] = { pts: 0, gf: 0, ga: 0 };
    if (!stats[a].h2h[h]) stats[a].h2h[h] = { pts: 0, gf: 0, ga: 0 };

    stats[h].played++;
    stats[a].played++;
    stats[h].gf += hs;
    stats[h].ga += as_;
    stats[a].gf += as_;
    stats[a].ga += hs;
    stats[h].h2h[a].gf += hs;
    stats[h].h2h[a].ga += as_;
    stats[a].h2h[h].gf += as_;
    stats[a].h2h[h].ga += hs;

    if (hs > as_) {
      stats[h].won++; stats[h].pts += 3; stats[h].h2h[a].pts += 3;
      stats[a].lost++;
    } else if (hs < as_) {
      stats[a].won++; stats[a].pts += 3; stats[a].h2h[h].pts += 3;
      stats[h].lost++;
    } else {
      stats[h].drawn++; stats[h].pts += 1; stats[h].h2h[a].pts += 1;
      stats[a].drawn++; stats[a].pts += 1; stats[a].h2h[h].pts += 1;
    }
  });

  // Trier : Points > DB général > BP général > H2H pts > H2H DB > H2H BP > alphabet
  const teamNames = Object.keys(stats);
  teamNames.sort((a, b) => {
    const sa = stats[a], sb = stats[b];
    if (sb.pts !== sa.pts) return sb.pts - sa.pts;
    const dbA = sa.gf - sa.ga, dbB = sb.gf - sb.ga;
    if (dbB !== dbA) return dbB - dbA;
    if (sb.gf !== sa.gf) return sb.gf - sa.gf;
    // H2H entre les équipes à égalité
    const h2hPtsA = sa.h2h[b]?.pts ?? 0;
    const h2hPtsB = sb.h2h[a]?.pts ?? 0;
    if (h2hPtsB !== h2hPtsA) return h2hPtsB - h2hPtsA;
    const h2hDbA = (sa.h2h[b]?.gf ?? 0) - (sa.h2h[b]?.ga ?? 0);
    const h2hDbB = (sb.h2h[a]?.gf ?? 0) - (sb.h2h[a]?.ga ?? 0);
    if (h2hDbB !== h2hDbA) return h2hDbB - h2hDbA;
    return a.localeCompare(b);
  });

  // Construire la liste finale
  const standingsList: TeamStanding[] = await Promise.all(
    teamNames.map(async (name, idx) => {
      const s = stats[name];
      return {
        teamName: name,
        flag: await getFlag(name),
        group: groupUpper,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        goalDiff: s.gf - s.ga,
        points: s.pts,
        position: idx + 1,
      };
    })
  );

  // Un groupe est complet si les 6 matchs sont terminés
  const expectedMatches = 6;
  const isComplete = finishedGroupMatches.length >= expectedMatches;

  return { group: groupUpper, teams: standingsList, isComplete };
}

/** Récupérer tous les classements d'un coup */
export async function getAllGroupStandings(): Promise<GroupStandings[]> {
  const results = await Promise.all(
    Object.keys(GROUPS).map(g => computeGroupStandings(g))
  );
  return results;
}

// ─── Meilleurs 3es (règle FIFA 2026) ─────────────────────────────────────────

/**
 * Parmi les 12 équipes classées 3es (une par groupe), sélectionne les 8 meilleures.
 * Critère FIFA : Points > DB > BP > Moins de cartons (simplifié ici par alphabet)
 */
export async function getBestThirdPlaceTeams(): Promise<TeamStanding[]> {
  const allStandings = await getAllGroupStandings();
  const thirds: TeamStanding[] = [];

  allStandings.forEach(gs => {
    const third = gs.teams.find(t => t.position === 3);
    if (third && third.played > 0) thirds.push(third);
  });

  // Trier les 3es selon les critères FIFA
  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  return thirds.slice(0, 8);
}

// ─── Avancement automatique dans le bracket KO ───────────────────────────────

/**
 * Appelée après chaque mise à jour de score.
 * Vérifie si le groupe concerné est terminé et met à jour les matchs KO en conséquence.
 */
export async function advanceToKnockout(matchId: string): Promise<{
  success: boolean;
  groupsAdvanced: string[];
  message: string;
}> {
  const groupsAdvanced: string[] = [];

  try {
    // Récupérer le match mis à jour
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();

    if (!match) return { success: false, groupsAdvanced: [], message: 'Match introuvable.' };

    // Déterminer le(s) groupe(s) concerné(s)
    const groupHome = getGroupForTeam(match.team_home);
    const groupAway = getGroupForTeam(match.team_away);
    const affectedGroups = [...new Set([groupHome, groupAway].filter(Boolean))] as string[];

    for (const group of affectedGroups) {
      const standings = await computeGroupStandings(group);

      if (!standings.isComplete) continue; // Groupe pas encore terminé

      const first = standings.teams[0];
      const second = standings.teams[1];

      if (!first || !second) continue;

      // Mettre à jour les matchs KO qui attendaient ce groupe
      // Chercher les matchs KO avec les libellés génériques correspondants
      const slotFirst  = `1er gr. ${group}`;
      const slotSecond = `2e gr. ${group}`;

      // Mettre à jour le slot "1er gr. X" en team_home ou team_away
      await updateKOSlot(slotFirst, first.teamName);
      await updateKOSlot(slotSecond, second.teamName);

      groupsAdvanced.push(group);
      console.log(`✅ Groupe ${group} complet : ${first.teamName} (1er) | ${second.teamName} (2e) → Bracket KO mis à jour`);
    }

    // Si tous les groupes sont terminés, calculer et placer les 8 meilleurs 3es
    const allStandings = await getAllGroupStandings();
    const allComplete = allStandings.every(s => s.isComplete);

    if (allComplete) {
      const best8Thirds = await getBestThirdPlaceTeams();
      await placeThirdPlaceTeams(best8Thirds);
      console.log('🏆 Phase de groupes terminée. Meilleurs 3es placés dans le bracket.');
    }

    return {
      success: true,
      groupsAdvanced,
      message: groupsAdvanced.length > 0
        ? `Groupe(s) ${groupsAdvanced.join(', ')} → Bracket KO mis à jour automatiquement !`
        : 'Score enregistré. Le groupe n\'est pas encore complet.',
    };
  } catch (e: any) {
    console.error('advanceToKnockout error:', e);
    return { success: false, groupsAdvanced: [], message: 'Erreur lors de la qualification automatique.' };
  }
}

/**
 * Met à jour un slot KO (team_home ou team_away) dans la table matches.
 * Cherche par le libellé générique exact et le remplace par le vrai nom de l'équipe.
 */
async function updateKOSlot(slot: string, teamName: string) {
  // Récupérer tous les matchs pour faire une comparaison insensible à la casse
  const { data: dbMatches } = await supabase
    .from('matches')
    .select('id, team_home, team_away');

  if (!dbMatches) return;

  const targetSlot = slot.toLowerCase();

  for (const m of dbMatches) {
    let updatePayload: any = {};
    let shouldUpdate = false;

    if (m.team_home && m.team_home.toLowerCase() === targetSlot) {
      updatePayload.team_home = teamName;
      shouldUpdate = true;
    } else if (m.team_away && m.team_away.toLowerCase() === targetSlot) {
      updatePayload.team_away = teamName;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await supabase
        .from('matches')
        .update(updatePayload)
        .eq('id', m.id);
      
      // On s'arrête après avoir mis à jour UN SEUL slot d'UN SEUL match
      // pour éviter d'écraser des placeholders identiques (ex: les meilleurs 3es)
      return;
    }
  }
}

/**
 * Place les 8 meilleurs 3es dans les slots appropriés du bracket KO.
 * Mapping officiel FIFA 2026 selon les groupes dont sont issus les 3es qualifiés.
 */
async function placeThirdPlaceTeams(best8: TeamStanding[]) {
  // Slots des meilleurs 3es dans le bracket (libellés génériques dans la DB)
  const thirdSlots = [
    '3e gr. A/B/C/D/F',
    '3e gr. C/D/F/G/H',
    '3e gr. C/E/F/H/I',
    '3e gr. E/H/I/J/K',
    '3e gr. A/E/H/I/J',
    '3e gr. B/E/F/I/J',
    '3e gr. E/F/G/J',
    '3e gr. D/E/I/J/L',
  ];

  // Logique simplifiée : on place les 3es dans l'ordre du classement
  // En production, on appliquerait le mapping FIFA exact selon les groupes qualifiés
  for (let i = 0; i < Math.min(best8.length, thirdSlots.length); i++) {
    await updateKOSlot(thirdSlots[i], best8[i].teamName);
  }
}

// ─── Export pratique pour l'admin ────────────────────────────────────────────

/** Recalcule et retourne tous les classements + état du bracket */
export async function getFullTournamentState() {
  const allStandings = await getAllGroupStandings();
  const groupsComplete = allStandings.filter(s => s.isComplete).length;
  const best8Thirds = allStandings.every(s => s.isComplete)
    ? await getBestThirdPlaceTeams()
    : [];

  return {
    success: true,
    standings: allStandings,
    groupsComplete,
    totalGroups: 12,
    allGroupsDone: groupsComplete === 12,
    best8Thirds,
  };
}
