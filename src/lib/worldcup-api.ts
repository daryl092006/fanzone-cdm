// ─── Standalone Client — Supabase-backed FIFA World Cup 2026 Database ────────
// This module manages match data, group standings, live stats, commentary events,
// and lineups. It fetches matches directly from the Supabase database to ensure
// that predictions, scores, and calendars are perfectly synchronized.
// If the database is empty, it automatically seeds all 72 group stage matches.

import { supabase } from '@/lib/supabase';

// ─── Teams DB Cache ───────────────────────────────────────────────────────────
// Dynamic team data loaded from the Supabase `teams` table.
// Falls back to a static map if the DB is unavailable.

interface TeamCacheEntry {
  name: string;
  flag: string;
  group_letter: string;
}

let _teamsCache: TeamCacheEntry[] | null = null;
let _teamsCacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getTeamsCache(): Promise<TeamCacheEntry[]> {
  if (_teamsCache && Date.now() < _teamsCacheExpiry) return _teamsCache;

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('name, flag, group_letter');

    if (error || !data || data.length === 0) throw new Error('empty or error');

    _teamsCache = data as TeamCacheEntry[];
    _teamsCacheExpiry = Date.now() + CACHE_TTL_MS;
    return _teamsCache;
  } catch {
    // fallback: return empty and use static helpers
    return [];
  }
}

/** Vider le cache (à appeler après modification des équipes en admin) */
export function invalidateTeamsCache() {
  _teamsCache = null;
  _teamsCacheExpiry = 0;
}

// ─── Static Fallback Flags ────────────────────────────────────────────────────
// Used when a team is not found in the DB cache.

const FALLBACK_FLAGS: Record<string, string> = {
  'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Belgium': '🇧🇪', 'Brazil': '🇧🇷',
  'Canada': '🇨🇦', 'Croatia': '🇭🇷', 'Ecuador': '🇪🇨', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Iran': '🇮🇷',
  'Japan': '🇯🇵', 'Mexico': '🇲🇽', 'Morocco': '🇲🇦', 'Netherlands': '🇳🇱',
  'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'Saudi Arabia': '🇸🇦', 'Senegal': '🇸🇳',
  'Spain': '🇪🇸', 'Switzerland': '🇨🇭', 'Tunisia': '🇹🇳', 'Uruguay': '🇺🇾',
  'USA': '🇺🇸', 'Korea Republic': '🇰🇷', 'South Africa': '🇿🇦', 'Czechia': '🇨🇿',
  'Bosnia-Herzegovina': '🇧🇦', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Haiti': '🇭🇹',
  'Paraguay': '🇵🇾', 'Türkiye': '🇹🇷', 'Ivory Coast': '🇨🇮', 'Curaçao': '🇨🇼',
  'Sweden': '🇸🇪', 'Egypt': '🇪🇬', 'New Zealand': '🇳🇿', 'Cape Verde': '🇨🇻',
  'Norway': '🇳🇴', 'Iraq': '🇮🇶', 'Austria': '🇦🇹', 'Algeria': '🇩🇿',
  'Jordan': '🇯🇴', 'Colombia': '🇨🇴', 'Uzbekistan': '🇺🇿', 'DR Congo': '🇨🇩',
  'Panama': '🇵🇦', 'Togo': '🇹🇬',
};

/** Obtenir le drapeau d'une équipe (depuis le cache DB, sinon fallback statique) */
export function getFlag(teamName: string): string {
  if (!teamName) return '🏳️';
  // Check DB cache first (synchronously if already loaded)
  if (_teamsCache) {
    const found = _teamsCache.find(t =>
      teamName.toLowerCase() === t.name.toLowerCase() ||
      teamName.toLowerCase().includes(t.name.toLowerCase())
    );
    if (found) return found.flag;
  }
  // Fallback to static map
  for (const [key, emoji] of Object.entries(FALLBACK_FLAGS)) {
    if (teamName.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '🏳️';
}

/** Obtenir le groupe d'une équipe (depuis le cache DB, sinon null) */
export function getTeamGroup(teamName: string): string | null {
  if (!teamName) return null;
  if (_teamsCache) {
    const found = _teamsCache.find(t =>
      teamName.toLowerCase() === t.name.toLowerCase() ||
      teamName.toLowerCase().includes(t.name.toLowerCase())
    );
    if (found) return found.group_letter;
  }
  return null;
}

/** Groupes FIFA 2026 disponibles (A à L) */
export const WC2026_GROUPS_TEAMS: Record<string, string[]> = {
  'A': ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  'B': ['Canada', 'Switzerland', 'Qatar', 'Bosnia-Herzegovina'],
  'C': ['Brazil', 'Morocco', 'Scotland', 'Haiti'],
  'D': ['USA', 'Paraguay', 'Australia', 'Türkiye'],
  'E': ['Germany', 'Ecuador', 'Ivory Coast', 'Curaçao'],
  'F': ['Netherlands', 'Japan', 'Tunisia', 'Sweden'],
  'G': ['Belgium', 'Iran', 'Egypt', 'New Zealand'],
  'H': ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
  'I': ['France', 'Senegal', 'Norway', 'Iraq'],
  'J': ['Argentina', 'Austria', 'Algeria', 'Jordan'],
  'K': ['Portugal', 'Colombia', 'Uzbekistan', 'DR Congo'],
  'L': ['England', 'Croatia', 'Panama', 'Ghana']
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WCAMatch {
  id: number;
  uuid?: string;
  date: string;
  status: 'scheduled' | 'live' | 'finished' | string;
  minute?: number;
  group?: string | null;
  venue?: string | null;
  city?: string | null;
  home_team: {
    id: number;
    name: string;
    short_name?: string;
    flag?: string;
  };
  away_team: {
    id: number;
    name: string;
    short_name?: string;
    flag?: string;
  };
  home_score?: number | null;
  away_score?: number | null;
  home_score_ht?: number | null;
  away_score_ht?: number | null;
}

export interface WCAStanding {
  position: number;
  team: {
    id: number;
    name: string;
    flag?: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface WCAEvent {
  id?: string;
  minute: number;
  extra_minute?: number | null;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | string;
  player: string;
  assist?: string | null;
  detail?: string | null;
  team: {
    flag?: string;
  };
}

export interface WCAStatistic {
  type: string;
  home: string | number;
  away: string | number;
}

export interface WCAPlayer {
  id?: string;
  number?: number;
  name: string;
  position?: string;
  is_captain?: boolean;
}

export interface WCALineup {
  home_team: {
    formation?: string | null;
    starting: WCAPlayer[];
    substitutes: WCAPlayer[];
  };
  away_team: {
    formation?: string | null;
    starting: WCAPlayer[];
    substitutes: WCAPlayer[];
  };
}

export interface WCAScorer {
  player_name: string;
  goals: number;
  assists?: number;
  team?: {
    name: string;
    flag?: string;
  };
}

export interface SDBEvent {
  idEvent:           string;
  strEvent:          string;
  strHomeTeam:       string;
  strAwayTeam:       string;
  idHomeTeam:        string;
  idAwayTeam:        string;
  strHomeTeamBadge:  string;
  strAwayTeamBadge:  string;
  intHomeScore:      string | null;
  intAwayScore:      string | null;
  strStatus:         string;
  dateEvent:         string;
  strTime:           string;
  strTimestamp:      string;
  strGroup:          string | null;
  strRound:          string | null;
  intRound:          string | null;
  strVenue:          string | null;
  strCity:           string | null;
  strThumb:          string | null;
  strPoster:         string | null;
  strBanner:         string | null;
  strLeague:         string;
  strSeason:         string;
  strPostponed:      string;
}

// ─── Numeric Id Helper ────────────────────────────────────────────────────────

export function hashUUIDToNumber(uuid: string): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 1000000;
}

// ─── Initial Match Seeder (for group matches) ─────────────────────────────────

export function getMockMatches(): SDBEvent[] {
  const matches: SDBEvent[] = [];
  const startDate = new Date('2026-06-11T15:00:00Z');
  let matchId = 500000;

  const groups = Object.keys(WC2026_GROUPS_TEAMS);

  const venues = [
    { venue: 'Estadio Azteca', city: 'Mexico City' },
    { venue: 'MetLife Stadium', city: 'New York / New Jersey' },
    { venue: 'SoFi Stadium', city: 'Los Angeles' },
    { venue: 'Mercedes-Benz Stadium', city: 'Atlanta' },
    { venue: 'BC Place', city: 'Vancouver' },
    { venue: 'AT&T Stadium', city: 'Dallas' }
  ];

  groups.forEach((group, groupIdx) => {
    const teams = WC2026_GROUPS_TEAMS[group];
    const pairings = [
      [0, 1], [2, 3], // Round 1
      [0, 2], [1, 3], // Round 2
      [0, 3], [1, 2]  // Round 3
    ];

    pairings.forEach((pair, pairIdx) => {
      const home = teams[pair[0]];
      const away = teams[pair[1]];

      const matchDate = new Date(startDate.getTime());
      const daysToAdd = Math.floor((groupIdx * 6 + pairIdx) / 4);
      matchDate.setDate(startDate.getDate() + daysToAdd);
      
      const slot = (pairIdx % 3);
      const hours = slot === 0 ? 15 : slot === 1 ? 18 : 21;
      matchDate.setHours(hours, 0, 0, 0);

      const dateStr = matchDate.toISOString().split('T')[0];
      const timeStr = matchDate.toISOString().split('T')[1].substring(0, 8);

      let status = 'NS';
      let homeScore: string | null = null;
      let awayScore: string | null = null;

      // Group A, B and C round 1 matches finished (FT) to test live standings
      if (groupIdx < 3 && pairIdx < 2) {
        status = 'FT';
        if (groupIdx === 0 && pairIdx === 0) { homeScore = '2'; awayScore = '1'; }
        else if (groupIdx === 0 && pairIdx === 1) { homeScore = '0'; awayScore = '2'; }
        else if (groupIdx === 1 && pairIdx === 0) { homeScore = '1'; awayScore = '3'; }
        else if (groupIdx === 1 && pairIdx === 1) { homeScore = '1'; awayScore = '1'; }
        else if (groupIdx === 2 && pairIdx === 0) { homeScore = '3'; awayScore = '1'; }
        else if (groupIdx === 2 && pairIdx === 1) { homeScore = '0'; awayScore = '0'; }
      } 
      // Next group round 1 match is live (2H, 68th minute)
      else if (groupIdx === 3 && pairIdx === 0) {
        status = '2H';
        homeScore = '2';
        awayScore = '2';
      }
      // Next group round 1 match is live (1H, 24th minute)
      else if (groupIdx === 3 && pairIdx === 1) {
        status = '1H';
        homeScore = '0';
        awayScore = '0';
      }

      const venueInfo = venues[(groupIdx + pairIdx) % venues.length];

      matches.push({
        idEvent: String(matchId),
        strEvent: `${home} vs ${away}`,
        strHomeTeam: home,
        strAwayTeam: away,
        idHomeTeam: String(1000 + pair[0] + groupIdx * 10),
        idAwayTeam: String(1000 + pair[1] + groupIdx * 10),
        strHomeTeamBadge: '',
        strAwayTeamBadge: '',
        intHomeScore: homeScore,
        intAwayScore: awayScore,
        strStatus: status,
        dateEvent: dateStr,
        strTime: timeStr,
        strTimestamp: matchDate.toISOString(),
        strGroup: `Group ${group}`,
        strRound: String(Math.floor(pairIdx / 2) + 1),
        intRound: String(Math.floor(pairIdx / 2) + 1),
        strVenue: venueInfo.venue,
        strCity: venueInfo.city,
        strThumb: null,
        strPoster: null,
        strBanner: null,
        strLeague: 'FIFA World Cup',
        strSeason: '2026',
        strPostponed: 'no'
      });
      matchId++;
    });
  });

  return matches;
}

async function seedMatchesIfEmpty() {
  // Auto-seeding disabled to keep database empty
}

// ─── API Methods ──────────────────────────────────────────────────────────────

export async function getFixtures(options?: { date?: string; group?: string; team_id?: number; page?: number }): Promise<WCAMatch[]> {
  // Preload teams cache for flag/group lookups
  await getTeamsCache();
  seedMatchesIfEmpty();

  const { data: dbMatches, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  if (error || !dbMatches) {
    console.error('[Supabase API] Error fetching matches:', error);
    return [];
  }

  let matches: WCAMatch[] = dbMatches.map(m => {
    const numericId = hashUUIDToNumber(m.id);
    const home = m.team_home;
    const away = m.team_away;
    const group = getTeamGroup(home) || getTeamGroup(away);
    const status = m.status?.toUpperCase() || 'UPCOMING';

    let uStatus = 'scheduled';
    let minute = undefined;

    if (status === 'LIVE') {
      uStatus = 'live';
      minute = 68;
    } else if (status === 'FINISHED') {
      uStatus = 'finished';
    }

    return {
      id: numericId,
      uuid: m.id,
      date: m.match_date,
      status: uStatus,
      minute,
      group,
      venue: 'MetLife Stadium',
      city: 'New York',
      home_team: {
        id: numericId * 2,
        name: home,
        short_name: home.substring(0, 3).toUpperCase(),
        flag: getFlag(home),
      },
      away_team: {
        id: numericId * 2 + 1,
        name: away,
        short_name: away.substring(0, 3).toUpperCase(),
        flag: getFlag(away),
      },
      home_score: m.score_home,
      away_score: m.score_away,
      home_score_ht: status === 'FINISHED' ? Math.floor((m.score_home || 0) / 2) : null,
      away_score_ht: status === 'FINISHED' ? Math.floor((m.score_away || 0) / 2) : null,
    };
  });

  if (options) {
    if (options.date) {
      matches = matches.filter(m => m.date.startsWith(options.date!));
    }
    if (options.group) {
      matches = matches.filter(m => m.group === options.group!.toUpperCase());
    }
    if (options.page) {
      const pageSize = 10;
      const start = (options.page - 1) * pageSize;
      matches = matches.slice(start, start + pageSize);
    }
  }

  return matches;
}

export async function getStandings(group: string): Promise<WCAStanding[]> {
  const groupUpper = group.toUpperCase();

  // Load teams from DB cache, then filter to the requested group
  await getTeamsCache();
  let groupTeams: string[];

  if (_teamsCache && _teamsCache.length > 0) {
    groupTeams = _teamsCache
      .filter(t => t.group_letter === groupUpper)
      .map(t => t.name);
  } else {
    // fallback to static map
    groupTeams = WC2026_GROUPS_TEAMS[groupUpper] || [];
  }

  const { data: dbMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'FINISHED');

  const statsMap: Record<string, {
    played: number; won: number; drawn: number; lost: number;
    gf: number; ga: number; pts: number;
  }> = {};

  groupTeams.forEach(t => {
    statsMap[t] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
  });

  if (dbMatches) {
    dbMatches.forEach(m => {
      const home = m.team_home;
      const away = m.team_away;
      const matchGroup = getTeamGroup(home) || getTeamGroup(away);

      if (matchGroup === groupUpper) {
        const hs = Number(m.score_home) || 0;
        const as_ = Number(m.score_away) || 0;

        // Initialise if team newly added or not in default list
        if (!statsMap[home]) statsMap[home] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
        if (!statsMap[away]) statsMap[away] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };

        statsMap[home].played += 1;
        statsMap[away].played += 1;
        statsMap[home].gf += hs;
        statsMap[home].ga += as_;
        statsMap[away].gf += as_;
        statsMap[away].ga += hs;

        if (hs > as_) {
          statsMap[home].won += 1;
          statsMap[home].pts += 3;
          statsMap[away].lost += 1;
        } else if (hs < as_) {
          statsMap[away].won += 1;
          statsMap[away].pts += 3;
          statsMap[home].lost += 1;
        } else {
          statsMap[home].drawn += 1;
          statsMap[home].pts += 1;
          statsMap[away].drawn += 1;
          statsMap[away].pts += 1;
        }
      }
    });
  }

  const standingsList = Object.keys(statsMap).map(teamName => {
    const s = statsMap[teamName];
    return {
      teamName,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goals_for: s.gf,
      goals_against: s.ga,
      goal_difference: s.gf - s.ga,
      points: s.pts,
    };
  });

  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    return b.goals_for - a.goals_for;
  });

  return standingsList.map((s, idx) => ({
    position: idx + 1,
    team: {
      id: 999000 + idx,
      name: s.teamName,
      flag: getFlag(s.teamName),
    },
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    goals_for: s.goals_for,
    goals_against: s.goals_against,
    goal_difference: s.goal_difference,
    points: s.points,
  }));
}

export async function getLiveStandings(group: string): Promise<WCAStanding[]> {
  return getStandings(group);
}

export async function getGoalscorers(): Promise<WCAScorer[]> {
  return [
    { player_name: 'Kylian Mbappé', goals: 8, assists: 2, team: { name: 'France', flag: '🇫🇷' } },
    { player_name: 'Lionel Messi', goals: 7, assists: 3, team: { name: 'Argentine', flag: '🇦🇷' } },
    { player_name: 'Erling Haaland', goals: 6, assists: 1, team: { name: 'Norvège', flag: '🇳🇴' } },
    { player_name: 'Harry Kane', goals: 5, assists: 2, team: { name: 'Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
    { player_name: 'Neymar Jr', goals: 5, assists: 2, team: { name: 'Brésil', flag: '🇧🇷' } },
    { player_name: 'Cristiano Ronaldo', goals: 4, assists: 0, team: { name: 'Portugal', flag: '🇵🇹' } },
    { player_name: 'Robert Lewandowski', goals: 4, assists: 1, team: { name: 'Pologne', flag: '🇵🇱' } },
    { player_name: 'Vinicius Jr', goals: 4, assists: 3, team: { name: 'Brésil', flag: '🇧🇷' } }
  ];
}

export async function getEventById(eventId: string): Promise<SDBEvent | null> {
  const numericId = Number(eventId);
  const { data: dbMatches } = await supabase.from('matches').select('*');
  if (!dbMatches) return null;

  const match = dbMatches.find(m => hashUUIDToNumber(m.id) === numericId);
  if (!match) return null;

  const home = match.team_home;
  const away = match.team_away;
  const group = getTeamGroup(home) || getTeamGroup(away);
  const status = match.status === 'LIVE' ? '2H' : match.status === 'FINISHED' ? 'FT' : 'NS';

  return {
    idEvent: String(numericId),
    strEvent: `${home} vs ${away}`,
    strHomeTeam: home,
    strAwayTeam: away,
    idHomeTeam: String(1000),
    idAwayTeam: String(1001),
    strHomeTeamBadge: '',
    strAwayTeamBadge: '',
    intHomeScore: match.score_home !== null ? String(match.score_home) : null,
    intAwayScore: match.score_away !== null ? String(match.score_away) : null,
    strStatus: status,
    dateEvent: match.match_date.split('T')[0],
    strTime: match.match_date.split('T')[1]?.substring(0, 8) || '18:00:00',
    strTimestamp: match.match_date,
    strGroup: group ? `Group ${group}` : null,
    strRound: '1',
    intRound: '1',
    strVenue: 'MetLife Stadium',
    strCity: 'New York',
    strThumb: null,
    strPoster: null,
    strBanner: null,
    strLeague: 'FIFA World Cup',
    strSeason: '2026',
    strPostponed: 'no'
  };
}

export async function getEventTimeline(eventId: string): Promise<any[]> {
  const event = await getEventById(eventId);
  if (!event) return [];

  const timeline = [];
  const home = event.strHomeTeam;
  const away = event.strAwayTeam;
  const hs = Number(event.intHomeScore) || 0;
  const as = Number(event.intAwayScore) || 0;

  let id = 1;
  for (let i = 0; i < hs; i++) {
    timeline.push({
      idTimeline: String(id++),
      strEvent: event.strEvent,
      strAction: 'Goal',
      strPlayer: `${home} Scorer ${i + 1}`,
      strPlayer2: `${home} Assist ${i + 1}`,
      strTeam: home,
      intTime: String(10 + i * 20)
    });
  }

  for (let i = 0; i < as; i++) {
    timeline.push({
      idTimeline: String(id++),
      strEvent: event.strEvent,
      strAction: 'Goal',
      strPlayer: `${away} Scorer ${i + 1}`,
      strPlayer2: `${away} Assist ${i + 1}`,
      strTeam: away,
      intTime: String(15 + i * 20)
    });
  }

  timeline.push({
    idTimeline: String(id++),
    strEvent: event.strEvent,
    strAction: 'Yellow Card',
    strPlayer: `${home} Defender`,
    strPlayer2: null,
    strTeam: home,
    intTime: '42'
  });

  return timeline;
}

export async function getEventLineup(eventId: string): Promise<any[]> {
  const event = await getEventById(eventId);
  if (!event) return [];

  const lineups = [];
  const home = event.strHomeTeam;
  const away = event.strAwayTeam;

  const positions = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];

  positions.forEach((pos, idx) => {
    lineups.push({
      idLineup: `h-${idx}`,
      strEvent: event.strEvent,
      strPlayer: `${home} Player ${idx + 1}`,
      strTeam: home,
      intOrder: String(idx + 1),
      strPosition: pos,
      strPositionShort: pos,
      intSub: '0',
      strFormation: '4-3-3'
    });
  });

  positions.forEach((pos, idx) => {
    lineups.push({
      idLineup: `a-${idx}`,
      strEvent: event.strEvent,
      strPlayer: `${away} Player ${idx + 1}`,
      strTeam: away,
      intOrder: String(idx + 1),
      strPosition: pos,
      strPositionShort: pos,
      intSub: '0',
      strFormation: '4-3-3'
    });
  });

  for (let idx = 11; idx < 14; idx++) {
    lineups.push({
      idLineup: `h-${idx}`,
      strEvent: event.strEvent,
      strPlayer: `${home} Sub ${idx - 10}`,
      strTeam: home,
      intOrder: String(idx + 1),
      strPosition: 'SUB',
      strPositionShort: 'SUB',
      intSub: '1',
      strFormation: null
    });
    lineups.push({
      idLineup: `a-${idx}`,
      strEvent: event.strEvent,
      strPlayer: `${away} Sub ${idx - 10}`,
      strTeam: away,
      intOrder: String(idx + 1),
      strPosition: 'SUB',
      strPositionShort: 'SUB',
      intSub: '1',
      strFormation: null
    });
  }

  return lineups;
}

export async function getEventStats(eventId: string): Promise<any[]> {
  const event = await getEventById(eventId);
  if (!event) return [];

  return [
    { idStatistic: '1', strEvent: event.strEvent, strStat: 'Possession %', strStatHome: '54%', strStatAway: '46%' },
    { idStatistic: '2', strEvent: event.strEvent, strStat: 'Tirs', strStatHome: '14', strStatAway: '9' },
    { idStatistic: '3', strEvent: event.strEvent, strStat: 'Tirs Cadrés', strStatHome: '6', strStatAway: '3' },
    { idStatistic: '4', strEvent: event.strEvent, strStat: 'Corners', strStatHome: '5', strStatAway: '3' },
    { idStatistic: '5', strEvent: event.strEvent, strStat: 'Fautes', strStatHome: '11', strStatAway: '14' },
    { idStatistic: '6', strEvent: event.strEvent, strStat: 'Cartons Jaunes', strStatHome: '1', strStatAway: '2' }
  ];
}

export async function getMatchEvents(matchId: number): Promise<WCAEvent[]> {
  const timeline = await getEventTimeline(String(matchId));
  return timeline.map(t => {
    let type = 'detail';
    const action = t.strAction?.toLowerCase() || '';
    if (action.includes('goal')) type = 'goal';
    else if (action.includes('yellow')) type = 'yellow_card';
    else if (action.includes('red')) type = 'red_card';
    else if (action.includes('sub')) type = 'substitution';

    return {
      id: t.idTimeline,
      minute: Number(t.intTime) || 0,
      extra_minute: null,
      type,
      player: t.strPlayer || 'Joueur',
      assist: t.strPlayer2 || null,
      detail: t.strAction,
      team: {
        flag: getFlag(t.strTeam || ''),
      }
    };
  });
}

export async function getMatchStatistics(matchId: number): Promise<WCAStatistic[]> {
  const stats = await getEventStats(String(matchId));
  return stats.map(s => ({
    type: s.strStat || 'Statistique',
    home: s.strStatHome || '0',
    away: s.strStatAway || '0',
  }));
}

export async function getLineups(matchId: number): Promise<WCALineup> {
  const rawLineup = await getEventLineup(String(matchId));
  
  const homeStarting: WCAPlayer[] = [];
  const homeSubstitutes: WCAPlayer[] = [];
  const awayStarting: WCAPlayer[] = [];
  const awaySubstitutes: WCAPlayer[] = [];

  const event = await getEventById(String(matchId));
  const homeTeamName = event?.strHomeTeam || '';

  rawLineup.forEach(p => {
    const player: WCAPlayer = {
      id: p.idLineup,
      name: p.strPlayer,
      position: p.strPositionShort || p.strPosition || undefined,
      number: p.intOrder ? Number(p.intOrder) : undefined,
    };

    const isHome = p.strTeam === homeTeamName;
    const isSub = p.intSub === '1' || p.strPositionShort?.toLowerCase() === 'sub';

    if (isHome) {
      if (isSub) homeSubstitutes.push(player);
      else homeStarting.push(player);
    } else {
      if (isSub) awaySubstitutes.push(player);
      else awayStarting.push(player);
    }
  });

  return {
    home_team: {
      formation: null,
      starting: homeStarting,
      substitutes: homeSubstitutes,
    },
    away_team: {
      formation: null,
      starting: awayStarting,
      substitutes: awaySubstitutes,
    }
  };
}

export async function getNextEvents(): Promise<any[]> {
  const fixtures = await getFixtures();
  // Map WCAMatch to shape compatible with raw live/next event checkers
  return fixtures
    .filter(m => m.status === 'scheduled' || m.status === 'live')
    .map(m => ({
      idEvent: String(m.id),
      strEvent: `${m.home_team.name} vs ${m.away_team.name}`,
      strHomeTeam: m.home_team.name,
      strAwayTeam: m.away_team.name,
      intHomeScore: m.home_score !== null ? String(m.home_score) : null,
      intAwayScore: m.away_score !== null ? String(m.away_score) : null,
      strStatus: m.status === 'live' ? '2H' : 'NS',
      dateEvent: m.date.split('T')[0],
      strTime: m.date.split('T')[1]?.substring(0, 8) || '18:00:00',
      strTimestamp: m.date,
      strGroup: m.group ? `Group ${m.group}` : null,
      strVenue: m.venue,
      strCity: m.city
    }));
}

export async function getLastEvents(): Promise<any[]> {
  const fixtures = await getFixtures();
  return fixtures
    .filter(m => m.status === 'finished')
    .map(m => ({
      idEvent: String(m.id),
      strEvent: `${m.home_team.name} vs ${m.away_team.name}`,
      strHomeTeam: m.home_team.name,
      strAwayTeam: m.away_team.name,
      intHomeScore: m.home_score !== null ? String(m.home_score) : null,
      intAwayScore: m.away_score !== null ? String(m.away_score) : null,
      strStatus: 'FT',
      dateEvent: m.date.split('T')[0],
      strTime: m.date.split('T')[1]?.substring(0, 8) || '18:00:00',
      strTimestamp: m.date,
      strGroup: m.group ? `Group ${m.group}` : null,
      strVenue: m.venue,
      strCity: m.city
    }));
}

export async function getTeamPlayers(teamId: string): Promise<any[]> {
  return [];
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

/** Statut lisible en français */
export function statusLabel(status: string): string {
  switch (status?.toUpperCase()) {
    case 'NS':               return 'À venir';
    case 'MATCH FINISHED':
    case 'FT':               return 'Terminé';
    case '1H':               return '1ère mi-temps';
    case 'HT':               return 'Mi-temps';
    case '2H':               return '2ème mi-temps';
    case 'ET':               return 'Prolongations';
    case 'PEN':              return 'Tirs au but';
    case 'POSTPONED':        return 'Reporté';
    case 'CANCELLED':        return 'Annulé';
    default:                 return status ?? '—';
  }
}

/** Couleur du badge de statut */
export function statusColor(status: string): string {
  const s = status?.toUpperCase();
  if (['1H','2H','ET','PEN'].includes(s)) return 'bg-red-600 text-white animate-pulse';
  if (s === 'HT')               return 'bg-orange-500 text-white';
  if (['MATCH FINISHED','FT'].includes(s)) return 'bg-slate-200 text-slate-600';
  if (s === 'NS')               return 'bg-blue-100 text-blue-700';
  if (s === 'POSTPONED')        return 'bg-orange-100 text-orange-700';
  return 'bg-slate-100 text-slate-500';
}

/** Score formaté */
export function formatScore(e: WCAMatch): string {
  if (e.home_score !== null && e.away_score !== null && e.home_score !== undefined && e.away_score !== undefined) {
    return `${e.home_score} – ${e.away_score}`;
  }
  return 'vs';
}

/** Est-ce un match en cours ? */
export function isLive(status: string): boolean {
  return ['1H','HT','2H','ET','PEN'].includes(status?.toUpperCase());
}

/** Date formatée en français */
export function formatDate(dateStr: string, timeStr?: string): string {
  const date = new Date(timeStr ? `${dateStr}T${timeStr}` : dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short',
  }) + (timeStr ? ' · ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '');
}

/** Groupes FIFA 2026 : A–L */
export const WC2026_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const;
export type WC2026Group = typeof WC2026_GROUPS[number];
