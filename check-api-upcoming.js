async function run() {
  const res = await fetch('https://worldcup26.ir/get/games');
  const data = await res.json();
  const games = data.games || [];
  
  // Find Belgium vs Egypt
  const belEgypt = games.find(g => g.home_team_name_en?.toLowerCase().includes('belgium') || g.away_team_name_en?.toLowerCase().includes('belgium'));
  console.log("Belgium game in API:", belEgypt);
  
  // Find other upcoming games
  console.log("\nSome games in API:");
  games.slice(15, 25).forEach(g => {
    console.log(`${g.home_team_name_en} vs ${g.away_team_name_en} | finished: ${g.finished} | score: ${g.home_score}-${g.away_score} | date: ${g.local_date}`);
  });
}
run();
