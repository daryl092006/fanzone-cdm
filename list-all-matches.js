const supabaseUrl = "https://ntvvlkosaakgpkrrjzxq.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI";

async function run() {
    const headers = {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
        "Content-Type": "application/json"
    };
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/matches?select=*&order=match_date.asc`, { headers });
        if (res.ok) {
            const data = await res.json();
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error("Error fetching matches", res.status, await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}
run();
