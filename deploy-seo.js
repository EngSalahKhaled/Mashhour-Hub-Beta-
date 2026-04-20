const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://mashhor-hub.com';

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('assets') && !file.includes('tmp_archive')) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.html') && !file.includes('flaticon')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(__dirname);

// 1. Meta Descriptions Fix
const seoMap = {
    'privacy.html': { en: 'Privacy policy for Mashhor Hub. Learn how we handle your data, protect your privacy, and secure your marketing assets.', ar: 'سياسة الخصوصية لمنصة مشهور هب. تعرف على كيفية حماية بياناتك وتأمين أصولك التسويقية معنا.' },
    'terms.html': { en: 'Terms and Conditions for using Mashhor Hub marketing and AI platform.', ar: 'الشروط والأحكام الخاصة باستعمال منصة مشهور هب وباقاتها التسويقية المتقدمة.' },
    'subscribe.html': { en: 'Subscribe to Mashhor Hub newsletter for the latest modern marketing and AI insights.', ar: 'اشترك الآن في نشرتنا البريدية لتصلك أحدث أسرار التسويق الذكي وأخبار مشهور هب.' },
    'unsubscribe.html': { en: 'Unsubscribe from Mashhor Hub mailing list.', ar: 'إلغاء الاشتراك من القائمة البريدية لمنصة مشهور هب.' },
    'Complete_Vault_Data.html': { ar: 'بيانات أسرار التسويق من مشهور هب.', en: 'Complete Marketing Vault Data from Mashhor Hub.' },
    'Complete_Vault_Data_En.html': { ar: 'بيانات أسرار التسويق من مشهور هب.', en: 'Complete Marketing Vault Data from Mashhor Hub.' }
};

let modifiedFilesCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  const basename = path.basename(file);
  const isArabic = file.replace(/\\/g, '/').includes('/ar/');
  
  // Apply Meta
  if (seoMap[basename]) {
     if (!content.includes('name="description"') && !content.includes("name='description'")) {
         const desc = isArabic ? seoMap[basename].ar : seoMap[basename].en;
         const metaTag = `    <!-- SEO Meta Descriptions -->\n    <meta name="description" content="${desc}">\n`;
         content = content.replace(/<\/head>/i, metaTag + '</head>');
         changed = true;
     }
  }

  // Inject Organization Schema only to actual index files (not inside portfolio/blog etc)
  const isRootIndex = file === path.join(__dirname, 'index.html');
  const isArabicIndex = file === path.join(__dirname, 'ar', 'index.html');
  
  if (isRootIndex || isArabicIndex) {
     if (!content.includes('application/ld+json')) {
        const orgSchema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": isArabicIndex ? "مشهور هب" : "Mashhor Hub",
          "url": DOMAIN + (isArabicIndex ? '/ar/' : '/'),
          "logo": `${DOMAIN}/assets/images/icons/logo-flat.png`,
          "description": isArabicIndex ? "منصة مشهور هب: المنصة الذكية الأولى المتخصصة باللوجستيات وخدمات الإعلانات الشاملة والذكاء الاصطناعي." : "Mashhor Hub: The No.1 smart platform for marketing, AI logistics, and comprehensive digital campaigns.",
          "sameAs": [
            "https://www.linkedin.com/company/mashhor-hub/",
            "https://www.instagram.com/mohamedr.ai",
            "https://www.tiktok.com/@mashhorhub",
            "https://www.facebook.com/mashhor.hub",
            "https://www.snapchat.com/@mashhorhub"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+96555377309",
            "contactType": "customer service",
            "areaServed": ["KW", "SA", "AE", "QA", "BH", "OM"],
            "availableLanguage": ["Arabic", "English"]
          }
        };
        const schemaTag = `\n    <!-- SEO Structured Data -->\n    <script type="application/ld+json">\n${JSON.stringify(orgSchema, null, 2)}\n    </script>\n`;
        content = content.replace(/<\/head>/i, schemaTag + '</head>');
        changed = true;
     }
  }

  if (changed) {
     fs.writeFileSync(file, content, 'utf8');
     modifiedFilesCount++;
  }
}

// 2. Generate Sitemap
let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

let sitemapCount = 0;
for (const file of files) {
  let relPath = path.relative(__dirname, file).replace(/\\/g, '/');
  
  // exclude some internal/dummy paths
  if (relPath.includes('tmp_archive') || relPath.includes('data/') || relPath.includes('prompts/') || relPath.includes('components/')) continue;
  
  const loc = `${DOMAIN}/${relPath === 'index.html' ? '' : relPath}`;
  
  // Define priority
  let priority = '0.6';
  let changefreq = 'monthly';
  if (relPath === 'index.html' || relPath === 'ar/index.html') {
      priority = '1.0';
      changefreq = 'weekly';
  } else if (relPath.includes('blog/') || relPath.includes('services/') || relPath.includes('pricing/')) {
      priority = '0.8';
      changefreq = 'weekly';
  }

  sitemapXML += `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  sitemapCount++;
}

sitemapXML += `</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXML, 'utf8');

// 3. Generate Robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsTxt, 'utf8');

console.log('SEO Enhancements successfully applied!');
console.log(`- Modified ${modifiedFilesCount} files for Meta/Schema injections.`);
console.log(`- Generated sitemap.xml with ${sitemapCount} valid URLs.`);
console.log(`- Generated robots.txt pointing to ${DOMAIN}/sitemap.xml`);
