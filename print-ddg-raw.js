async function run() {
    try {
        const response = await fetch('https://html.duckduckgo.com/html/?q=Canada+vs+Bosnia-Herzegovina+score+2026', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        console.log("HTML length:", html.length);
        console.log("HTML sample:", html.slice(0, 1000));
    } catch (e) {
        console.error(e);
    }
}
run();
