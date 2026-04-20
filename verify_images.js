const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.html')) {
      results.push(file);
    }
  });
  return results;
}

const htmlFiles = walk(__dirname);
const broken = [];
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
     const src = match[1];
     if (src.startsWith('http') || src.startsWith('data:')) continue;
     const absPath = path.resolve(path.dirname(file), src);
     if (!fs.existsSync(absPath)) {
        broken.push(file + ' -> ' + src);
     }
  }
}
console.log('Broken images:', broken.length ? broken.join('\n') : 'None');
