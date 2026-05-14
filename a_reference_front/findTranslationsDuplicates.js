const fs = require('fs');
const content = fs.readFileSync('src/utils/translations.js', 'utf8');
const regex = /([A-Za-z0-9_]+)\s*:\s*\{\s*fr\s*:/g;
const counts = new Map();
let m;
while ((m = regex.exec(content)) !== null) {
  const key = m[1];
  const pos = content.slice(0, m.index).split('\n').length;
  const arr = counts.get(key) || [];
  arr.push(pos);
  counts.set(key, arr);
}
const duplicates = [...counts.entries()].filter(([, v]) => v.length > 1).sort((a,b)=>b[1].length-a[1].length || a[0].localeCompare(b[0]));
console.log('duplicate keys:', duplicates.length);
duplicates.forEach(([k,v]) => console.log(k, v.length, v.join(',')));
