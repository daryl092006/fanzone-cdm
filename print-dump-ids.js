const fs = require('fs');
let content = fs.readFileSync('matches-utf8.json', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
const dump = JSON.parse(content);
console.log("Total matches in dump:", dump.length);

const kos = dump.slice(72);
kos.forEach((m, i) => {
  console.log(`${i+73}. id: ${m.id} | ${m.team_home} vs ${m.team_away} | date: ${m.match_date}`);
});
