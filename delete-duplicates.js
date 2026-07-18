const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ntvvlkosaakgpkrrjzxq.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI');

async function run() {
  // Récupérer tous les doublons potentiels avec leurs vrais IDs
  const { data } = await supabase
    .from('matches')
    .select('id,team_home,team_away,match_date,status')
    .gte('match_date', '2026-07-09')
    .order('match_date', { ascending: true });

  console.log('=== MATCHS >= 09 JUILLET (avec IDs complets) ===');
  (data || []).forEach(m => {
    console.log(`[${m.status}] ${m.team_home} vs ${m.team_away} | ${(m.match_date || '').substring(0, 16)} | id=${m.id}`);
  });

  // Identifier les doublons : même paire d'équipes, deux fois
  const pairs = {};
  (data || []).forEach(m => {
    const key = [m.team_home, m.team_away].sort().join('|');
    if (!pairs[key]) pairs[key] = [];
    pairs[key].push(m);
  });

  const duplicates = Object.entries(pairs).filter(([k, arr]) => arr.length > 1);
  if (duplicates.length === 0) {
    console.log('\n✅ Aucun doublon trouvé !');
    return;
  }

  console.log('\n=== DOUBLONS DÉTECTÉS ===');
  for (const [key, arr] of duplicates) {
    // Garder le premier (date la plus ancienne), supprimer le suivant
    arr.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
    console.log(`Paire: ${key}`);
    arr.forEach((m, i) => console.log(`  ${i === 0 ? '✅ GARDER' : '🗑  SUPPRIMER'}: ${m.match_date?.substring(0,16)} | id=${m.id}`));

    // Supprimer tous sauf le premier
    for (let i = 1; i < arr.length; i++) {
      const { error } = await supabase.from('matches').delete().eq('id', arr[i].id);
      if (!error) console.log(`  ✅ Supprimé: ${arr[i].id}`);
      else console.error(`  ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n=== ÉTAT FINAL ===');
  const { data: final } = await supabase.from('matches').select('team_home,team_away,match_date,status,score_home,score_away').gte('match_date', '2026-07-09').order('match_date', { ascending: true });
  (final || []).forEach(m => {
    const score = (m.score_home !== null && m.score_away !== null) ? `${m.score_home}-${m.score_away}` : 'TBD';
    console.log(`[${m.status}] ${m.team_home} vs ${m.team_away} | ${score} | ${(m.match_date || '').substring(0, 16)}`);
  });
}
run().catch(console.error);
