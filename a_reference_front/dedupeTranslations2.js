const fs = require('fs');
const path = require('path');
const filePath = path.resolve('src/utils/translations.js');
const content = fs.readFileSync(filePath, 'utf8');
const regex = /\b([A-Za-z0-9_]+)\s*:\s*\{/g;
const entries = [];
let match;
while ((match = regex.exec(content)) !== null) {
  const key = match[1];
  const start = match.index;
  let depth = 0;
  let end = -1;
  for (let i = start; i < content.length; i++) {
    const c = content[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    if (depth === 0) {
      end = i + 1; // include closing brace
      break;
    }
  }
  if (end === -1) {
    throw new Error(`Unterminated object for key ${key}`);
  }
  entries.push({ key, start, end });
}
const lastOccurrence = new Map();
entries.forEach((entry, index) => lastOccurrence.set(entry.key, index));
const keep = Array(content.length).fill(true);
entries.forEach((entry, index) => {
  if (lastOccurrence.get(entry.key) !== index) {
    for (let pos = entry.start; pos < entry.end; pos++) keep[pos] = false;
  }
});
let result = '';
for (let i = 0; i < content.length; i++) {
  if (keep[i]) result += content[i];
}
fs.writeFileSync(filePath, result, 'utf8');
console.log('Wrote deduped translations.js via dedupeTranslations2');
