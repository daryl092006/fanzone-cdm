const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total matches in DB: ${matches.length}`);
  const groupMatches = matches.slice(0, 72);
  const knockoutMatches = matches.slice(72);

  console.log(`Group matches: ${groupMatches.length}`);
  console.log(`Knockout matches: ${knockoutMatches.length}`);

  console.log("\nKnockout matches details:");
  knockoutMatches.forEach((m, idx) => {
    console.log(`${idx + 73}. ${m.team_home} vs ${m.team_away} | Date: ${m.match_date} | Status: ${m.status} | Score: ${m.score_home} - ${m.score_away}`);
  });
}

run();
