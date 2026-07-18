const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    const { data: matches, error } = await supabase.from('matches').select('*');
    if (error) return console.error(error);
    
    let updates = 0;
    for (const m of matches) {
        if (m.match_date < '2026-07-07T00:00:00Z' && m.score_home === null) {
            const scoreH = Math.floor(Math.random() * 4);
            const scoreA = Math.floor(Math.random() * 4);
            await supabase.from('matches').update({
                score_home: scoreH,
                score_away: scoreA,
                status: 'FINISHED'
            }).eq('id', m.id);
            updates++;
        }
    }
    console.log(`Updated ${updates} matches with random scores.`);
}
main();
