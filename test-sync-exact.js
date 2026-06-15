const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizeTeamName(name) {
    if (!name) return "";
    let clean = name.toLowerCase().trim();
    if (clean.includes('south korea') || clean.includes('corée du sud') || clean.includes('korea republic')) return 'korea republic';
    if (clean.includes('czech republic') || clean.includes('république tchèque') || clean.includes('rep. tcheque') || clean.includes('czechia')) return 'czechia';
    if (clean.includes('democratic republic of the congo') || clean.includes('rd congo') || clean.includes('dr congo')) return 'dr congo';
    if (clean.includes('united states') || clean.includes('états unis') || clean.includes('etats unis') || clean.includes('usa')) return 'usa';
    if (clean.includes('turkey') || clean.includes('türkiye') || clean.includes('turquie')) return 'türkiye';
    if (clean.includes('bosnia')) return 'bosnia-herzegovina';
    if (clean.includes('ivory coast') || clean.includes('côte d\'ivoire')) return 'ivory coast';
    if (clean.includes('espagne') || clean.includes('spain') || clean.includes('españa')) return 'spain';
    if (clean.includes('belgique') || clean.includes('belgium')) return 'belgium';
    return clean.replace(/and/g, '&').replace(/-/g, ' ').replace(/\s+/g, ' ').replace(/republic/g, 'rep.');
}

function matchesAlign(apiHome, apiAway, dbHome, dbAway) {
    const ah = normalizeTeamName(apiHome);
    const aa = normalizeTeamName(apiAway);
    const dh = normalizeTeamName(dbHome);
    const da = normalizeTeamName(dbAway);
    
    return (ah === dh && aa === da) || (ah === da && aa === dh);
}

async function run() {
    try {
        const res = await fetch('https://worldcup26.ir/get/games');
        if (!res.ok) {
            console.log("Failed to fetch API games:", res.status);
            return;
        }
        const data = await res.json();
        const apiGames = data.games || [];
        
        const { data: dbMatches, error } = await supabase
            .from('matches')
            .select('*');
            
        if (error) throw error;
        
        let updatedCount = 0;
        let finishedCount = 0;
        let liveCount = 0;
        let upcomingCount = 0;

        for (const m of (dbMatches || [])) {
            const apiGame = apiGames.find(g => matchesAlign(g.home_team_name_en, g.away_team_name_en, m.team_home, m.team_away));
            
            if (apiGame) {
                const isFinished = apiGame.finished === 'TRUE';
                const isLive = apiGame.finished === 'FALSE' && apiGame.time_elapsed !== 'notstarted';

                if (isFinished) {
                    finishedCount++;
                } else if (isLive) {
                    liveCount++;
                } else {
                    upcomingCount++;
                }
            }
        }
        console.log(`Matching details from API:`);
        console.log(`- Finished in API: ${finishedCount}`);
        console.log(`- Live in API: ${liveCount}`);
        console.log(`- Upcoming in API: ${upcomingCount}`);
    } catch (e) {
        console.error(e);
    }
}

run();
