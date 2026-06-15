const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const nameMap = {
  'Mexique': 'Mexico',
  'Afrique du Sud': 'South Africa',
  'Corée du Sud': 'Korea Republic',
  'Rép. tchèque': 'Czechia',
  'Canada': 'Canada',
  'Bosnie-Herzégovine': 'Bosnia-Herzegovina',
  'Etats-Unis': 'USA',
  'États-Unis': 'USA',
  'Paraguay': 'Paraguay',
  'Qatar': 'Qatar',
  'Suisse': 'Switzerland',
  'Brésil': 'Brazil',
  'Maroc': 'Morocco',
  'Haiti': 'Haiti',
  'Haïti': 'Haiti',
  'Écosse': 'Scotland',
  'Australie': 'Australia',
  'Turquie': 'Türkiye',
  'Allemagne': 'Germany',
  'Curaçao': 'Curaçao',
  'Pays-Bas': 'Netherlands',
  'Japon': 'Japan',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Equateur': 'Ecuador',
  'Équateur': 'Ecuador',
  'Suède': 'Sweden',
  'Tunisie': 'Tunisia',
  'Belgique': 'Belgium',
  'Egypte': 'Egypt',
  'Égypte': 'Egypt',
  'Arabie saoudite': 'Saudi Arabia',
  'Iran': 'Iran',
  'Nouvelle-Zélande': 'New Zealand',
  'France': 'France',
  'Sénégal': 'Senegal',
  'Irak': 'Iraq',
  'Norvège': 'Norway',
  'Argentine': 'Argentina',
  'Algérie': 'Algeria',
  'Autriche': 'Austria',
  'Jordanie': 'Jordan',
  'Portugal': 'Portugal',
  'RD Congo': 'DR Congo',
  'Angleterre': 'England',
  'Croatie': 'Croatia',
  'Ghana': 'Ghana',
  'Panama': 'Panama',
  'Ouzbékistan': 'Uzbekistan',
  'Colombie': 'Colombia',
  'Uruguay': 'Uruguay',
  'Cap-Vert': 'Cape Verde',
  'Spain': 'Spain'
};

function mapTeam(name) {
  const clean = name.trim();
  return nameMap[clean] || clean;
}

const GROUP_MATCHES = [
  // Column 1
  { home: 'Mexique', away: 'Afrique du Sud', date: '2026-06-11T19:00:00Z', group: 'A', round: '1' },
  { home: 'Corée du Sud', away: 'Rép. tchèque', date: '2026-06-12T00:00:00Z', group: 'A', round: '1' },
  { home: 'Canada', away: 'Bosnie-Herzégovine', date: '2026-06-12T16:00:00Z', group: 'B', round: '1' },
  { home: 'Etats-Unis', away: 'Paraguay', date: '2026-06-13T01:00:00Z', group: 'D', round: '1' },
  { home: 'Qatar', away: 'Suisse', date: '2026-06-13T16:00:00Z', group: 'B', round: '1' },
  { home: 'Brésil', away: 'Maroc', date: '2026-06-14T22:00:00Z', group: 'C', round: '1' },
  { home: 'Haiti', away: 'Écosse', date: '2026-06-14T01:00:00Z', group: 'C', round: '1' },
  { home: 'Australie', away: 'Turquie', date: '2026-06-14T04:00:00Z', group: 'D', round: '1' },
  { home: 'Allemagne', away: 'Curaçao', date: '2026-06-14T17:00:00Z', group: 'E', round: '1' },
  { home: 'Pays-Bas', away: 'Japon', date: '2026-06-14T20:00:00Z', group: 'F', round: '1' },
  { home: 'Côte d\'Ivoire', away: 'Equateur', date: '2026-06-15T00:00:00Z', group: 'E', round: '1' },
  { home: 'Suède', away: 'Tunisie', date: '2026-06-15T03:00:00Z', group: 'F', round: '1' },
  { home: 'Belgique', away: 'Egypte', date: '2026-06-15T16:00:00Z', group: 'G', round: '1' },
  { home: 'Arabie saoudite', away: 'Uruguay', date: '2026-06-16T00:00:00Z', group: 'H', round: '1' },
  { home: 'Iran', away: 'Nouvelle-Zélande', date: '2026-06-16T03:00:00Z', group: 'G', round: '1' },
  { home: 'France', away: 'Sénégal', date: '2026-06-16T16:00:00Z', group: 'I', round: '1' },
  { home: 'Irak', away: 'Norvège', date: '2026-06-16T19:00:00Z', group: 'I', round: '1' },
  { home: 'Argentine', away: 'Algérie', date: '2026-06-17T00:00:00Z', group: 'J', round: '1' },
  { home: 'Autriche', away: 'Jordanie', date: '2026-06-17T03:00:00Z', group: 'J', round: '1' },
  { home: 'Portugal', away: 'RD Congo', date: '2026-06-17T17:00:00Z', group: 'K', round: '1' },

  // Column 2
  { home: 'Angleterre', away: 'Croatie', date: '2026-06-17T20:00:00Z', group: 'L', round: '1' },
  { home: 'Ghana', away: 'Panama', date: '2026-06-18T03:00:00Z', group: 'L', round: '1' },
  { home: 'Ouzbékistan', away: 'Colombie', date: '2026-06-18T17:00:00Z', group: 'K', round: '1' },
  { home: 'Rép. tchèque', away: 'Afrique du Sud', date: '2026-06-18T16:00:00Z', group: 'A', round: '2' },
  { home: 'Suisse', away: 'Bosnie-Herzégovine', date: '2026-06-18T14:00:00Z', group: 'B', round: '2' },
  { home: 'Canada', away: 'Qatar', date: '2026-06-19T22:00:00Z', group: 'B', round: '2' },
  { home: 'Mexique', away: 'Corée du Sud', date: '2026-06-19T01:00:00Z', group: 'A', round: '2' },
  { home: 'Etats-Unis', away: 'Australie', date: '2026-06-19T16:00:00Z', group: 'D', round: '2' },
  { home: 'Écosse', away: 'Maroc', date: '2026-06-20T22:00:00Z', group: 'C', round: '2' },
  { home: 'Brésil', away: 'Haiti', date: '2026-06-20T01:00:00Z', group: 'C', round: '2' },
  { home: 'Turquie', away: 'Paraguay', date: '2026-06-20T14:00:00Z', group: 'D', round: '2' },
  { home: 'Allemagne', away: 'Côte d\'Ivoire', date: '2026-06-20T17:00:00Z', group: 'E', round: '2' },
  { home: 'Équateur', away: 'Curaçao', date: '2026-06-21T00:00:00Z', group: 'E', round: '2' },
  { home: 'Tunisie', away: 'Japon', date: '2026-06-21T03:00:00Z', group: 'F', round: '2' },
  { home: 'Pays-Bas', away: 'Suède', date: '2026-06-21T16:00:00Z', group: 'F', round: '2' },
  { home: 'Espagne', away: 'Arabie saoudite', date: '2026-06-21T19:00:00Z', group: 'H', round: '2' },
  { home: 'Belgique', away: 'Iran', date: '2026-06-21T14:00:00Z', group: 'G', round: '2' },
  { home: 'Uruguay', away: 'Cap-Vert', date: '2026-06-22T22:00:00Z', group: 'H', round: '2' },
  { home: 'Nouvelle-Zélande', away: 'Égypte', date: '2026-06-22T20:00:00Z', group: 'G', round: '2' },
  { home: 'Argentine', away: 'Autriche', date: '2026-06-22T17:00:00Z', group: 'J', round: '2' },
  { home: 'Algérie', away: 'Jordanie', date: '2026-06-22T14:00:00Z', group: 'J', round: '2' },
  { home: 'France', away: 'Irak', date: '2026-06-22T01:00:00Z', group: 'I', round: '2' },

  // Column 3
  { home: 'Norvège', away: 'Sénégal', date: '2026-06-23T00:00:00Z', group: 'I', round: '2' },
  { home: 'Espagne', away: 'Cap-Vert', date: '2026-06-15T16:00:00Z', group: 'H', round: '1' },
  { home: 'Portugal', away: 'Ouzbékistan', date: '2026-06-23T17:00:00Z', group: 'K', round: '2' },
  { home: 'Angleterre', away: 'Ghana', date: '2026-06-23T21:00:00Z', group: 'L', round: '2' },
  { home: 'Panama', away: 'Croatie', date: '2026-06-24T11:00:00Z', group: 'L', round: '3' },
  { home: 'Colombie', away: 'RD Congo', date: '2026-06-24T20:00:00Z', group: 'K', round: '2' },
  { home: 'Suisse', away: 'Canada', date: '2026-06-24T14:00:00Z', group: 'B', round: '3' },
  { home: 'Bosnie-Herzégovine', away: 'Qatar', date: '2026-06-24T14:00:00Z', group: 'B', round: '3' },
  { home: 'Maroc', away: 'Haiti', date: '2026-06-25T21:00:00Z', group: 'C', round: '3' },
  { home: 'Écosse', away: 'Brésil', date: '2026-06-25T21:00:00Z', group: 'C', round: '3' },
  { home: 'Rép. tchèque', away: 'Mexique', date: '2026-06-25T01:00:00Z', group: 'A', round: '3' },
  { home: 'Afrique du Sud', away: 'Corée du Sud', date: '2026-06-25T01:00:00Z', group: 'A', round: '3' },
  { home: 'Équateur', away: 'Allemagne', date: '2026-06-25T20:00:00Z', group: 'E', round: '3' },
  { home: 'Curaçao', away: 'Côte d\'Ivoire', date: '2026-06-25T20:00:00Z', group: 'E', round: '3' },
  { home: 'Tunisie', away: 'Pays-Bas', date: '2026-06-26T22:00:00Z', group: 'F', round: '3' },
  { home: 'Japon', away: 'Suède', date: '2026-06-26T22:00:00Z', group: 'F', round: '3' },
  { home: 'Turquie', away: 'Etats-Unis', date: '2026-06-26T14:00:00Z', group: 'D', round: '3' },
  { home: 'Paraguay', away: 'Australie', date: '2026-06-26T02:00:00Z', group: 'D', round: '3' },
  { home: 'Norvège', away: 'France', date: '2026-06-26T02:00:00Z', group: 'I', round: '3' },
  { home: 'Sénégal', away: 'Irak', date: '2026-06-26T10:00:00Z', group: 'I', round: '3' },
  { home: 'Uruguay', away: 'Espagne', date: '2026-06-28T00:00:00Z', group: 'H', round: '3' },

  // Column 4
  { home: 'Cap-Vert', away: 'Arabie saoudite', date: '2026-06-27T00:00:00Z', group: 'H', round: '3' },
  { home: 'Égypte', away: 'Iran', date: '2026-06-27T03:00:00Z', group: 'G', round: '3' },
  { home: 'Nouvelle-Zélande', away: 'Belgique', date: '2026-06-27T23:30:00Z', group: 'G', round: '3' },
  { home: 'Croatie', away: 'Ghana', date: '2026-06-27T21:00:00Z', group: 'L', round: '3' },
  { home: 'Panama', away: 'Angleterre', date: '2026-06-27T21:00:00Z', group: 'L', round: '3' },
  { home: 'Colombie', away: 'Portugal', date: '2026-06-28T23:30:00Z', group: 'K', round: '3' },
  { home: 'RD Congo', away: 'Ouzbékistan', date: '2026-06-28T23:30:00Z', group: 'K', round: '3' },
  { home: 'Jordanie', away: 'Argentine', date: '2026-06-28T02:00:00Z', group: 'J', round: '3' },
  { home: 'Algérie', away: 'Autriche', date: '2026-06-28T02:00:00Z', group: 'J', round: '3' }
];

const KNOCKOUT_MATCHES = [
  // Tour de 32 (16 matches)
  { team_home: '2e gr. A', team_away: '2e gr. B', match_date: '2026-06-28T16:00:00Z', round: 'R32' },
  { team_home: '1er gr. C', team_away: '2e gr. F', match_date: '2026-06-28T20:00:00Z', round: 'R32' },
  { team_home: '1er gr. E', team_away: '3e gr. A/B/C/D/F', match_date: '2026-06-29T16:00:00Z', round: 'R32' },
  { team_home: '1er gr. F', team_away: '2e gr. C', match_date: '2026-06-29T20:00:00Z', round: 'R32' },
  { team_home: '2e gr. E', team_away: '2e gr. I', match_date: '2026-06-30T16:00:00Z', round: 'R32' },
  { team_home: '1er gr. I', team_away: '3e gr. C/D/F/G/H', match_date: '2026-06-30T20:00:00Z', round: 'R32' },
  { team_home: '1er gr. A', team_away: '3e gr. C/E/F/H/I', match_date: '2026-07-01T16:00:00Z', round: 'R32' },
  { team_home: '1er gr. G', team_away: '3e gr. A/E/H/I/J', match_date: '2026-07-01T20:00:00Z', round: 'R32' },
  { team_home: '1er gr. L', team_away: '3e gr. E/H/I/J/K', match_date: '2026-07-01T20:00:00Z', round: 'R32' },
  { team_home: '1er gr. D', team_away: '3e gr. B/E/F/I/J', match_date: '2026-07-02T16:00:00Z', round: 'R32' },
  { team_home: '1er gr. H', team_away: '2e gr. J', match_date: '2026-07-02T20:00:00Z', round: 'R32' },
  { team_home: '1er gr. B', team_away: '3e gr. E/F/G/I/J', match_date: '2026-07-03T15:00:00Z', round: 'R32' },
  { team_home: '2e gr. K', team_away: '2e gr. L', match_date: '2026-07-03T16:00:00Z', round: 'R32' },
  { team_home: '2e gr. D', team_away: '2e gr. G', match_date: '2026-07-03T18:00:00Z', round: 'R32' },
  { team_home: '1er gr. J', team_away: '2e gr. C', match_date: '2026-07-04T15:00:00Z', round: 'R32' },
  { team_home: '1er gr. K', team_away: '3e gr. D/E/I/J/L', match_date: '2026-07-04T18:30:00Z', round: 'R32' },

  // Huitièmes de finale (8 matches)
  { team_home: 'Vq. S1', team_away: 'Vq. S2', match_date: '2026-07-04T22:00:00Z', round: 'R16' },
  { team_home: 'Vq. S3', team_away: 'Vq. S4', match_date: '2026-07-05T15:00:00Z', round: 'R16' },
  { team_home: 'Vq. S5', team_away: 'Vq. S6', match_date: '2026-07-05T20:00:00Z', round: 'R16' },
  { team_home: 'Vq. S7', team_away: 'Vq. S8', match_date: '2026-07-05T22:30:00Z', round: 'R16' },
  { team_home: 'Vq. S9', team_away: 'Vq. S10', match_date: '2026-07-06T15:00:00Z', round: 'R16' },
  { team_home: 'Vq. S11', team_away: 'Vq. S12', match_date: '2026-07-06T20:00:00Z', round: 'R16' },
  { team_home: 'Vq. S13', team_away: 'Vq. S14', match_date: '2026-07-07T15:00:00Z', round: 'R16' },
  { team_home: 'Vq. S15', team_away: 'Vq. S16', match_date: '2026-07-07T18:00:00Z', round: 'R16' },

  // Quarts de finale (4 matches)
  { team_home: 'Vq. H1', team_away: 'Vq. H2', match_date: '2026-07-09T15:00:00Z', round: 'QF' },
  { team_home: 'Vq. H3', team_away: 'Vq. H4', match_date: '2026-07-10T18:00:00Z', round: 'QF' },
  { team_home: 'Vq. H5', team_away: 'Vq. H6', match_date: '2026-07-11T15:00:00Z', round: 'QF' },
  { team_home: 'Vq. H7', team_away: 'Vq. H8', match_date: '2026-07-12T17:00:00Z', round: 'QF' },

  // Demi-finales (2 matches)
  { team_home: 'Vq. Q1', team_away: 'Vq. Q2', match_date: '2026-07-14T18:00:00Z', round: 'SF' },
  { team_home: 'Vq. Q3', team_away: 'Vq. Q4', match_date: '2026-07-15T18:00:00Z', round: 'SF' },

  // 3e place (1 match)
  { team_home: 'Perd. D1', team_away: 'Perd. D2', match_date: '2026-07-18T21:00:00Z', round: '3RD' },

  // Finale (1 match)
  { team_home: 'Vq. D1', team_away: 'Vq. D2', match_date: '2026-07-19T19:00:00Z', round: 'FINAL' }
];

async function main() {
  console.log("Cleaning up all matches...");
  const { error: deleteError } = await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error("Error deleting matches:", deleteError);
    return;
  }

  console.log("Inserting group matches...");
  const groupRows = GROUP_MATCHES.map(m => ({
    team_home: mapTeam(m.home),
    team_away: mapTeam(m.away),
    match_date: m.date,
    status: 'UPCOMING',
    score_home: null,
    score_away: null
  }));

  const { error: insertGroupError } = await supabase.from('matches').insert(groupRows);
  if (insertGroupError) {
    console.error("Error inserting group matches:", insertGroupError);
    return;
  }
  console.log(`Inserted ${groupRows.length} group matches successfully.`);

  console.log("Inserting knockout matches...");
  const knockoutRows = KNOCKOUT_MATCHES.map(m => ({
    team_home: m.team_home,
    team_away: m.team_away,
    match_date: m.match_date,
    status: 'UPCOMING',
    score_home: null,
    score_away: null
  }));

  const { error: insertKnockoutError } = await supabase.from('matches').insert(knockoutRows);
  if (insertKnockoutError) {
    console.error("Error inserting knockout matches:", insertKnockoutError);
    return;
  }
  console.log(`Inserted ${knockoutRows.length} knockout matches successfully.`);
}

main();
