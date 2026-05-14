const fs = require('fs');
const lines = fs.readFileSync('src/utils/translations.js', 'utf8').split('\n');
const positions = [1470, 2604, 2968, 2580, 2656, 2950];
for (const pos of positions) {
  console.log('--- line', pos, '---');
  for (let i = Math.max(0, pos - 4); i < Math.min(lines.length, pos + 4); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
