const fs = require('fs');
const en = fs.readFileSync('portfolio/index.html', 'utf8');
const ar = fs.readFileSync('ar/portfolio/index.html', 'utf8');

const bad = ['l-1.webp', 'l-2.webp', 'l-3.webp', 'm-1.webp', 'm-2.webp', 'm-3.webp', 'n-1.webp', 'n-2.webp', 'n-3.webp'];
let clean = true;
bad.forEach(b => {
  if (en.includes('Portofolio/' + b)) { console.log('EN still has: ' + b); clean = false; }
  if (ar.includes('Portofolio/' + b)) { console.log('AR still has: ' + b); clean = false; }
});
if (clean) console.log('✅ No case study covers found in masonry gallery!');

const enMasonry = (en.match(/masonry-item/g) || []).length;
const arMasonry = (ar.match(/masonry-item/g) || []).length;
console.log('EN masonry items:', enMasonry);
console.log('AR masonry items:', arMasonry);
