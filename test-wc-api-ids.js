async function run() {
    try {
        const res = await fetch('https://worldcup26.ir/get/games');
        if (res.ok) {
            const data = await res.json();
            // Sort by numerical id
            const games = data.games.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            
            console.log("First 10 matches in API:");
            games.slice(0, 10).forEach(g => {
                console.log(`ID: ${g.id} | ${g.home_team_name_en} vs ${g.away_team_name_en} | Type: ${g.type} | Date: ${g.local_date}`);
            });
            
            console.log("\nKnockout matches in API:");
            games.filter(g => g.type !== 'group').slice(0, 10).forEach(g => {
                console.log(`ID: ${g.id} | ${g.home_team_label || g.home_team_name_en} vs ${g.away_team_label || g.away_team_name_en} | Type: ${g.type}`);
            });
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
run();
