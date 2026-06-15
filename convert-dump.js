const fs = require('fs');
const content = fs.readFileSync('matches-dump.json', 'utf16le');
fs.writeFileSync('matches-utf8.json', content, 'utf8');
console.log("Converted!");
