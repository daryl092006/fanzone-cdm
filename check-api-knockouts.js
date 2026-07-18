const fs = require('fs');

async function run() {
  const res = await fetch('https://worldcup26.ir/get/games');
  const data = await res.json();
  const games = data.games || [];

  console.log("ALL API GAMES (type qf, sf, third, final):");
  games.forEach(g => {
    if (['qf', 'sf', 'third', 'final'].includes(g.type)) {
      console.log(`ID: ${g.id} | ${g.home_team_name_en} vs ${g.away_team_name_en} | Type: ${g.type} | Finished: ${g.finished} | Score: ${g.home_score} - ${g.away_score} | Date: ${g.local_date}`);
    }
  });
}
run();
