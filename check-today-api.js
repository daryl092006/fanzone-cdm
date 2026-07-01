async function run() {
  const res = await fetch('https://worldcup26.ir/get/games');
  const data = await res.json();
  const games = data.games || [];
  
  const r32Games = games.filter(g => g.type === 'r32');
  console.log("R32 games in API:");
  r32Games.forEach(g => {
    console.log(`${g.id}. ${g.home_team_name_en} vs ${g.away_team_name_en} | finished: ${g.finished} | score: ${g.home_score}-${g.away_score} | date: ${g.local_date} | elapsed: ${g.time_elapsed}`);
  });
}
run();
