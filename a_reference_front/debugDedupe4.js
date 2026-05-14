const fs = require('fs');
const lines = fs.readFileSync('src/utils/translations.js', 'utf8').split('\n');
const entries = [];
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(/^\s*([A-Za-z0-9_]+)\s*:\s*\{/);
  if (!match) continue;
  const key = match[1];
  let depth = 0;
  let end = -1;
  for (let j = i; j < lines.length; j++) {
    for (const char of lines[j]) {
      if (char === '{') depth++;
      else if (char === '}') depth--;
    }
    if (depth === 0) {
      end = j;
      break;
    }
  }
  if (end === -1) throw new Error('unterminated ' + key + ' at ' + (i + 1));
  entries.push({ key, start: i + 1, end: end + 1 });
  i = end;
}
console.log('total entries', entries.length);
const allergie = entries.filter(e => e.key === 'allergie');
console.log('allergie count', allergie.length, allergie.map(e => `${e.start}-${e.end}`));
const matching = lines
  .map((line, idx) => ({ line, idx }))
  .filter(({ line }) => /^\s*allergie\s*:\s*\{/.test(line))
  .map(({ idx }) => idx + 1);
console.log('matching lines', matching);
