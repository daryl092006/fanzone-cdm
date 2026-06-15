import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getFlag } from '@/lib/worldcup-api';

export const runtime = 'nodejs';

export interface KOMatch {
  id: string;
  round: 'R16' | 'QF' | 'SF' | 'F' | '3P';
  round_label: string;
  match_number: number;
  home_team: string | null;
  away_team: string | null;
  home_flag: string;
  away_flag: string;
  home_score: number | null;
  away_score: number | null;
  home_score_pen: number | null;
  away_score_pen: number | null;
  status: string;
  match_date: string | null;
  venue: string | null;
}

const KO_STRUCTURE: Omit<KOMatch, 'home_team' | 'away_team' | 'home_flag' | 'away_flag' | 'home_score' | 'away_score' | 'home_score_pen' | 'away_score_pen' | 'status' | 'match_date' | 'venue'>[] = [
  // Huitièmes de finale (16 matchs)
  { id: 'r16_1',  round: 'R16', round_label: 'Huitième de finale', match_number: 1 },
  { id: 'r16_2',  round: 'R16', round_label: 'Huitième de finale', match_number: 2 },
  { id: 'r16_3',  round: 'R16', round_label: 'Huitième de finale', match_number: 3 },
  { id: 'r16_4',  round: 'R16', round_label: 'Huitième de finale', match_number: 4 },
  { id: 'r16_5',  round: 'R16', round_label: 'Huitième de finale', match_number: 5 },
  { id: 'r16_6',  round: 'R16', round_label: 'Huitième de finale', match_number: 6 },
  { id: 'r16_7',  round: 'R16', round_label: 'Huitième de finale', match_number: 7 },
  { id: 'r16_8',  round: 'R16', round_label: 'Huitième de finale', match_number: 8 },
  // Quarts de finale
  { id: 'qf_1',   round: 'QF', round_label: 'Quart de finale', match_number: 1 },
  { id: 'qf_2',   round: 'QF', round_label: 'Quart de finale', match_number: 2 },
  { id: 'qf_3',   round: 'QF', round_label: 'Quart de finale', match_number: 3 },
  { id: 'qf_4',   round: 'QF', round_label: 'Quart de finale', match_number: 4 },
  // Demi-finales
  { id: 'sf_1',   round: 'SF', round_label: 'Demi-finale', match_number: 1 },
  { id: 'sf_2',   round: 'SF', round_label: 'Demi-finale', match_number: 2 },
  // Finale pour la 3e place
  { id: '3p_1',   round: '3P', round_label: 'Match pour la 3e place', match_number: 1 },
  // Finale
  { id: 'f_1',    round: 'F',  round_label: 'Finale', match_number: 1 },
];

export async function GET(_req: NextRequest) {
  try {
    // Fetch KO matches from DB if they exist
    const { data: dbKO } = await supabase
      .from('matches')
      .select('*')
      .eq('stage', 'KO')
      .order('match_date', { ascending: true });

    // Build the KO bracket, merging DB data with the static structure
    const bracket: KOMatch[] = KO_STRUCTURE.map((slot, _i) => {
      const dbMatch = dbKO?.find((m: any) => m.ko_slot === slot.id);
      
      const homeTeam = dbMatch?.team_home ?? null;
      const awayTeam = dbMatch?.team_away ?? null;

      return {
        ...slot,
        home_team: homeTeam,
        away_team: awayTeam,
        home_flag: homeTeam ? getFlag(homeTeam) : '🏳️',
        away_flag: awayTeam ? getFlag(awayTeam) : '🏳️',
        home_score: dbMatch?.score_home ?? null,
        away_score: dbMatch?.score_away ?? null,
        home_score_pen: dbMatch?.score_home_pen ?? null,
        away_score_pen: dbMatch?.score_away_pen ?? null,
        status: dbMatch?.status ?? 'TBD',
        match_date: dbMatch?.match_date ?? null,
        venue: dbMatch?.venue ?? null,
      };
    });

    return NextResponse.json(
      { success: true, data: bracket },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
