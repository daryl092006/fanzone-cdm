/**
 * ─── Script d'import complet : FIFA World Cup 2026 ───────────────────────────
 * 104 matchs officiels (Phase de groupes + Phases à élimination directe)
 * 48 équipes (groupes A à L)
 *
 * Usage: node seed-worldcup-2026.js
 *
 * Pré-requis :
 *   npm install @supabase/supabase-js
 *   Variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env
 */

const { createClient } = require('@supabase/supabase-js');

// Credentiels lus depuis .env (injectés directement pour éviter dotenv)
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── 1. Équipes par groupe ────────────────────────────────────────────────────
// Source : calendrier officiel FIFA World Cup 2026

const GROUPS = {
  A: [
    { name: 'Mexico',       flag: '🇲🇽' },
    { name: 'South Africa', flag: '🇿🇦' },
    { name: 'Korea Republic', flag: '🇰🇷' },
    { name: 'Czechia',      flag: '🇨🇿' },
  ],
  B: [
    { name: 'Canada',       flag: '🇨🇦' },
    { name: 'Switzerland',  flag: '🇨🇭' },
    { name: 'Qatar',        flag: '🇶🇦' },
    { name: 'Bosnia-Herzegovina', flag: '🇧🇦' },
  ],
  C: [
    { name: 'Brazil',       flag: '🇧🇷' },
    { name: 'Morocco',      flag: '🇲🇦' },
    { name: 'Scotland',     flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { name: 'Haiti',        flag: '🇭🇹' },
  ],
  D: [
    { name: 'USA',          flag: '🇺🇸' },
    { name: 'Paraguay',     flag: '🇵🇾' },
    { name: 'Australia',    flag: '🇦🇺' },
    { name: 'Türkiye',      flag: '🇹🇷' },
  ],
  E: [
    { name: 'Germany',      flag: '🇩🇪' },
    { name: 'Ecuador',      flag: '🇪🇨' },
    { name: 'Ivory Coast',  flag: '🇨🇮' },
    { name: 'Curaçao',      flag: '🇨🇼' },
  ],
  F: [
    { name: 'Netherlands',  flag: '🇳🇱' },
    { name: 'Japan',        flag: '🇯🇵' },
    { name: 'Tunisia',      flag: '🇹🇳' },
    { name: 'Sweden',       flag: '🇸🇪' },
  ],
  G: [
    { name: 'Belgium',      flag: '🇧🇪' },
    { name: 'Iran',         flag: '🇮🇷' },
    { name: 'Egypt',        flag: '🇪🇬' },
    { name: 'New Zealand',  flag: '🇳🇿' },
  ],
  H: [
    { name: 'Spain',        flag: '🇪🇸' },
    { name: 'Uruguay',      flag: '🇺🇾' },
    { name: 'Saudi Arabia', flag: '🇸🇦' },
    { name: 'Cape Verde',   flag: '🇨🇻' },
  ],
  I: [
    { name: 'France',       flag: '🇫🇷' },
    { name: 'Senegal',      flag: '🇸🇳' },
    { name: 'Norway',       flag: '🇳🇴' },
    { name: 'Iraq',         flag: '🇮🇶' },
  ],
  J: [
    { name: 'Argentina',    flag: '🇦🇷' },
    { name: 'Austria',      flag: '🇦🇹' },
    { name: 'Algeria',      flag: '🇩🇿' },
    { name: 'Jordan',       flag: '🇯🇴' },
  ],
  K: [
    { name: 'Portugal',     flag: '🇵🇹' },
    { name: 'Colombia',     flag: '🇨🇴' },
    { name: 'Uzbekistan',   flag: '🇺🇿' },
    { name: 'DR Congo',     flag: '🇨🇩' },
  ],
  L: [
    { name: 'England',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Croatia',      flag: '🇭🇷' },
    { name: 'Panama',       flag: '🇵🇦' },
    { name: 'Ghana',        flag: '🇬🇭' },
  ],
};

// ─── 2. Matchs de phase de groupes ───────────────────────────────────────────
// Chaque groupe joue 6 matchs (combinaisons de 4 équipes, 3 journées)
// Horaires en GMT — adaptés selon le calendrier officiel

const GROUP_MATCHES = [
  // ── GROUPE A ──────────────────────────────────────────────────────────────
  // J1
  { team_home: 'Mexico',       team_away: 'South Africa',  match_date: '2026-06-11T19:00:00Z', group_label: 'A', round: 1 },
  { team_home: 'Korea Republic', team_away: 'Czechia',     match_date: '2026-06-11T22:00:00Z', group_label: 'A', round: 1 },
  // J2
  { team_home: 'Mexico',       team_away: 'Korea Republic', match_date: '2026-06-15T19:00:00Z', group_label: 'A', round: 2 },
  { team_home: 'South Africa', team_away: 'Czechia',       match_date: '2026-06-15T22:00:00Z', group_label: 'A', round: 2 },
  // J3
  { team_home: 'Czechia',      team_away: 'Mexico',        match_date: '2026-06-19T18:00:00Z', group_label: 'A', round: 3 },
  { team_home: 'South Africa', team_away: 'Korea Republic', match_date: '2026-06-19T18:00:00Z', group_label: 'A', round: 3 },

  // ── GROUPE B ──────────────────────────────────────────────────────────────
  { team_home: 'Canada',       team_away: 'Switzerland',   match_date: '2026-06-12T19:00:00Z', group_label: 'B', round: 1 },
  { team_home: 'Qatar',        team_away: 'Bosnia-Herzegovina', match_date: '2026-06-12T22:00:00Z', group_label: 'B', round: 1 },
  { team_home: 'Canada',       team_away: 'Qatar',         match_date: '2026-06-16T19:00:00Z', group_label: 'B', round: 2 },
  { team_home: 'Switzerland',  team_away: 'Bosnia-Herzegovina', match_date: '2026-06-16T22:00:00Z', group_label: 'B', round: 2 },
  { team_home: 'Bosnia-Herzegovina', team_away: 'Canada',  match_date: '2026-06-20T18:00:00Z', group_label: 'B', round: 3 },
  { team_home: 'Switzerland',  team_away: 'Qatar',         match_date: '2026-06-20T18:00:00Z', group_label: 'B', round: 3 },

  // ── GROUPE C ──────────────────────────────────────────────────────────────
  { team_home: 'Brazil',       team_away: 'Morocco',       match_date: '2026-06-13T16:00:00Z', group_label: 'C', round: 1 },
  { team_home: 'Scotland',     team_away: 'Haiti',         match_date: '2026-06-13T19:00:00Z', group_label: 'C', round: 1 },
  { team_home: 'Brazil',       team_away: 'Scotland',      match_date: '2026-06-17T19:00:00Z', group_label: 'C', round: 2 },
  { team_home: 'Morocco',      team_away: 'Haiti',         match_date: '2026-06-17T22:00:00Z', group_label: 'C', round: 2 },
  { team_home: 'Haiti',        team_away: 'Brazil',        match_date: '2026-06-21T18:00:00Z', group_label: 'C', round: 3 },
  { team_home: 'Scotland',     team_away: 'Morocco',       match_date: '2026-06-21T18:00:00Z', group_label: 'C', round: 3 },

  // ── GROUPE D ──────────────────────────────────────────────────────────────
  { team_home: 'USA',          team_away: 'Paraguay',      match_date: '2026-06-12T16:00:00Z', group_label: 'D', round: 1 },
  { team_home: 'Australia',    team_away: 'Türkiye',       match_date: '2026-06-13T22:00:00Z', group_label: 'D', round: 1 },
  { team_home: 'USA',          team_away: 'Australia',     match_date: '2026-06-16T16:00:00Z', group_label: 'D', round: 2 },
  { team_home: 'Paraguay',     team_away: 'Türkiye',       match_date: '2026-06-17T16:00:00Z', group_label: 'D', round: 2 },
  { team_home: 'Türkiye',      team_away: 'USA',           match_date: '2026-06-21T22:00:00Z', group_label: 'D', round: 3 },
  { team_home: 'Australia',    team_away: 'Paraguay',      match_date: '2026-06-21T22:00:00Z', group_label: 'D', round: 3 },

  // ── GROUPE E ──────────────────────────────────────────────────────────────
  { team_home: 'Germany',      team_away: 'Ecuador',       match_date: '2026-06-14T19:00:00Z', group_label: 'E', round: 1 },
  { team_home: 'Ivory Coast',  team_away: 'Curaçao',       match_date: '2026-06-14T22:00:00Z', group_label: 'E', round: 1 },
  { team_home: 'Germany',      team_away: 'Ivory Coast',   match_date: '2026-06-18T19:00:00Z', group_label: 'E', round: 2 },
  { team_home: 'Ecuador',      team_away: 'Curaçao',       match_date: '2026-06-18T22:00:00Z', group_label: 'E', round: 2 },
  { team_home: 'Ecuador',      team_away: 'Germany',       match_date: '2026-06-22T18:00:00Z', group_label: 'E', round: 3 },
  { team_home: 'Curaçao',      team_away: 'Ivory Coast',   match_date: '2026-06-22T18:00:00Z', group_label: 'E', round: 3 },

  // ── GROUPE F ──────────────────────────────────────────────────────────────
  { team_home: 'Netherlands',  team_away: 'Japan',         match_date: '2026-06-14T16:00:00Z', group_label: 'F', round: 1 },
  { team_home: 'Tunisia',      team_away: 'Sweden',        match_date: '2026-06-14T13:00:00Z', group_label: 'F', round: 1 },
  { team_home: 'Netherlands',  team_away: 'Tunisia',       match_date: '2026-06-18T16:00:00Z', group_label: 'F', round: 2 },
  { team_home: 'Japan',        team_away: 'Sweden',        match_date: '2026-06-19T19:00:00Z', group_label: 'F', round: 2 },
  { team_home: 'Sweden',       team_away: 'Netherlands',   match_date: '2026-06-23T18:00:00Z', group_label: 'F', round: 3 },
  { team_home: 'Tunisia',      team_away: 'Japan',         match_date: '2026-06-23T18:00:00Z', group_label: 'F', round: 3 },

  // ── GROUPE G ──────────────────────────────────────────────────────────────
  { team_home: 'Belgium',      team_away: 'Iran',          match_date: '2026-06-15T16:00:00Z', group_label: 'G', round: 1 },
  { team_home: 'Egypt',        team_away: 'New Zealand',   match_date: '2026-06-15T13:00:00Z', group_label: 'G', round: 1 },
  { team_home: 'Belgium',      team_away: 'Egypt',         match_date: '2026-06-19T16:00:00Z', group_label: 'G', round: 2 },
  { team_home: 'Iran',         team_away: 'New Zealand',   match_date: '2026-06-19T22:00:00Z', group_label: 'G', round: 2 },
  { team_home: 'New Zealand',  team_away: 'Belgium',       match_date: '2026-06-23T22:00:00Z', group_label: 'G', round: 3 },
  { team_home: 'Egypt',        team_away: 'Iran',          match_date: '2026-06-23T22:00:00Z', group_label: 'G', round: 3 },

  // ── GROUPE H ──────────────────────────────────────────────────────────────
  { team_home: 'Spain',        team_away: 'Uruguay',       match_date: '2026-06-16T13:00:00Z', group_label: 'H', round: 1 },
  { team_home: 'Saudi Arabia', team_away: 'Cape Verde',    match_date: '2026-06-16T22:00:00Z', group_label: 'H', round: 1 },
  { team_home: 'Spain',        team_away: 'Saudi Arabia',  match_date: '2026-06-20T22:00:00Z', group_label: 'H', round: 2 },
  { team_home: 'Uruguay',      team_away: 'Cape Verde',    match_date: '2026-06-21T16:00:00Z', group_label: 'H', round: 2 },
  { team_home: 'Cape Verde',   team_away: 'Spain',         match_date: '2026-06-25T18:00:00Z', group_label: 'H', round: 3 },
  { team_home: 'Uruguay',      team_away: 'Saudi Arabia',  match_date: '2026-06-25T18:00:00Z', group_label: 'H', round: 3 },

  // ── GROUPE I ──────────────────────────────────────────────────────────────
  { team_home: 'France',       team_away: 'Senegal',       match_date: '2026-06-17T13:00:00Z', group_label: 'I', round: 1 },
  { team_home: 'Norway',       team_away: 'Iraq',          match_date: '2026-06-18T13:00:00Z', group_label: 'I', round: 1 },
  { team_home: 'France',       team_away: 'Norway',        match_date: '2026-06-21T19:00:00Z', group_label: 'I', round: 2 },
  { team_home: 'Senegal',      team_away: 'Iraq',          match_date: '2026-06-22T19:00:00Z', group_label: 'I', round: 2 },
  { team_home: 'Iraq',         team_away: 'France',        match_date: '2026-06-25T22:00:00Z', group_label: 'I', round: 3 },
  { team_home: 'Senegal',      team_away: 'Norway',        match_date: '2026-06-25T22:00:00Z', group_label: 'I', round: 3 },

  // ── GROUPE J ──────────────────────────────────────────────────────────────
  { team_home: 'Argentina',    team_away: 'Austria',       match_date: '2026-06-17T22:00:00Z', group_label: 'J', round: 1 },
  { team_home: 'Algeria',      team_away: 'Jordan',        match_date: '2026-06-18T16:00:00Z', group_label: 'J', round: 1 },
  { team_home: 'Argentina',    team_away: 'Algeria',       match_date: '2026-06-22T16:00:00Z', group_label: 'J', round: 2 },
  { team_home: 'Austria',      team_away: 'Jordan',        match_date: '2026-06-22T13:00:00Z', group_label: 'J', round: 2 },
  { team_home: 'Jordan',       team_away: 'Argentina',     match_date: '2026-06-26T18:00:00Z', group_label: 'J', round: 3 },
  { team_home: 'Austria',      team_away: 'Algeria',       match_date: '2026-06-26T18:00:00Z', group_label: 'J', round: 3 },

  // ── GROUPE K ──────────────────────────────────────────────────────────────
  { team_home: 'Portugal',     team_away: 'Colombia',      match_date: '2026-06-20T13:00:00Z', group_label: 'K', round: 1 },
  { team_home: 'Uzbekistan',   team_away: 'DR Congo',      match_date: '2026-06-20T16:00:00Z', group_label: 'K', round: 1 },
  { team_home: 'Portugal',     team_away: 'Uzbekistan',    match_date: '2026-06-24T19:00:00Z', group_label: 'K', round: 2 },
  { team_home: 'Colombia',     team_away: 'DR Congo',      match_date: '2026-06-24T22:00:00Z', group_label: 'K', round: 2 },
  { team_home: 'DR Congo',     team_away: 'Portugal',      match_date: '2026-06-28T18:00:00Z', group_label: 'K', round: 3 },
  { team_home: 'Colombia',     team_away: 'Uzbekistan',    match_date: '2026-06-28T18:00:00Z', group_label: 'K', round: 3 },

  // ── GROUPE L ──────────────────────────────────────────────────────────────
  { team_home: 'England',      team_away: 'Croatia',       match_date: '2026-06-20T19:00:00Z', group_label: 'L', round: 1 },
  { team_home: 'Panama',       team_away: 'Ghana',         match_date: '2026-06-21T13:00:00Z', group_label: 'L', round: 1 },
  { team_home: 'England',      team_away: 'Panama',        match_date: '2026-06-24T13:00:00Z', group_label: 'L', round: 2 },
  { team_home: 'Croatia',      team_away: 'Ghana',         match_date: '2026-06-24T16:00:00Z', group_label: 'L', round: 2 },
  { team_home: 'Ghana',        team_away: 'England',       match_date: '2026-06-28T22:00:00Z', group_label: 'L', round: 3 },
  { team_home: 'Croatia',      team_away: 'Panama',        match_date: '2026-06-28T22:00:00Z', group_label: 'L', round: 3 },
];

// ─── 3. Matchs à élimination directe ─────────────────────────────────────────
// Tour de 32 (R32), huitièmes (R16), quarts (QF), demies (SF), finale (F)
// team_home et team_away = libellés génériques jusqu'à la qualification

const KNOCKOUT_MATCHES = [
  // ──────────────────────────────────────────────────────────────────────────
  //  TOUR DE 32   (32 matchs, 29 juin – 2 juillet 2026)
  // ──────────────────────────────────────────────────────────────────────────
  { team_home: '1er Gr. A', team_away: '3e gr. E/F/G/U',  match_date: '2026-07-03T19:00:00Z', round_label: 'Tour de 32', match_number: 'R32-01' },
  { team_home: '2e gr. D',  team_away: '2e gr. G',         match_date: '2026-07-03T22:00:00Z', round_label: 'Tour de 32', match_number: 'R32-02' },
  { team_home: '1er gr. C', team_away: '3e gr. D/E/F',     match_date: '2026-07-04T16:00:00Z', round_label: 'Tour de 32', match_number: 'R32-03' },
  { team_home: '1er gr. B', team_away: '3e gr. A/B/C/D',   match_date: '2026-07-04T19:00:00Z', round_label: 'Tour de 32', match_number: 'R32-04' },
  { team_home: '1er gr. F', team_away: '2e gr. I',         match_date: '2026-07-04T22:00:00Z', round_label: 'Tour de 32', match_number: 'R32-05' },
  { team_home: '1er gr. E', team_away: '2e gr. H',         match_date: '2026-07-05T16:00:00Z', round_label: 'Tour de 32', match_number: 'R32-06' },
  { team_home: '1er gr. D', team_away: '3e gr. B/H/I/J/K', match_date: '2026-07-05T19:00:00Z', round_label: 'Tour de 32', match_number: 'R32-07' },
  { team_home: '2e gr. A',  team_away: '2e gr. B',         match_date: '2026-07-05T22:00:00Z', round_label: 'Tour de 32', match_number: 'R32-08' },
  { team_home: '1er gr. H', team_away: '2e gr. J',         match_date: '2026-07-06T16:00:00Z', round_label: 'Tour de 32', match_number: 'R32-09' },
  { team_home: '1er gr. G', team_away: '2e gr. F',         match_date: '2026-07-06T19:00:00Z', round_label: 'Tour de 32', match_number: 'R32-10' },
  { team_home: '2e gr. C',  team_away: '3e gr. G/H/J/K/L', match_date: '2026-07-06T22:00:00Z', round_label: 'Tour de 32', match_number: 'R32-11' },
  { team_home: '1er gr. I', team_away: '2e gr. L',         match_date: '2026-07-07T16:00:00Z', round_label: 'Tour de 32', match_number: 'R32-12' },
  { team_home: '1er gr. K', team_away: '3e gr. A/B/C/D',   match_date: '2026-07-07T19:00:00Z', round_label: 'Tour de 32', match_number: 'R32-13' },
  { team_home: '2e gr. E',  team_away: '2e gr. K',         match_date: '2026-07-07T22:00:00Z', round_label: 'Tour de 32', match_number: 'R32-14' },
  { team_home: '1er gr. J', team_away: '2e gr. C',         match_date: '2026-07-08T16:00:00Z', round_label: 'Tour de 32', match_number: 'R32-15' },
  { team_home: '1er gr. L', team_away: '3e gr. I/J/K/L',   match_date: '2026-07-08T19:00:00Z', round_label: 'Tour de 32', match_number: 'R32-16' },

  // ──────────────────────────────────────────────────────────────────────────
  //  HUITIÈMES DE FINALE  (16 matchs, 5–8 juillet 2026)
  // ──────────────────────────────────────────────────────────────────────────
  { team_home: 'Vq. S1',  team_away: 'Vq. S2',   match_date: '2026-07-09T19:00:00Z', round_label: 'Huitièmes de finale', match_number: 'R16-01' },
  { team_home: 'Vq. S3',  team_away: 'Vq. S4',   match_date: '2026-07-09T22:00:00Z', round_label: 'Huitièmes de finale', match_number: 'R16-02' },
  { team_home: 'Vq. S5',  team_away: 'Vq. S6',   match_date: '2026-07-10T19:00:00Z', round_label: 'Huitièmes de finale', match_number: 'R16-03' },
  { team_home: 'Vq. S7',  team_away: 'Vq. S8',   match_date: '2026-07-10T22:00:00Z', round_label: 'Huitièmes de finale', match_number: 'R16-04' },
  { team_home: 'Vq. S9',  team_away: 'Vq. S10',  match_date: '2026-07-11T19:00:00Z', round_label: 'Huitièmes de finale', match_number: 'R16-05' },
  { team_home: 'Vq. S11', team_away: 'Vq. S12',  match_date: '2026-07-11T22:00:00Z', round_label: 'Huitièmes de finale', match_number: 'R16-06' },
  { team_home: 'Vq. S13', team_away: 'Vq. S14',  match_date: '2026-07-12T19:00:00Z', round_label: 'Huitièmes de finale', match_number: 'R16-07' },
  { team_home: 'Vq. S15', team_away: 'Vq. S16',  match_date: '2026-07-12T22:00:00Z', round_label: 'Huitièmes de finale', match_number: 'R16-08' },

  // ──────────────────────────────────────────────────────────────────────────
  //  QUARTS DE FINALE  (8 matchs, 9–10 juillet 2026)
  // ──────────────────────────────────────────────────────────────────────────
  { team_home: 'Vq. B3',  team_away: 'Vq. B4',   match_date: '2026-07-13T20:00:00Z', round_label: 'Quarts de finale', match_number: 'QF-01' },
  { team_home: 'Vq. B1',  team_away: 'Vq. B2',   match_date: '2026-07-14T20:00:00Z', round_label: 'Quarts de finale', match_number: 'QF-02' },
  { team_home: 'Vq. B5',  team_away: 'Vq. B6',   match_date: '2026-07-15T20:00:00Z', round_label: 'Quarts de finale', match_number: 'QF-03' },
  { team_home: 'Vq. B7',  team_away: 'Vq. B8',   match_date: '2026-07-16T20:00:00Z', round_label: 'Quarts de finale', match_number: 'QF-04' },

  // ──────────────────────────────────────────────────────────────────────────
  //  DEMI-FINALES  (4 matchs, 13–14 juillet 2026)
  // ──────────────────────────────────────────────────────────────────────────
  { team_home: 'Vq. Q1',  team_away: 'Vq. Q2',   match_date: '2026-07-18T20:00:00Z', round_label: 'Demi-finales', match_number: 'SF-01' },
  { team_home: 'Vq. Q3',  team_away: 'Vq. Q4',   match_date: '2026-07-19T20:00:00Z', round_label: 'Demi-finales', match_number: 'SF-02' },

  // ──────────────────────────────────────────────────────────────────────────
  //  MATCH POUR LA 3e PLACE  (1 match, 18 juillet 2026)
  // ──────────────────────────────────────────────────────────────────────────
  { team_home: 'Perd. D1', team_away: 'Perd. D2', match_date: '2026-07-18T17:00:00Z', round_label: 'Match pour la 3e place', match_number: '3RD-01' },

  // ──────────────────────────────────────────────────────────────────────────
  //  FINALE  (1 match, 19 juillet 2026)
  // ──────────────────────────────────────────────────────────────────────────
  { team_home: 'Vq. D1',  team_away: 'Vq. D2',   match_date: '2026-07-19T20:00:00Z', round_label: 'Finale', match_number: 'FINAL' },
];

// ─── Fonctions d'import ───────────────────────────────────────────────────────

async function seedTeams() {
  console.log('\n📋  Import des équipes…');

  const rows = [];
  for (const [letter, teams] of Object.entries(GROUPS)) {
    for (const t of teams) {
      rows.push({ name: t.name, flag: t.flag, group_letter: letter });
    }
  }

  const { error } = await supabase
    .from('teams')
    .upsert(rows, { onConflict: 'name' });

  if (error) {
    console.error('   ❌  Erreur teams :', error.message);
    throw error;
  }
  console.log(`   ✅  ${rows.length} équipes insérées / mises à jour`);
}

async function seedGroupMatches() {
  console.log('\n⚽  Import des matchs de phase de groupes (72 matchs)…');

  // Effacer les matchs de groupes existants
  const { error: delError } = await supabase
    .from('matches')
    .delete()
    .like('team_home', '%')
    .not('team_home', 'like', 'Vq.%')
    .not('team_home', 'like', '1er%')
    .not('team_home', 'like', '2e%')
    .not('team_home', 'like', '3e%')
    .not('team_home', 'like', 'Perd.%');

  if (delError) {
    console.warn('   ⚠️   Nettoyage partiel :', delError.message);
  }

  // Préparer les lignes
  const rows = GROUP_MATCHES.map(m => ({
    team_home:  m.team_home,
    team_away:  m.team_away,
    match_date: m.match_date,
    status:     'UPCOMING',
    score_home: null,
    score_away: null,
  }));

  // Insertion par lots de 20
  const BATCH = 20;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('matches').insert(batch);
    if (error) {
      console.error(`   ❌  Erreur lot ${i / BATCH + 1} :`, error.message);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`\r   ✅  ${inserted}/${rows.length} matchs…`);
  }
  console.log(`\n   ✅  ${inserted} matchs de groupes insérés`);
}

async function seedKnockoutMatches() {
  console.log('\n🏆  Import des matchs à élimination directe (32 matchs)…');

  // Supprimer les anciens matchs KO
  const { error: delError } = await supabase
    .from('matches')
    .delete()
    .or("team_home.like.Vq.%,team_home.like.1er%,team_home.like.2e%,team_home.like.3e%,team_home.like.Perd.%");

  if (delError) {
    console.warn('   ⚠️   Nettoyage KO partiel :', delError.message);
  }

  const rows = KNOCKOUT_MATCHES.map(m => ({
    team_home:  m.team_home,
    team_away:  m.team_away,
    match_date: m.match_date,
    status:     'UPCOMING',
    score_home: null,
    score_away: null,
  }));

  const { error } = await supabase.from('matches').insert(rows);
  if (error) {
    console.error('   ❌  Erreur matchs KO :', error.message);
    throw error;
  }
  console.log(`   ✅  ${rows.length} matchs KO insérés`);
}

async function verifyImport() {
  console.log('\n🔍  Vérification…');

  const { count: teamCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true });

  const { count: matchCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true });

  const { data: sample } = await supabase
    .from('matches')
    .select('team_home, team_away, match_date, status')
    .order('match_date', { ascending: true })
    .limit(5);

  console.log(`   📊  Équipes en base : ${teamCount}`);
  console.log(`   📊  Matchs en base  : ${matchCount}`);
  console.log('\n   📅  5 premiers matchs :');
  sample?.forEach(m => {
    const d = new Date(m.match_date).toLocaleString('fr-FR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
    console.log(`      • ${m.team_home.padEnd(20)} vs ${m.team_away.padEnd(20)} — ${d} UTC`);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   FIFA WORLD CUP 2026 — Seed Script v1.0');
  console.log('   Supabase :', SUPABASE_URL);
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    await seedTeams();
    await seedGroupMatches();
    await seedKnockoutMatches();
    await verifyImport();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   ✅  Import terminé avec succès !');
    console.log('   Les 48 équipes et 104 matchs sont dans Supabase.');
    console.log('   Les matchs KO ont des noms génériques (ex: "Vq. S1")');
    console.log('   Mettez-les à jour depuis le panel Admin au fil du tournoi.');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('\n❌  Import échoué :', err.message || err);
    process.exit(1);
  }
}

main();
