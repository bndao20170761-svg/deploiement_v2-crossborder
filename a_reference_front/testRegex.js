const fs = require('fs');
const lines = fs.readFileSync('src/utils/translations.js', 'utf8').split('\n');
[2604,2968].forEach(lineNo => {
  const line = lines[lineNo-1];
  console.log('LINE', lineNo, JSON.stringify(line));
  console.log('MATCH', !!line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*\{/), line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*\{/));
});
