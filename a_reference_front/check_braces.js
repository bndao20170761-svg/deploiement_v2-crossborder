const fs = require('fs');
const path = 'C:\\Users\\babac\\Desktop\\Babacar Ndao\\Master2 GL\\deploiement\\vesion_2_enda_crossborder\\a_reference_front\\src\\utils\\translations.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

let depth = 0;
let inString = false;
let stringChar = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (inString) {
      if (ch === stringChar && line[j-1] !== '\\') inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth < 0) {
        console.log('Line ' + (i+1) + ': depth went negative: ' + line.trim().substring(0, 80));
      }
    }
  }
}
console.log('Final depth: ' + depth);

// Now find where depth jumps unexpectedly
depth = 0;
inString = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let prevDepth = depth;
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (inString) {
      if (ch === stringChar && line[j-1] !== '\\') inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
  if (depth !== prevDepth) {
    console.log('Line ' + (i+1) + ': depth changed from ' + prevDepth + ' to ' + depth + ' | ' + line.trim().substring(0, 80));
  }
}