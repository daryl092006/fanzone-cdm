/**
 * ─── RESET COMPLET : 72 matchs FIFA World Cup 2026 avec noms officiels ─────
 * 
 * Ce script :
 * 1. Supprime TOUS les matchs existants (sauf le match système UUID zéro)
 * 2. Réinsère les 72 matchs de phase de groupes avec les noms officiels
 * 
 * Usage: node reset-matches.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── 72 matchs officiels FIFA WC 2026 — noms EN ANGLAIS (noms officiels) ─────

const MATCHES = [
  // ── Groupe A ──────────────────────────────────────────────────────────────
  { home: 'Mexico',       away: 'South Africa',      date: '2026-06-11T19:00:00Z' },
  { home: 'Korea Republic', away: 'Czechia',         date: '2026-06-12T00:00:00Z' },
  { home: 'Czechia',      away: 'South Africa',      date: '2026-06-18T16:00:00Z' },
  { home: 'Mexico',       away: 'Korea Republic',    date: '2026-06-19T01:00:00Z' },
  { home: 'Czechia',      away: 'Mexico',            date: '2026-06-25T01:00:00Z' },
  { home: 'South Africa', away: 'Korea Republic',    date: '2026-06-25T01:00:00Z' },

  // ── Groupe B ──────────────────────────────────────────────────────────────
  { home: 'Canada',             away: 'Bosnia-Herzegovina', date: '2026-06-12T16:00:00Z' },
  { home: 'Qatar',              away: 'Switzerland',         date: '2026-06-13T16:00:00Z' },
  { home: 'Switzerland',        away: 'Bosnia-Herzegovina',  date: '2026-06-18T14:00:00Z' },
  { home: 'Canada',             away: 'Qatar',               date: '2026-06-19T22:00:00Z' },
  { home: 'Switzerland',        away: 'Canada',              date: '2026-06-24T14:00:00Z' },
  { home: 'Bosnia-Herzegovina', away: 'Qatar',               date: '2026-06-24T14:00:00Z' },

  // ── Groupe C ──────────────────────────────────────────────────────────────
  { home: 'Haiti',    away: 'Scotland', date: '2026-06-14T01:00:00Z' },
  { home: 'Brazil',   away: 'Morocco',  date: '2026-06-14T22:00:00Z' },
  { home: 'Scotland', away: 'Morocco',  date: '2026-06-20T22:00:00Z' },
  { home: 'Brazil',   away: 'Haiti',    date: '2026-06-20T01:00:00Z' },
  { home: 'Morocco',  away: 'Haiti',    date: '2026-06-25T21:00:00Z' },
  { home: 'Scotland', away: 'Brazil',   date: '2026-06-25T21:00:00Z' },

  // ── Groupe D ──────────────────────────────────────────────────────────────
  { home: 'USA',       away: 'Paraguay',  date: '2026-06-13T01:00:00Z' },
  { home: 'Australia', away: 'Türkiye',   date: '2026-06-14T04:00:00Z' },
  { home: 'USA',       away: 'Australia', date: '2026-06-19T16:00:00Z' },
  { home: 'Türkiye',   away: 'Paraguay',  date: '2026-06-20T14:00:00Z' },
  { home: 'Türkiye',   away: 'USA',       date: '2026-06-26T14:00:00Z' },
  { home: 'Paraguay',  away: 'Australia', date: '2026-06-26T02:00:00Z' },

  // ── Groupe E ──────────────────────────────────────────────────────────────
  { home: 'Germany',     away: 'Curaçao',     date: '2026-06-14T17:00:00Z' },
  { home: 'Ivory Coast', away: 'Ecuador',     date: '2026-06-15T00:00:00Z' },
  { home: 'Germany',     away: 'Ivory Coast', date: '2026-06-20T17:00:00Z' },
  { home: 'Ecuador',     away: 'Curaçao',     date: '2026-06-21T00:00:00Z' },
  { home: 'Ecuador',     away: 'Germany',     date: '2026-06-25T20:00:00Z' },
  { home: 'Curaçao',    away: 'Ivory Coast',  date: '2026-06-25T20:00:00Z' },

  // ── Groupe F ──────────────────────────────────────────────────────────────
  { home: 'Netherlands', away: 'Japan',       date: '2026-06-14T20:00:00Z' },
  { home: 'Sweden',      away: 'Tunisia',     date: '2026-06-15T03:00:00Z' },
  { home: 'Tunisia',     away: 'Japan',       date: '2026-06-21T03:00:00Z' },
  { home: 'Netherlands', away: 'Sweden',      date: '2026-06-21T16:00:00Z' },
  { home: 'Tunisia',     away: 'Netherlands', date: '2026-06-26T22:00:00Z' },
  { home: 'Japan',       away: 'Sweden',      date: '2026-06-26T22:00:00Z' },

  // ── Groupe G ──────────────────────────────────────────────────────────────
  { home: 'Belgium',     away: 'Egypt',       date: '2026-06-15T16:00:00Z' },
  { home: 'Iran',        away: 'New Zealand', date: '2026-06-16T03:00:00Z' },
  { home: 'Belgium',     away: 'Iran',        date: '2026-06-21T14:00:00Z' },
  { home: 'New Zealand', away: 'Egypt',       date: '2026-06-22T20:00:00Z' },
  { home: 'Egypt',       away: 'Iran',        date: '2026-06-27T03:00:00Z' },
  { home: 'New Zealand', away: 'Belgium',     date: '2026-06-27T23:30:00Z' },

  // ── Groupe H ──────────────────────────────────────────────────────────────
  { home: 'Spain',         away: 'Cape Verde',   date: '2026-06-15T16:00:00Z' },
  { home: 'Saudi Arabia',  away: 'Uruguay',      date: '2026-06-16T00:00:00Z' },
  { home: 'Spain',         away: 'Saudi Arabia', date: '2026-06-21T19:00:00Z' },
  { home: 'Uruguay',       away: 'Cape Verde',   date: '2026-06-22T22:00:00Z' },
  { home: 'Cape Verde',    away: 'Saudi Arabia', date: '2026-06-27T00:00:00Z' },
  { home: 'Uruguay',       away: 'Spain',        date: '2026-06-28T00:00:00Z' },

  // ── Groupe I ──────────────────────────────────────────────────────────────
  { home: 'France',  away: 'Senegal', date: '2026-06-16T16:00:00Z' },
  { home: 'Iraq',    away: 'Norway',  date: '2026-06-16T19:00:00Z' },
  { home: 'France',  away: 'Iraq',    date: '2026-06-22T01:00:00Z' },
  { home: 'Norway',  away: 'Senegal', date: '2026-06-23T00:00:00Z' },
  { home: 'Norway',  away: 'France',  date: '2026-06-26T02:00:00Z' },
  { home: 'Senegal', away: 'Iraq',    date: '2026-06-26T10:00:00Z' },

  // ── Groupe J ──────────────────────────────────────────────────────────────
  { home: 'Argentina', away: 'Algeria', date: '2026-06-17T00:00:00Z' },
  { home: 'Austria',   away: 'Jordan',  date: '2026-06-17T03:00:00Z' },
  { home: 'Argentina', away: 'Austria', date: '2026-06-22T17:00:00Z' },
  { home: 'Algeria',   away: 'Jordan',  date: '2026-06-22T14:00:00Z' },
  { home: 'Algeria',   away: 'Austria', date: '2026-06-28T02:00:00Z' },
  { home: 'Jordan',    away: 'Argentina', date: '2026-06-28T02:00:00Z' },

  // ── Groupe K ──────────────────────────────────────────────────────────────
  { home: 'Portugal',   away: 'DR Congo',   date: '2026-06-17T17:00:00Z' },
  { home: 'Uzbekistan', away: 'Colombia',   date: '2026-06-18T17:00:00Z' },
  { home: 'Portugal',   away: 'Uzbekistan', date: '2026-06-23T17:00:00Z' },
  { home: 'Colombia',   away: 'DR Congo',   date: '2026-06-24T20:00:00Z' },
  { home: 'Colombia',   away: 'Portugal',   date: '2026-06-28T23:30:00Z' },
  { home: 'DR Congo',   away: 'Uzbekistan', date: '2026-06-28T23:30:00Z' },

  // ── Groupe L ──────────────────────────────────────────────────────────────
  { home: 'England', away: 'Croatia', date: '2026-06-17T20:00:00Z' },
  { home: 'Ghana',   away: 'Panama',  date: '2026-06-18T03:00:00Z' },
  { home: 'England', away: 'Ghana',   date: '2026-06-23T21:00:00Z' },
  { home: 'Panama',  away: 'Croatia', date: '2026-06-24T11:00:00Z' },
  { home: 'Panama',  away: 'England', date: '2026-06-27T21:00:00Z' },
  { home: 'Croatia', away: 'Ghana',   date: '2026-06-27T21:00:00Z' },
];

// ─── 32 matchs phases à élimination directe ───────────────────────────────

const KNOCKOUT_MATCHES = [
  // ── Tour de 32 (16 matchs) ──────────────────────────────────────────────
  { home: '2e Groupe A',  away: '2e Groupe B',         date: '2026-06-28T16:00:00Z', round: 'R32' },
  { home: '1er Groupe C', away: '2e Groupe F',         date: '2026-06-28T20:00:00Z', round: 'R32' },
  { home: '1er Groupe E', away: '3e Groupes A/B/C/D',  date: '2026-06-29T16:00:00Z', round: 'R32' },
  { home: '1er Groupe F', away: '2e Groupe C',         date: '2026-06-29T20:00:00Z', round: 'R32' },
  { home: '2e Groupe E',  away: '2e Groupe I',         date: '2026-06-30T16:00:00Z', round: 'R32' },
  { home: '1er Groupe I', away: '3e Groupes C/D/F/G',  date: '2026-06-30T20:00:00Z', round: 'R32' },
  { home: '1er Groupe A', away: '3e Groupes C/E/F/H',  date: '2026-07-01T16:00:00Z', round: 'R32' },
  { home: '1er Groupe G', away: '3e Groupes A/E/H/I',  date: '2026-07-01T20:00:00Z', round: 'R32' },
  { home: '1er Groupe L', away: '3e Groupes E/H/I/J',  date: '2026-07-01T20:00:00Z', round: 'R32' },
  { home: '1er Groupe D', away: '3e Groupes B/E/F/I',  date: '2026-07-02T16:00:00Z', round: 'R32' },
  { home: '1er Groupe H', away: '2e Groupe J',         date: '2026-07-02T20:00:00Z', round: 'R32' },
  { home: '1er Groupe B', away: '3e Groupes E/F/G/J',  date: '2026-07-03T15:00:00Z', round: 'R32' },
  { home: '2e Groupe K',  away: '2e Groupe L',         date: '2026-07-03T16:00:00Z', round: 'R32' },
  { home: '2e Groupe D',  away: '2e Groupe G',         date: '2026-07-03T18:00:00Z', round: 'R32' },
  { home: '1er Groupe J', away: '2e Groupe H',         date: '2026-07-04T15:00:00Z', round: 'R32' },
  { home: '1er Groupe K', away: '3e Groupes D/E/I/J',  date: '2026-07-04T18:30:00Z', round: 'R32' },

  // ── Huitièmes de finale (8 matchs) ──────────────────────────────────────
  { home: 'Vainqueur S1', away: 'Vainqueur S2',  date: '2026-07-04T22:00:00Z', round: 'R16' },
  { home: 'Vainqueur S3', away: 'Vainqueur S4',  date: '2026-07-05T15:00:00Z', round: 'R16' },
  { home: 'Vainqueur S5', away: 'Vainqueur S6',  date: '2026-07-05T20:00:00Z', round: 'R16' },
  { home: 'Vainqueur S7', away: 'Vainqueur S8',  date: '2026-07-05T22:30:00Z', round: 'R16' },
  { home: 'Vainqueur S9', away: 'Vainqueur S10', date: '2026-07-06T15:00:00Z', round: 'R16' },
  { home: 'Vainqueur S11', away: 'Vainqueur S12', date: '2026-07-06T20:00:00Z', round: 'R16' },
  { home: 'Vainqueur S13', away: 'Vainqueur S14', date: '2026-07-07T15:00:00Z', round: 'R16' },
  { home: 'Vainqueur S15', away: 'Vainqueur S16', date: '2026-07-07T18:00:00Z', round: 'R16' },

  // ── Quarts de finale (4 matchs) ─────────────────────────────────────────
  { home: 'Vainqueur H1', away: 'Vainqueur H2', date: '2026-07-09T15:00:00Z', round: 'QF' },
  { home: 'Vainqueur H3', away: 'Vainqueur H4', date: '2026-07-10T18:00:00Z', round: 'QF' },
  { home: 'Vainqueur H5', away: 'Vainqueur H6', date: '2026-07-11T15:00:00Z', round: 'QF' },
  { home: 'Vainqueur H7', away: 'Vainqueur H8', date: '2026-07-12T17:00:00Z', round: 'QF' },

  // ── Demi-finales (2 matchs) ─────────────────────────────────────────────
  { home: 'Vainqueur QF1', away: 'Vainqueur QF2', date: '2026-07-14T18:00:00Z', round: 'SF' },
  { home: 'Vainqueur QF3', away: 'Vainqueur QF4', date: '2026-07-15T18:00:00Z', round: 'SF' },

  // ── Match 3e place (1 match) ────────────────────────────────────────────
  { home: 'Perdant SF1', away: 'Perdant SF2', date: '2026-07-18T21:00:00Z', round: '3RD' },

  // ── Finale (1 match) ────────────────────────────────────────────────────
  { home: 'Vainqueur SF1', away: 'Vainqueur SF2', date: '2026-07-19T19:00:00Z', round: 'FINAL' },
];

async function main() {
  console.log('🗑️  Suppression de tous les matchs existants...');
  const { error: deleteError } = await supabase
    .from('matches')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('❌ Erreur suppression:', deleteError.message);
    process.exit(1);
  }
  console.log('✅ Matchs supprimés.');

  // Insérer matchs de groupes
  console.log(`\n📥 Insertion des ${MATCHES.length} matchs de phase de groupes...`);
  const groupRows = MATCHES.map(m => ({
    team_home:  m.home,
    team_away:  m.away,
    match_date: m.date,
    status:     'UPCOMING',
    score_home: null,
    score_away: null,
  }));

  const { error: insertGroupError } = await supabase.from('matches').insert(groupRows);
  if (insertGroupError) {
    console.error('❌ Erreur insertion groupes:', insertGroupError.message);
    process.exit(1);
  }
  console.log(`✅ ${groupRows.length} matchs de groupes insérés.`);

  // Insérer matchs knockout
  console.log(`\n📥 Insertion des ${KNOCKOUT_MATCHES.length} matchs à élimination directe...`);
  const knockoutRows = KNOCKOUT_MATCHES.map(m => ({
    team_home:  m.home,
    team_away:  m.away,
    match_date: m.date,
    status:     'UPCOMING',
    score_home: null,
    score_away: null,
  }));

  const { error: insertKnockoutError } = await supabase.from('matches').insert(knockoutRows);
  if (insertKnockoutError) {
    console.error('❌ Erreur insertion knockout:', insertKnockoutError.message);
    process.exit(1);
  }
  console.log(`✅ ${knockoutRows.length} matchs knockout insérés.`);

  const total = groupRows.length + knockoutRows.length;
  console.log(`\n🎯 Base réinitialisée : ${total} matchs au total (${groupRows.length} groupes + ${knockoutRows.length} élimination directe)\n`);
}

main();

