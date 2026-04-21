const fs = require('fs');
const path = require('path');

const portfolioDir = path.join(__dirname, 'assets', 'images', 'Portofolio');
const englishFile = path.join(__dirname, 'portfolio', 'index.html');
const arabicFile = path.join(__dirname, 'ar', 'portfolio', 'index.html');

const allFiles = fs.readdirSync(portfolioDir).filter(f => f.endsWith('.webp'));

// ─── EXCLUSION LIST ───
const excludeExact = new Set([
  'l-1.webp', 'l-2.webp', 'l-3.webp',
  'm-1.webp', 'm-2.webp', 'm-3.webp',
  'n-1.webp', 'n-2.webp', 'n-3.webp',
  'mashhor-cloud.webp', 'mashhor-hub.webp',
  'mr-gfx.webp', 'munjiz.webp',
  'de1.webp', 'de2.webp',
  'lastnight.webp', 'video-production.webp',
]);

const items = allFiles.filter(f => !excludeExact.has(f));

// ─── DEDUPLICATION ───
const seenSeries = {};
const deduplicated = [];

items.forEach(file => {
  const nameOnly = file.replace('.webp', '').toLowerCase();

  let prefix;
  const namedMatch = nameOnly.match(/^([a-z][\w-]*?)[\s_-]?\d/i);
  if (namedMatch) {
    prefix = namedMatch[1].replace(/[-_]+$/, '').toLowerCase();
  } else {
    prefix = nameOnly;
  }

  const isNamedSeries = /^[a-z]/i.test(prefix) && prefix.length > 2;
  const maxPerSeries = isNamedSeries ? 1 : 1;

  if (!seenSeries[prefix]) seenSeries[prefix] = 0;
  if (seenSeries[prefix] >= maxPerSeries) return;
  seenSeries[prefix]++;

  deduplicated.push(file);
});

console.log(`Total: ${allFiles.length}, Excluded: ${items.length}, Deduped: ${deduplicated.length}`);

// ─── CATEGORIZATION ───
const categories = [[], [], [], []];

deduplicated.forEach(file => {
  const n = file.toLowerCase().replace('.webp', '');
  let cat = -1;

  if (/^7k2a/i.test(n) || /^dsc/i.test(n) || /^photo_/i.test(n) || /^img_/i.test(n) || /^whatsapp image/i.test(n)) {
    cat = 2;
  } else if (/post|insta|snap|reels|story|artboard|ramad|eid|blog|grow|mark|fake|weak|musk|professor|google|co-founder|update|development|reatch|product/i.test(n)) {
    cat = 1;
  } else if (/oud|box|perfume|beauty|taqeel|thgeel|petmoon|salon|bouv|clinic|derma|cosmo|asnan|aldawaeya|king|valant|شفاء|عرض|مددنا|مشروع|وناسة|يوم|افتتاح/i.test(n)) {
    cat = 0;
  } else if (/platform|web|app|cloud|hub|souq|army|medx|360/i.test(n)) {
    cat = 3;
  } else {
    let minCat = 0;
    for (let i = 1; i < 4; i++) {
      if (categories[i].length < categories[minCat].length) minCat = i;
    }
    cat = minCat;
  }
  categories[cat].push(file);
});

const MAX_PER_CAT = 24;
for (let i = 0; i < 4; i++) categories[i] = categories[i].slice(0, MAX_PER_CAT);
console.log('Per category:', categories.map(c => c.length));

// ─── TITLES ───
const titlesEn = [
  [{ title: "Premium Brand Identity", cat: "Visual Systems" }, { title: "Luxury Packaging Design", cat: "Product Branding" }, { title: "Corporate Identity Suite", cat: "Brand Architecture" }, { title: "Visual Art Direction", cat: "Creative Strategy" }, { title: "Full Brand Experience", cat: "Identity Design" }, { title: "Retail Brand Assets", cat: "Print & Packaging" }],
  [{ title: "Social Media Campaign", cat: "Content Strategy" }, { title: "Performance Creative", cat: "Digital Marketing" }, { title: "Content Production", cat: "Social Management" }, { title: "Viral Campaign Concept", cat: "Growth Marketing" }, { title: "Engagement Optimization", cat: "Account Management" }, { title: "Ad Creative Suite", cat: "Paid Media" }],
  [{ title: "Professional Photography", cat: "Visual Production" }, { title: "Event Coverage", cat: "Live Documentation" }, { title: "Commercial Shoot", cat: "Studio Production" }, { title: "Cinematic Capture", cat: "Creative Direction" }, { title: "Product Photography", cat: "E-Commerce Assets" }, { title: "Brand Photoshoot", cat: "Visual Storytelling" }],
  [{ title: "Digital Platform", cat: "Web Development" }, { title: "E-Commerce Solution", cat: "Conversion Architecture" }, { title: "SaaS Interface Design", cat: "Product Design" }, { title: "Integrated Dashboard", cat: "Technical Execution" }, { title: "Mobile Experience", cat: "App Development" }, { title: "Omnichannel System", cat: "Platform Engineering" }],
];

const titlesAr = [
  [{ title: "هوية بصرية متكاملة", cat: "أنظمة العلامة" }, { title: "تصميم تغليف فاخر", cat: "هوية المنتجات" }, { title: "منظومة هوية مؤسسية", cat: "بناء العلامة" }, { title: "توجيه فني إبداعي", cat: "استراتيجية بصرية" }, { title: "تجربة علامة شاملة", cat: "تصميم الهوية" }, { title: "أصول العلامة التجارية", cat: "الطباعة والتغليف" }],
  [{ title: "حملة سوشيال ميديا", cat: "استراتيجية المحتوى" }, { title: "إبداع إعلاني عالي الأداء", cat: "التسويق الرقمي" }, { title: "إنتاج محتوى احترافي", cat: "إدارة السوشيال" }, { title: "مفهوم حملة تفاعلية", cat: "تسويق النمو" }, { title: "تحسين معدلات التفاعل", cat: "إدارة الحسابات" }, { title: "منظومة إبداع إعلاني", cat: "الإعلانات المدفوعة" }],
  [{ title: "تصوير فوتوغرافي احترافي", cat: "الإنتاج البصري" }, { title: "تغطية فعاليات", cat: "التوثيق الحي" }, { title: "تصوير تجاري", cat: "إنتاج الاستوديو" }, { title: "التقاط سينمائي", cat: "التوجيه الإبداعي" }, { title: "تصوير المنتجات", cat: "أصول التجارة" }, { title: "جلسة تصوير العلامة", cat: "السرد البصري" }],
  [{ title: "منصة رقمية متكاملة", cat: "تطوير الويب" }, { title: "حلول تجارة إلكترونية", cat: "هندسة التحويل" }, { title: "تصميم واجهات SaaS", cat: "تصميم المنتجات" }, { title: "لوحة تحكم ذكية", cat: "تنفيذ تقني" }, { title: "تجربة موبايل", cat: "تطوير التطبيقات" }, { title: "منظومة قنوات شاملة", cat: "هندسة المنصات" }],
];

// ─── HTML GENERATION ───
function generateHTML(catIndex, isArabic) {
  const images = categories[catIndex];
  const titles = isArabic ? titlesAr[catIndex] : titlesEn[catIndex];
  let html = '\n';
  images.forEach((img, idx) => {
    const t = titles[idx % titles.length];
    const src = isArabic ? `../../assets/images/Portofolio/${img}` : `../assets/images/Portofolio/${img}`;
    html += `          <div class="masonry-item reveal">
            <img src="${src}" alt="${t.title}" loading="lazy">
            <div class="masonry-overlay">
              <h4 class="masonry-title">${t.title}</h4>
              <span class="masonry-cat">${t.cat}</span>
            </div>
          </div>\n`;
  });
  return html + '        ';
}

// ─── CAROUSEL REPLACEMENT ───
function replaceCarouselImages(content, isArabic) {
  const prefix = isArabic ? '../../assets/images/Portofolio/' : '../assets/images/Portofolio/';
  // Replace case study images in carousel
  content = content.replace(new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 'l-2\\.webp', 'g'), prefix + 'BOUV-SALON FULL.webp');
  content = content.replace(new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 'm-3\\.webp', 'g'), prefix + 'cosmo-life.webp');
  content = content.replace(new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 'petmoon-1\\.webp', 'g'), prefix + '7K2A0092.webp');
  return content;
}

// ─── FILE INJECTION ───
function updateFile(filePath, isArabic) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Step 1: Replace carousel images
  content = replaceCarouselImages(content, isArabic);

  // Step 2: Replace masonry grid contents
  const parts = content.split('<div class="portfolio-masonry">');
  if (parts.length !== 5) {
    console.log("Expected 4 masonry sections, found " + (parts.length - 1) + " in " + filePath);
    return;
  }

  for (let i = 1; i <= 4; i++) {
    const match = parts[i].match(/<\/div>\s*<\/div>\s*(?:<!-- Category|<\/section>)/);
    if (match) {
      parts[i] = generateHTML(i - 1, isArabic) + parts[i].substring(match.index);
    } else {
      console.log("Could not find closing marker for section " + i);
    }
  }

  fs.writeFileSync(filePath, parts.join('<div class="portfolio-masonry">'));
  console.log("✅ Updated " + filePath);
}

updateFile(englishFile, false);
updateFile(arabicFile, true);
