async function run() {
    try {
        const response = await fetch('https://www.google.com/search?q=site:wikipedia.org+Coupe+du+monde+de+football+2026', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        console.log("Status:", response.status);
        console.log("HTML length:", html.length);
        console.log("Contains Coupe du monde:", html.includes("Coupe du monde"));
    } catch (e) {
        console.error(e);
    }
}
run();
