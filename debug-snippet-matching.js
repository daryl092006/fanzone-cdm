const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const searchNameMap = {
  'Canada': ['canada'],
  'Bosnia-Herzegovina': ['bosnia', 'bosnie']
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
        if (!res.ok) return null;
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
        
        console.log(`Debug matching snippets for ${home} vs ${away}:`);
        for (const snippet of snippets) {
            const hasHome = searchNameMap[home] ? searchNameMap[home].some(k => snippet.includes(k)) : snippet.includes(home.toLowerCase());
            const hasAway = searchNameMap[away] ? searchNameMap[away].some(k => snippet.includes(k)) : snippet.includes(away.toLowerCase());
            
            console.log(`Snippet: "${snippet.slice(0, 100)}..." -> hasHome: ${hasHome}, hasAway: ${hasAway}`);
            if (hasHome && hasAway) {
                for (const rx of regexes) {
                    rx.lastIndex = 0;
                    let m;
                    while ((m = rx.exec(snippet)) !== null) {
                        const hScore = parseInt(m[1]);
                        const aScore = parseInt(m[2]);
                        console.log(`   -> Found score match: ${hScore}-${aScore}`);
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

async function run() {
    const res = await scrapeScoreFromDDG('Canada', 'Bosnia-Herzegovina');
    console.log("Result:", res);
}
run();
