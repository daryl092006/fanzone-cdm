const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const searchNameMap = {
  'Mexico': ['mexico', 'mexique'],
  'South Africa': ['south africa', 'afrique du sud'],
  'Canada': ['canada'],
  'Bosnia-Herzegovina': ['bosnia', 'bosnie']
};

async function testSnippet() {
    const home = 'Canada';
    const away = 'Bosnia-Herzegovina';
    const query = `${home} vs ${away} score 2026`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, searchEngine) Chrome/115.0.0.0 Safari/537.36'
        }
    });
    const html = await res.text();
    const snippets = [];
    const snippetRegex = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = snippetRegex.exec(html)) !== null) {
        snippets.push(match[1].replace(/<[^>]+>/g, '').toLowerCase());
    }
    
    console.log("Snippets length:", snippets.length);
    for (const s of snippets) {
        const hasHome = searchNameMap[home].some(k => s.includes(k));
        const hasAway = searchNameMap[away].some(k => s.includes(k));
        console.log(`Snippet: "${s.slice(0, 80)}" -> hasHome: ${hasHome}, hasAway: ${hasAway}`);
    }
}
testSnippet();
