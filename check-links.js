
const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git') && !file.includes('assets') && !file.includes('prompts')) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(process.cwd());
let brokenLinks = [];

// More robust regex
const regex = /(?:href|src)=[\"']((?!http|https|mailto|tel|#|data:)[^\"']+)[\"']/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawLink = match[1];
    const linkPath = rawLink.split('?')[0].split('#')[0];
    if (!linkPath) continue;

    const absoluteTargetPath = path.resolve(path.dirname(file), linkPath);
    if (!fs.existsSync(absoluteTargetPath)) {
      brokenLinks.push({ file: file.replace(process.cwd()+'\\\\', ''), link: rawLink });
    }
  }
});

const report = brokenLinks.reduce((acc, curr) => {
    if (!acc[curr.file]) acc[curr.file] = [];
    if (!acc[curr.file].includes(curr.link)) acc[curr.file].push(curr.link);
    return acc;
}, {});

fs.writeFileSync('broken-links.json', JSON.stringify(report, null, 2));
console.log('Broken links found on ' + Object.keys(report).length + ' pages.');

