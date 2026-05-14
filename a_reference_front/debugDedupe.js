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
  if (end === -1) throw new Error('unterminated ' + key + ' at ' + (i+1));
  entries.push({ key, start: i+1, end: end+1 });
  i = end;
}
const map = new Map();
entries.forEach((entry, idx) => {
  const arr = map.get(entry.key) || [];
  arr.push(entry);
  map.set(entry.key, arr);
});
for (const [key, arr] of map.entries()) {
  if (arr.length > 1) {
    console.log('KEY', key, 'COUNT', arr.length, 'RANGES', arr.map(e=>`${e.start}-${e.end}`).join(', '));
  }
}
const allergie = map.get('allergie');
console.log('ALLERGIE RANGES', allergie.map(e=>`${e.start}-${e.end}`));
