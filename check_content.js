const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('assets')) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.html') && !file.includes('flaticon')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(__dirname);
let missingMeta = [];
let loremIpsum = [];

for (let f of files) {
  let c = fs.readFileSync(f, 'utf8').toLowerCase();
  if (!c.includes('name="description"') && !c.includes("name='description'")) {
      missingMeta.push(path.basename(f));
  }
  if (c.includes('lorem ipsum')) {
      loremIpsum.push(path.basename(f));
  }
}

console.log('Missing meta description:', missingMeta.length === 0 ? 'None' : missingMeta.join(', '));
console.log('Has Lorem Ipsum:', loremIpsum.length === 0 ? 'None' : loremIpsum.join(', '));
