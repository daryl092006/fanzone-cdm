const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ntvvlkosaakgpkrrjzxq.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI');

// API: France vs Spain  | sf | Date: 07/14/2026 14:00 local EDT → 18:00 UTC
// API: England vs Argentina | sf | Date: 07/15/2026 15:00 local EDT → 19:00 UTC
const SFS = [
  { team_home: 'France',  team_away: 'Spain',      match_date: '2026-07-14T18:00:00Z', score_home: 0, score_away: 2, status: 'FINISHED' },
  { team_home: 'England', team_away: 'Argentina',  match_date: '2026-07-15T19:00:00Z', score_home: 1, score_away: 2, status: 'FINISHED' },
];

async function run() {
  for (const sf of SFS) {
    // Vérifier si le match existe déjà
    const { data: existing } = await supabase
      .from('matches')
      .select('id,team_home,team_away,match_date,status')
      .or(`team_home.eq.${sf.team_home},team_away.eq.${sf.team_home}`)
      .gte('match_date', '2026-07-13')
      .lte('match_date', '2026-07-16');

    const found = (existing || []).find(m =>
      (m.team_home === sf.team_home && m.team_away === sf.team_away) ||
      (m.team_home === sf.team_away && m.team_away === sf.team_home)
    );

    if (found) {
      // Mettre à jour
      const { error } = await supabase.from('matches').update({
        team_home: sf.team_home,
        team_away: sf.team_away,
        match_date: sf.match_date,
        score_home: sf.score_home,
        score_away: sf.score_away,
        status: sf.status
      }).eq('id', found.id);
      if (!error) console.log(`✅ MAJ SF: ${sf.team_home} vs ${sf.team_away} → FINISHED ${sf.score_home}-${sf.score_away} @ ${sf.match_date}`);
      else console.error('❌', error.message);
    } else {
      // Insérer
      const { error } = await supabase.from('matches').insert({
        team_home: sf.team_home,
        team_away: sf.team_away,
        match_date: sf.match_date,
        score_home: sf.score_home,
        score_away: sf.score_away,
        status: sf.status
      });
      if (!error) console.log(`✅ INSÉRÉ SF: ${sf.team_home} vs ${sf.team_away} → FINISHED ${sf.score_home}-${sf.score_away} @ ${sf.match_date}`);
      else console.error('❌', error.message);
    }
  }

  // Vérif finale complète des matchs KO
  console.log('\n=== TABLEAU COMPLET DES ÉLIMINATOIRES ===');
  const { data: all } = await supabase
    .from('matches')
    .select('team_home,team_away,match_date,status,score_home,score_away')
    .gte('match_date', '2026-06-28')
    .order('match_date', { ascending: true });

  let i = 1;
  (all || []).forEach(m => {
    if (m.team_home === 'SYSTEM') return;
    const score = (m.score_home !== null && m.score_away !== null) ? `${m.score_home}-${m.score_away}` : 'TBD';
    const dt = m.match_date || '';
    console.log(`${String(i++).padStart(2)}. [${m.status.padEnd(8)}] ${(m.team_home + ' vs ' + m.team_away).padEnd(32)} ${score.padEnd(5)} | ${dt.substring(0,10)} ${dt.substring(11,16)} UTC`);
  });
}

run().catch(console.error);
