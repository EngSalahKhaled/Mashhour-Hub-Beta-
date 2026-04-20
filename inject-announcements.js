const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// Get announcements
const engContent = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const arContent = fs.readFileSync(path.join(ROOT, 'ar', 'index.html'), 'utf8');

const engAnnMatch = engContent.match(/<div class="announcement">.*?<\/div>/);
const arAnnMatch = arContent.match(/<div class="announcement">.*?<\/div>/);

if (!engAnnMatch || !arAnnMatch) {
  console.log('Error: Could not find original announcements');
  process.exit(1);
}

const engAnn = engAnnMatch[0];
const arAnn = arAnnMatch[0];

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git') && !file.startsWith('.')) {
        results = results.concat(walk(fullPath));
      } else if (file.endsWith('.html') && !file.includes('index.html') && !file.includes('insights.html')) {
        results.push(fullPath);
      }
    });
  } catch (e) {}
  return results;
}

const engBlogs = walk(path.join(ROOT, 'blog'));
const arBlogs = walk(path.join(ROOT, 'ar', 'blog'));
let count = 0;

function processFiles(files, announcementStr) {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it already has announcement
    if (content.includes('class="announcement"')) return;
    
    // Must have platform-header to inject before it
    if (content.includes('<div data-platform-header></div>')) {
      content = content.replace('<div data-platform-header></div>', `${announcementStr}\n  <div data-platform-header></div>`);
      fs.writeFileSync(file, content);
      count++;
    }
  });
}

processFiles(engBlogs, engAnn);
processFiles(arBlogs, arAnn);

console.log('Injected announcements into', count, 'blog pages.');
