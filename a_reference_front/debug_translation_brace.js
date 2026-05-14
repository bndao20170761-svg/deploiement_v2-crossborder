const fs = require('fs');
const lines = fs.readFileSync('src/utils/translations.js', 'utf8').split(/\r?\n/);
let depth = 0;
let inString = false;
let stringChar = '';
let escaped = false;
for (let i = 1100; i < 1205; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === stringChar) {
        inString = false;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
  console.log(`${i + 1}: depth=${depth} | ${line}`);
}
