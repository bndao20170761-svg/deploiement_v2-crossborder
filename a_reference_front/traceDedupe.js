const fs = require('fs');
const lines = fs.readFileSync('src/utils/translations.js', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(/^\s*([A-Za-z0-9_]+)\s*:\s*\{/);
  if (!match) continue;
  const key = match[1];
  if (key !== 'allergie') continue;
  console.log('START', i+1, lines[i]);
  let depth = 0;
  for (let j = i; j < Math.min(lines.length, i + 10); j++) {
    const row = lines[j];
    let delta = 0;
    for (const char of row) {
      if (char === '{') delta++;
      else if (char === '}') delta--;
    }
    depth += delta;
    console.log('  line', j+1, 'delta', delta, 'depth', depth, JSON.stringify(row));
    if (depth === 0) {
      console.log('  END at', j+1);
      break;
    }
  }
}
