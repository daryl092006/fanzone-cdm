const fs = require('fs');

async function run() {
  const res = await fetch('https://worldcup26.ir/get/games');
  const data = await res.json();
  const games = data.games || [];

  // Let's group games by group to calculate standings
  const groupMatches = games.filter(g => g.type === 'group');
  
  // Let's compute standings for each group
  const standings = {}; // group -> team -> stats
  
  function addStats(group, team, gs, gc, pts) {
    if (!standings[group]) standings[group] = {};
    if (!standings[group][team]) {
      standings[group][team] = { name: team, gs: 0, gc: 0, pts: 0, gd: 0 };
    }
    standings[group][team].gs += gs;
    standings[group][team].gc += gc;
    standings[group][team].pts += pts;
    standings[group][team].gd = standings[group][team].gs - standings[group][team].gc;
  }

  groupMatches.forEach(g => {
    const group = g.group;
    const home = g.home_team_name_en;
    const away = g.away_team_name_en;
    const hs = parseInt(g.home_score) || 0;
    const as = parseInt(g.away_score) || 0;
    
    if (g.finished === 'TRUE') {
      if (hs > as) {
        addStats(group, home, hs, as, 3);
        addStats(group, away, as, hs, 0);
      } else if (as > hs) {
        addStats(group, home, hs, as, 0);
        addStats(group, away, as, hs, 3);
      } else {
        addStats(group, home, hs, as, 1);
        addStats(group, away, as, hs, 1);
      }
    }
  });

  // Sort each group
  const groupWinners = {}; // group -> [1st, 2nd, 3rd]
  Object.keys(standings).forEach(group => {
    const teams = Object.values(standings[group]);
    teams.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gs - a.gs;
    });
    groupWinners[group] = teams;
  });

  console.log("Calculated Group Winners from API:");
  Object.keys(groupWinners).sort().forEach(g => {
    console.log(`Group ${g}: 1st: ${groupWinners[g][0]?.name}, 2nd: ${groupWinners[g][1]?.name}, 3rd: ${groupWinners[g][2]?.name}`);
  });
}
run();
