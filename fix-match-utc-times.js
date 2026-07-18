const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ntvvlkosaakgpkrrjzxq.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI');

// Correction des heures : API local_date est en heure locale EDT (UTC-4)
// local → UTC : heure locale + 4h
// Vérification : Norway vs England QF → 17:00 local → 21:00 UTC ✓ (confirmé par ancien DB)
//                France vs Morocco QF → 16:00 local → 20:00 UTC ✓ (confirmé par ancien DB)

const FIXES = [
  // QF
  { teams: ['Argentina', 'Switzerland'], correct_utc: '2026-07-12T00:00:00Z', note: 'QF 20:00 EDT → 00:00 UTC next day' },
  { teams: ['France', 'Morocco'],        correct_utc: '2026-07-09T20:00:00Z', note: 'QF 16:00 EDT → 20:00 UTC ← déjà bon mais vérifié' },
  { teams: ['Norway', 'England'],        correct_utc: '2026-07-11T21:00:00Z', note: 'QF 17:00 EDT → 21:00 UTC ← déjà bon mais vérifié' },
  // SF (j'avais mis l'heure locale comme UTC)
  { teams: ['France', 'Spain'],          correct_utc: '2026-07-14T18:00:00Z', note: 'SF 14:00 EDT → 18:00 UTC' },
  { teams: ['England', 'Argentina'],     correct_utc: '2026-07-15T19:00:00Z', note: 'SF 15:00 EDT → 19:00 UTC' },
  // 3e place et finale
  { teams: ['France', 'England'],        correct_utc: '2026-07-18T21:00:00Z', note: '3e place 17:00 EDT → 21:00 UTC' },
  { teams: ['Spain', 'Argentina'],       correct_utc: '2026-07-19T19:00:00Z', note: 'Finale 15:00 EDT → 19:00 UTC' },
];

function teamsMatch(home, away, pair) {
  return (home === pair[0] && away === pair[1]) || (home === pair[1] && away === pair[0]);
}

async function run() {
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .gte('match_date', '2026-07-07')
    .order('match_date', { ascending: true });

  for (const fix of FIXES) {
    const m = (matches || []).find(x => teamsMatch(x.team_home, x.team_away, fix.teams));
    if (!m) {
      console.log(`⚠️  Introuvable: ${fix.teams.join(' vs ')}`);
      continue;
    }
    const currentUTC = m.match_date?.substring(0, 16).replace('T', ' ');
    const newUTC = fix.correct_utc.substring(0, 16).replace('T', ' ');

    if (m.match_date === fix.correct_utc || m.match_date?.startsWith(fix.correct_utc.substring(0, 16))) {
      console.log(`✅ OK déjà: ${m.team_home} vs ${m.team_away} | ${currentUTC} UTC`);
      continue;
    }

    const { error } = await supabase
      .from('matches')
      .update({ match_date: fix.correct_utc })
      .eq('id', m.id);

    if (!error) {
      console.log(`✅ CORRIGÉ: ${m.team_home} vs ${m.team_away} | ${currentUTC} → ${newUTC} UTC | ${fix.note}`);
    } else {
      console.error(`❌ Erreur ${m.team_home} vs ${m.team_away}:`, error.message);
    }
  }

  // Vérification finale
  console.log('\n=== HEURES FINALES (>= 7 juillet) ===');
  const { data: final } = await supabase
    .from('matches')
    .select('team_home,team_away,match_date,status,score_home,score_away')
    .gte('match_date', '2026-07-07')
    .order('match_date', { ascending: true });

  (final || []).forEach(m => {
    if (m.team_home === 'SYSTEM') return;
    const score = (m.score_home !== null && m.score_away !== null) ? `${m.score_home}-${m.score_away}` : 'TBD';
    const utcTime = (m.match_date || '').substring(11, 16);
    console.log(`[${m.status.padEnd(8)}] ${(m.team_home + ' vs ' + m.team_away).padEnd(30)} ${score.padEnd(6)} | ${m.match_date?.substring(0,10)} ${utcTime} UTC`);
  });
}

run().catch(console.error);
