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
let totalFiles = htmlFiles.length;
let issues = {
  missingPlatformJs: [],
  missingRtlInArabic: [],
  missingAltImages: 0,
  brokenInternalLinks: []
};

const allHtmlRelativePaths = htmlFiles.map(f => path.relative(__dirname, f).replace(/\\/g, '/'));

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const isArabicPath = file.replace(/\\/g, '/').includes('/ar/');
  
  // 1. Check if platform JS is included
  if (!content.includes('mashhor-platform.js')) {
    issues.missingPlatformJs.push(path.relative(__dirname, file));
  }

  // 2. Check Arabic pages for RTL
  if (isArabicPath && (!content.includes('dir="rtl"') && !content.includes("dir='rtl'"))) {
    issues.missingRtlInArabic.push(path.relative(__dirname, file));
  }

  // 3. Check for basic image alt tags (rough regex)
  const imgRegex = /<img([^>]+)>/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    if (!match[1].includes('alt=')) {
      issues.missingAltImages++;
    }
  }

  // 4. Broken internal href links
  const hrefRegex = /href=["']([^"'#]*)["']/g;
  let hrefMatch;
  while ((hrefMatch = hrefRegex.exec(content)) !== null) {
      const link = hrefMatch[1];
      if (link && !link.startsWith('http') && !link.startsWith('mailto:') && !link.startsWith('tel:') && link.endsWith('.html')) {
          const absTarget = path.resolve(path.dirname(file), link);
          if (!fs.existsSync(absTarget)) {
              issues.brokenInternalLinks.push(`${path.relative(__dirname, file)} -> ${link}`);
          }
      }
  }
}

console.log(`=== MASHHOR HUB DIAGNOSTICS ===`);
console.log(`Scanned ${totalFiles} HTML files.`);
console.log(`\n1. Pages missing mashhor-platform.js (${issues.missingPlatformJs.length}):`);
if (issues.missingPlatformJs.length > 0) console.log(issues.missingPlatformJs.slice(0,10).join('\n') + (issues.missingPlatformJs.length > 10 ? '\n...and more' : ''));
else console.log("None! All good.");

console.log(`\n2. Arabic pages missing dir="rtl" (${issues.missingRtlInArabic.length}):`);
if (issues.missingRtlInArabic.length > 0) console.log(issues.missingRtlInArabic.slice(0,10).join('\n') + (issues.missingRtlInArabic.length > 10 ? '\n...and more' : ''));
else console.log("None! All good.");

console.log(`\n3. Images missing 'alt' text (Accessibility/SEO): ${issues.missingAltImages} images`);

console.log(`\n4. Broken Internal HTML Links (${issues.brokenInternalLinks.length}):`);
if (issues.brokenInternalLinks.length > 0) {
   const uniqueBroken = [...new Set(issues.brokenInternalLinks)];
   console.log(uniqueBroken.slice(0,10).join('\n') + (uniqueBroken.length > 10 ? `\n...and ${uniqueBroken.length - 10} more` : ''));
}
else console.log("None! All internal links valid.");
