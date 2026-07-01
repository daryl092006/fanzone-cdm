const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const KNOCKOUT_MATCHES = [
  // Tour de 32 (16 matches)
  { slot: 'R32-01', team_home: '2e gr. A', team_away: '2e gr. B', match_date: '2026-06-28T16:00:00Z', round: 'R32' },
  { slot: 'R32-02', team_home: '1er gr. C', team_away: '2e gr. F', match_date: '2026-06-28T20:00:00Z', round: 'R32' },
  { slot: 'R32-03', team_home: '1er gr. E', team_away: '3e gr. A/B/C/D/F', match_date: '2026-06-29T16:00:00Z', round: 'R32' },
  { slot: 'R32-04', team_home: '1er gr. F', team_away: '2e gr. C', match_date: '2026-06-29T20:00:00Z', round: 'R32' },
  { slot: 'R32-05', team_home: '2e gr. E', team_away: '2e gr. I', match_date: '2026-06-30T16:00:00Z', round: 'R32' },
  { slot: 'R32-06', team_home: '1er gr. I', team_away: '3e gr. C/D/F/G/H', match_date: '2026-06-30T20:00:00Z', round: 'R32' },
  { slot: 'R32-07', team_home: '1er gr. A', team_away: '3e gr. C/E/F/H/I', match_date: '2026-07-01T16:00:00Z', round: 'R32' },
  { slot: 'R32-08', team_home: '1er gr. G', team_away: '3e gr. A/E/H/I/J', match_date: '2026-07-01T20:00:00Z', round: 'R32' },
  { slot: 'R32-09', team_home: '1er gr. L', team_away: '3e gr. E/H/I/J/K', match_date: '2026-07-01T20:00:00Z', round: 'R32' },
  { slot: 'R32-10', team_home: '1er gr. D', team_away: '3e gr. B/E/F/I/J', match_date: '2026-07-02T16:00:00Z', round: 'R32' },
  { slot: 'R32-11', team_home: '1er gr. H', team_away: '2e gr. J', match_date: '2026-07-02T20:00:00Z', round: 'R32' },
  { slot: 'R32-12', team_home: '1er gr. B', team_away: '3e gr. E/F/G/I/J', match_date: '2026-07-03T15:00:00Z', round: 'R32' },
  { slot: 'R32-13', team_home: '2e gr. K', team_away: '2e gr. L', match_date: '2026-07-03T16:00:00Z', round: 'R32' },
  { slot: 'R32-14', team_home: '2e gr. D', team_away: '2e gr. G', match_date: '2026-07-03T18:00:00Z', round: 'R32' },
  { slot: 'R32-15', team_home: '1er gr. J', team_away: '2e gr. C', match_date: '2026-07-04T15:00:00Z', round: 'R32' },
  { slot: 'R32-16', team_home: '1er gr. K', team_away: '3e gr. D/E/I/J/L', match_date: '2026-07-04T18:30:00Z', round: 'R32' },

  // Huitièmes de finale (8 matches)
  { slot: 'R16-01', team_home: 'Vq. S1', team_away: 'Vq. S2', match_date: '2026-07-04T22:00:00Z', round: 'R16' },
  { slot: 'R16-02', team_home: 'Vq. S3', team_away: 'Vq. S4', match_date: '2026-07-05T15:00:00Z', round: 'R16' },
  { slot: 'R16-03', team_home: 'Vq. S5', team_away: 'Vq. S6', match_date: '2026-07-05T20:00:00Z', round: 'R16' },
  { slot: 'R16-04', team_home: 'Vq. S7', team_away: 'Vq. S8', match_date: '2026-07-05T22:30:00Z', round: 'R16' },
  { slot: 'R16-05', team_home: 'Vq. S9', team_away: 'Vq. S10', match_date: '2026-07-06T15:00:00Z', round: 'R16' },
  { slot: 'R16-06', team_home: 'Vq. S11', team_away: 'Vq. S12', match_date: '2026-07-06T20:00:00Z', round: 'R16' },
  { slot: 'R16-07', team_home: 'Vq. S13', team_away: 'Vq. S14', match_date: '2026-07-07T15:00:00Z', round: 'R16' },
  { slot: 'R16-08', team_home: 'Vq. S15', team_away: 'Vq. S16', match_date: '2026-07-07T18:00:00Z', round: 'R16' },

  // Quarts de finale (4 matches)
  { slot: 'QF-01', team_home: 'Vq. H1', team_away: 'Vq. H2', match_date: '2026-07-09T15:00:00Z', round: 'QF' },
  { slot: 'QF-02', team_home: 'Vq. H3', team_away: 'Vq. H4', match_date: '2026-07-10T18:00:00Z', round: 'QF' },
  { slot: 'QF-03', team_home: 'Vq. H5', team_away: 'Vq. H6', match_date: '2026-07-11T15:00:00Z', round: 'QF' },
  { slot: 'QF-04', team_home: 'Vq. H7', team_away: 'Vq. H8', match_date: '2026-07-12T17:00:00Z', round: 'QF' },

  // Demi-finales (2 matches)
  { slot: 'SF-01', team_home: 'Vq. Q1', team_away: 'Vq. Q2', match_date: '2026-07-14T18:00:00Z', round: 'SF' },
  { slot: 'SF-02', team_home: 'Vq. Q3', team_away: 'Vq. Q4', match_date: '2026-07-15T18:00:00Z', round: 'SF' },

  // 3e place (1 match)
  { slot: '3RD', team_home: 'Perd. D1', team_away: 'Perd. D2', match_date: '2026-07-18T21:00:00Z', round: '3RD' },

  // Finale (1 match)
  { slot: 'FINAL', team_home: 'Vq. D1', team_away: 'Vq. D2', match_date: '2026-07-19T19:00:00Z', round: 'FINAL' }
];

async function run() {
  const { data: dbMatches, error } = await supabase
    .from('matches')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`DB Matches loaded: ${dbMatches.length}`);

  KNOCKOUT_MATCHES.forEach(ko => {
    // Find matching DB matches by match_date
    const matchesForDate = dbMatches.filter(m => {
      const d1 = new Date(m.match_date).toISOString();
      const d2 = new Date(ko.match_date).toISOString();
      return d1 === d2;
    });

    if (matchesForDate.length === 1) {
      const m = matchesForDate[0];
      console.log(`Slot: ${ko.slot} (${ko.team_home} vs ${ko.team_away}) -> DB Match ID: ${m.id} | ${m.team_home} vs ${m.team_away} | Status: ${m.status}`);
    } else if (matchesForDate.length > 1) {
      // Resolve by team_home
      const m = matchesForDate.find(dbM => {
        if (ko.team_home === '1er gr. G') {
          return dbM.team_home.toLowerCase().includes('belg') || dbM.team_home.toLowerCase().includes('bosn');
        }
        if (ko.team_home === '1er gr. L') {
          return dbM.team_home.toLowerCase().includes('engl') || dbM.team_home.toLowerCase().includes('ghan');
        }
        return false;
      });
      if (m) {
        console.log(`Slot: ${ko.slot} (${ko.team_home} vs ${ko.team_away}) -> DB Match ID: ${m.id} | ${m.team_home} vs ${m.team_away} | Status: ${m.status}`);
      } else {
        console.log(`Slot: ${ko.slot} (${ko.team_home} vs ${ko.team_away}) -> MULTIPLE MATCHES FOUND:`, matchesForDate.map(x => `${x.id} (${x.team_home} vs ${x.team_away})`));
      }
    } else {
      console.log(`Slot: ${ko.slot} (${ko.team_home} vs ${ko.team_away}) -> NOT FOUND IN DB`);
    }
  });
}
run();
