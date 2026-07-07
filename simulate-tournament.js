const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GROUPS = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Bosnia-Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Haiti', 'Scotland', 'Brazil', 'Morocco'],
  D: ['USA', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama']
};

function getRandomScore(max = 3) {
  return Math.floor(Math.random() * (max + 1));
}

async function main() {
  console.log('🔄 Démarrage de la simulation du tournoi...');

  // 1. Fetch all matches ordered by date
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .order('match_date', { ascending: true });

  if (error) {
    console.error('Erreur de chargement des matchs', error);
    process.exit(1);
  }

  let standings = {}; // group -> { team: { pts, gd, gf } }
  for (const group in GROUPS) {
    standings[group] = {};
    for (const team of GROUPS[group]) {
      standings[group][team] = { pts: 0, gd: 0, gf: 0, team };
    }
  }

  const groupMatches = matches.filter(m => m.match_date < '2026-06-28T00:00:00Z');
  
  // 2. Simulate Group Stage
  console.log(`⚽ Simulation de ${groupMatches.length} matchs de groupes...`);
  for (const m of groupMatches) {
    let scoreH = getRandomScore(4);
    let scoreA = getRandomScore(4);

    // Update DB
    await supabase.from('matches').update({
      score_home: scoreH,
      score_away: scoreA,
      status: 'FINISHED'
    }).eq('id', m.id);

    // Update Standings
    let group = null;
    for (const g in GROUPS) {
      if (GROUPS[g].includes(m.team_home)) {
        group = g;
        break;
      }
    }

    if (group) {
      const hStats = standings[group][m.team_home];
      const aStats = standings[group][m.team_away];
      
      hStats.gf += scoreH;
      aStats.gf += scoreA;
      hStats.gd += (scoreH - scoreA);
      aStats.gd += (scoreA - scoreH);

      if (scoreH > scoreA) hStats.pts += 3;
      else if (scoreA > scoreH) aStats.pts += 3;
      else {
        hStats.pts += 1;
        aStats.pts += 1;
      }
    }
  }

  // 3. Compute final group standings
  const topTeams = {};
  const thirdPlaces = [];
  for (const group in standings) {
    const sorted = Object.values(standings[group]).sort((a, b) => {
      if (a.pts !== b.pts) return b.pts - a.pts;
      if (a.gd !== b.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
    topTeams[`1er Groupe ${group}`] = sorted[0].team;
    topTeams[`2e Groupe ${group}`] = sorted[1].team;
    thirdPlaces.push({ group, ...sorted[2] });
  }

  // Pick 8 best 3rd places
  thirdPlaces.sort((a, b) => {
    if (a.pts !== b.pts) return b.pts - a.pts;
    if (a.gd !== b.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
  const bestThirds = thirdPlaces.slice(0, 8).map(t => t.team);
  
  // Helpers to resolve knockout placeholders
  function resolvePlaceholder(ph) {
    if (topTeams[ph]) return topTeams[ph];
    if (ph.startsWith('3e Groupes')) {
      return bestThirds.pop() || 'Unknown 3rd';
    }
    return ph; // Fallback
  }

  // 4. Simulate Knockout Matches sequentially
  const knockoutMatches = matches.filter(m => m.match_date >= '2026-06-28T00:00:00Z');
  
  let knockoutMap = {}; // Maps match ID or generic name to the winner/loser
  // In `reset-matches.js`, we used placeholders like 'Vainqueur S1'. We need to know which match is S1.
  // The first 16 knockout matches are R32 (S1 to S16).
  let r32_counter = 1;
  let r16_counter = 1;
  let qf_counter = 1;
  let sf_counter = 1;

  console.log(`🏆 Simulation des ${knockoutMatches.length} matchs à élimination directe...`);
  
  for (const m of knockoutMatches) {
    // Resolve home and away names
    let homeName = m.team_home;
    let awayName = m.team_away;

    // Resolve group stage placeholders (1er Groupe X, etc.)
    if (homeName.includes('Groupe')) homeName = resolvePlaceholder(homeName);
    if (awayName.includes('Groupe')) awayName = resolvePlaceholder(awayName);

    // Resolve previous knockout winners
    if (homeName.startsWith('Vainqueur') || homeName.startsWith('Perdant')) homeName = knockoutMap[homeName] || homeName;
    if (awayName.startsWith('Vainqueur') || awayName.startsWith('Perdant')) awayName = knockoutMap[awayName] || awayName;

    // Simulate match
    let scoreH = getRandomScore(3);
    let scoreA = getRandomScore(3);
    if (scoreH === scoreA) scoreH++; // No draws in knockout

    // Update DB with real names and scores
    await supabase.from('matches').update({
      team_home: homeName,
      team_away: awayName,
      score_home: scoreH,
      score_away: scoreA,
      status: 'FINISHED'
    }).eq('id', m.id);

    const winner = scoreH > scoreA ? homeName : awayName;
    const loser = scoreH > scoreA ? awayName : homeName;

    // Save winner/loser for the next rounds based on round identifiers
    // We can infer the match label based on date and order.
    // 16 matches of R32
    if (m.match_date < '2026-07-04T22:00:00Z') {
      knockoutMap[`Vainqueur S${r32_counter}`] = winner;
      r32_counter++;
    } 
    // 8 matches of R16
    else if (m.match_date >= '2026-07-04T22:00:00Z' && m.match_date < '2026-07-09T00:00:00Z') {
      knockoutMap[`Vainqueur H${r16_counter}`] = winner;
      r16_counter++;
    }
    // 4 matches of QF
    else if (m.match_date >= '2026-07-09T00:00:00Z' && m.match_date < '2026-07-14T00:00:00Z') {
      knockoutMap[`Vainqueur QF${qf_counter}`] = winner;
      qf_counter++;
    }
    // 2 matches of SF
    else if (m.match_date >= '2026-07-14T00:00:00Z' && m.match_date < '2026-07-18T00:00:00Z') {
      knockoutMap[`Vainqueur SF${sf_counter}`] = winner;
      knockoutMap[`Perdant SF${sf_counter}`] = loser;
      sf_counter++;
    }
  }

  console.log('✅ Simulation terminée ! Tous les matchs ont des scores et les phases finales affichent les vraies équipes !');
}

main();
