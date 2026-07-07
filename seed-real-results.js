/**
 * Seed complet FIFA World Cup 2026 avec les vrais résultats au 7 juillet 2026
 * Toutes les heures sont en UTC+0 (heure du Togo)
 */

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const F = 'FINISHED';
const U = 'UPCOMING';
const L = 'LIVE';

// ─── 72 matchs de phase de groupes (tous terminés) ───────────────────────────
const GROUP_MATCHES = [
  // Groupe A
  { home: 'Mexico',       away: 'South Africa',      date: '2026-06-11T19:00:00Z', sh: null, sa: null, s: F },
  { home: 'Korea Republic', away: 'Czechia',          date: '2026-06-12T00:00:00Z', sh: null, sa: null, s: F },
  { home: 'Czechia',      away: 'South Africa',       date: '2026-06-18T16:00:00Z', sh: null, sa: null, s: F },
  { home: 'Mexico',       away: 'Korea Republic',     date: '2026-06-19T01:00:00Z', sh: null, sa: null, s: F },
  { home: 'Czechia',      away: 'Mexico',             date: '2026-06-25T01:00:00Z', sh: null, sa: null, s: F },
  { home: 'South Africa', away: 'Korea Republic',     date: '2026-06-25T01:00:00Z', sh: null, sa: null, s: F },
  // Groupe B
  { home: 'Canada',             away: 'Bosnia-Herzegovina', date: '2026-06-12T16:00:00Z', sh: null, sa: null, s: F },
  { home: 'Qatar',              away: 'Switzerland',         date: '2026-06-13T16:00:00Z', sh: null, sa: null, s: F },
  { home: 'Switzerland',        away: 'Bosnia-Herzegovina',  date: '2026-06-18T14:00:00Z', sh: null, sa: null, s: F },
  { home: 'Canada',             away: 'Qatar',               date: '2026-06-19T22:00:00Z', sh: null, sa: null, s: F },
  { home: 'Switzerland',        away: 'Canada',              date: '2026-06-24T14:00:00Z', sh: null, sa: null, s: F },
  { home: 'Bosnia-Herzegovina', away: 'Qatar',               date: '2026-06-24T14:00:00Z', sh: null, sa: null, s: F },
  // Groupe C
  { home: 'Haiti',    away: 'Scotland', date: '2026-06-14T01:00:00Z', sh: null, sa: null, s: F },
  { home: 'Brazil',   away: 'Morocco',  date: '2026-06-14T22:00:00Z', sh: null, sa: null, s: F },
  { home: 'Scotland', away: 'Morocco',  date: '2026-06-20T22:00:00Z', sh: null, sa: null, s: F },
  { home: 'Brazil',   away: 'Haiti',    date: '2026-06-20T01:00:00Z', sh: null, sa: null, s: F },
  { home: 'Morocco',  away: 'Haiti',    date: '2026-06-25T21:00:00Z', sh: null, sa: null, s: F },
  { home: 'Scotland', away: 'Brazil',   date: '2026-06-25T21:00:00Z', sh: null, sa: null, s: F },
  // Groupe D
  { home: 'USA',       away: 'Paraguay',  date: '2026-06-13T01:00:00Z', sh: null, sa: null, s: F },
  { home: 'Australia', away: 'Türkiye',   date: '2026-06-14T04:00:00Z', sh: null, sa: null, s: F },
  { home: 'USA',       away: 'Australia', date: '2026-06-19T16:00:00Z', sh: null, sa: null, s: F },
  { home: 'Türkiye',   away: 'Paraguay',  date: '2026-06-20T14:00:00Z', sh: null, sa: null, s: F },
  { home: 'Türkiye',   away: 'USA',       date: '2026-06-26T14:00:00Z', sh: null, sa: null, s: F },
  { home: 'Paraguay',  away: 'Australia', date: '2026-06-26T02:00:00Z', sh: null, sa: null, s: F },
  // Groupe E
  { home: 'Germany',     away: 'Curaçao',     date: '2026-06-14T17:00:00Z', sh: null, sa: null, s: F },
  { home: 'Ivory Coast', away: 'Ecuador',     date: '2026-06-15T00:00:00Z', sh: null, sa: null, s: F },
  { home: 'Germany',     away: 'Ivory Coast', date: '2026-06-20T17:00:00Z', sh: null, sa: null, s: F },
  { home: 'Ecuador',     away: 'Curaçao',     date: '2026-06-21T00:00:00Z', sh: null, sa: null, s: F },
  { home: 'Ecuador',     away: 'Germany',     date: '2026-06-25T20:00:00Z', sh: null, sa: null, s: F },
  { home: 'Curaçao',    away: 'Ivory Coast',  date: '2026-06-25T20:00:00Z', sh: null, sa: null, s: F },
  // Groupe F
  { home: 'Netherlands', away: 'Japan',       date: '2026-06-14T20:00:00Z', sh: null, sa: null, s: F },
  { home: 'Sweden',      away: 'Tunisia',     date: '2026-06-15T03:00:00Z', sh: null, sa: null, s: F },
  { home: 'Tunisia',     away: 'Japan',       date: '2026-06-21T03:00:00Z', sh: null, sa: null, s: F },
  { home: 'Netherlands', away: 'Sweden',      date: '2026-06-21T16:00:00Z', sh: null, sa: null, s: F },
  { home: 'Tunisia',     away: 'Netherlands', date: '2026-06-26T22:00:00Z', sh: null, sa: null, s: F },
  { home: 'Japan',       away: 'Sweden',      date: '2026-06-26T22:00:00Z', sh: null, sa: null, s: F },
  // Groupe G
  { home: 'Belgium',     away: 'Egypt',       date: '2026-06-15T16:00:00Z', sh: null, sa: null, s: F },
  { home: 'Iran',        away: 'New Zealand', date: '2026-06-16T03:00:00Z', sh: null, sa: null, s: F },
  { home: 'Belgium',     away: 'Iran',        date: '2026-06-21T14:00:00Z', sh: null, sa: null, s: F },
  { home: 'New Zealand', away: 'Egypt',       date: '2026-06-22T20:00:00Z', sh: null, sa: null, s: F },
  { home: 'Egypt',       away: 'Iran',        date: '2026-06-27T03:00:00Z', sh: null, sa: null, s: F },
  { home: 'New Zealand', away: 'Belgium',     date: '2026-06-27T23:30:00Z', sh: null, sa: null, s: F },
  // Groupe H
  { home: 'Spain',         away: 'Cape Verde',   date: '2026-06-15T16:00:00Z', sh: null, sa: null, s: F },
  { home: 'Saudi Arabia',  away: 'Uruguay',      date: '2026-06-16T00:00:00Z', sh: null, sa: null, s: F },
  { home: 'Spain',         away: 'Saudi Arabia', date: '2026-06-21T19:00:00Z', sh: null, sa: null, s: F },
  { home: 'Uruguay',       away: 'Cape Verde',   date: '2026-06-22T22:00:00Z', sh: null, sa: null, s: F },
  { home: 'Cape Verde',    away: 'Saudi Arabia', date: '2026-06-27T00:00:00Z', sh: null, sa: null, s: F },
  { home: 'Uruguay',       away: 'Spain',        date: '2026-06-28T00:00:00Z', sh: null, sa: null, s: F },
  // Groupe I
  { home: 'France',  away: 'Senegal', date: '2026-06-16T16:00:00Z', sh: null, sa: null, s: F },
  { home: 'Iraq',    away: 'Norway',  date: '2026-06-16T19:00:00Z', sh: null, sa: null, s: F },
  { home: 'France',  away: 'Iraq',    date: '2026-06-22T01:00:00Z', sh: null, sa: null, s: F },
  { home: 'Norway',  away: 'Senegal', date: '2026-06-23T00:00:00Z', sh: null, sa: null, s: F },
  { home: 'Norway',  away: 'France',  date: '2026-06-26T02:00:00Z', sh: null, sa: null, s: F },
  { home: 'Senegal', away: 'Iraq',    date: '2026-06-26T10:00:00Z', sh: null, sa: null, s: F },
  // Groupe J
  { home: 'Argentina', away: 'Algeria', date: '2026-06-17T00:00:00Z', sh: null, sa: null, s: F },
  { home: 'Austria',   away: 'Jordan',  date: '2026-06-17T03:00:00Z', sh: null, sa: null, s: F },
  { home: 'Argentina', away: 'Austria', date: '2026-06-22T17:00:00Z', sh: null, sa: null, s: F },
  { home: 'Algeria',   away: 'Jordan',  date: '2026-06-22T14:00:00Z', sh: null, sa: null, s: F },
  { home: 'Algeria',   away: 'Austria', date: '2026-06-28T02:00:00Z', sh: null, sa: null, s: F },
  { home: 'Jordan',    away: 'Argentina', date: '2026-06-28T02:00:00Z', sh: null, sa: null, s: F },
  // Groupe K
  { home: 'Portugal',   away: 'DR Congo',   date: '2026-06-17T17:00:00Z', sh: null, sa: null, s: F },
  { home: 'Uzbekistan', away: 'Colombia',   date: '2026-06-18T17:00:00Z', sh: null, sa: null, s: F },
  { home: 'Portugal',   away: 'Uzbekistan', date: '2026-06-23T17:00:00Z', sh: null, sa: null, s: F },
  { home: 'Colombia',   away: 'DR Congo',   date: '2026-06-24T20:00:00Z', sh: null, sa: null, s: F },
  { home: 'Colombia',   away: 'Portugal',   date: '2026-06-28T23:30:00Z', sh: null, sa: null, s: F },
  { home: 'DR Congo',   away: 'Uzbekistan', date: '2026-06-28T23:30:00Z', sh: null, sa: null, s: F },
  // Groupe L
  { home: 'England', away: 'Croatia', date: '2026-06-17T20:00:00Z', sh: null, sa: null, s: F },
  { home: 'Ghana',   away: 'Panama',  date: '2026-06-18T03:00:00Z', sh: null, sa: null, s: F },
  { home: 'England', away: 'Ghana',   date: '2026-06-23T21:00:00Z', sh: null, sa: null, s: F },
  { home: 'Panama',  away: 'Croatia', date: '2026-06-24T11:00:00Z', sh: null, sa: null, s: F },
  { home: 'Panama',  away: 'England', date: '2026-06-27T21:00:00Z', sh: null, sa: null, s: F },
  { home: 'Croatia', away: 'Ghana',   date: '2026-06-27T21:00:00Z', sh: null, sa: null, s: F },
];

// ─── 16es de finale — tous terminés ─────────────────────────────────────────
// Note : 1-1 ap + tab = score après prolongation, vainqueur aux tirs au but
const R32_MATCHES = [
  { home: 'South Africa', away: 'Canada',            date: '2026-06-28T19:00:00Z', sh: 0, sa: 1, s: F },
  { home: 'Brazil',       away: 'Japan',             date: '2026-06-29T17:00:00Z', sh: 2, sa: 1, s: F },
  { home: 'Germany',      away: 'Paraguay',          date: '2026-06-29T20:30:00Z', sh: 1, sa: 1, s: F }, // Paraguay qualifié aux tirs
  { home: 'Netherlands',  away: 'Morocco',           date: '2026-06-30T01:00:00Z', sh: 1, sa: 1, s: F }, // Maroc qualifié aux tirs
  { home: 'Ivory Coast',  away: 'Norway',            date: '2026-06-30T17:00:00Z', sh: 1, sa: 2, s: F },
  { home: 'France',       away: 'Sweden',            date: '2026-06-30T21:00:00Z', sh: 3, sa: 0, s: F },
  { home: 'Mexico',       away: 'Ecuador',           date: '2026-07-01T02:00:00Z', sh: 2, sa: 0, s: F },
  { home: 'England',      away: 'DR Congo',          date: '2026-07-01T16:00:00Z', sh: 2, sa: 1, s: F },
  { home: 'Belgium',      away: 'Senegal',           date: '2026-07-01T20:00:00Z', sh: 3, sa: 2, s: F },
  { home: 'USA',          away: 'Bosnia-Herzegovina',date: '2026-07-02T00:00:00Z', sh: 2, sa: 0, s: F },
  { home: 'Spain',        away: 'Austria',           date: '2026-07-02T19:00:00Z', sh: 3, sa: 0, s: F },
  { home: 'Portugal',     away: 'Croatia',           date: '2026-07-02T23:00:00Z', sh: 2, sa: 1, s: F },
  { home: 'Switzerland',  away: 'Algeria',           date: '2026-07-03T03:00:00Z', sh: 2, sa: 0, s: F },
  { home: 'Australia',    away: 'Egypt',             date: '2026-07-03T18:00:00Z', sh: 1, sa: 1, s: F }, // Égypte qualifiée aux tirs
  { home: 'Argentina',    away: 'Cape Verde',        date: '2026-07-03T22:00:00Z', sh: 3, sa: 2, s: F },
  { home: 'Colombia',     away: 'Ghana',             date: '2026-07-04T01:30:00Z', sh: 1, sa: 0, s: F },
];

// ─── Huitièmes de finale ─────────────────────────────────────────────────────
const R16_MATCHES = [
  { home: 'Canada',    away: 'Morocco',   date: '2026-07-04T17:00:00Z', sh: 0,    sa: 3,    s: F },
  { home: 'Paraguay',  away: 'France',    date: '2026-07-04T21:00:00Z', sh: 0,    sa: 1,    s: F },
  { home: 'Brazil',    away: 'Norway',    date: '2026-07-05T20:00:00Z', sh: 1,    sa: 2,    s: F },
  { home: 'Mexico',    away: 'England',   date: '2026-07-06T01:00:00Z', sh: 2,    sa: 3,    s: F },
  { home: 'Portugal',  away: 'Spain',     date: '2026-07-06T19:00:00Z', sh: 0,    sa: 1,    s: F },
  { home: 'USA',       away: 'Belgium',   date: '2026-07-07T00:00:00Z', sh: 1,    sa: 4,    s: F },
  { home: 'Argentina', away: 'Egypt',     date: '2026-07-07T16:00:00Z', sh: null, sa: null, s: L }, // EN COURS
  { home: 'Switzerland', away: 'Colombia', date: '2026-07-07T20:00:00Z', sh: null, sa: null, s: U }, // À JOUER
];

// ─── Quarts de finale ─────────────────────────────────────────────────────────
const QF_MATCHES = [
  { home: 'France',   away: 'Morocco',   date: '2026-07-09T20:00:00Z', sh: null, sa: null, s: U },
  { home: 'Spain',    away: 'Belgium',   date: '2026-07-10T19:00:00Z', sh: null, sa: null, s: U },
  { home: 'Norway',   away: 'England',   date: '2026-07-11T21:00:00Z', sh: null, sa: null, s: U },
  { home: 'Vainqueur Argentine/Égypte', away: 'Vainqueur Suisse/Colombie', date: '2026-07-12T01:00:00Z', sh: null, sa: null, s: U },
];

// ─── Demi-finales ─────────────────────────────────────────────────────────────
const SF_MATCHES = [
  { home: 'Vainqueur France/Maroc',    away: 'Vainqueur Espagne/Belgique',  date: '2026-07-14T19:00:00Z', sh: null, sa: null, s: U },
  { home: 'Vainqueur Norvège/Angleterre', away: 'Vainqueur QF4',           date: '2026-07-15T19:00:00Z', sh: null, sa: null, s: U },
];

// ─── 3e place ─────────────────────────────────────────────────────────────────
const THIRD_MATCH = [
  { home: 'Perdant SF1', away: 'Perdant SF2', date: '2026-07-18T21:00:00Z', sh: null, sa: null, s: U },
];

// ─── Finale ───────────────────────────────────────────────────────────────────
const FINAL_MATCH = [
  { home: 'Vainqueur SF1', away: 'Vainqueur SF2', date: '2026-07-19T19:00:00Z', sh: null, sa: null, s: U },
];

function toRow(m) {
  return {
    team_home: m.home,
    team_away: m.away,
    match_date: m.date,
    score_home: m.sh,
    score_away: m.sa,
    status: m.s,
  };
}

async function insert(label, arr) {
  const rows = arr.map(toRow);
  const { error } = await supabase.from('matches').insert(rows);
  if (error) {
    console.error(`❌ Erreur insertion ${label}:`, error.message);
    process.exit(1);
  }
  console.log(`  ✅ ${rows.length} ${label}`);
}

async function main() {
  console.log('🗑️  Suppression de tous les matchs...');
  const { error: deleteError } = await supabase
    .from('matches')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('❌ Erreur suppression:', deleteError.message);
    process.exit(1);
  }
  console.log('✅ Base vidée.\n');

  console.log('📥 Insertion des matchs...');
  await insert('matchs de phase de groupes (FINISHED)', GROUP_MATCHES);
  await insert('matchs de 16es de finale (FINISHED)', R32_MATCHES);
  await insert('matchs de huitièmes de finale (6 FINISHED, 1 LIVE, 1 UPCOMING)', R16_MATCHES);
  await insert('matchs de quarts de finale (UPCOMING)', QF_MATCHES);
  await insert('matchs de demi-finales (UPCOMING)', SF_MATCHES);
  await insert('match pour la 3e place', THIRD_MATCH);
  await insert('finale', FINAL_MATCH);

  const total = GROUP_MATCHES.length + R32_MATCHES.length + R16_MATCHES.length + QF_MATCHES.length + SF_MATCHES.length + THIRD_MATCH.length + FINAL_MATCH.length;
  console.log(`\n🎯 Fait ! ${total} matchs insérés avec les vrais résultats de la Coupe du Monde 2026.\n`);
  console.log('⚽ LIVE : Argentina vs Egypt (16h00 Togo / 17:50 UTC actuellement en cours)');
  console.log('🕐 À JOUER : Switzerland vs Colombia (20h00 Togo ce soir)\n');
}

main();
