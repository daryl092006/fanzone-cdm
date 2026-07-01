const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, team_home, team_away, match_date, created_at, status')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total: ${matches.length}`);
  // Group matches vs Knockout matches by created_at. Let's see if the first 72 are group matches.
  matches.forEach((m, idx) => {
    console.log(`${idx + 1}. id: ${m.id} | ${m.team_home} vs ${m.team_away} | date: ${m.match_date} | created_at: ${m.created_at} | status: ${m.status}`);
  });
}
run();
