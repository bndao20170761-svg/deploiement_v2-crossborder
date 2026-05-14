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
  if (end === -1) {
    throw new Error('unterminated ' + key + ' at ' + (i+1));
  }
  entries.push({ key, start: i+1, end: end+1, text: lines[i] });
  i = end;
}
console.log('total entries', entries.length);
const allergieEntries = entries.filter(e=>e.key==='allergie');
console.log('allergie count', allergieEntries.length, allergieEntries.map(e=>`${e.start}-${e.end}`));
const sample = entries.filter(e=>['hopitalDestination','medecinDestinataire','temporalInformation','allergie'].includes(e.key)).slice(0,20);
console.log('sample', sample.map(e=>`${e.key}:${e.start}-${e.end}`));
