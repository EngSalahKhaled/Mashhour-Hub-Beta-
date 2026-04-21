const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OG_DIR = path.join(__dirname, 'assets', 'images', 'og');
const LOGO_PATH = path.join(__dirname, 'assets', 'images', 'icons', 'logo-flat.png');
const WIDTH = 1200;
const HEIGHT = 630;

// ─── Category mapping ───
function getCategory(filename) {
    const f = filename.toLowerCase();
    if (f.startsWith('ar_blog_') || f.startsWith('blog_')) return { en: 'Blog', ar: 'المدونة', color: '#4F8EFF' };
    if (f.startsWith('ar_academy_courses_') || f.includes('academy_courses_')) return { en: 'Academy Course', ar: 'الأكاديمية', color: '#10b981' };
    if (f.startsWith('ar_academy_tracks_') || f.includes('academy_tracks_')) return { en: 'Academy Track', ar: 'الأكاديمية', color: '#10b981' };
    if (f.startsWith('ar_academy_') || f.includes('academy_')) return { en: 'Academy', ar: 'الأكاديمية', color: '#10b981' };
    if (f.includes('services_mashhor-ai')) return { en: 'Mashhor AI', ar: 'مشهور AI', color: '#8b5cf6' };
    if (f.includes('services_consultation')) return { en: 'Consultation', ar: 'استشارات', color: '#f59e0b' };
    if (f.includes('services_content-writing')) return { en: 'Content Writing', ar: 'كتابة المحتوى', color: '#ec4899' };
    if (f.includes('services_e-marketing')) return { en: 'Digital Advertising', ar: 'الإعلانات الرقمية', color: '#ef4444' };
    if (f.includes('services_graphic-design')) return { en: 'Design', ar: 'التصميم', color: '#f97316' };
    if (f.includes('services_influencer')) return { en: 'Influencer Marketing', ar: 'التسويق المؤثر', color: '#06b6d4' };
    if (f.includes('services_seo')) return { en: 'SEO', ar: 'تحسين محركات البحث', color: '#22c55e' };
    if (f.includes('services_smart-automation')) return { en: 'AI & Automation', ar: 'الأتمتة والذكاء', color: '#a855f7' };
    if (f.includes('services_video-production')) return { en: 'Video Production', ar: 'الإنتاج المرئي', color: '#e11d48' };
    if (f.includes('services_')) return { en: 'Services', ar: 'الخدمات', color: '#3b82f6' };
    if (f.includes('case-studies_')) return { en: 'Case Study', ar: 'دراسة حالة', color: '#f59e0b' };
    if (f.includes('portfolio_')) return { en: 'Portfolio', ar: 'الأعمال', color: '#06b6d4' };
    if (f.includes('pricing_')) return { en: 'Pricing', ar: 'الباقات', color: '#f4cd55' };
    if (f.includes('prompts_')) return { en: 'Prompt Vault', ar: 'مكتبة البرومبتات', color: '#8b5cf6' };
    if (f.includes('influencers_')) return { en: 'Influencers', ar: 'المؤثرون', color: '#06b6d4' };
    if (f.includes('legal_')) return { en: 'Legal', ar: 'قانوني', color: '#6b7280' };
    if (f.includes('book-call')) return { en: 'Book a Call', ar: 'احجز مكالمة', color: '#f4cd55' };
    if (f.includes('search_')) return { en: 'Search', ar: 'البحث', color: '#3b82f6' };
    return { en: 'Platform', ar: 'المنصة', color: '#f4cd55' };
}

// ─── Extract title from HTML ───
function extractTitle(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Try og:title first
    let m = content.match(/property="og:title"\s+content="([^"]+)"/);
    if (m) return m[1].replace(/\s*[|\-–—]\s*Mashhor Hub.*$/i, '').replace(/\s*[|\-–—]\s*مشهور هب.*$/i, '').trim();
    
    // Try <title> tag
    m = content.match(/<title>([^<]+)<\/title>/i);
    if (m) return m[1].replace(/\s*[|\-–—]\s*Mashhor Hub.*$/i, '').replace(/\s*[|\-–—]\s*مشهور هب.*$/i, '').trim();
    
    return null;
}

// ─── Map OG filename back to HTML file path ───
function ogToHtmlPath(ogName) {
    const name = ogName.replace('.jpg', '');
    // Convert underscores back to path separators, handle index pages
    let rel = name.replace(/_/g, '/');
    
    // Check if it's an index page (ends with /index)
    if (rel.endsWith('/index')) {
        return rel + '.html';
    }
    
    return rel + '.html';
}

// ─── Escape XML special characters ───
function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ─── Word-wrap text for SVG ───
function wrapText(text, maxCharsPerLine) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
            if (currentLine) lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine += ' ' + word;
        }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    
    // Maximum 3 lines
    if (lines.length > 3) {
        lines.length = 3;
        lines[2] = lines[2].substring(0, lines[2].length - 3) + '...';
    }
    
    return lines;
}

// ─── Detect if text is Arabic ───
function isArabicText(text) {
    return /[\u0600-\u06FF]/.test(text);
}

// ─── Generate SVG template ───
function createSVG(title, category, isArabic) {
    const catLabel = isArabic ? category.ar : category.en;
    const catColor = category.color;
    const direction = isArabic ? 'rtl' : 'ltr';
    const anchor = isArabic ? 'end' : 'start';
    const textX = isArabic ? 1100 : 100;
    const maxChars = isArabic ? 35 : 40;
    const titleLines = wrapText(title, maxChars);
    const titleFontSize = titleLines.length > 2 ? 38 : (titleLines.length > 1 ? 42 : 48);
    const lineHeight = titleFontSize + 12;
    const titleStartY = titleLines.length > 2 ? 280 : (titleLines.length > 1 ? 300 : 320);
    
    const titleTspans = titleLines.map((line, i) => 
        `<tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    ).join('');

    // Decorative grid dots
    let dots = '';
    for (let x = 0; x < 1200; x += 40) {
        for (let y = 0; y < 630; y += 40) {
            if (Math.random() > 0.85) {
                dots += `<circle cx="${x}" cy="${y}" r="1" fill="rgba(255,255,255,0.03)"/>`;
            }
        }
    }

    return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#041121"/>
      <stop offset="50%" stop-color="#071a30"/>
      <stop offset="100%" stop-color="#0a1e38"/>
    </linearGradient>
    <!-- Gold accent gradient -->
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f4cd55"/>
      <stop offset="100%" stop-color="#b8860b"/>
    </linearGradient>
    <!-- Category badge gradient -->
    <linearGradient id="cat" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${catColor}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${catColor}" stop-opacity="0.08"/>
    </linearGradient>
    <!-- Glow -->
    <radialGradient id="glow" cx="0.2" cy="0.3" r="0.8">
      <stop offset="0%" stop-color="${catColor}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <!-- Corner glow -->
    <radialGradient id="cornerGlow" cx="0.85" cy="0.15" r="0.5">
      <stop offset="0%" stop-color="#f4cd55" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#cornerGlow)"/>
  
  <!-- Decorative dots -->
  ${dots}
  
  <!-- Top gold accent bar -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="url(#gold)"/>
  
  <!-- Decorative line elements -->
  <line x1="${isArabic ? 1100 : 100}" y1="240" x2="${isArabic ? 700 : 500}" y2="240" stroke="${catColor}" stroke-opacity="0.15" stroke-width="1"/>
  <line x1="${isArabic ? 1100 : 100}" y1="${titleStartY + (titleLines.length * lineHeight) + 20}" x2="${isArabic ? 600 : 600}" y2="${titleStartY + (titleLines.length * lineHeight) + 20}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  
  <!-- Corner decoration -->
  <rect x="${isArabic ? 40 : WIDTH - 90}" y="40" width="50" height="50" rx="4" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <rect x="${isArabic ? 50 : WIDTH - 80}" y="50" width="30" height="30" rx="2" fill="none" stroke="${catColor}" stroke-opacity="0.1" stroke-width="1"/>
  
  <!-- Category badge -->
  <rect x="${isArabic ? 1100 - catLabel.length * 12 - 32 : 100}" y="180" width="${catLabel.length * 12 + 32}" height="36" rx="18" fill="url(#cat)" stroke="${catColor}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="${isArabic ? 1100 - catLabel.length * 6 - 16 : 100 + catLabel.length * 6 + 16}" y="204" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${catColor}" text-anchor="middle" letter-spacing="1.5">${escapeXml(catLabel.toUpperCase())}</text>
  
  <!-- Title -->
  <text x="${textX}" y="${titleStartY}" font-family="Arial, Helvetica, sans-serif" font-size="${titleFontSize}" font-weight="800" fill="white" text-anchor="${anchor}" direction="${direction}" letter-spacing="-0.5">
    ${titleTspans}
  </text>
  
  <!-- Bottom section -->
  <!-- Brand name -->
  <text x="${isArabic ? 1100 : 100}" y="545" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="white" text-anchor="${anchor}" letter-spacing="2">MASHHOR HUB</text>
  <text x="${isArabic ? 1100 : 100}" y="570" font-family="Arial, sans-serif" font-size="12" font-weight="400" fill="rgba(255,255,255,0.4)" text-anchor="${anchor}" letter-spacing="3">MARKETING • AI • GROWTH</text>
  
  <!-- Website URL -->
  <text x="${isArabic ? 100 : 1100}" y="558" font-family="Arial, sans-serif" font-size="14" font-weight="400" fill="rgba(244,205,85,0.6)" text-anchor="${isArabic ? 'start' : 'end'}" letter-spacing="1">mashhor-hub.com</text>
  
  <!-- Bottom gold accent bar -->
  <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="url(#gold)"/>
</svg>`;
}

// ═══════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════
async function main() {
    // Step 1: Delete all existing OG images
    console.log('Deleting all existing OG images...');
    const existing = fs.readdirSync(OG_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.webp') || f.endsWith('.png'));
    existing.forEach(f => fs.unlinkSync(path.join(OG_DIR, f)));
    console.log(`Deleted ${existing.length} images.\n`);

    // Step 2: Prepare logo - resize to 90px for compositing
    const logoBuffer = await sharp(LOGO_PATH)
        .resize(90, 90, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    // Step 3: Collect all HTML pages and their OG image names
    const pages = [];
    function walk(dir) {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            const s = fs.statSync(p);
            if (s.isDirectory() && !['node_modules', '.git', '.gemini', 'assets'].includes(f)) {
                walk(p);
            } else if (p.endsWith('.html') && !p.includes('Complete_Vault') && !p.includes('flaticon') && !p.includes('license')) {
                const rel = path.relative(__dirname, p).replace(/\\/g, '/');
                const ogName = rel.replace(/\.html$/, '').replace(/\//g, '_') + '.jpg';
                pages.push({ htmlPath: p, ogName, rel });
            }
        });
    }
    walk(__dirname);

    console.log(`Generating ${pages.length} OG thumbnails...\n`);
    let generated = 0;
    let errors = 0;

    for (const page of pages) {
        try {
            const title = extractTitle(page.htmlPath) || page.ogName.replace('.jpg', '').replace(/_/g, ' ');
            const isArabic = isArabicText(title) || page.rel.startsWith('ar/');
            const category = getCategory(page.ogName);
            
            // Create SVG
            const svg = createSVG(title, category, isArabic);
            const svgBuffer = Buffer.from(svg);
            
            // Render SVG to image
            const bgImage = await sharp(svgBuffer)
                .resize(WIDTH, HEIGHT)
                .png()
                .toBuffer();
            
            // Determine logo position
            const logoLeft = isArabic ? 50 : WIDTH - 140;
            const logoTop = HEIGHT - 120;
            
            // Composite logo onto background
            const finalImage = await sharp(bgImage)
                .composite([
                    { input: logoBuffer, left: logoLeft, top: logoTop }
                ])
                .jpeg({ quality: 88, mozjpeg: true })
                .toFile(path.join(OG_DIR, page.ogName));
            
            generated++;
            if (generated % 20 === 0) console.log(`  Progress: ${generated}/${pages.length}`);
        } catch (e) {
            errors++;
            console.error(`  Error: ${page.ogName} - ${e.message}`);
        }
    }

    console.log(`\n═══════ RESULTS ═══════`);
    console.log(`Generated: ${generated}`);
    console.log(`Errors: ${errors}`);
    console.log(`═══════════════════════`);
}

main().catch(console.error);
