const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_URL = 'https://mashhor-hub.com';
const OG_DIR = path.join(__dirname, 'assets', 'images', 'og');

// ─── STEP 1: Build a map of all existing OG images ───
const existingOG = new Set(fs.readdirSync(OG_DIR).map(f => f.toLowerCase()));

// ─── STEP 2: Derive an OG image key from a file path ───
function ogKeyFromPath(filePath) {
    let rel = path.relative(__dirname, filePath).replace(/\\/g, '/');
    // Remove ar/ prefix for Arabic pages (they share the same OG images as EN)
    const isArabic = rel.startsWith('ar/');
    if (isArabic) rel = rel.replace(/^ar\//, '');
    // Convert path to OG naming convention: folder/file.html -> folder_file
    let key = rel.replace(/\.html$/, '').replace(/\//g, '_');
    return key;
}

// ─── STEP 3: Find best fallback image for a given key ───
function findFallback(key) {
    // Try exact match first
    if (existingOG.has(key + '.jpg')) return key + '.jpg';
    
    // Try parent: services_seo_technical-clarity -> services_seo
    const parts = key.split('_');
    for (let i = parts.length - 1; i >= 1; i--) {
        const parent = parts.slice(0, i).join('_');
        if (existingOG.has(parent + '.jpg')) return parent + '.jpg';
    }
    
    // Ultimate fallback
    if (existingOG.has('index.jpg')) return 'index.jpg';
    return null;
}

// ─── STEP 4: Generate missing OG image from fallback ───
async function generateOGImage(targetName, fallbackName) {
    const src = path.join(OG_DIR, fallbackName);
    const dst = path.join(OG_DIR, targetName);
    if (fs.existsSync(dst)) return;
    try {
        await sharp(src)
            .resize(1200, 630, { fit: 'cover' })
            .jpeg({ quality: 85 })
            .toFile(dst);
    } catch (e) {
        console.error('  Error generating', targetName, e.message);
    }
}

// ─── STEP 5: Extract page title from HTML ───
function getPageTitle(content) {
    const m = content.match(/<title>([^<]+)<\/title>/i);
    if (m) return m[1].trim();
    const h1 = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1) return h1[1].trim();
    return 'Mashhor Hub';
}

// ─── STEP 6: Extract page description from HTML ───
function getPageDesc(content) {
    const m = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (m) return m[1].trim();
    return 'Premium Marketing & AI-Powered Growth Agency';
}

// ─── STEP 7: Determine canonical URL ───
function getCanonicalUrl(filePath) {
    let rel = path.relative(__dirname, filePath).replace(/\\/g, '/');
    rel = rel.replace(/index\.html$/, '').replace(/\.html$/, '');
    // Ensure trailing slash for directories
    if (!rel.endsWith('/') && !rel.includes('.')) rel += '/';
    if (rel === '/') rel = '';
    return BASE_URL + '/' + rel;
}

// ═══════════════════════════════════════════════════
//  MAIN PROCESSING
// ═══════════════════════════════════════════════════
async function main() {
    const pages = [];
    
    function walk(dir) {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            const s = fs.statSync(p);
            if (s.isDirectory() && !['node_modules', '.git', '.gemini', 'assets'].includes(f)) {
                walk(p);
            } else if (p.endsWith('.html') && !p.includes('Complete_Vault') && !p.includes('flaticon') && !p.includes('license')) {
                pages.push(p);
            }
        });
    }
    walk(__dirname);
    
    let fixedBroken = 0, addedOG = 0, addedTwitter = 0, generatedImages = 0;
    
    for (const page of pages) {
        let content = fs.readFileSync(page, 'utf8');
        let changed = false;
        const key = ogKeyFromPath(page);
        const isArabic = path.relative(__dirname, page).replace(/\\/g, '/').startsWith('ar/');
        
        // ── Fix broken .png references → .jpg ──
        const ogMatch = content.match(/property="og:image"\s+content="([^"]+)"/);
        if (ogMatch) {
            const currentUrl = ogMatch[1];
            const currentFile = currentUrl.split('/').pop();
            const currentPath = path.join(OG_DIR, currentFile);
            
            if (!fs.existsSync(currentPath)) {
                // Try .jpg version
                const jpgName = currentFile.replace(/\.png$/, '.jpg').replace(/\.webp$/, '.jpg');
                const jpgPath = path.join(OG_DIR, jpgName);
                
                if (fs.existsSync(jpgPath)) {
                    // Just fix the reference
                    const newUrl = BASE_URL + '/assets/images/og/' + jpgName;
                    content = content.replace(currentUrl, newUrl);
                    changed = true;
                    fixedBroken++;
                } else {
                    // Generate from fallback
                    const fallback = findFallback(key);
                    if (fallback) {
                        const targetName = key + '.jpg';
                        await generateOGImage(targetName, fallback);
                        generatedImages++;
                        existingOG.add(targetName.toLowerCase());
                        const newUrl = BASE_URL + '/assets/images/og/' + targetName;
                        content = content.replace(currentUrl, newUrl);
                        changed = true;
                        fixedBroken++;
                    }
                }
            }
        }
        
        // ── Add missing og:image block ──
        if (!content.includes('og:image')) {
            const targetName = key + '.jpg';
            if (!existingOG.has(targetName.toLowerCase())) {
                const fallback = findFallback(key);
                if (fallback) {
                    await generateOGImage(targetName, fallback);
                    generatedImages++;
                    existingOG.add(targetName.toLowerCase());
                }
            }
            
            const title = getPageTitle(content);
            const desc = getPageDesc(content);
            const url = getCanonicalUrl(page);
            const imgUrl = BASE_URL + '/assets/images/og/' + targetName;
            const locale = isArabic ? 'ar_AR' : 'en_US';
            
            const ogBlock = `
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${imgUrl}">
<meta property="og:image:secure_url" content="${imgUrl}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Mashhor Hub">
<meta property="og:locale" content="${locale}">
`;
            content = content.replace('</head>', ogBlock + '</head>');
            changed = true;
            addedOG++;
        }
        
        // ── Fix og:image:type to jpeg ──
        if (content.includes('og:image:type') && content.includes('image/png')) {
            content = content.replace(
                /(<meta\s+property="og:image:type"\s+content=")image\/png(")/g,
                '$1image/jpeg$2'
            );
            changed = true;
        }
        
        // ── Fix secure_url if it still points to wrong file ──
        const secureMatch = content.match(/property="og:image:secure_url"\s+content="([^"]+)"/);
        const ogImgMatch = content.match(/property="og:image"\s+content="([^"]+)"/);
        if (secureMatch && ogImgMatch && secureMatch[1] !== ogImgMatch[1]) {
            content = content.replace(secureMatch[1], ogImgMatch[1]);
            changed = true;
        }
        
        // ── Add missing twitter:image ──
        if (!content.includes('twitter:image') && ogImgMatch) {
            // Refresh og:image match after possible changes
            const freshOg = content.match(/property="og:image"\s+content="([^"]+)"/);
            const imgUrl = freshOg ? freshOg[1] : (BASE_URL + '/assets/images/og/' + key + '.jpg');
            const title = getPageTitle(content);
            const desc = getPageDesc(content);
            const url = getCanonicalUrl(page);
            
            if (content.includes('twitter:card')) {
                // Just add twitter:image after existing twitter tags
                const twitterInsert = `\n<meta name="twitter:image" content="${imgUrl}">`;
                content = content.replace(
                    /(<meta\s+name="twitter:card"[^>]+>)/,
                    '$1' + twitterInsert
                );
            } else {
                // Add full twitter block
                const twitterBlock = `
<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${imgUrl}">
`;
                content = content.replace('</head>', twitterBlock + '</head>');
            }
            changed = true;
            addedTwitter++;
        } else if (!content.includes('twitter:image') && !ogImgMatch) {
            // Page had no og:image either - we added OG above, now add Twitter
            const freshOg = content.match(/property="og:image"\s+content="([^"]+)"/);
            if (freshOg) {
                const imgUrl = freshOg[1];
                const title = getPageTitle(content);
                const desc = getPageDesc(content);
                const url = getCanonicalUrl(page);
                const twitterBlock = `
<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${imgUrl}">
`;
                content = content.replace('</head>', twitterBlock + '</head>');
                changed = true;
                addedTwitter++;
            }
        }
        
        if (changed) {
            fs.writeFileSync(page, content, 'utf8');
        }
    }
    
    console.log('═══════ RESULTS ═══════');
    console.log(`Fixed broken OG references: ${fixedBroken}`);
    console.log(`Added missing OG blocks: ${addedOG}`);
    console.log(`Added missing Twitter cards: ${addedTwitter}`);
    console.log(`Generated fallback images: ${generatedImages}`);
    console.log('═══════════════════════');
}

main().catch(console.error);
