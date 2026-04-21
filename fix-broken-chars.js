const fs = require('fs');
const path = require('path');

let fixedFiles = 0;
let totalReplacements = 0;

function walk(dir, cb) {
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        const s = fs.statSync(p);
        if (s.isDirectory() && !['node_modules', '.git', '.gemini'].includes(f)) walk(p, cb);
        else if (p.endsWith('.html')) cb(p);
    });
}

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let replacements = 0;

    // ── 1. Fix "? Back to All Articles" → "← Back to All Articles" ──
    content = content.replace(/>\?\s*Back to All Articles</g, () => { replacements++; return '>← Back to All Articles<'; });
    
    // ── 2. Fix "? More Articles" → "→ More Articles" ──
    content = content.replace(/>\?\s*More Articles</g, () => { replacements++; return '>→ More Articles<'; });
    
    // ── 3. Fix "? Copied!" → "✓ Copied!" ──
    content = content.replace(/'\\?\s*Copied!'/g, () => { replacements++; return "'✓ Copied!'"; });
    content = content.replace(/'\?\s*Copied!'/g, () => { replacements++; return "'✓ Copied!'"; });
    
    // ── 4. Fix CSS content:'?' → content:'→' (for list markers / TOC) ──
    content = content.replace(/content:\s*'\\?'\s*;/g, () => { replacements++; return "content:'→';"; });
    content = content.replace(/content:\s*'\?'\s*;/g, () => { replacements++; return "content:'→';"; });
    content = content.replace(/content:\s*'\\?'/g, () => { replacements++; return "content:'→'"; });
    content = content.replace(/content:\s*'\?'/g, () => { replacements++; return "content:'→'"; });

    // ── 5. Fix breadcrumb separators: <span>�</span> → <span>›</span> ──
    content = content.replace(/<span>\uFFFD<\/span>/g, () => { replacements++; return '<span>›</span>'; });
    
    // ── 6. Fix metadata separators: MASHHOR HUB  �  DATE → MASHHOR HUB  ◆  DATE ──
    // Pattern: text content with replacement character used as a bullet/separator
    content = content.replace(/(MASHHOR HUB\s*)\uFFFD(\s)/g, () => { replacements++; return '$1◆$2'; });
    
    // ── 7. Fix U+FFFD (�) in titles and headings — replace with em-dash ──
    // In <title> tags
    content = content.replace(/(<title>[^<]*)\uFFFD([^<]*<\/title>)/g, (m, before, after) => { replacements++; return before + '—' + after; });
    
    // In og:title, twitter:title content attributes
    content = content.replace(/(content="[^"]*)\uFFFD([^"]*")/g, (m, before, after) => { replacements++; return before + '—' + after; });
    
    // In <h1>, <h2>, <h3> tags
    content = content.replace(/(<h[1-6][^>]*>[^<]*)\uFFFD([^<]*<\/h[1-6]>)/g, (m, before, after) => { replacements++; return before + '—' + after; });
    
    // ── 8. Fix U+FFFD in general paragraph/list text — replace with em-dash ──
    content = content.replace(/(<(?:p|li|blockquote|span|strong|em|a)[^>]*>[^<]*)\uFFFD/g, (m, before) => { replacements++; return before + '—'; });
    
    // ── 9. Fix any remaining isolated U+FFFD in body text — em-dash ──
    content = content.replace(/\uFFFD/g, (m) => { replacements++; return '—'; });
    
    // ── 10. Fix "? " at start of list item content (likely →) ──
    content = content.replace(/<li>\?\s/g, () => { replacements++; return '<li>→ '; });
    
    // ── 11. Fix inline style content with ? that should be arrows ──
    // .back-to-blog::before { content: '?' } → content: '←'
    content = content.replace(/(\.back-to-blog[^}]*content:\s*)'[?]'/g, (m, before) => { replacements++; return before + "'←'"; });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        fixedFiles++;
        totalReplacements += replacements;
        if (replacements > 0) {
            console.log(`  Fixed ${replacements} issues in ${path.relative('.', filePath)}`);
        }
    }
}

console.log('Scanning all HTML files for broken characters...\n');
walk('.', fixFile);

console.log(`\n═══════ RESULTS ═══════`);
console.log(`Fixed files: ${fixedFiles}`);
console.log(`Total replacements: ${totalReplacements}`);
console.log(`═══════════════════════`);
