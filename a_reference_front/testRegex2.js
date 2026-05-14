const fs = require('fs');
const lines = fs.readFileSync('src/utils/translations.js', 'utf8').split('\n');
const regex = /^\s*([A-Za-z0-9_]+)\s*:\s*\{/;
const matches = [];
lines.forEach((line, index) => {
  const match = line.match(regex);
  if (match) matches.push({ line: index + 1, key: match[1], text: line });
});
console.log('matched count', matches.length);
console.log(matches.slice(0, 20));
console.log('...');
console.log(matches.filter(m=>m.key==='allergie').map(m=>m.line));
