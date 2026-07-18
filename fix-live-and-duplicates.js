const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });
  if (error) { console.error(error); return; }

  // ── 1. Trouver et corriger France vs England (3e place) → LIVE 0-0 ────────
  const frEngland = matches.find(m =>
    ((m.team_home === 'France' && m.team_away === 'England') ||
     (m.team_home === 'England' && m.team_away === 'France')) &&
    m.match_date?.startsWith('2026-07-18')
  );
  if (frEngland) {
    console.log(`Trouvé 3e place: id=${frEngland.id} | status=${frEngland.status} | score=${frEngland.score_home}-${frEngland.score_away}`);
    const { error: e1 } = await supabase.from('matches').update({
      team_home: 'France',
      team_away: 'England',
      status: 'LIVE',
      score_home: 0,
      score_away: 0,
      match_date: '2026-07-18T17:00:00Z'
    }).eq('id', frEngland.id);
    if (!e1) console.log('✅ France vs England → LIVE 0-0');
    else console.error('❌', e1.message);
  } else {
    console.log('⚠️  France vs England (3e place) introuvable !');
  }

  // ── 2. Supprimer les doublons ──────────────────────────────────────────────
  // France vs Morocco doit exister 1 seule fois en tant que QF (2026-07-09)
  // Norway vs England doit exister 1 seule fois en tant que QF (2026-07-11)
  // Les doublons sont ceux qui ont la mauvaise date (QF placeholder avec date incorrecte)

  const frMoroccoAll = matches.filter(m =>
    (m.team_home === 'France' && m.team_away === 'Morocco') ||
    (m.team_home === 'Morocco' && m.team_away === 'France')
  );
  console.log(`\nFrance vs Morocco: ${frMoroccoAll.length} entrée(s)`);
  frMoroccoAll.forEach(m => console.log(`  id=${m.id.substring(0,8)}… | date=${m.match_date?.substring(0,16)} | status=${m.status}`));

  const norEngAll = matches.filter(m =>
    (m.team_home === 'Norway' && m.team_away === 'England') ||
    (m.team_home === 'England' && m.team_away === 'Norway')
  );
  console.log(`Norway vs England: ${norEngAll.length} entrée(s)`);
  norEngAll.forEach(m => console.log(`  id=${m.id.substring(0,8)}… | date=${m.match_date?.substring(0,16)} | status=${m.status}`));

  // Supprimer les doublons (garder celui avec la date QF officielle,
  // supprimer celui avec la mauvaise date reconstituée depuis le placeholder)
  if (frMoroccoAll.length > 1) {
    // QF officiel = 2026-07-09, l'autre est le doublon
    const doublon = frMoroccoAll.find(m => !m.match_date?.startsWith('2026-07-09'));
    if (doublon) {
      const { error: e2 } = await supabase.from('matches').delete().eq('id', doublon.id);
      if (!e2) console.log(`✅ Doublon France vs Morocco supprimé (id=${doublon.id.substring(0,8)}…)`);
      else console.error('❌', e2.message);
    }
  }

  if (norEngAll.length > 1) {
    // QF officiel = 2026-07-11, l'autre est le doublon
    const doublon = norEngAll.find(m => !m.match_date?.startsWith('2026-07-11'));
    if (doublon) {
      const { error: e3 } = await supabase.from('matches').delete().eq('id', doublon.id);
      if (!e3) console.log(`✅ Doublon Norway vs England supprimé (id=${doublon.id.substring(0,8)}…)`);
      else console.error('❌', e3.message);
    }
  }

  // ── 3. Affichage final des éliminatoires ──────────────────────────────────
  const { data: final } = await supabase.from('matches').select('*').order('match_date', { ascending: true });
  const ko = (final || []).filter(m =>
    m.id !== '00000000-0000-0000-0000-000000000000' &&
    new Date(m.match_date) >= new Date('2026-06-28')
  ).slice(0, 35);

  console.log('\n=== ÉLIMINATOIRES FINAL ===');
  ko.forEach((m, i) => {
    const score = (m.score_home !== null && m.score_away !== null) ? `${m.score_home}-${m.score_away}` : 'TBD';
    console.log(`${String(i+1).padStart(2)}. [${m.status.padEnd(8)}] ${m.team_home} vs ${m.team_away} | ${score} | ${m.match_date?.substring(0,16)}`);
  });
}

run().catch(console.error);
