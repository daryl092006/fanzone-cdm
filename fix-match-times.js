
// Script de correction des horaires des matchs selon le calendrier FIFA officiel 2026
// Horaires en UTC = Heure de Lomé (Togo = UTC+0)

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ntvvlkosaakgpkrrjzxq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI'
);

// Calendrier officiel FIFA 2026 - horaires UTC (= heure Lomé Togo)
// Source: FIFA officiel + sources vérifiées
const CORRECTIONS = [
  // === 11 JUIN ===
  { home: 'Mexico', away: 'South Africa',          date: '2026-06-11T19:00:00+00:00' }, // ✅ OK
  { home: 'Korea Republic', away: 'Czechia',        date: '2026-06-12T02:00:00+00:00' }, // ❌ était 00:00 (12 juin)

  // === 12 JUIN ===
  { home: 'Canada', away: 'Bosnia-Herzegovina',     date: '2026-06-12T19:00:00+00:00' }, // ❌ était 16:00
  { home: 'USA', away: 'Paraguay',                  date: '2026-06-13T01:00:00+00:00' }, // ✅ OK

  // === 13 JUIN ===
  { home: 'Qatar', away: 'Switzerland',             date: '2026-06-13T19:00:00+00:00' }, // ❌ était 16:00
  { home: 'Brazil', away: 'Morocco',                date: '2026-06-13T22:00:00+00:00' }, // ❌ était 14 juin 22:00
  { home: 'Haiti', away: 'Scotland',                date: '2026-06-14T01:00:00+00:00' }, // ✅ OK
  { home: 'Australia', away: 'Türkiye',             date: '2026-06-14T04:00:00+00:00' }, // ⚠️ source dit 06:00, on garde 04:00 (à confirmer)

  // === 14 JUIN ===
  { home: 'Germany', away: 'Curaçao',               date: '2026-06-14T17:00:00+00:00' }, // ✅ OK
  { home: 'Netherlands', away: 'Japan',             date: '2026-06-14T20:00:00+00:00' }, // ✅ OK
  { home: 'Ivory Coast', away: 'Ecuador',           date: '2026-06-14T23:00:00+00:00' }, // ❌ était 15 juin 00:00
  { home: 'Sweden', away: 'Tunisia',                date: '2026-06-15T02:00:00+00:00' }, // ❌ était 15 juin 03:00

  // === 15 JUIN ===
  { home: 'Belgium', away: 'Egypt',                 date: '2026-06-15T19:00:00+00:00' }, // ❌ était 16:00
  { home: 'Espagne', away: 'Cape Verde',            date: '2026-06-15T16:00:00+00:00' }, // à confirmer

  // === 16 JUIN ===
  { home: 'Saudi Arabia', away: 'Uruguay',          date: '2026-06-16T00:00:00+00:00' }, // ✅ OK
  { home: 'Iran', away: 'New Zealand',              date: '2026-06-16T03:00:00+00:00' }, // ✅ OK
  { home: 'France', away: 'Senegal',                date: '2026-06-16T19:00:00+00:00' }, // ✅ déjà corrigé
  { home: 'Iraq', away: 'Norway',                   date: '2026-06-16T22:00:00+00:00' }, // ❌ était 16:00

  // === 17 JUIN ===
  { home: 'Argentina', away: 'Algeria',             date: '2026-06-17T01:00:00+00:00' }, // ✅ OK
  { home: 'Austria', away: 'Jordan',                date: '2026-06-17T04:00:00+00:00' }, // ❌ était 03:00
  { home: 'Portugal', away: 'DR Congo',             date: '2026-06-17T19:00:00+00:00' }, // ❌ était 17:00
  { home: 'England', away: 'Croatia',               date: '2026-06-17T22:00:00+00:00' }, // ❌ était 20:00

  // === 18 JUIN ===
  { home: 'Ghana', away: 'Panama',                  date: '2026-06-18T01:00:00+00:00' }, // ✅ OK
  { home: 'Uzbekistan', away: 'Colombia',           date: '2026-06-18T04:00:00+00:00' }, // ❌ était 17:00
  { home: 'Czechia', away: 'South Africa',          date: '2026-06-18T18:00:00+00:00' }, // ❌ était 16:00
  { home: 'Switzerland', away: 'Bosnia-Herzegovina',date: '2026-06-18T21:00:00+00:00' }, // ❌ était 14:00
];

async function fixMatchTimes() {
  console.log('🔄 Récupération de tous les matchs...');
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, team_home, team_away, match_date')
    .order('match_date');

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📋 ${matches.length} matchs trouvés\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const correction of CORRECTIONS) {
    // Chercher le match dans la base (fuzzy match sur team_home et team_away)
    const match = matches.find(m => {
      const homeMatch = m.team_home.toLowerCase().includes(correction.home.toLowerCase()) ||
                        correction.home.toLowerCase().includes(m.team_home.toLowerCase());
      const awayMatch = m.team_away.toLowerCase().includes(correction.away.toLowerCase()) ||
                        correction.away.toLowerCase().includes(m.team_away.toLowerCase());
      return homeMatch && awayMatch;
    });

    if (!match) {
      console.log(`⚠️  INTROUVABLE: ${correction.home} vs ${correction.away}`);
      notFound++;
      continue;
    }

    const currentDate = new Date(match.match_date).toISOString();
    const newDate = new Date(correction.date).toISOString();

    if (currentDate === newDate) {
      const h = new Date(newDate).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Lome', hour: '2-digit', minute: '2-digit' });
      const d = new Date(newDate).toLocaleDateString('fr-FR', { timeZone: 'Africa/Lome', day: '2-digit', month: 'short' });
      console.log(`✅ OK: ${match.team_home} vs ${match.team_away} → ${d} ${h} (inchangé)`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('matches')
      .update({ match_date: correction.date })
      .eq('id', match.id);

    if (updateError) {
      console.log(`❌ ERREUR update: ${match.team_home} vs ${match.team_away}:`, updateError);
    } else {
      const oldH = new Date(currentDate).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Lome', hour: '2-digit', minute: '2-digit' });
      const oldD = new Date(currentDate).toLocaleDateString('fr-FR', { timeZone: 'Africa/Lome', day: '2-digit', month: 'short' });
      const newH = new Date(newDate).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Lome', hour: '2-digit', minute: '2-digit' });
      const newD = new Date(newDate).toLocaleDateString('fr-FR', { timeZone: 'Africa/Lome', day: '2-digit', month: 'short' });
      console.log(`🔧 CORRIGÉ: ${match.team_home} vs ${match.team_away}`);
      console.log(`   ${oldD} ${oldH} → ${newD} ${newH}`);
      updated++;
    }
  }

  console.log(`\n📊 Résultat: ${updated} corrigés, ${skipped} inchangés, ${notFound} introuvables`);
}

fixMatchTimes();
