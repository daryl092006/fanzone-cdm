const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total matches: ${matches.length}`);
  // print the last 34 matches
  const kos = matches.slice(72);
  kos.forEach((m, i) => {
    console.log(`${i+1}. id: ${m.id} | ${m.team_home} vs ${m.team_away} | Date: ${m.match_date} | Status: ${m.status}`);
  });
}
run();
