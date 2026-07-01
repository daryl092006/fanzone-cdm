const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  // R32-09: 1er gr. L vs 3e gr. E/H/I/J/K
  // Group L winner = England, 3rd best from K (DR Congo was 3rd in K but made it as best 3rd)
  // This slot was wrongly set to "England vs Ghana" - it should be "England vs DR Congo" at 16:00 UTC
  
  // The match in DB: id 93a70781 = "England vs Ghana" at 20:00 UTC (FINISHED 0-0)
  // But the REAL knockout slot for 1er gr. L should be England vs DR Congo at 16:00 UTC
  
  // Check: does a standalone "England vs DR Congo" at 16:00 already exist?
  const { data: existing } = await supabase
    .from('matches')
    .select('*')
    .or('team_home.eq.England,team_away.eq.England')
    .order('match_date');

  console.log("All England matches in DB:");
  existing.forEach(m => console.log(`id: ${m.id} | ${m.team_home} vs ${m.team_away} | date: ${m.match_date} | status: ${m.status}`));

  // Update the R32-09 slot (id: 93a70781-08ae-4060-b7d6-7a828cab022e) to be England vs DR Congo at 16:00 UTC LIVE
  console.log("\nUpdating R32-09 slot to England vs DR Congo...");
  const { error } = await supabase
    .from('matches')
    .update({
      team_home: 'England',
      team_away: 'DR Congo',
      match_date: '2026-07-01T16:00:00Z',
      score_home: 0,
      score_away: 0,
      status: 'LIVE'
    })
    .eq('id', '93a70781-08ae-4060-b7d6-7a828cab022e');

  if (error) {
    console.error('Error updating match:', error);
  } else {
    console.log('✅ Match updated: England vs DR Congo | LIVE 0-0 | 16:00 UTC');
  }
}
run();
