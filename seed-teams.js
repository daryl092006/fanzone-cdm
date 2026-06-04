// Script to create the teams table in Supabase via REST API
// Run: node create-teams-table.js

const supabaseUrl = "https://ntvvlkosaakgpkrrjzxq.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI";

const headers = {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`,
    "Content-Type": "application/json"
};

// Default 48 FIFA World Cup 2026 teams with groups
const FIFA_2026_TEAMS = [
    // Group A
    { name: "Mexico", flag: "🇲🇽", group_letter: "A" },
    { name: "South Africa", flag: "🇿🇦", group_letter: "A" },
    { name: "Korea Republic", flag: "🇰🇷", group_letter: "A" },
    { name: "Czechia", flag: "🇨🇿", group_letter: "A" },
    // Group B
    { name: "Canada", flag: "🇨🇦", group_letter: "B" },
    { name: "Switzerland", flag: "🇨🇭", group_letter: "B" },
    { name: "Qatar", flag: "🇶🇦", group_letter: "B" },
    { name: "Bosnia-Herzegovina", flag: "🇧🇦", group_letter: "B" },
    // Group C
    { name: "Brazil", flag: "🇧🇷", group_letter: "C" },
    { name: "Morocco", flag: "🇲🇦", group_letter: "C" },
    { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group_letter: "C" },
    { name: "Haiti", flag: "🇭🇹", group_letter: "C" },
    // Group D
    { name: "USA", flag: "🇺🇸", group_letter: "D" },
    { name: "Paraguay", flag: "🇵🇾", group_letter: "D" },
    { name: "Australia", flag: "🇦🇺", group_letter: "D" },
    { name: "Türkiye", flag: "🇹🇷", group_letter: "D" },
    // Group E
    { name: "Germany", flag: "🇩🇪", group_letter: "E" },
    { name: "Ecuador", flag: "🇪🇨", group_letter: "E" },
    { name: "Ivory Coast", flag: "🇨🇮", group_letter: "E" },
    { name: "Curaçao", flag: "🇨🇼", group_letter: "E" },
    // Group F
    { name: "Netherlands", flag: "🇳🇱", group_letter: "F" },
    { name: "Japan", flag: "🇯🇵", group_letter: "F" },
    { name: "Tunisia", flag: "🇹🇳", group_letter: "F" },
    { name: "Sweden", flag: "🇸🇪", group_letter: "F" },
    // Group G
    { name: "Belgium", flag: "🇧🇪", group_letter: "G" },
    { name: "Iran", flag: "🇮🇷", group_letter: "G" },
    { name: "Egypt", flag: "🇪🇬", group_letter: "G" },
    { name: "New Zealand", flag: "🇳🇿", group_letter: "G" },
    // Group H
    { name: "Spain", flag: "🇪🇸", group_letter: "H" },
    { name: "Uruguay", flag: "🇺🇾", group_letter: "H" },
    { name: "Saudi Arabia", flag: "🇸🇦", group_letter: "H" },
    { name: "Cape Verde", flag: "🇨🇻", group_letter: "H" },
    // Group I
    { name: "France", flag: "🇫🇷", group_letter: "I" },
    { name: "Senegal", flag: "🇸🇳", group_letter: "I" },
    { name: "Norway", flag: "🇳🇴", group_letter: "I" },
    { name: "Iraq", flag: "🇮🇶", group_letter: "I" },
    // Group J
    { name: "Argentina", flag: "🇦🇷", group_letter: "J" },
    { name: "Austria", flag: "🇦🇹", group_letter: "J" },
    { name: "Algeria", flag: "🇩🇿", group_letter: "J" },
    { name: "Jordan", flag: "🇯🇴", group_letter: "J" },
    // Group K
    { name: "Portugal", flag: "🇵🇹", group_letter: "K" },
    { name: "Colombia", flag: "🇨🇴", group_letter: "K" },
    { name: "Uzbekistan", flag: "🇺🇿", group_letter: "K" },
    { name: "DR Congo", flag: "🇨🇩", group_letter: "K" },
    // Group L
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group_letter: "L" },
    { name: "Croatia", flag: "🇭🇷", group_letter: "L" },
    { name: "Panama", flag: "🇵🇦", group_letter: "L" },
    { name: "Ghana", flag: "🇬🇭", group_letter: "L" },
];

async function run() {
    console.log("=== CHECKING TEAMS TABLE ===");

    // 1. Check if teams table exists
    try {
        const checkRes = await fetch(`${supabaseUrl}/rest/v1/teams?select=id&limit=1`, { headers });
        if (!checkRes.ok) {
            const errText = await checkRes.text();
            if (errText.includes("does not exist") || checkRes.status === 404) {
                console.error("❌ Table 'teams' does not exist yet.");
                console.log("👉 Please run schema_teams.sql in the Supabase SQL editor first, then run this script again.");
                process.exit(1);
            }
        } else {
            console.log("✅ Table 'teams' exists.");
        }
    } catch (e) {
        console.error("❌ Error checking teams table:", e.message);
        process.exit(1);
    }

    // 2. Check if already seeded
    const countRes = await fetch(`${supabaseUrl}/rest/v1/teams?select=id`, {
        headers: { ...headers, "Prefer": "count=exact", "Range-Unit": "items", "Range": "0-0" }
    });
    const countHeader = countRes.headers.get("content-range") || "";
    const total = countHeader.includes("/") ? parseInt(countHeader.split("/")[1]) : 0;

    if (total > 0) {
        console.log(`ℹ️  Table 'teams' already has ${total} rows. Skipping seed.`);
        console.log("    Use clear option if you want to re-seed.");
        return;
    }

    // 3. Insert teams
    console.log(`\n📦 Inserting ${FIFA_2026_TEAMS.length} FIFA 2026 teams...`);
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/teams`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify(FIFA_2026_TEAMS)
    });

    if (insertRes.ok) {
        console.log(`✅ ${FIFA_2026_TEAMS.length} teams inserted successfully!`);
    } else {
        const errText = await insertRes.text();
        console.error("❌ Error inserting teams:", insertRes.status, errText);
    }

    console.log("\n=== DONE ===");
}

run();
