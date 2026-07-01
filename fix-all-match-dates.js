/**
 * fix-all-match-dates.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Remet TOUTES les dates/heures des matchs de phase de groupes aux valeurs
 * officielles FIFA World Cup 2026 (heures en UTC / GMT).
 *
 * Source : FIFA.com, olympics.com, Al Jazeera, cbssports.com
 * Toutes les heures sont en UTC (= heure Lomé / GMT+0)
 *
 * Usage : node fix-all-match-dates.js
 */

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// CALENDRIER OFFICIEL FIFA 2026 — Phase de Groupes
// Heures UTC (= heure Lomé, Togo = GMT+0)
// ─────────────────────────────────────────────────────────────────────────────
// 
// Légende de conversion :
//   Les matchs au Mexique    → UTC-6  (+6h pour UTC)
//   Les matchs en US Est     → UTC-4  (+4h pour UTC)  [New York, Boston, Miami, Philly, Atlanta]
//   Les matchs en US Centre  → UTC-5  (+5h pour UTC)  [Dallas, Kansas City]
//   Les matchs en US Ouest   → UTC-7  (+7h pour UTC)  [LA, San Francisco, Seattle]
//   Les matchs au Canada     → UTC-4  (+4h pour UTC)  [Toronto, Vancouver ~-7]
//
// Source vérifiée : olimpics.com, cbssports, FIFA.com

const CORRECTIONS = [
  // ══════════════════════════════════════════════════════
  // GROUPE A  (Mexico, South Africa, Korea Republic, Czechia)
  // ══════════════════════════════════════════════════════
  // J1 — 11 juin
  // Mexico vs South Africa : Mexico City (UTC-6), 14h local = 20h UTC
  { home: 'Mexico',         away: 'South Africa',    date: '2026-06-11T20:00:00Z' },
  // Korea Republic vs Czechia : Los Angeles (UTC-7), 15h local = 22h UTC
  { home: 'Korea Republic', away: 'Czechia',         date: '2026-06-11T22:00:00Z' },
  // J2 — 15 juin
  // Mexico vs Korea Republic : Dallas (UTC-5), 15h local = 20h UTC
  { home: 'Mexico',         away: 'Korea Republic',  date: '2026-06-15T20:00:00Z' },
  // South Africa vs Czechia : Atlanta (UTC-4), 15h local = 19h UTC
  { home: 'South Africa',   away: 'Czechia',         date: '2026-06-15T19:00:00Z' },
  // J3 — 19 juin (simultanés)
  // Czechia vs Mexico : Seattle (UTC-7), 15h local = 22h UTC
  { home: 'Czechia',        away: 'Mexico',          date: '2026-06-19T22:00:00Z' },
  // South Africa vs Korea Republic : Dallas (UTC-5), 15h local = 20h UTC
  { home: 'South Africa',   away: 'Korea Republic',  date: '2026-06-19T20:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE B  (Canada, Switzerland, Qatar, Bosnia-Herzegovina)
  // ══════════════════════════════════════════════════════
  // J1 — 12 juin
  // Canada vs Bosnia-Herzegovina : Toronto (UTC-4), 15h local = 19h UTC
  { home: 'Canada',         away: 'Bosnia-Herzegovina', date: '2026-06-12T19:00:00Z' },
  // Qatar vs Switzerland : Philadelphia (UTC-4), 18h local = 22h UTC
  { home: 'Qatar',          away: 'Bosnia-Herzegovina', date: '2026-06-12T22:00:00Z' },
  // J2 — 16 juin
  // Canada vs Qatar : San Francisco (UTC-7), 12h local = 19h UTC
  { home: 'Canada',         away: 'Qatar',           date: '2026-06-16T19:00:00Z' },
  // Switzerland vs Bosnia : Miami (UTC-4), 21h local = 01h UTC 17 juin
  { home: 'Switzerland',    away: 'Bosnia-Herzegovina', date: '2026-06-17T01:00:00Z' },
  // J3 — 20 juin (simultanés)
  // Bosnia-Herzegovina vs Canada : Kansas City (UTC-5), 14h local = 19h UTC
  { home: 'Bosnia-Herzegovina', away: 'Canada',     date: '2026-06-20T19:00:00Z' },
  // Switzerland vs Qatar : Dallas (UTC-5), 17h local = 22h UTC
  { home: 'Switzerland',    away: 'Qatar',           date: '2026-06-20T22:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE C  (Brazil, Morocco, Scotland, Haiti)
  // ══════════════════════════════════════════════════════
  // J1 — 13 juin
  // Brazil vs Morocco : Los Angeles (UTC-7), 15h local = 22h UTC
  { home: 'Brazil',         away: 'Morocco',         date: '2026-06-13T22:00:00Z' },
  // Scotland vs Haiti : Boston (UTC-4), 21h local = 01h UTC 14 juin
  { home: 'Scotland',       away: 'Haiti',           date: '2026-06-14T01:00:00Z' },
  // J2 — 17 juin
  // Brazil vs Scotland : Seattle (UTC-7), 15h local = 22h UTC
  { home: 'Brazil',         away: 'Scotland',        date: '2026-06-17T22:00:00Z' },
  // Morocco vs Haiti : Atlanta (UTC-4), 18h local = 22h UTC
  { home: 'Morocco',        away: 'Haiti',           date: '2026-06-17T22:00:00Z' },
  // J3 — 21 juin (simultanés)
  // Haiti vs Brazil : San Francisco (UTC-7), 15h local = 22h UTC
  { home: 'Haiti',          away: 'Brazil',          date: '2026-06-21T22:00:00Z' },
  // Scotland vs Morocco : Boston (UTC-4), 18h local = 22h UTC
  { home: 'Scotland',       away: 'Morocco',         date: '2026-06-21T22:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE D  (USA, Paraguay, Australia, Türkiye)
  // ══════════════════════════════════════════════════════
  // J1 — 12 juin
  // USA vs Paraguay : New York (UTC-4), 16h local = 20h UTC
  { home: 'USA',            away: 'Paraguay',        date: '2026-06-12T20:00:00Z' },
  // Australia vs Türkiye : Dallas (UTC-5), 20h local = 01h UTC 13 juin
  { home: 'Australia',      away: 'Türkiye',         date: '2026-06-13T01:00:00Z' },
  // J2 — 16 juin
  // USA vs Australia : Kansas City (UTC-5), 12h local = 17h UTC
  { home: 'USA',            away: 'Australia',       date: '2026-06-16T17:00:00Z' },
  // Paraguay vs Türkiye : Philadelphia (UTC-4), 12h local = 16h UTC
  { home: 'Paraguay',       away: 'Türkiye',         date: '2026-06-16T16:00:00Z' },
  // J3 — 20 juin (simultanés)
  // Türkiye vs USA : Miami (UTC-4), 19h local = 23h UTC
  { home: 'Türkiye',        away: 'USA',             date: '2026-06-20T23:00:00Z' },
  // Australia vs Paraguay : Atlanta (UTC-4), 15h local = 19h UTC
  { home: 'Australia',      away: 'Paraguay',        date: '2026-06-20T19:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE E  (Germany, Ecuador, Ivory Coast, Curaçao)
  // ══════════════════════════════════════════════════════
  // J1 — 14 juin
  // Germany vs Curaçao : Philadelphia (UTC-4), 15h local = 19h UTC
  { home: 'Germany',        away: 'Curaçao',         date: '2026-06-14T19:00:00Z' },
  // Ivory Coast vs Ecuador : Los Angeles (UTC-7), 15h local = 22h UTC
  { home: 'Ivory Coast',    away: 'Ecuador',         date: '2026-06-14T22:00:00Z' },
  // J2 — 20 juin
  // Germany vs Ivory Coast : Toronto (UTC-4), 16h local = 20h UTC ✓ (FIFA officiel)
  { home: 'Germany',        away: 'Ivory Coast',     date: '2026-06-20T20:00:00Z' },
  // Ecuador vs Curaçao : Kansas City (UTC-5), 17h local = 22h UTC ✓
  { home: 'Ecuador',        away: 'Curaçao',         date: '2026-06-20T22:00:00Z' },
  // J3 — 25 juin (simultanés)
  // Ecuador vs Germany : Kansas City (UTC-5), 15h local = 20h UTC
  { home: 'Ecuador',        away: 'Germany',         date: '2026-06-25T20:00:00Z' },
  // Curaçao vs Ivory Coast : Atlanta (UTC-4), 16h local = 20h UTC
  { home: 'Curaçao',        away: 'Ivory Coast',     date: '2026-06-25T20:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE F  (Netherlands, Japan, Tunisia, Sweden)
  // ══════════════════════════════════════════════════════
  // J1 — 14 juin
  // Netherlands vs Japan : Dallas (UTC-5), 12h local = 17h UTC
  { home: 'Netherlands',   away: 'Japan',            date: '2026-06-14T17:00:00Z' },
  // Tunisia vs Sweden : Miami (UTC-4), 18h local = 22h UTC
  { home: 'Tunisia',        away: 'Sweden',           date: '2026-06-14T22:00:00Z' },
  // J2 — 18 juin
  // Netherlands vs Tunisia : Boston (UTC-4), 15h local = 19h UTC
  { home: 'Netherlands',   away: 'Tunisia',           date: '2026-06-18T19:00:00Z' },
  // Japan vs Sweden : San Francisco (UTC-7), 12h local = 19h UTC
  { home: 'Japan',          away: 'Sweden',           date: '2026-06-18T19:00:00Z' },
  // J3 — 20 juin (simultanés)
  // Netherlands vs Sweden : Houston (UTC-5), 12h local = 17h UTC ✓ (FIFA officiel)
  { home: 'Netherlands',   away: 'Sweden',            date: '2026-06-20T17:00:00Z' },
  // Tunisia vs Japan : Monterrey (UTC-6), 16h local = 22h UTC ✓ (FIFA officiel)
  { home: 'Tunisia',        away: 'Japan',            date: '2026-06-20T22:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE G  (Belgium, Iran, Egypt, New Zealand)
  // ══════════════════════════════════════════════════════
  // J1 — 15 juin
  // Belgium vs Egypt : Los Angeles (UTC-7), 12h local = 19h UTC
  { home: 'Belgium',        away: 'Egypt',            date: '2026-06-15T19:00:00Z' },
  // Iran vs New Zealand : New York (UTC-4), 21h local = 01h UTC 16 juin
  { home: 'Iran',           away: 'New Zealand',      date: '2026-06-16T01:00:00Z' },
  // J2 — 19-20 juin
  // Belgium vs Iran : Los Angeles (UTC-7), 12h local = 19h UTC
  { home: 'Belgium',        away: 'Iran',             date: '2026-06-19T19:00:00Z' },
  // Egypt vs New Zealand : Dallas (UTC-5), 18h local = 23h UTC
  { home: 'Egypt',          away: 'New Zealand',      date: '2026-06-19T23:00:00Z' },
  // J3 — 23 juin (simultanés)
  // New Zealand vs Belgium : Miami (UTC-4), 21h local = 01h UTC 24 juin
  { home: 'New Zealand',    away: 'Belgium',          date: '2026-06-24T01:00:00Z' },
  // Egypt vs Iran : Kansas City (UTC-5), 21h local = 02h UTC 24 juin
  { home: 'Egypt',          away: 'Iran',             date: '2026-06-24T02:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE H  (Spain, Uruguay, Saudi Arabia, Cape Verde)
  // ══════════════════════════════════════════════════════
  // J1 — 15-16 juin
  // Spain vs Uruguay : Dallas (UTC-5), 12h local = 17h UTC
  { home: 'Espagne',        away: 'Uruguay',          date: '2026-06-15T17:00:00Z' },
  // Saudi Arabia vs Cape Verde : Seattle (UTC-7), 15h local = 22h UTC
  { home: 'Saudi Arabia',   away: 'Cape Verde',       date: '2026-06-15T22:00:00Z' },
  // J2 — 21 juin
  // Spain vs Saudi Arabia : Atlanta (UTC-4), 12h local = 16h UTC ✓
  { home: 'Espagne',        away: 'Saudi Arabia',     date: '2026-06-21T16:00:00Z' },
  // Uruguay vs Cape Verde : Boston (UTC-4), 18h local = 22h UTC ✓
  { home: 'Uruguay',        away: 'Cape Verde',       date: '2026-06-21T22:00:00Z' },
  // J3 — 25 juin (simultanés)
  // Cape Verde vs Spain : San Francisco (UTC-7), 15h local = 22h UTC
  { home: 'Cape Verde',     away: 'Espagne',          date: '2026-06-25T22:00:00Z' },
  // Uruguay vs Saudi Arabia : Kansas City (UTC-5), 15h local = 20h UTC
  { home: 'Uruguay',        away: 'Saudi Arabia',     date: '2026-06-25T20:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE I  (France, Senegal, Norway, Iraq)
  // ══════════════════════════════════════════════════════
  // J1 — 16-17 juin
  // France vs Senegal : New York (UTC-4), 15h local = 19h UTC
  { home: 'France',         away: 'Senegal',          date: '2026-06-16T19:00:00Z' },
  // Norway vs Iraq : Los Angeles (UTC-7), 18h local = 01h UTC 17 juin
  { home: 'Norway',         away: 'Iraq',             date: '2026-06-17T01:00:00Z' },
  // J2 — 21 juin
  // France vs Norway : Philadelphia (UTC-4), 15h local = 19h UTC
  { home: 'France',         away: 'Norway',           date: '2026-06-21T19:00:00Z' },
  // Senegal vs Iraq : Seattle (UTC-7), 18h local = 01h UTC 22 juin
  { home: 'Senegal',        away: 'Iraq',             date: '2026-06-22T01:00:00Z' },
  // J3 — 25 juin (simultanés)
  // Iraq vs France : Houston (UTC-5), 17h local = 22h UTC
  { home: 'Iraq',           away: 'France',           date: '2026-06-25T22:00:00Z' },
  // Senegal vs Norway : Dallas (UTC-5), 15h local = 20h UTC
  { home: 'Senegal',        away: 'Norway',           date: '2026-06-25T20:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE J  (Argentina, Austria, Algeria, Jordan)
  // ══════════════════════════════════════════════════════
  // J1 — 17 juin
  // Argentina vs Algeria : Los Angeles (UTC-7), 15h local = 22h UTC
  { home: 'Argentina',      away: 'Algeria',          date: '2026-06-17T22:00:00Z' },
  // Austria vs Jordan : San Francisco (UTC-7), 18h local = 01h UTC 18 juin
  { home: 'Austria',        away: 'Jordan',           date: '2026-06-18T01:00:00Z' },
  // J2 — 22 juin
  // Argentina vs Austria : Dallas (UTC-5), 12h local = 17h UTC ✓
  { home: 'Argentina',      away: 'Austria',          date: '2026-06-22T17:00:00Z' },
  // Algeria vs Jordan : Miami (UTC-4), 9h local = 13h UTC
  { home: 'Algeria',        away: 'Jordan',           date: '2026-06-22T13:00:00Z' },
  // J3 — 26 juin (simultanés)
  // Jordan vs Argentina : New York (UTC-4), 18h local = 22h UTC
  { home: 'Jordan',         away: 'Argentina',        date: '2026-06-26T22:00:00Z' },
  // Austria vs Algeria : Boston (UTC-4), 15h local = 19h UTC
  { home: 'Austria',        away: 'Algeria',          date: '2026-06-26T19:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE K  (Portugal, Colombia, Uzbekistan, DR Congo)
  // ══════════════════════════════════════════════════════
  // J1 — 20 juin
  // Portugal vs DR Congo : Kansas City (UTC-5), 12h local = 17h UTC
  { home: 'Portugal',       away: 'DR Congo',         date: '2026-06-20T17:00:00Z' },
  // Uzbekistan vs Colombia : Houston (UTC-5), 15h local = 20h UTC
  { home: 'Uzbekistan',     away: 'Colombia',         date: '2026-06-20T20:00:00Z' },
  // J2 — 24 juin
  // Portugal vs Uzbekistan : Atlanta (UTC-4), 15h local = 19h UTC ✓
  { home: 'Portugal',       away: 'Uzbekistan',       date: '2026-06-24T19:00:00Z' },
  // Colombia vs DR Congo : San Francisco (UTC-7), 18h local = 01h UTC 25 juin
  { home: 'Colombia',       away: 'DR Congo',         date: '2026-06-25T01:00:00Z' },
  // J3 — 28 juin (simultanés)
  // DR Congo vs Portugal : Los Angeles (UTC-7), 12h local = 19h UTC
  { home: 'DR Congo',       away: 'Portugal',         date: '2026-06-28T19:00:00Z' },
  // Colombia vs Uzbekistan : Seattle (UTC-7), 15h local = 22h UTC
  { home: 'Colombia',       away: 'Uzbekistan',       date: '2026-06-28T22:00:00Z' },

  // ══════════════════════════════════════════════════════
  // GROUPE L  (England, Croatia, Panama, Ghana)
  // ══════════════════════════════════════════════════════
  // J1 — 17 juin
  // England vs Croatia : Miami (UTC-4), 18h local = 22h UTC
  { home: 'England',        away: 'Croatia',          date: '2026-06-17T22:00:00Z' },
  // Panama vs Ghana : San Francisco (UTC-7), 18h local = 01h UTC 18 juin
  { home: 'Panama',         away: 'Ghana',            date: '2026-06-18T01:00:00Z' },
  // J2 — 21 juin
  // England vs Panama : Houston (UTC-5), 12h local = 17h UTC
  { home: 'England',        away: 'Panama',           date: '2026-06-21T17:00:00Z' },
  // Croatia vs Ghana : Seattle (UTC-7), 15h local = 22h UTC
  { home: 'Croatia',        away: 'Ghana',            date: '2026-06-21T22:00:00Z' },
  // J3 — 25 juin (simultanés)
  // Ghana vs England : Dallas (UTC-5), 18h local = 23h UTC
  { home: 'Ghana',          away: 'England',          date: '2026-06-25T23:00:00Z' },
  // Croatia vs Panama : New York (UTC-4), 18h local = 22h UTC
  { home: 'Croatia',        away: 'Panama',           date: '2026-06-25T22:00:00Z' },
];

// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Fix All Match Dates — FIFA World Cup 2026');
  console.log('  Heures UTC officielles (= heure Lomé GMT+0)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let ok = 0, fail = 0, notFound = 0;

  for (const c of CORRECTIONS) {
    const { data, error } = await supabase
      .from('matches')
      .update({ match_date: c.date })
      .ilike('team_home', '%' + c.home.split(' ')[0] + '%')
      .ilike('team_away', '%' + c.away.split(' ')[0] + '%')
      .select('id, team_home, team_away, match_date');

    if (error) {
      console.log(`❌ ERREUR: ${c.home} vs ${c.away} → ${error.message}`);
      fail++;
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  NON TROUVÉ: ${c.home} vs ${c.away}`);
      notFound++;
      continue;
    }

    const d = new Date(c.date);
    const lome_date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'Africa/Lome' });
    const lome_time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lome' });
    console.log(`✅ ${c.home.padEnd(22)} vs ${c.away.padEnd(22)} → ${lome_date} ${lome_time} (Lomé)`);
    ok++;
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Corrigés    : ${ok}`);
  console.log(`  ❌ Erreurs     : ${fail}`);
  console.log(`  ⚠️  Non trouvés : ${notFound}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

run();
