// Script de diagnostic de base de données sans dépendances
const supabaseUrl = "https://ntvvlkosaakgpkrrjzxq.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI";

async function run() {
    const headers = {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
        "Content-Type": "application/json"
    };

    console.log("=== DIAGNOSTIC SUPABASE ===");

    // 1. Tester la table participants
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/participants?select=id,first_name,last_name&limit=3`, { headers });
        if (res.ok) {
            const data = await res.json();
            console.log("✅ Table 'participants' : ACCESSIBLE");
            console.log(`Nombre de lignes retournées (limit 3) : ${data.length}`);
            console.log("Exemples :", data);
        } else {
            const errText = await res.text();
            console.error("❌ Table 'participants' : ERREUR", res.status, errText);
        }
    } catch (e) {
        console.error("❌ Échec de connexion table 'participants':", e.message);
    }

    // 2. Tester la table matches
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/matches?select=*&limit=3`, { headers });
        if (res.ok) {
            const data = await res.json();
            console.log("\n✅ Table 'matches' : ACCESSIBLE");
            console.log(`Nombre de matchs en base : ${data.length}`);
            console.log("Exemples :", data);
        } else {
            const errText = await res.text();
            console.error("\n❌ Table 'matches' : ERREUR", res.status, errText);
            if (res.status === 404 || errText.includes("does not exist")) {
                console.log("=> La table 'matches' n'a pas encore été créée. Exécutez schema.sql dans Supabase.");
            }
        }
    } catch (e) {
        console.error("\n❌ Échec de connexion table 'matches':", e.message);
    }

    // 3. Tester la table predictions
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/predictions?select=*&limit=1`, { headers });
        if (res.ok) {
            console.log("\n✅ Table 'predictions' : ACCESSIBLE");
        } else {
            const errText = await res.text();
            console.error("\n❌ Table 'predictions' : ERREUR", res.status, errText);
        }
    } catch (e) {
        console.error("\n❌ Échec de connexion table 'predictions':", e.message);
    }
}

run();
