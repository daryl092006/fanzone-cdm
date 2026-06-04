// Creates the teams table and seeds it using Supabase REST API
// The table is created via Supabase's pg_query RPC (if enabled), or via a migration workaround.

const supabaseUrl = "https://ntvvlkosaakgpkrrjzxq.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI";

const headers = {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`,
    "Content-Type": "application/json"
};

const FIFA_2026_TEAMS = [
    { name: "Mexico", flag: "🇲🇽", group_letter: "A" },
    { name: "South Africa", flag: "🇿🇦", group_letter: "A" },
    { name: "Korea Republic", flag: "🇰🇷", group_letter: "A" },
    { name: "Czechia", flag: "🇨🇿", group_letter: "A" },
    { name: "Canada", flag: "🇨🇦", group_letter: "B" },
    { name: "Switzerland", flag: "🇨🇭", group_letter: "B" },
    { name: "Qatar", flag: "🇶🇦", group_letter: "B" },
    { name: "Bosnia-Herzegovina", flag: "🇧🇦", group_letter: "B" },
    { name: "Brazil", flag: "🇧🇷", group_letter: "C" },
    { name: "Morocco", flag: "🇲🇦", group_letter: "C" },
    { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group_letter: "C" },
    { name: "Haiti", flag: "🇭🇹", group_letter: "C" },
    { name: "USA", flag: "🇺🇸", group_letter: "D" },
    { name: "Paraguay", flag: "🇵🇾", group_letter: "D" },
    { name: "Australia", flag: "🇦🇺", group_letter: "D" },
    { name: "Türkiye", flag: "🇹🇷", group_letter: "D" },
    { name: "Germany", flag: "🇩🇪", group_letter: "E" },
    { name: "Ecuador", flag: "🇪🇨", group_letter: "E" },
    { name: "Ivory Coast", flag: "🇨🇮", group_letter: "E" },
    { name: "Curaçao", flag: "🇨🇼", group_letter: "E" },
    { name: "Netherlands", flag: "🇳🇱", group_letter: "F" },
    { name: "Japan", flag: "🇯🇵", group_letter: "F" },
    { name: "Tunisia", flag: "🇹🇳", group_letter: "F" },
    { name: "Sweden", flag: "🇸🇪", group_letter: "F" },
    { name: "Belgium", flag: "🇧🇪", group_letter: "G" },
    { name: "Iran", flag: "🇮🇷", group_letter: "G" },
    { name: "Egypt", flag: "🇪🇬", group_letter: "G" },
    { name: "New Zealand", flag: "🇳🇿", group_letter: "G" },
    { name: "Spain", flag: "🇪🇸", group_letter: "H" },
    { name: "Uruguay", flag: "🇺🇾", group_letter: "H" },
    { name: "Saudi Arabia", flag: "🇸🇦", group_letter: "H" },
    { name: "Cape Verde", flag: "🇨🇻", group_letter: "H" },
    { name: "France", flag: "🇫🇷", group_letter: "I" },
    { name: "Senegal", flag: "🇸🇳", group_letter: "I" },
    { name: "Norway", flag: "🇳🇴", group_letter: "I" },
    { name: "Iraq", flag: "🇮🇶", group_letter: "I" },
    { name: "Argentina", flag: "🇦🇷", group_letter: "J" },
    { name: "Austria", flag: "🇦🇹", group_letter: "J" },
    { name: "Algeria", flag: "🇩🇿", group_letter: "J" },
    { name: "Jordan", flag: "🇯🇴", group_letter: "J" },
    { name: "Portugal", flag: "🇵🇹", group_letter: "K" },
    { name: "Colombia", flag: "🇨🇴", group_letter: "K" },
    { name: "Uzbekistan", flag: "🇺🇿", group_letter: "K" },
    { name: "DR Congo", flag: "🇨🇩", group_letter: "K" },
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group_letter: "L" },
    { name: "Croatia", flag: "🇭🇷", group_letter: "L" },
    { name: "Panama", flag: "🇵🇦", group_letter: "L" },
    { name: "Ghana", flag: "🇬🇭", group_letter: "L" },
];

async function run() {
    console.log("=== SETUP TEAMS ===\n");

    // 1. Try to insert directly — if table doesn't exist, it will fail with a clear error
    console.log("📋 Trying to insert teams into 'teams' table...");
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/teams`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify(FIFA_2026_TEAMS)
    });

    if (insertRes.ok) {
        console.log(`✅ ${FIFA_2026_TEAMS.length} teams inserted successfully!`);
        return;
    }

    const errText = await insertRes.text();
    let errData;
    try { errData = JSON.parse(errText); } catch { errData = { message: errText }; }

    // Table doesn't exist: print the SQL to create it
    if (errData.code === '42P01' || errText.includes('does not exist')) {
        console.error("❌ La table 'teams' n'existe pas encore.");
        console.log("\n════════════════════════════════════════════════════════");
        console.log("📋 VEUILLEZ EXÉCUTER CE SQL DANS SUPABASE > SQL Editor :");
        console.log("════════════════════════════════════════════════════════\n");
        console.log(`CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    flag TEXT NOT NULL DEFAULT '🏳️',
    group_letter TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to teams"
ON public.teams FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow full access to admin for teams"
ON public.teams FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`);
        console.log("\n════════════════════════════════════════════════════════");
        console.log("➡️  Après cela, relancez : node setup-teams.js");
        return;
    }

    // Already has data
    if (errData.code === '23505') {
        console.log("ℹ️  Des équipes existent déjà dans la table.");
        return;
    }

    console.error("❌ Erreur:", insertRes.status, errText);
}

run();
