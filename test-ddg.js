async function run() {
    try {
        const response = await fetch('https://html.duckduckgo.com/html/?q=Mexique+vs+Afrique+du+Sud+score+2026');
        const html = await response.text();
        console.log("DDG HTML length:", html.length);
        // print first 500 chars of body or search results
        const matches = html.match(/class="result__snippet"[^>]*>([^<]+)/g);
        console.log("Snippets found:", matches ? matches.slice(0, 5) : "none");
    } catch (e) {
        console.error(e);
    }
}
run();
