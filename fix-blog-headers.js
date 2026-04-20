/**
 * Fix Blog Pages — Replace old hardcoded nav with platform header system
 * Issues fixed:
 * 1. Remove old hardcoded nav CSS (nav{position:fixed;...}) that conflicts with global header
 * 2. Ensure page-shell platform-page wrapper exists
 * 3. Ensure announcement banner exists
 * 4. Ensure data-platform-header exists
 * 5. Ensure data-platform-footer exists
 * 6. Ensure mashhor-platform.js is loaded
 * 7. Ensure protection.js is loaded
 * 8. Remove old nav-logo CSS references
 */

const fs = require('fs');
const path = require('path');

// All blog files that have the old nav-logo pattern
const blogDirs = [
  path.join(__dirname, 'blog'),
  path.join(__dirname, 'ar', 'blog')
];

let fixedCount = 0;
let skippedCount = 0;

function fixBlogFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(__dirname, filePath);
  
  // Check if this file has the old nav CSS pattern
  const hasOldNavCSS = content.includes('nav{position:fixed;') || content.includes('.nav-logo{');
  
  if (!hasOldNavCSS) {
    // Check if it already has page-shell — if so, it's likely already fixed
    if (content.includes('page-shell')) {
      console.log(`  SKIP (already fixed): ${relativePath}`);
      skippedCount++;
      return;
    }
  }

  const isArabic = filePath.includes(path.sep + 'ar' + path.sep);
  
  // Determine correct relative prefix
  const depth = relativePath.split(path.sep).length - 1; // e.g. blog/file.html = 1, ar/blog/file.html = 2
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  
  // 1. Remove old nav CSS block from <style> — the nav{...} rule that conflicts with global header
  // Remove the bare nav{...} rule (not .new-page-scope nav)
  content = content.replace(/\nnav\{[^}]+\}/g, '');
  content = content.replace(/nav\{position:fixed;[^}]+\}/g, '');
  
  // 2. Remove old .nav-logo and .nav-links CSS
  content = content.replace(/\.new-page-scope \.nav-logo\{[^}]+\}\.new-page-scope \.nav-logo span\{[^}]+\}/g, '');
  content = content.replace(/\.new-page-scope \.nav-links\{[^}]+\}/g, '');
  content = content.replace(/\.new-page-scope \.nav-links a\{[^}]+\}/g, '');
  content = content.replace(/\.new-page-scope \.nav-links a:hover\{[^}]+\}/g, '');
  content = content.replace(/\.new-page-scope \.nav-cta\{[^}]+\}/g, '');
  
  // 3. Remove old footer CSS (.fg, .fbn, .ftg, .fct, .fl, .fbot, .fcp, .fbs) since platform footer handles this
  // Keep these — they may be used for article-specific layouts
  
  // 4. Ensure page-shell wrapper exists after <body>
  if (!content.includes('page-shell')) {
    const announcementEN = `<div class="announcement">🚀 Kuwait's first integrated marketing + AI platform — now serving the GCC, Egypt, and the entire Arab world.</div>`;
    const announcementAR = `<div class="announcement">🚀 منصة التسويق والذكاء الاصطناعي الأولى في الكويت — الآن تخدم الخليج، مصر، وكل قوة عربية طموحة.</div>`;
    const announcement = isArabic ? announcementAR : announcementEN;
    
    // Replace <body> + any existing announcement + data-platform-header with proper structure
    // Pattern: <body> ... <div data-platform-header></div>
    const bodyHeaderPattern = /<body>\s*(?:<div class="announcement">.*?<\/div>\s*)?(?:<div data-platform-header><\/div>\s*)?/;
    
    if (bodyHeaderPattern.test(content)) {
      content = content.replace(bodyHeaderPattern, 
        `<body>\n<div class="page-shell platform-page">\n  ${announcement}\n  <div data-platform-header></div>\n`);
    } else {
      // Fallback: just wrap after <body>
      content = content.replace('<body>', 
        `<body>\n<div class="page-shell platform-page">\n  ${announcement}\n  <div data-platform-header></div>`);
    }
  }
  
  // 5. Ensure data-platform-header exists (if not already added above)
  if (!content.includes('data-platform-header')) {
    content = content.replace('<body>', '<body>\n<div data-platform-header></div>');
  }
  
  // 6. Ensure data-platform-footer exists
  if (!content.includes('data-platform-footer')) {
    // Add before </body> or before the script tags
    if (content.includes('</main>')) {
      content = content.replace('</main>', '</main>\n<div data-platform-footer></div>');
    } else {
      content = content.replace('</body>', '<div data-platform-footer></div>\n</body>');
    }
  }
  
  // 7. Ensure closing </div> for page-shell before </body>
  // Count if we added page-shell but don't have closing div
  if (content.includes('page-shell') && !content.includes('</div>\n</body>') && !content.match(/<\/div>\s*<script/)) {
    // Add closing div for page-shell before the scripts
    content = content.replace(/<div data-platform-footer><\/div>/, '<div data-platform-footer></div>\n</div>');
  }
  
  // 8. Ensure mashhor-platform.js is loaded
  if (!content.includes('mashhor-platform.js')) {
    content = content.replace('</body>', `<script src="${prefix}assets/js/mashhor-platform.js"></script>\n</body>`);
  }
  
  // 9. Ensure protection.js is loaded
  if (!content.includes('protection.js')) {
    content = content.replace('</body>', `<script src="${prefix}assets/js/protection.js"></script>\n</body>`);
  }
  
  // 10. Remove old hardcoded <nav>...</nav> HTML if it exists
  content = content.replace(/<nav>\s*<a[^>]*class="nav-logo"[^>]*>.*?<\/nav>/gs, '');
  
  // 11. Remove old hardcoded footer HTML (the one with .fg class that's not inside new-page-scope article)
  // Only remove if it looks like a standalone footer, not article content
  content = content.replace(/<footer>\s*<div class="fg">.*?<\/footer>/gs, '');
  
  // 12. Ensure platform font links exist
  if (!content.includes('Alexandria')) {
    content = content.replace('</head>', 
      `<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;700;800&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">\n</head>`);
  }
  
  // 13. Ensure RTL CSS for Arabic pages
  if (isArabic && !content.includes('rtl.css')) {
    content = content.replace('</head>', `<link rel="stylesheet" href="${prefix}assets/css/rtl.css">\n</head>`);
  }

  // Clean up any double blank lines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  fs.writeFileSync(filePath, content);
  console.log(`  FIXED: ${relativePath}`);
  fixedCount++;
}

console.log('=== Fixing Blog Pages Header System ===\n');

for (const dir of blogDirs) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    continue;
  }
  
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f));
  
  console.log(`Processing ${files.length} files in ${path.relative(__dirname, dir)}/`);
  
  for (const file of files) {
    try {
      fixBlogFile(file);
    } catch (err) {
      console.error(`  ERROR: ${path.relative(__dirname, file)} — ${err.message}`);
    }
  }
  console.log('');
}

console.log(`\nDone! Fixed: ${fixedCount}, Skipped: ${skippedCount}`);
