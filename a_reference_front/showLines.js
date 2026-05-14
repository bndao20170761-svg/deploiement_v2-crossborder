const fs = require('fs');
const lines = fs.readFileSync('src/utils/translations.js', 'utf8').split('\n');
const ranges = [1748, 1749, 1750, 1751, 1752, 1753, 1754, 1755, 1756, 1757, 1758, 1759, 1760, 1761, 1762];
ranges.forEach(n => console.log(n + ': ' + (lines[n-1] || '')));
