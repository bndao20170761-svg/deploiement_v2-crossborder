const fs = require('fs');
const path = require('path');
const filePath = path.resolve('src/utils/translations.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const entries = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*\{/);
  if (!match) continue;
  const key = match[1];
  let depth = 0;
  let end = -1;
  for (let j = i; j < lines.length; j++) {
    const row = lines[j];
    for (const char of row) {
      if (char === '{') depth++;
      else if (char === '}') depth--;
    }
    if (depth === 0) {
      end = j;
      break;
    }
  }
  if (end === -1) {
    throw new Error(`Unterminated object for key ${key} starting at line ${i + 1}`);
  }
  entries.push({ key, start: i, end });
  i = end;
}
const lastIndex = new Map();
entries.forEach((entry, index) => lastIndex.set(entry.key, index));
const linesToRemove = new Set();
entries.forEach((entry, index) => {
  if (lastIndex.get(entry.key) !== index) {
    for (let k = entry.start; k <= entry.end; k++) {
      linesToRemove.add(k);
    }
  }
});
const newLines = lines.filter((_, idx) => !linesToRemove.has(idx));
fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Wrote deduped translations.js');
