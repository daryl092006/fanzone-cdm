const fs = require('fs');
async function run() {
    try {
        const response = await fetch('https://www.google.com/search?q=Coupe+du+monde+2026', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        fs.writeFileSync('google-result.html', html);
        console.log("Contains captcha:", html.includes("captcha") || html.includes("Captcha") || html.includes("CAPTCHA"));
        console.log("Contains google:", html.includes("google") || html.includes("Google"));
        console.log("Contains system/unusual:", html.includes("our system") || html.includes("unusual traffic"));
    } catch (e) {
        console.error(e);
    }
}
run();
