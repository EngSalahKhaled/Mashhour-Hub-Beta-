const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const globalFonts = `<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;700;800&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">`;

// We use the exact Arabic announcement text for AR pages, English for EN pages
const arAnn = `<div class="announcement">🚀 منصة التسويق والذكاء الاصطناعي الأولى في الكويت — الآن تخدم الخليج، مصر، وكل قوة عربية طموحة.</div>`;
const enAnn = `<div class="announcement">🚀 Kuwait's first integrated marketing + AI platform — now serving the GCC, Egypt, and the entire Arab world.</div>`;

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git') && !file.startsWith('.')) {
        results = results.concat(walk(fullPath));
      } else if (file.endsWith('.html') && !fullPath.includes('blog')) {
          // exclude blog since we did it, but it doesn't hurt to parse it
          // let's parse ALL HTML just to be sure we kill Cairo everywhere
          results.push(fullPath);
      }
    });
  } catch (e) {}
  return results;
}

const allFiles = walk(ROOT);

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // 1. Remove Cairo Imports
    const cairoRegex1 = /<link rel="preload" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Cairo.*?onload.*?rel='stylesheet'>/g;
    const cairoRegex2 = /<noscript><link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Cairo.*?<\/noscript>/g;
    const cairoRegex3 = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Cairo.*?rel="stylesheet">/g;

    if (cairoRegex1.test(content)) { content = content.replace(cairoRegex1, ''); changed = true; }
    if (cairoRegex2.test(content)) { content = content.replace(cairoRegex2, ''); changed = true; }
    if (cairoRegex3.test(content)) { content = content.replace(cairoRegex3, ''); changed = true; }

    // 2. Inject Alexandria / Space Grotesk if missing!
    if (!content.includes('family=Alexandria') && content.includes('</head>')) {
        content = content.replace('</head>', `\n${globalFonts}\n</head>`);
        changed = true;
    }
    
    // 3. Inject Announcement banner if MISSING and it has platform header
    if (content.includes('<div data-platform-header></div>') && !content.includes('class="announcement"')) {
        // Is Arabic page?
        const isAr = file.includes('\\ar\\') || file.includes('/ar/');
        const announcement = isAr ? arAnn : enAnn;
        
        content = content.replace('<div data-platform-header></div>', `${announcement}\n  <div data-platform-header></div>`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed fonts/banners in:', path.relative(ROOT, file));
    }
});
