const nameMap = {
    'Mexico': ['mexico', 'mexique'],
    'South Africa': ['south africa', 'afrique du sud'],
    'Canada': ['canada'],
    'Bosnia-Herzegovina': ['bosnia', 'bosnie'],
    'Korea Republic': ['korea', 'corée'],
    'Czechia': ['czechia', 'république tchèque', 'rep. tcheque']
};

async function scrapeScore(home, away) {
    const query = `${home} vs ${away} score 2026`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    console.log(`Searching for: ${home} vs ${away}...`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) return null;
        const html = await res.text();
        
        // Find all regex matches for scores like "2-0", "2 - 1", "2 - 0"
        const regexes = [
            /(\d+)\s*-\s*(\d+)/g,
            /(\d+)\s*–\s*(\d+)/g, // en-dash
            /(\d+)\s*—\s*(\d+)/g  // em-dash
        ];
        
        const counts = {};
        
        // Let's scan all paragraphs or snippets in DDG HTML
        // Result snippets are inside <a class="result__snippet" ...>...</a>
        const snippets = [];
        const snippetRegex = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = snippetRegex.exec(html)) !== null) {
            snippets.push(match[1].replace(/<[^>]+>/g, '').toLowerCase());
        }
        
        // Also result titles
        const titleRegex = /class="result__url"[^>]*>([\s\S]*?)<\/a>/gi;
        while ((match = titleRegex.exec(html)) !== null) {
            snippets.push(match[1].replace(/<[^>]+>/g, '').toLowerCase());
        }
        
        console.log(`Found ${snippets.length} search result snippets.`);
        
        for (const snippet of snippets) {
            // Check if snippet contains keywords of both teams to avoid irrelevant matches
            const hasHome = nameMap[home] ? nameMap[home].some(k => snippet.includes(k)) : snippet.includes(home.toLowerCase());
            const hasAway = nameMap[away] ? nameMap[away].some(k => snippet.includes(k)) : snippet.includes(away.toLowerCase());
            
            if (hasHome && hasAway) {
                // Look for scores in this snippet
                for (const rx of regexes) {
                    rx.lastIndex = 0;
                    let m;
                    while ((m = rx.exec(snippet)) !== null) {
                        const hScore = parseInt(m[1]);
                        const aScore = parseInt(m[2]);
                        if (hScore < 15 && aScore < 15) { // reasonable football scores
                            const key = `${hScore}-${aScore}`;
                            counts[key] = (counts[key] || 0) + 1;
                        }
                    }
                }
            }
        }
        
        console.log("Score candidates:", counts);
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0 && sorted[0][1] >= 1) { // at least 1 match
            const [scoreStr, freq] = sorted[0];
            const [h, a] = scoreStr.split('-').map(Number);
            return { scoreHome: h, scoreAway: a, confidence: freq };
        }
        return null;
    } catch (e) {
        console.error("Scraping error:", e);
        return null;
    }
}

async function test() {
    const res1 = await scrapeScore('Mexico', 'South Africa');
    console.log("Result Mexico vs South Africa:", res1);
    
    const res2 = await scrapeScore('Canada', 'Bosnia-Herzegovina');
    console.log("Result Canada vs Bosnia:", res2);
}

test();
