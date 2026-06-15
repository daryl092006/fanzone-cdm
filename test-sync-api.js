const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizeTeamName(name) {
    if (!name) return "";
    return name
        .toLowerCase()
        .replace(/and/g, '&')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/republic/g, 'rep.')
        .replace(/south korea/g, 'korea republic')
        .replace(/czech republic/g, 'czechia')
        .replace(/united states/g, 'usa')
        .replace(/turkey/g, 'türkiye')
        .replace(/cote d'ivoire/g, 'ivory coast')
        .replace(/espania/g, 'spain')
        .replace(/espagne/g, 'spain')
        .trim();
}

function matchesAlign(apiHome, apiAway, dbHome, dbAway) {
    const ah = normalizeTeamName(apiHome);
    const aa = normalizeTeamName(apiAway);
    const dh = normalizeTeamName(dbHome);
    const da = normalizeTeamName(dbAway);
    
    return (ah === dh && aa === da) || (ah === da && aa === dh);
}

async function testSync() {
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
        
        console.log(`Loaded ${apiGames.length} API games and ${dbMatches.length} DB matches.`);
        
        let matchCount = 0;
        for (const g of apiGames) {
            // Check if we can find a matching DB match
            const dbMatch = dbMatches.find(m => matchesAlign(g.home_team_name_en, g.away_team_name_en, m.team_home, m.team_away));
            if (dbMatch) {
                matchCount++;
                if (g.finished === 'TRUE' || g.home_score !== 'null') {
                    console.log(`Matched (Finished): ${g.home_team_name_en} vs ${g.away_team_name_en} -> DB: ${dbMatch.team_home} vs ${dbMatch.team_away} | Score: ${g.home_score} - ${g.away_score}`);
                }
            } else {
                console.log(`No match for API game: ${g.home_team_name_en} vs ${g.away_team_name_en} (${g.type})`);
            }
        }
        console.log(`Total matched games: ${matchCount}/104`);
    } catch (e) {
        console.error(e);
    }
}

testSync();
