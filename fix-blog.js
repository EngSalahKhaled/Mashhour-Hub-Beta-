
const fs = require('fs');
const path = require('path');

const fonts = \<link href=\"https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;700;800&family=Space+Grotesk:wght@400;500;700&display=swap\" rel=\"stylesheet\">\;

function processFile(file, isArabic) {
  let content = fs.readFileSync(file, 'utf8');

  // ensure fonts
  if (!content.includes('Alexandria:wght')) {
    content = content.replace('</head>', \\n  \\n</head>\);
  }

  // extract body content to simplify
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return;
  let bodyContent = bodyMatch[1];
  let bodyTag = content.match(/<body[^>]*>/i)[0];

  // If page doesn't have data-platform-header, inject it.
  if (!bodyContent.includes('<div data-platform-header></div>')) {
    // some old blogs have it, others dont. But all new ones need preloader skipped.
    // wait, if we blindly inject it, where? Just after <body>
    // let's put it at the very top of body
    const headerStr = \\n  <div data-platform-header></div>\n\;
    const footerStr = \<div data-platform-footer></div>\n<script src=\"\assets/js/mashhor-platform.js\"></script>\n<script src=\"\assets/js/protection.js\"></script>\;

    // remove old scripts just to avoid duplicates
    bodyContent = bodyContent.replace(/<script src=\"[./]*assets\/js\/mashhor-platform.js\"><\/script>/gi, '');
    bodyContent = bodyContent.replace(/<script src=\"[./]*assets\/js\/protection.js\"><\/script>/gi, '');

    // inject header right after <div id=\"readProgress\"> or <div id=\"preloader\"...> if they exist
    // simplest way: replace <main with header+<main
    if (bodyContent.includes('<main')) {
       bodyContent = bodyContent.replace(/(<main)/i, headerStr + '');
    } else {
       bodyContent = headerStr + bodyContent;
    }

    // append footer at the end
    bodyContent = bodyContent.trim() + '\n' + footerStr + '\n';
  }

  // reconstruct
  content = content.replace(/(<body[^>]*>)([\s\S]*?)(<\/body>)/i, \\\n\\n\\);
  fs.writeFileSync(file, content);
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.html') && !file.includes('index.html') && !file.includes('insights.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const engBlogs = walk(path.join(process.cwd(), 'blog'));
const arBlogs = walk(path.join(process.cwd(), 'ar/blog'));
let total = 0;

engBlogs.forEach(f => { processFile(f, false); total++; });
arBlogs.forEach(f => { processFile(f, true); total++; });

console.log('Processed', total, 'blog files.');

