/**
 * fix-all-headers.js
 * 
 * Comprehensive script to:
 * 1. Inject <div data-platform-header></div> into all blog pages that are missing it
 * 2. Ensure Alexandria & Space Grotesk fonts are loaded in <head>
 * 3. Fix ar/index.html marquee image paths (assets/ → ../assets/)
 * 4. Fix broken derma-life.html links in portfolio indices
 * 5. Fix broken image reference (mr-v-s1.webp) in blog posts
 */

const fs = require('fs');
const path = require('path');

let stats = { headersAdded: 0, fontsAdded: 0, marqueeFixed: 0, portfolioFixed: 0, imageFixed: 0, errors: [] };

// ============================================================
// UTILITY: recursive walk
// ============================================================
function walk(dir, filter) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git') && !file.startsWith('.')) {
        results = results.concat(walk(fullPath, filter));
      } else if (filter(fullPath)) {
        results.push(fullPath);
      }
    });
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

const ROOT = process.cwd();

// ============================================================
// TASK 1: Inject header into blog pages that are missing it
// ============================================================
function fixBlogHeaders() {
  console.log('\n📋 TASK 1: Fixing missing headers in blog pages...');
  
  const blogDirs = [
    path.join(ROOT, 'blog'),
    path.join(ROOT, 'ar', 'blog')
  ];

  blogDirs.forEach(blogDir => {
    if (!fs.existsSync(blogDir)) return;
    
    const files = walk(blogDir, f => f.endsWith('.html'));
    
    files.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        const relPath = path.relative(ROOT, file);
        
        // Skip if already has the header
        if (content.includes('<div data-platform-header></div>')) {
          return;
        }
        
        // Determine the relative prefix to assets
        const depth = relPath.split(path.sep).length - 1; // blog/file.html = 1, ar/blog/file.html = 2
        const prefix = '../'.repeat(depth);
        
        // STEP A: Ensure Alexandria + Space Grotesk fonts are in <head>
        if (!content.includes('Alexandria:wght')) {
          const fontLink = `\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;700;800&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">`;
          content = content.replace('</head>', fontLink + '\n</head>');
          stats.fontsAdded++;
        }
        
        // STEP B: Inject data-platform-header right after <body> (or after <body> tag)
        // We insert: <div data-platform-header></div> right after <body>
        // But we keep whatever the page already has (readProgress, preloader, etc.)
        const bodyTagMatch = content.match(/<body[^>]*>/i);
        if (!bodyTagMatch) {
          stats.errors.push(`No <body> found in ${relPath}`);
          return;
        }
        
        const bodyTag = bodyTagMatch[0];
        const headerDiv = `\n<div data-platform-header></div>`;
        
        // Insert header after <body> tag
        content = content.replace(bodyTag, bodyTag + headerDiv);
        
        // STEP C: Ensure data-platform-footer and mashhor-platform.js exist at bottom
        if (!content.includes('<div data-platform-footer></div>')) {
          // Insert before </body>
          content = content.replace('</body>', `<div data-platform-footer></div>\n</body>`);
        }
        
        if (!content.includes('mashhor-platform.js')) {
          content = content.replace('</body>', `<script src="${prefix}assets/js/mashhor-platform.js"></script>\n</body>`);
        }
        
        if (!content.includes('protection.js')) {
          content = content.replace('</body>', `<script src="${prefix}assets/js/protection.js"></script>\n</body>`);
        }
        
        fs.writeFileSync(file, content);
        console.log(`  ✅ Header added: ${relPath}`);
        stats.headersAdded++;
      } catch (e) {
        stats.errors.push(`Error processing ${path.relative(ROOT, file)}: ${e.message}`);
      }
    });
  });
}

// ============================================================
// TASK 2: Fix ar/index.html marquee paths
// ============================================================
function fixArMarqueePaths() {
  console.log('\n📋 TASK 2: Fixing ar/index.html marquee image paths...');
  
  const arIndex = path.join(ROOT, 'ar', 'index.html');
  if (!fs.existsSync(arIndex)) {
    console.log('  ⚠️  ar/index.html not found, skipping.');
    return;
  }
  
  let content = fs.readFileSync(arIndex, 'utf8');
  
  // The marquee images use "assets/images/brand/..." but from ar/ folder,
  // they need "../assets/images/brand/..."
  // Be precise: only fix within the tech-marquee section
  const marqueeStart = content.indexOf('tech-marquee-section');
  const marqueeEnd = content.indexOf('</section>', marqueeStart);
  
  if (marqueeStart === -1) {
    console.log('  ⚠️  No tech-marquee-section found in ar/index.html');
    return;
  }
  
  const before = content.substring(0, marqueeStart);
  const marqueeSection = content.substring(marqueeStart, marqueeEnd + '</section>'.length);
  const after = content.substring(marqueeEnd + '</section>'.length);
  
  // Fix: replace "assets/images/brand/" with "../assets/images/brand/" 
  // but NOT "../assets/images/brand/" (avoid double-prefix)
  const fixedMarquee = marqueeSection.replace(/(?<!\.\.\/)assets\/images\/brand\//g, '../assets/images/brand/');
  
  if (fixedMarquee !== marqueeSection) {
    content = before + fixedMarquee + after;
    fs.writeFileSync(arIndex, content);
    stats.marqueeFixed++;
    console.log('  ✅ Fixed marquee paths in ar/index.html');
  } else {
    console.log('  ✔️  Marquee paths already correct in ar/index.html');
  }
}

// ============================================================
// TASK 3: Fix broken derma-life.html links in portfolio indices
// ============================================================
function fixPortfolioLinks() {
  console.log('\n📋 TASK 3: Fixing broken derma-life.html links...');
  
  const portfolioFiles = [
    path.join(ROOT, 'portfolio', 'index.html'),
    path.join(ROOT, 'ar', 'portfolio', 'index.html')
  ];
  
  portfolioFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(ROOT, file);
    
    // Remove links pointing to derma-life.html since it doesn't exist
    // Find the entire card/link element pointing to derma-life.html and remove it
    if (content.includes('derma-life.html')) {
      // Replace href="derma-life.html" with href="#" and add a comment
      content = content.replace(/href="derma-life\.html"/g, 'href="index.html"');
      fs.writeFileSync(file, content);
      stats.portfolioFixed++;
      console.log(`  ✅ Fixed derma-life link in ${relPath}`);
    }
  });
}

// ============================================================
// TASK 4: Fix broken mr-v-s1.webp image references
// ============================================================
function fixBrokenImages() {
  console.log('\n📋 TASK 4: Fixing broken image references (mr-v-s1.webp)...');
  
  const filesToCheck = [
    path.join(ROOT, 'blog', 'mastering-canva-2026.html'),
    path.join(ROOT, 'blog', 'top-ai-tools-2026.html'),
    path.join(ROOT, 'ar', 'blog', 'mastering-canva-2026-ar.html'),
    path.join(ROOT, 'ar', 'blog', 'top-ai-tools-2026-ar.html')
  ];
  
  filesToCheck.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(ROOT, file);
    
    if (content.includes('mr-v-s1.webp')) {
      // Replace with existing fallback image
      content = content.replace(/(?:\.\.\/)+assets\/images\/mr-v-s1\.webp/g, (match) => {
        return match.replace('mr-v-s1.webp', 'icons/favicon.jpg');
      });
      fs.writeFileSync(file, content);
      stats.imageFixed++;
      console.log(`  ✅ Fixed broken image in ${relPath}`);
    }
  });
}

// ============================================================
// TASK 5: Ensure getPrefix handles 'influencers' directory
// ============================================================
function checkGetPrefix() {
  console.log('\n📋 TASK 5: Checking getPrefix() coverage...');
  
  const jsFile = path.join(ROOT, 'assets', 'js', 'mashhor-platform.js');
  let content = fs.readFileSync(jsFile, 'utf8');
  
  // Check if 'influencers' is in the getPrefix function
  if (!content.includes("'influencers'") && content.includes("'blog'")) {
    // The getPrefix path-detection list might be missing some directories
    // Let's check all first-level directories that have HTML files
    const dirs = fs.readdirSync(ROOT).filter(d => {
      const full = path.join(ROOT, d);
      return fs.statSync(full).isDirectory() && !d.startsWith('.') && d !== 'node_modules' && d !== 'assets';
    });
    
    console.log(`  📂 First-level directories: ${dirs.join(', ')}`);
    
    // Check which ones are in getPrefix
    const missingFromPrefix = dirs.filter(d => !content.includes(`'${d}'`));
    if (missingFromPrefix.length > 0) {
      console.log(`  ⚠️  Dirs not in getPrefix: ${missingFromPrefix.join(', ')}`);
      
      // Add them to the getPrefix function
      const oldSearch = content.match(/p === 'ar' \|\| p === 'services'[^)]+\)/);
      if (oldSearch) {
        let newSearch = oldSearch[0];
        missingFromPrefix.forEach(d => {
          if (!newSearch.includes(`'${d}'`)) {
            newSearch = newSearch.replace(/\)$/, ` || p === '${d}')`);
          }
        });
        if (newSearch !== oldSearch[0]) {
          content = content.replace(oldSearch[0], newSearch);
          fs.writeFileSync(jsFile, content);
          console.log(`  ✅ Updated getPrefix() to include: ${missingFromPrefix.join(', ')}`);
        }
      }
    } else {
      console.log('  ✔️  All directories covered by getPrefix()');
    }
  } else {
    console.log('  ✔️  getPrefix() already covers influencers');
  }
}

// ============================================================
// RUN ALL TASKS
// ============================================================
console.log('🚀 Starting comprehensive header & path fix...\n');
console.log('=' .repeat(60));

fixBlogHeaders();
fixArMarqueePaths();
fixPortfolioLinks();
fixBrokenImages();
checkGetPrefix();

console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY:');
console.log(`   Headers added:     ${stats.headersAdded}`);
console.log(`   Fonts injected:    ${stats.fontsAdded}`);
console.log(`   Marquee fixed:     ${stats.marqueeFixed}`);
console.log(`   Portfolio fixed:   ${stats.portfolioFixed}`);
console.log(`   Images fixed:      ${stats.imageFixed}`);
if (stats.errors.length > 0) {
  console.log(`\n   ❌ Errors (${stats.errors.length}):`);
  stats.errors.forEach(e => console.log(`      - ${e}`));
}
console.log('\n✅ Done!');
