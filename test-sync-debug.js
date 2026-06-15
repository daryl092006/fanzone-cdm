const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const searchNameMap = {
  'Mexico': ['mexico', 'mexique'],
  'South Africa': ['south africa', 'afrique du sud'],
  'Korea Republic': ['korea', 'corée'],
  'Czechia': ['czechia', 'république tchèque', 'rep. tcheque'],
  'Canada': ['canada'],
  'Bosnia-Herzegovina': ['bosnia', 'bosnie'],
  'USA': ['usa', 'états-unis', 'etats-unis'],
  'Paraguay': ['paraguay'],
  'Qatar': ['qatar'],
  'Switzerland': ['switzerland', 'suisse'],
  'Brazil': ['brazil', 'brésil'],
  'Morocco': ['morocco', 'maroc'],
  'Haiti': ['haiti', 'haïti'],
  'Scotland': ['scotland', 'écosse'],
  'Australia': ['australia', 'australie'],
  'Türkiye': ['türkiye', 'turquie'],
  'Germany': ['germany', 'allemagne'],
  'Ecuador': ['ecuador', 'équateur', 'equateur'],
  'Ivory Coast': ['ivory coast', 'côte d\'ivoire'],
  'Curaçao': ['curaçao'],
  'Netherlands': ['netherlands', 'pays-bas'],
  'Japan': ['japan', 'japon'],
  'Tunisia': ['tunisia', 'tunisie'],
  'Sweden': ['sweden', 'suède'],
  'Belgium': ['belgium', 'belgique'],
  'Iran': ['iran'],
  'Egypt': ['egypt', 'égypte', 'egypte'],
  'New Zealand': ['new zealand', 'nouvelle-zélande'],
  'Spain': ['spain', 'espagne'],
  'Uruguay': ['uruguay'],
  'Saudi Arabia': ['saudi arabia', 'arabie saoudite'],
  'Cape Verde': ['cape verde', 'cap-vert'],
  'France': ['france'],
  'Senegal': ['senegal', 'sénégal'],
  'Norway': ['norway', 'norvège'],
  'Iraq': ['iraq', 'irak'],
  'Argentina': ['argentina', 'argentine'],
  'Austria': ['austria', 'autriche'],
  'Algeria': ['algeria', 'algérie'],
  'Jordan': ['jordan', 'jordanie'],
  'Portugal': ['portugal'],
  'Colombia': ['colombia', 'colombie'],
  'Uzbekistan': ['uzbekistan', 'ouzbékistan'],
  'DR Congo': ['dr congo', 'rd congo'],
  'England': ['england', 'angleterre'],
  'Croatia': ['croatia', 'croatie'],
  'Panama': ['panama'],
  'Ghana': ['ghana']
};

async function scrapeScoreFromDDG(home, away) {
    const query = `${home} vs ${away} score 2026`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) {
            console.log(`Failed fetch for ${home} vs ${away}: ${res.status}`);
            return null;
        }
        const html = await res.text();
        
        const regexes = [
            /(\d+)\s*-\s*(\d+)/g,
            /(\d+)\s*–\s*(\d+)/g,
            /(\d+)\s*—\s*(\d+)/g
        ];
        
        const counts = {};
        const snippets = [];
        
        const snippetRegex = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = snippetRegex.exec(html)) !== null) {
            snippets.push(match[1].replace(/<[^>]+>/g, '').toLowerCase());
        }
        
        const titleRegex = /class="result__url"[^>]*>([\s\S]*?)<\/a>/gi;
        while ((match = titleRegex.exec(html)) !== null) {
            snippets.push(match[1].replace(/<[^>]+>/g, '').toLowerCase());
        }
        
        for (const snippet of snippets) {
            const hasHome = searchNameMap[home] ? searchNameMap[home].some(k => snippet.includes(k)) : snippet.includes(home.toLowerCase());
            const hasAway = searchNameMap[away] ? searchNameMap[away].some(k => snippet.includes(k)) : snippet.includes(away.toLowerCase());
            
            if (hasHome && hasAway) {
                for (const rx of regexes) {
                    rx.lastIndex = 0;
                    let m;
                    while ((m = rx.exec(snippet)) !== null) {
                        const hScore = parseInt(m[1]);
                        const aScore = parseInt(m[2]);
                        if (hScore < 15 && aScore < 15) {
                            const key = `${hScore}-${aScore}`;
                            counts[key] = (counts[key] || 0) + 1;
                        }
                    }
                }
            }
        }
        
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0 && sorted[0][1] >= 1) {
            const [scoreStr] = sorted[0];
            const [h, a] = scoreStr.split('-').map(Number);
            return { scoreHome: h, scoreAway: a, confidence: sorted[0][1] };
        }
        return null;
    } catch (e) {
        console.error(`Error scraping for ${home} vs ${away}:`, e);
        return null;
    }
}

async function debugSync() {
    try {
        const { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .order('match_date', { ascending: true });

        if (matchesError) throw matchesError;

        const now = new Date();
        console.log(`Current Local Time on Server: ${now.toISOString()}`);

        const matchesToSync = (matches || []).filter(m => {
            const matchDate = new Date(m.match_date);
            const hasStarted = matchDate <= now;
            const isPlaceholder = m.team_home.startsWith('Vq.') || 
                                  m.team_home.startsWith('1er') || 
                                  m.team_home.startsWith('2e') || 
                                  m.team_home.startsWith('3e') || 
                                  m.team_home.startsWith('Perd.');
            
            return hasStarted && m.score_home === null && !isPlaceholder;
        });

        console.log(`Found ${matchesToSync.length} matches to sync.`);
        
        for (const m of matchesToSync) {
            console.log(`Syncing match: ${m.team_home} vs ${m.team_away} (scheduled date: ${m.match_date})`);
            const scoreResult = await scrapeScoreFromDDG(m.team_home, m.team_away);
            if (scoreResult) {
                console.log(`  -> SUCCESS: Found score ${scoreResult.scoreHome} - ${scoreResult.scoreAway} (confidence ${scoreResult.confidence})`);
            } else {
                console.log(`  -> FAILED: No score found or not enough confidence.`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

debugSync();
