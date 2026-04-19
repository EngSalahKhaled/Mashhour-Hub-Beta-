(() => {
  const html = document.documentElement;
  const isArabic = html.lang && html.lang.toLowerCase().startsWith("ar");
  const isRTL = html.dir === "rtl";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══════════════════════════════════════════════════
     THEME SYSTEM (Color Selection)
     ═══════════════════════════════════════════════════ */
  // Clear old light/dark preference if it exists
  if (localStorage.getItem('mashhor-theme')) {
    localStorage.removeItem('mashhor-theme');
    html.removeAttribute('data-theme');
  }

  const initTheme = () => {
    const savedColor = localStorage.getItem('mashhor-color-theme');
    if (savedColor && savedColor !== 'default') {
      html.setAttribute('data-color', savedColor);
      
      // ── iOS WebKit Repaint Hack (On Load) ──
      html.style.display = 'none';
      html.offsetHeight; // Force reflow
      html.style.display = '';
    }
  };
  initTheme();

  const mojibakePattern = /(?:â€¦|â€”|â€“|â€|â€¢|â†’|â†|âœ|â–¾|â”‚|ï¸|ðŸ|Ã|Ø|Ù|ط|ظ|€|™|œ|¢|£|¤|¥)/;
  const repairMojibake = (value) => {
    if (typeof value !== "string" || !value || !mojibakePattern.test(value)) return value;

    let output = value;
    for (let i = 0; i < 2; i += 1) {
      try {
        const decoded = decodeURIComponent(escape(output));
        if (!decoded || decoded === output || decoded.includes("�")) break;
        output = decoded;
      } catch (error) {
        break;
      }
    }

    return output
      .replace(/â€“/g, "–")
      .replace(/â€”/g, "—")
      .replace(/â€¦/g, "…")
      .replace(/â€¢/g, "•")
      .replace(/â†’/g, "→")
      .replace(/âœ…/g, "✅")
      .replace(/â–¾/g, "▾")
      .replace(/â”‚/g, "│");
  };

  const normalizeDocumentText = (root = document.body) => {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !mojibakePattern.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      node.nodeValue = repairMojibake(node.nodeValue);
    });

    root.querySelectorAll("*").forEach((el) => {
      ["placeholder", "title", "aria-label", "alt", "value"].forEach((attr) => {
        const current = el.getAttribute(attr);
        if (current && mojibakePattern.test(current)) {
          el.setAttribute(attr, repairMojibake(current));
        }
      });
    });
  };

  const normalizeMetadata = () => {
    document.title = repairMojibake(document.title);
    document.querySelectorAll('meta[name], meta[property]').forEach((meta) => {
      const content = meta.getAttribute("content");
      if (content && mojibakePattern.test(content)) {
        meta.setAttribute("content", repairMojibake(content));
      }
    });
  };

  /* ═══════════════════════════════════════════════════
     PATH PREFIX DETECTION
     ═══════════════════════════════════════════════════ */
  const getPrefix = () => {
    try {
      const script = document.currentScript || document.querySelector('script[src*="mashhor-platform.js"]');
      if (script && script.getAttribute("src")) {
        const src = script.getAttribute("src");
        const idx = src.indexOf("assets/js/mashhor-platform.js");
        if (idx !== -1) return src.substring(0, idx);
      }
    } catch (e) {}
    const path = window.location.pathname.replace(/\\/g, "/");
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return "./";
    if (window.location.protocol === 'file:') {
      const idx = parts.findIndex(p => p === 'ar' || p === 'services' || p === 'academy' || p === 'pricing' || p === 'blog' || p === 'book-call' || p === 'case-studies' || p === 'legal' || p === 'prompts' || p === 'search' || p === 'portfolio' || Boolean(p.match(/\.html$/)));
      if (idx !== -1) {
        const remaining = parts.length - idx;
        return remaining <= 1 ? "./" : "../".repeat(remaining - 1);
      }
      return "./";
    }
    const fileLike = parts[parts.length - 1].includes(".");
    const depth = fileLike ? parts.length - 1 : parts.length;
    return depth === 0 ? "./" : "../".repeat(depth);
  };

  const prefix = getPrefix();
  const brandSrc = `${prefix}assets/images/icons/logo-flat.png`;
  const currentPath = window.location.pathname.replace(/\\/g, "/");

  /* ═══════════════════════════════════════════════════
     ACTIVE LINK DETECTION
     ═══════════════════════════════════════════════════ */
  const isActive = (href) => {
    const norm = (p) => p.replace(/\\/g, "/").replace(/\/index\.html$/, "/").replace(/\/$/, "").toLowerCase();
    return norm(currentPath).endsWith(norm(href).replace(/^\.\/|^\.\.\//g, ""));
  };

  /* ═══════════════════════════════════════════════════
     HEADER INJECTION
     ═══════════════════════════════════════════════════ */
  const headerEl = document.querySelector("[data-platform-header]");
  if (headerEl) {
    const p = prefix;
    // arBase: prefix always resolves to the SITE root, so Arabic links always need ar/ appended
    const arBase = `${p}ar/`;
    // enP: use prefix directly — it correctly resolves to site root from any depth
    const enP = p;
    const nav = isArabic ? {
      home: { text: "الرئيسية", href: `${arBase}index.html` },
      about: { text: "من نحن", href: `${arBase}about.html` },
      services: { text: "الخدمات", children: [
        { text: "التسويق المؤثر", href: `${arBase}services/influencer-marketing.html` },
        { text: "الهوية البصرية", href: `${arBase}services/graphic-design.html` },
        { text: "الإعلانات الرقمية", href: `${arBase}services/e-marketing.html` },
        { text: "الإنتاج المرئي", href: `${arBase}services/video-production.html` },
        { text: "كتابة المحتوى", href: `${arBase}services/content-writing.html` },
        { text: "تحسين محركات البحث", href: `${arBase}services/seo.html` },
        { text: "الأتمتة والذكاء", href: `${arBase}services/smart-automation.html` },
        { text: "الاستشارات", href: `${arBase}services/consultation.html` }
      ]},
      explore: { text: "استكشف", children: [
        { text: "الأعمال", href: `${arBase}portfolio/index.html` },
        { text: "المؤثرون", href: `${arBase}influencers/index.html` },
        { text: "Mashhor AI", href: `${arBase}services/mashhor-ai.html` },
        { text: "الباقات", href: `${arBase}pricing/index.html` },
        { text: "الأكاديمية", href: `${arBase}academy/index.html` }
      ]},
      blog: { text: "المدونة", href: `${arBase}blog/index.html` },
      contact: { text: "تواصل", href: `${arBase}contact.html` },
      langText: "English",
      langHref: `${arBase}../index.html`,
      ctaText: "ابدأ مشروعك",
      ctaHref: `${arBase}contact.html`,
      brandName: "مشهور هب",
      brandSub: "MARKETING • AI • GROWTH"
    } : {
      home: { text: "Home", href: `${enP}index.html` },
      about: { text: "About", href: `${enP}about.html` },
      services: { text: "Services", children: [
        { text: "Influencer Marketing", href: `${enP}services/influencer-marketing.html` },
        { text: "Brand Identity & Design", href: `${enP}services/graphic-design.html` },
        { text: "Digital Advertising", href: `${enP}services/e-marketing.html` },
        { text: "Video Production", href: `${enP}services/video-production.html` },
        { text: "Content Writing", href: `${enP}services/content-writing.html` },
        { text: "SEO", href: `${enP}services/seo.html` },
        { text: "AI & Automation", href: `${enP}services/smart-automation.html` },
        { text: "Consultation", href: `${enP}services/consultation.html` }
      ]},
      explore: { text: "Explore", children: [
        { text: "Portfolio", href: `${enP}portfolio/index.html` },
        { text: "Influencers", href: `${enP}influencers/index.html` },
        { text: "Mashhor AI", href: `${enP}services/mashhor-ai.html` },
        { text: "Pricing", href: `${enP}pricing/index.html` },
        { text: "Academy", href: `${enP}academy/index.html` }
      ]},
      blog: { text: "Blog", href: `${enP}blog/index.html` },
      contact: { text: "Contact", href: `${enP}contact.html` },
      langText: "العربية",
      langHref: `${p}ar/index.html`,
      ctaText: "Start Now",
      ctaHref: `${p}contact.html`,
      brandName: "Mashhor Hub",
      brandSub: "MARKETING • AI • GROWTH"
    };

    // Fix lang href based on alternate hreflang
    // Only use the hreflang URL override on the real production domain.
    // On localhost / file:// the hreflang tags point to https://mashhor-hub.com/…
    // which would extract an absolute path like /ar/ and cause "Cannot GET /ar/" errors.
    const altLink = document.querySelector('link[rel="alternate"][hreflang="' + (isArabic ? 'en' : 'ar') + '"]');
    if (altLink) {
      try {
        const u = new URL(altLink.href);
        const isProduction = window.location.hostname === u.hostname && u.hostname !== '' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1';
        if (isProduction) {
          // On production the hreflang href is a reliable absolute URL — use its pathname directly
          nav.langHref = u.pathname;
        }
        // On local dev / file:// we keep the relative-path langHref already computed above
      } catch (e) {}
    }

    const activeClass = (href) => isActive(href) ? ' is-active' : '';

    const servicesDropdown = nav.services.children.map(c =>
      `<a class="global-dropdown-link${activeClass(c.href)}" href="${c.href}">${c.text}</a>`
    ).join("");

    const exploreDropdown = nav.explore.children.map(c =>
      `<a class="global-dropdown-link${activeClass(c.href)}" href="${c.href}">${c.text}</a>`
    ).join("");

    headerEl.innerHTML = `
    <header class="global-header" id="global-header">
      <div class="global-header-inner">
        <a class="global-brand" href="${nav.home.href}">
          <img src="${brandSrc}" alt="${nav.brandName}" width="54" height="54">
          <div class="global-brand-copy">
            <strong>${nav.brandName}</strong>
            <small>${nav.brandSub}</small>
          </div>
        </a>
        <nav class="global-nav" aria-label="Main Navigation">
          <a class="global-nav-link${activeClass(nav.home.href)}" href="${nav.home.href}">${nav.home.text}</a>
          <a class="global-nav-link${activeClass(nav.about.href)}" href="${nav.about.href}">${nav.about.text}</a>
          <div class="global-nav-item">
            <button class="global-nav-trigger">
              <span>${nav.services.text}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="global-dropdown">${servicesDropdown}</div>
          </div>
          <div class="global-nav-item">
            <button class="global-nav-trigger">
              <span>${nav.explore.text}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="global-dropdown">${exploreDropdown}</div>
          </div>
          <a class="global-nav-link${activeClass(nav.blog.href)}" href="${nav.blog.href}">${nav.blog.text}</a>
        </nav>
        <div class="global-actions">
          <div class="bilingual-search-wrapper desktop-search">
            <input type="search" class="bilingual-search-input" placeholder="${isArabic ? 'ابحث...' : 'Search...'}" autocomplete="off">
            <ul class="bilingual-search-dropdown" hidden></ul>
          </div>
          <div class="theme-color-picker" id="theme-color-picker">
            <button class="color-picker-toggle" aria-label="${isArabic ? 'اختر لون الواجهة' : 'Select Theme Color'}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22a10 10 0 0 0 10-10H22A10 10 0 0 0 12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10z"></path>
                <path d="M12 6v2m0 8v2M6 12h2m8 0h2"></path>
              </svg>
            </button>
            <div class="color-picker-menu">
              <button class="color-dot" data-color="default" aria-label="ذهبي" style="background: linear-gradient(135deg, #f4cd55, #b8860b);"></button>
              <button class="color-dot" data-color="light" aria-label="أبيض" style="background: linear-gradient(135deg, #ffffff, #e2e8f0); border: 1px solid #cbd5e1;"></button>
              <button class="color-dot" data-color="blue" aria-label="أزرق" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);"></button>
              <button class="color-dot" data-color="green" aria-label="أخضر" style="background: linear-gradient(135deg, #10b981, #047857);"></button>
              <button class="color-dot" data-color="purple" aria-label="بنفسجي" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9);"></button>
            </div>
          </div>
          <a class="global-lang" href="${nav.langHref}">${nav.langText}</a>
          <a class="global-cta" href="${nav.ctaHref}">${nav.ctaText}</a>
          <button class="global-burger" id="global-burger" aria-label="${isArabic ? 'القائمة' : 'Menu'}" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="global-mobile-panel" id="global-mobile-panel">
        <div class="global-mobile-header">
          <div class="global-mobile-brand">
            <img src="${brandSrc}" alt="${nav.brandName}" width="36" height="36">
            <strong>${nav.brandName}</strong>
          </div>
          <div class="global-mobile-header-actions">
            <div class="theme-color-picker" id="theme-color-picker-mobile">
              <button class="color-picker-toggle" aria-label="${isArabic ? 'اختر لون الواجهة' : 'Select Theme Color'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22a10 10 0 0 0 10-10H22A10 10 0 0 0 12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10z"></path>
                  <path d="M12 6v2m0 8v2M6 12h2m8 0h2"></path>
                </svg>
              </button>
              <div class="color-picker-menu">
                <button class="color-dot" data-color="default" aria-label="ذهبي" style="background: linear-gradient(135deg, #f4cd55, #b8860b);"></button>
                <button class="color-dot" data-color="light" aria-label="أبيض" style="background: linear-gradient(135deg, #ffffff, #e2e8f0); border: 1px solid #cbd5e1;"></button>
                <button class="color-dot" data-color="blue" aria-label="أزرق" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);"></button>
                <button class="color-dot" data-color="green" aria-label="أخضر" style="background: linear-gradient(135deg, #10b981, #047857);"></button>
                <button class="color-dot" data-color="purple" aria-label="بنفسجي" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9);"></button>
              </div>
            </div>
            <button type="button" class="global-mobile-close" id="global-mobile-close" aria-label="${isArabic ? 'إغلاق' : 'Close'}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div class="global-mobile-nav-frame">
          <div class="bilingual-search-wrapper mobile-search">
            <input type="search" class="bilingual-search-input" placeholder="${isArabic ? 'ابحث عن خدمة...' : 'Search services...'}" autocomplete="off">
            <ul class="bilingual-search-dropdown" hidden></ul>
          </div>
          <a class="global-mobile-link${activeClass(nav.home.href)}" href="${nav.home.href}">${nav.home.text}</a>
          <a class="global-mobile-link${activeClass(nav.about.href)}" href="${nav.about.href}">${nav.about.text}</a>
          <details class="global-mobile-group">
            <summary>${nav.services.text}</summary>
            ${nav.services.children.map(c => `<a class="global-mobile-link${activeClass(c.href)}" href="${c.href}">${c.text}</a>`).join("")}
          </details>
          <details class="global-mobile-group">
            <summary>${nav.explore.text}</summary>
            ${nav.explore.children.map(c => `<a class="global-mobile-link${activeClass(c.href)}" href="${c.href}">${c.text}</a>`).join("")}
          </details>
          <a class="global-mobile-link${activeClass(nav.blog.href)}" href="${nav.blog.href}">${nav.blog.text}</a>
          <a class="global-mobile-link${activeClass(nav.contact.href)}" href="${nav.contact.href}">${nav.contact.text}</a>
        </div>
        <div class="mobile-actions">
          <a class="mobile-lang" href="${nav.langHref}">${nav.langText}</a>
          <a class="mobile-cta" href="${nav.ctaHref}">${nav.ctaText}</a>
        </div>
        <div class="mobile-social" style="flex-wrap: wrap;">
          <a href="https://www.linkedin.com/company/mashhor-hub/" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <a href="https://www.instagram.com/mohamedr.ai" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.203 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
          <a href="https://www.facebook.com/mashhor.hub" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="https://www.snapchat.com/@mashhorhub" aria-label="Snapchat"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.83 1.156A6.29 6.29 0 0 0 7.82.022 6.06 6.06 0 0 0 1.956 5.86c0 1.25-.098 2.21-.302 2.872a.81.81 0 0 1-.508.52 1.48 1.48 0 0 1-.617.069C.207 9.278 0 9.38 0 9.54c0 .151.78.685 1.547 1.05.514.246.906.402.956.467.042.054.06.183.048.337-.021.282-.164.717-.384 1.144a1.86 1.86 0 0 0-.156.404c-.035.155 0 .285.105.39.117.116.327.172.607.166.425-.01.996-.134 1.583-.346.42-.15.753-.292.83-.357.062-.052.17-.066.27-.035.104.032.253.111.385.203 1.085.761 2.373 1.168 3.731 1.168 1.424 0 2.766-.437 3.868-1.25.13-.095.27-.168.367-.196.09-.026.195-.011.25.034.072.06.4.2 1.002.43 1.254.475 2.502.73 3.031.6.143-.035.21-.107.24-.26a2.6 2.6 0 0 0-.083-.455c-.244-.795-.36-1.127-.403-1.189-.048-.069-.025-.2.062-.357.17-.306.94-1.026 1.62-1.503.491-.345.867-.655 1.09-.9.232-.253.307-.387.26-.467-.091-.157-1.13-.505-1.921-.637-.167-.027-.3-.07-.376-.118a.386.386 0 0 1-.22-.249 5 5 0 0 1-.229-1.272c-.105-1.428-.592-2.825-1.397-4.004C18.667 3.3 16.924 1.863 14.887 1.1c-.818-.306-1.98-.38-3.057.056Z"/></svg></a>
          <a href="https://www.tiktok.com/@mashhorhub" aria-label="TikTok"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.5-.32 3.03-1.05 4.38-1.05 1.94-2.89 3.32-4.99 3.82-1.89.44-3.95.27-5.71-.56-2.02-.95-3.56-2.71-4.22-4.81-.62-1.94-.49-4.14.37-5.96 1.07-2.28 3.25-3.92 5.68-4.32 1.06-.18 2.14-.14 3.19.06V11.7c-.55-.07-1.12-.04-1.66.08a4.918 4.918 0 0 0-3.32 2.37c-.7 1.12-.99 2.52-.77 3.83.21 1.23.86 2.37 1.84 3.12.98.74 2.23 1.08 3.45 1.01 1.48-.09 2.92-.85 3.8-2.05.74-1.02 1.14-2.3 1.14-3.58V.02z"/></svg></a>
          <a href="https://www.pinterest.com/mashhorhub/" aria-label="Pinterest"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/></svg></a>
        </div>
      </div>
    </header>`;

    // Mobile burger toggle
    const burger = document.getElementById("global-burger");
    const mobilePanel = document.getElementById("global-mobile-panel");
    if (burger && mobilePanel) {
      // Move mobile panel to body level so it's not trapped in
      // the header's stacking context (sticky + backdrop-filter)
      document.body.appendChild(mobilePanel);

      let mobileBackdrop = document.getElementById("global-mobile-backdrop");
      if (!mobileBackdrop) {
        mobileBackdrop = document.createElement("button");
        mobileBackdrop.type = "button";
        mobileBackdrop.id = "global-mobile-backdrop";
        mobileBackdrop.className = "global-mobile-backdrop";
        mobileBackdrop.setAttribute("aria-label", isArabic ? "إغلاق القائمة" : "Close menu");
        document.body.appendChild(mobileBackdrop);
      }

      const mobileFocusableSelector = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
      const closeMobileNav = () => {
        mobilePanel.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        document.body.classList.remove("mobile-nav-open");
      };

      const openMobileNav = () => {
        mobilePanel.classList.add("open");
        burger.classList.add("open");
        burger.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
        document.body.classList.add("mobile-nav-open");
        mobilePanel.querySelector(mobileFocusableSelector)?.focus();
      };

      burger.addEventListener("click", () => {
        if (mobilePanel.classList.contains("open")) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
      });

      mobileBackdrop.addEventListener("click", closeMobileNav);
      
      const mobileCloseBtn = document.getElementById("global-mobile-close");
      if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener("click", closeMobileNav);
      }

      document.addEventListener("keydown", (event) => {
        if (!mobilePanel.classList.contains("open")) return;
        if (event.key === "Escape") {
          closeMobileNav();
          burger.focus();
        }

        if (event.key === "Tab") {
          const focusables = Array.from(mobilePanel.querySelectorAll(mobileFocusableSelector))
            .filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 960 && mobilePanel.classList.contains("open")) {
          closeMobileNav();
        }
      });

      // Close on link click
      mobilePanel.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
          closeMobileNav();
        });
      });
    }

    // Theme color picker handler
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedColor = e.currentTarget.getAttribute('data-color');
        if (selectedColor === 'default') {
          html.removeAttribute('data-color');
          localStorage.removeItem('mashhor-color-theme');
        } else {
          html.setAttribute('data-color', selectedColor);
          localStorage.setItem('mashhor-color-theme', selectedColor);
        }

        // ── iOS WebKit Repaint Hack ──
        // Toggle display to force Safari to flush its render queue
        html.style.display = 'none';
        html.offsetHeight; // Force reflow
        html.style.display = '';
        
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        document.querySelectorAll(`.color-dot[data-color="${selectedColor}"]`).forEach(d => d.classList.add('active'));
        
        // Close menu after selection
        document.querySelectorAll('.color-picker-menu').forEach(m => m.classList.remove('show'));
      });
      
      const currentTheme = html.getAttribute('data-color') || 'default';
      if (currentTheme === dot.getAttribute('data-color')) {
        dot.classList.add('active');
      }
    });

    const pickerToggles = document.querySelectorAll('.color-picker-toggle');
    pickerToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = toggle.nextElementSibling;
        const isShowing = menu.classList.contains('show');
        document.querySelectorAll('.color-picker-menu').forEach(m => m.classList.remove('show'));
        if (!isShowing) menu.classList.add('show');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.color-picker-menu').forEach(m => m.classList.remove('show'));
    });

    // Bilingual Search Integration
    const searchBase = isArabic ? arBase : p;
    const servicesDB = [
      { url: searchBase + "programming.html", titleAr: "تطوير الويب", titleEn: "Web Development", keywords: ["برمجة", "مواقع", "منصات", "web", "coding", "development", "website"] },
      { url: searchBase + "services/graphic-design.html", titleAr: "الهوية البصرية", titleEn: "Brand Identity & Design", keywords: ["تصميم", "واجهة", "تجربة", "design", "interface", "experience", "ui", "ux", "graphic"] },
      { url: searchBase + "services/seo.html", titleAr: "تحسين محركات البحث", titleEn: "SEO", keywords: ["جوجل", "ارشفة", "محركات", "بحث", "google", "search", "ranking", "optimization"] },
      { url: searchBase + "services/e-marketing.html", titleAr: "الإعلانات الرقمية", titleEn: "Digital Advertising", keywords: ["تسويق", "إعلانات", "مبيعات", "ads", "digital", "marketing", "sales", "meta", "tiktok"] },
      { url: searchBase + "services/influencer-marketing.html", titleAr: "التسويق المؤثر", titleEn: "Influencer Marketing", keywords: ["مؤثرين", "مشاهير", "حملات", "creator", "campaigns", "influencer"] },
      { url: searchBase + "services/video-production.html", titleAr: "الإنتاج المرئي", titleEn: "Video Production", keywords: ["فيديو", "تصوير", "انتاج", "video", "production", "shooting"] },
      { url: searchBase + "services/smart-automation.html", titleAr: "الذكاء الاصطناعي والأتمتة", titleEn: "AI & Automation", keywords: ["ذكاء", "اصطناعي", "روبوت", "اتمتة", "ai", "automation", "systems", "bots"] },
      { url: searchBase + "services/content-writing.html", titleAr: "كتابة المحتوى", titleEn: "Content Writing", keywords: ["محتوى", "كتابة", "مقالات", "content", "writing", "copywriting", "blog", "articles"] },
      { url: searchBase + "services/consultation.html", titleAr: "الاستشارات", titleEn: "Consultation", keywords: ["استشارة", "استشارات", "نمو", "consultation", "consulting", "strategy", "growth"] },
      { url: searchBase + "services/mashhor-ai.html", titleAr: "Mashhor AI", titleEn: "Mashhor AI", keywords: ["ذكاء", "mashhor", "ai", "مشهور", "أداة", "tool", "cloud"] }
    ];

    const normalizeText = (text) => {
      if (!text) return "";
      return text.toString().trim().toLowerCase()
        .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ـ/g, "");
    };

    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };

    document.querySelectorAll(".bilingual-search-wrapper").forEach(wrapper => {
      const input = wrapper.querySelector(".bilingual-search-input");
      const dropdown = wrapper.querySelector(".bilingual-search-dropdown");
      
      const handleSearch = () => {
        const normQuery = normalizeText(input.value);
        if (!normQuery) {
          dropdown.innerHTML = "";
          dropdown.hidden = true;
          return;
        }

        const matches = servicesDB.filter((item) => {
          return normalizeText(item.titleAr).includes(normQuery) || 
                 normalizeText(item.titleEn).includes(normQuery) || 
                 item.keywords.some(kw => normalizeText(kw).includes(normQuery));
        });

        dropdown.innerHTML = "";
        if (matches.length > 0) {
          matches.forEach((item) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = item.url;
            a.textContent = isArabic ? item.titleAr : item.titleEn;
            li.appendChild(a);
            dropdown.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "no-results";
          li.textContent = isArabic ? "لم يتم العثور على نتائج" : "No results found";
          dropdown.appendChild(li);
        }
        dropdown.hidden = false;
      };

      input.addEventListener("input", debounce(handleSearch, 300));
      input.addEventListener("focus", () => {
        if (input.value.trim() !== "") dropdown.hidden = false;
      });
    });

    document.addEventListener("click", (e) => {
      document.querySelectorAll(".bilingual-search-wrapper").forEach(wrapper => {
        const dropdown = wrapper.querySelector(".bilingual-search-dropdown");
        if (dropdown && !wrapper.contains(e.target)) dropdown.hidden = true;
      });
    });

    // Header scroll behavior
    const globalHeader = document.getElementById("global-header");
    if (globalHeader) {
      let lastScroll = 0;
      let headerHidden = false;
      window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        globalHeader.classList.toggle("scrolled", scrollY > 60);
        if (scrollY > 300 && scrollY > lastScroll && !headerHidden) {
          globalHeader.classList.add("hidden");
          headerHidden = true;
        } else if (scrollY < lastScroll && headerHidden) {
          globalHeader.classList.remove("hidden");
          headerHidden = false;
        }
        lastScroll = scrollY;
      }, { passive: true });
    }
  }

  /* ═══════════════════════════════════════════════════
     FOOTER INJECTION
     ═══════════════════════════════════════════════════ */
  const footerEl = document.querySelector("[data-platform-footer]");
  if (footerEl) {
    const p = prefix;
    const year = new Date().getFullYear();

    if (isArabic) {
      const arFp = `${p}ar/`;
      footerEl.innerHTML = `
      <footer class="global-footer">
        <div class="global-footer-grid">
          <div class="global-footer-brand">
            <img src="${brandSrc}" alt="مشهور هب" width="86">
            <h3>مشهور هب</h3>
            <p>منصة كويتية متكاملة تخدم الخليج والوطن العربي — وتجمع بين الحملات الإعلانية، والإبداع، والذكاء الاصطناعي في واجهة تشغيل واحدة.</p>
            <div class="global-footer-social" style="display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0;">
              <a href="https://www.linkedin.com/company/mashhor-hub/" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
              <a href="https://www.instagram.com/mohamedr.ai" aria-label="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.203 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              <a href="https://www.facebook.com/mashhor.hub" aria-label="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
              <a href="https://www.snapchat.com/@mashhorhub" aria-label="Snapchat"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.83 1.156A6.29 6.29 0 0 0 7.82.022 6.06 6.06 0 0 0 1.956 5.86c0 1.25-.098 2.21-.302 2.872a.81.81 0 0 1-.508.52 1.48 1.48 0 0 1-.617.069C.207 9.278 0 9.38 0 9.54c0 .151.78.685 1.547 1.05.514.246.906.402.956.467.042.054.06.183.048.337-.021.282-.164.717-.384 1.144a1.86 1.86 0 0 0-.156.404c-.035.155 0 .285.105.39.117.116.327.172.607.166.425-.01.996-.134 1.583-.346.42-.15.753-.292.83-.357.062-.052.17-.066.27-.035.104.032.253.111.385.203 1.085.761 2.373 1.168 3.731 1.168 1.424 0 2.766-.437 3.868-1.25.13-.095.27-.168.367-.196.09-.026.195-.011.25.034.072.06.4.2 1.002.43 1.254.475 2.502.73 3.031.6.143-.035.21-.107.24-.26a2.6 2.6 0 0 0-.083-.455c-.244-.795-.36-1.127-.403-1.189-.048-.069-.025-.2.062-.357.17-.306.94-1.026 1.62-1.503.491-.345.867-.655 1.09-.9.232-.253.307-.387.26-.467-.091-.157-1.13-.505-1.921-.637-.167-.027-.3-.07-.376-.118a.386.386 0 0 1-.22-.249 5 5 0 0 1-.229-1.272c-.105-1.428-.592-2.825-1.397-4.004C18.667 3.3 16.924 1.863 14.887 1.1c-.818-.306-1.98-.38-3.057.056Z"/></svg></a>
              <a href="https://www.tiktok.com/@mashhorhub" aria-label="TikTok"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.5-.32 3.03-1.05 4.38-1.05 1.94-2.89 3.32-4.99 3.82-1.89.44-3.95.27-5.71-.56-2.02-.95-3.56-2.71-4.22-4.81-.62-1.94-.49-4.14.37-5.96 1.07-2.28 3.25-3.92 5.68-4.32 1.06-.18 2.14-.14 3.19.06V11.7c-.55-.07-1.12-.04-1.66.08a4.918 4.918 0 0 0-3.32 2.37c-.7 1.12-.99 2.52-.77 3.83.21 1.23.86 2.37 1.84 3.12.98.74 2.23 1.08 3.45 1.01 1.48-.09 2.92-.85 3.8-2.05.74-1.02 1.14-2.3 1.14-3.58V.02z"/></svg></a>
              <a href="https://www.pinterest.com/mashhorhub/" aria-label="Pinterest"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/></svg></a>
            </div>
            <a class="global-footer-cta" href="${arFp}contact.html">ابدأ مشروعك</a>
          </div>
          <div class="global-footer-col">
            <h4>الخدمات</h4>
            <a href="${arFp}services/influencer-marketing.html">التسويق المؤثر</a>
            <a href="${arFp}services/graphic-design.html">الهوية البصرية</a>
            <a href="${arFp}services/e-marketing.html">الإعلانات الرقمية</a>
            <a href="${arFp}services/video-production.html">الإنتاج المرئي</a>
            <a href="${arFp}services/smart-automation.html">الذكاء الاصطناعي</a>
            <a href="${arFp}services/consultation.html">الاستشارات</a>
          </div>
          <div class="global-footer-col">
            <h4>المنصة</h4>
            <a href="${arFp}about.html">من نحن</a>
            <a href="${arFp}portfolio/index.html">الأعمال</a>
            <a href="${arFp}case-studies/index.html">دراسات الحالة</a>
            <a href="${arFp}pricing/index.html">الباقات</a>
            <a href="${arFp}blog/index.html">المدونة</a>
            <a href="${arFp}academy/index.html">الأكاديمية</a>
          </div>
          <div class="global-footer-col">
            <h4>تواصل</h4>
            <a href="https://wa.me/96555377309" target="_blank" rel="noopener">واتساب</a>
            <a href="mailto:info@mashhor-hub.com">البريد الإلكتروني</a>
            <a href="tel:+96555377309">هاتف: +965 5537 7309</a>
            <a href="${arFp}book-call/index.html">حجز مكالمة</a>
            <a href="${arFp}faqs.html">الأسئلة الشائعة</a>
          </div>
        </div>
        <div class="global-footer-legal">
          <a href="${arFp}legal/privacy.html">سياسة الخصوصية</a>
          <a href="${arFp}legal/terms.html">الشروط والأحكام</a>
          <a href="${arFp}sitemap.html">خريطة الموقع</a>
        </div>
        <div class="global-footer-bottom">© ${year} مشهور هب. جميع الحقوق محفوظة. الكويت</div>
      </footer>
      <div class="sticky-mobile-cta" id="sticky-cta">
        <div class="sticky-cta-text">
          <strong>مستعد للنمو؟</strong>
          <span>احجز جلستك الآن</span>
        </div>
        <a href="${arFp}contact.html" class="button button-gold" style="padding: 10px 16px; font-size: 0.9rem; white-space: nowrap;">احجز الآن</a>
      </div>`;
    } else {
      footerEl.innerHTML = `
      <footer class="global-footer">
        <div class="global-footer-grid">
          <div class="global-footer-brand">
            <img src="${brandSrc}" alt="Mashhor Hub" width="86">
            <h3>Mashhor Hub</h3>
            <p>A premium Kuwaiti marketing platform for the GCC and Arab world — unifying campaigns, creativity, and AI.</p>
            <div class="global-footer-social" style="display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0;">
              <a href="https://www.linkedin.com/company/mashhor-hub/" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
              <a href="https://www.instagram.com/mohamedr.ai" aria-label="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.203 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              <a href="https://www.facebook.com/mashhor.hub" aria-label="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
              <a href="https://www.snapchat.com/@mashhorhub" aria-label="Snapchat"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.83 1.156A6.29 6.29 0 0 0 7.82.022 6.06 6.06 0 0 0 1.956 5.86c0 1.25-.098 2.21-.302 2.872a.81.81 0 0 1-.508.52 1.48 1.48 0 0 1-.617.069C.207 9.278 0 9.38 0 9.54c0 .151.78.685 1.547 1.05.514.246.906.402.956.467.042.054.06.183.048.337-.021.282-.164.717-.384 1.144a1.86 1.86 0 0 0-.156.404c-.035.155 0 .285.105.39.117.116.327.172.607.166.425-.01.996-.134 1.583-.346.42-.15.753-.292.83-.357.062-.052.17-.066.27-.035.104.032.253.111.385.203 1.085.761 2.373 1.168 3.731 1.168 1.424 0 2.766-.437 3.868-1.25.13-.095.27-.168.367-.196.09-.026.195-.011.25.034.072.06.4.2 1.002.43 1.254.475 2.502.73 3.031.6.143-.035.21-.107.24-.26a2.6 2.6 0 0 0-.083-.455c-.244-.795-.36-1.127-.403-1.189-.048-.069-.025-.2.062-.357.17-.306.94-1.026 1.62-1.503.491-.345.867-.655 1.09-.9.232-.253.307-.387.26-.467-.091-.157-1.13-.505-1.921-.637-.167-.027-.3-.07-.376-.118a.386.386 0 0 1-.22-.249 5 5 0 0 1-.229-1.272c-.105-1.428-.592-2.825-1.397-4.004C18.667 3.3 16.924 1.863 14.887 1.1c-.818-.306-1.98-.38-3.057.056Z"/></svg></a>
              <a href="https://www.tiktok.com/@mashhorhub" aria-label="TikTok"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.5-.32 3.03-1.05 4.38-1.05 1.94-2.89 3.32-4.99 3.82-1.89.44-3.95.27-5.71-.56-2.02-.95-3.56-2.71-4.22-4.81-.62-1.94-.49-4.14.37-5.96 1.07-2.28 3.25-3.92 5.68-4.32 1.06-.18 2.14-.14 3.19.06V11.7c-.55-.07-1.12-.04-1.66.08a4.918 4.918 0 0 0-3.32 2.37c-.7 1.12-.99 2.52-.77 3.83.21 1.23.86 2.37 1.84 3.12.98.74 2.23 1.08 3.45 1.01 1.48-.09 2.92-.85 3.8-2.05.74-1.02 1.14-2.3 1.14-3.58V.02z"/></svg></a>
              <a href="https://www.pinterest.com/mashhorhub/" aria-label="Pinterest"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/></svg></a>
            </div>
            <a class="global-footer-cta" href="${p}contact.html">Start Your Project</a>
          </div>
          <div class="global-footer-col">
            <h4>Services</h4>
            <a href="${p}services/influencer-marketing.html">Influencer Marketing</a>
            <a href="${p}services/graphic-design.html">Brand Identity & Design</a>
            <a href="${p}services/e-marketing.html">Digital Advertising</a>
            <a href="${p}services/video-production.html">Video Production</a>
            <a href="${p}services/smart-automation.html">AI & Automation</a>
            <a href="${p}services/consultation.html">Consultation</a>
          </div>
          <div class="global-footer-col">
            <h4>Platform</h4>
            <a href="${p}about.html">About</a>
            <a href="${p}portfolio/index.html">Portfolio</a>
            <a href="${p}case-studies/index.html">Case Studies</a>
            <a href="${p}pricing/index.html">Pricing</a>
            <a href="${p}blog/index.html">Blog</a>
            <a href="${p}academy/index.html">Academy</a>
          </div>
          <div class="global-footer-col">
            <h4>Connect</h4>
            <a href="https://wa.me/96555377309" target="_blank" rel="noopener">WhatsApp</a>
            <a href="mailto:info@mashhor-hub.com">Email</a>
            <a href="tel:+96555377309">Phone: +965 5537 7309</a>
            <a href="${p}book-call/index.html">Book a Call</a>
            <a href="${p}faqs.html">FAQs</a>
          </div>
        </div>
        <div class="global-footer-legal">
          <a href="${p}legal/privacy.html">Privacy Policy</a>
          <a href="${p}legal/terms.html">Terms & Conditions</a>
          <a href="${p}sitemap.html">Sitemap</a>
        </div>
        <div class="global-footer-bottom">© ${year} Mashhor Hub. All rights reserved. Kuwait</div>
      </footer>
      <div class="sticky-mobile-cta" id="sticky-cta">
        <div class="sticky-cta-text">
          <strong>Ready to scale?</strong>
          <span>Book your session today</span>
        </div>
        <a href="${p}contact.html" class="button button-gold" style="padding: 10px 16px; font-size: 0.9rem; white-space: nowrap;">Book a Call</a>
      </div>`;
    }
  }

  /* ═══════════════════════════════════════════════════
     MASHHOR ANIMATED BACKGROUND TEXT
     ═══════════════════════════════════════════════════ */
  const bgText = document.createElement("div");
  bgText.id = "mashhor-bg-text";
  bgText.innerHTML = isArabic ? "مشهور<br>هب" : "Mashhor<br>Hub";
  document.body.appendChild(bgText);

  /* ═══════════════════════════════════════════════════
     SCROLL PROGRESS BAR
     ═══════════════════════════════════════════════════ */
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.appendChild(progressBar);

  /* ═══════════════════════════════════════════════════
     BACK TO TOP BUTTON
     ═══════════════════════════════════════════════════ */
  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", isArabic ? "العودة للأعلى" : "Back to top");
  backToTop.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
  document.body.appendChild(backToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  // Scroll handler for progress + back-to-top
  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        progressBar.style.width = pct + "%";
        backToTop.classList.toggle("visible", scrollY > 400);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  /* ═══════════════════════════════════════════════════
     WHATSAPP FLOATING WIDGET
     ═══════════════════════════════════════════════════ */
  const waWidget = document.createElement("div");
  waWidget.className = "wa-float";
  waWidget.innerHTML = `
    <div class="wa-float-msg">${isArabic ? "مرحباً! كيف يمكننا مساعدتك؟" : "Hi! How can we help you?"}</div>
    <a class="wa-float-btn" href="https://wa.me/96555377309" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
      <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>`;
  document.body.appendChild(waWidget);

  // Show WA message after 3 seconds
  setTimeout(() => {
    const msg = waWidget.querySelector(".wa-float-msg");
    if (msg) { msg.classList.add("show"); setTimeout(() => msg.classList.remove("show"), 5000); }
  }, 3000);

  /* ═══════════════════════════════════════════════════
     ANNOUNCEMENT CLOSE BUTTON
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll(".announcement").forEach(ann => {
    if (ann.querySelector(".announcement-close")) return;
    const closeBtn = document.createElement("button");
    closeBtn.className = "announcement-close";
    closeBtn.innerHTML = "✕";
    closeBtn.setAttribute("aria-label", isArabic ? "إغلاق" : "Close");
    ann.style.position = "relative";
    ann.appendChild(closeBtn);
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      ann.classList.add("dismissed");
    });
  });


  /* ═══════════════════════════════════════════════════
     ANIMATED COUNTERS (IntersectionObserver)
     ═══════════════════════════════════════════════════ */
  const counterEls = document.querySelectorAll(".stat-number[data-count]");
  if (counterEls.length && "IntersectionObserver" in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count"), 10);
        if (isNaN(target)) return;

        // Preserve suffix spans
        const suffixEl = el.querySelector(".stat-suffix");
        const suffixHTML = suffixEl ? suffixEl.outerHTML : "";

        const duration = prefersReducedMotion ? 0 : 1800;
        const start = performance.now();
        const update = (now) => {
          const elapsed = now - start;
          const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          el.innerHTML = current + suffixHTML;
          if (progress < 1) requestAnimationFrame(update);
          else el.innerHTML = target + suffixHTML;
        };
        requestAnimationFrame(update);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.4 });

    counterEls.forEach(el => counterObs.observe(el));
  }

  /* ═══════════════════════════════════════════════════
     TESTIMONIALS SLIDER
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll("[data-testimonials]").forEach(slider => {
    const slides = slider.querySelectorAll(".testimonial-slide");
    const dots = slider.querySelectorAll(".testimonial-dot");
    if (!slides.length) return;

    let current = 0;
    let autoPlay;

    const goTo = (idx) => {
      slides.forEach(s => s.classList.remove("active"));
      dots.forEach(d => d.classList.remove("active"));
      current = idx;
      slides[current].classList.add("active");
      if (dots[current]) dots[current].classList.add("active");
    };

    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        goTo(parseInt(dot.getAttribute("data-slide"), 10));
        resetAutoPlay();
      });
    });

    const next = () => goTo((current + 1) % slides.length);
    const resetAutoPlay = () => {
      clearInterval(autoPlay);
      autoPlay = setInterval(next, 5000);
    };

    // Touch swipe support
    let touchStartX = 0;
    slider.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo((current + 1) % slides.length);
        else goTo((current - 1 + slides.length) % slides.length);
        resetAutoPlay();
      }
    }, { passive: true });

    resetAutoPlay();
  });

  /* ═══════════════════════════════════════════════════
     REVEAL ANIMATIONS (IntersectionObserver)
     ═══════════════════════════════════════════════════ */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealEls = document.querySelectorAll(
      ".reveal, .service-icon-card, .why-card, .stat-item, .process-step, .geo-point, .geo-stat-card, .project-card, .statement-card, .insight-card, .pillar-card, .pricing-card, .contact-route-card, .detail-slab, .matrix-card, .call-step, .faq-item, .proof-chip, .subhero-metric, .archive-link, .tag-link"
    );

    if (revealEls.length) {
      const revealObs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = (i * 0.04) + "s";
            entry.target.classList.add("in-view");
            revealObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

      revealEls.forEach(el => {
        if (!el.classList.contains("reveal")) {
          el.classList.add("reveal");
        }
        revealObs.observe(el);
      });
    }
  } else {
    // No animation: make all visible
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in-view"));
  }

  /* ═══════════════════════════════════════════════════
     PARTICLE CANVAS
     ═══════════════════════════════════════════════════ */
  const canvas = document.getElementById("particles-canvas");
  if (canvas && !prefersReducedMotion && window.innerWidth > 768) {
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    const PARTICLE_COUNT = 25;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.3 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(54, 218, 245, ${p.o})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(54, 218, 245, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* ═══════════════════════════════════════════════════
     FLOATING BRAND ICONS — Reliable Lightweight Rebuild
     ═══════════════════════════════════════════════════ */
  if (window.innerWidth > 768) {
    const brandsContainer = document.createElement("div");
    brandsContainer.className = "floating-brands-container";
    document.body.prepend(brandsContainer);

    const brandIcons = [
      "facebook.png", "google.png", "linkedin.png", "twitter.png",
      "telegram.png", "behance.png", "dribbble.png", "slack.png"
    ];

    // Only 8 icons, spread evenly
    brandIcons.forEach((iconName, i) => {
      const icon = document.createElement("img");
      icon.src = `${prefix}assets/images/icons/${iconName}`;
      icon.className = "floating-brand-icon";
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");

      const baseLeft = (i / brandIcons.length) * 90 + (Math.random() * 5);
      icon.style.left = `${baseLeft}vw`;
      
      // Delay and duration
      icon.style.animationDelay = `${i * 3.5}s`;
      icon.style.animationDuration = `${25 + (i % 3) * 6}s`;
      
      const size = i % 2 === 0 ? 26 : 32;
      icon.style.width = `${size}px`;
      icon.style.height = `${size}px`;

      brandsContainer.appendChild(icon);
    });
  }

  /* Luxury cursor removed for performance — uses native cursor instead */
  /* Spotlight effect preserved with lightweight mousemove */
  if (window.matchMedia("(pointer: fine)").matches && window.innerWidth > 768) {
    window.addEventListener("mousemove", (e) => {
      document.body.style.setProperty("--spotlight-x", `${e.clientX}px`);
      document.body.style.setProperty("--spotlight-y", `${e.clientY}px`);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════
     HERO CAROUSEL
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll(".hero-carousel").forEach(carousel => {
    const track = carousel.querySelector(".hero-carousel-track");
    const slides = carousel.querySelectorAll(".hero-slide");
    if (!track || slides.length === 0) return;

    let currentIdx = 0;
    
    // Create UI
    const prevBtn = document.createElement("button");
    prevBtn.className = "hero-carousel-prev";
    prevBtn.setAttribute("aria-label", isArabic ? "السابق" : "Previous");
    prevBtn.innerHTML = isArabic ? "➔" : "←"; // Simple arrows for now

    const nextBtn = document.createElement("button");
    nextBtn.className = "hero-carousel-next";
    nextBtn.setAttribute("aria-label", isArabic ? "التالي" : "Next");
    nextBtn.innerHTML = isArabic ? "←" : "➔";

    const dotsContainer = document.createElement("div");
    dotsContainer.className = "hero-carousel-dots";

    slides.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "carousel-dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    carousel.appendChild(prevBtn);
    carousel.appendChild(nextBtn);
    carousel.appendChild(dotsContainer);

    const updateDots = () => {
      dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIdx);
      });
    };

    const goToSlide = (idx) => {
      if (idx < 0) idx = slides.length - 1;
      if (idx >= slides.length) idx = 0;
      currentIdx = idx;
      
      const offset = isRTL ? (currentIdx * 100) : -(currentIdx * 100);
      track.style.transform = `translateX(${offset}%)`;
      updateDots();
    };

    prevBtn.addEventListener("click", () => goToSlide(currentIdx - 1));
    nextBtn.addEventListener("click", () => goToSlide(currentIdx + 1));

    // Auto Play
    setInterval(() => {
      goToSlide(currentIdx + 1);
    }, 6000);
  });

  /* ═══════════════════════════════════════════════════
     CONTACT FORM — TYPE TOGGLE
     ═══════════════════════════════════════════════════ */
  const typeBtns = document.querySelectorAll(".contact-type-btn[data-type]");
  if (typeBtns.length) {
    const companyFields = document.getElementById("company-fields");
    const individualFields = document.getElementById("individual-fields");
    const hiddenType = document.getElementById("hidden-client-type");

    typeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        typeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const type = btn.getAttribute("data-type");
        if (hiddenType) hiddenType.value = type;
        if (companyFields) companyFields.style.display = type === "company" ? "" : "none";
        if (individualFields) individualFields.style.display = type === "individual" ? "" : "none";
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     FAQ ACCORDION ACCESSIBILITY
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll(".faq-item").forEach(item => {
    const summary = item.querySelector("summary");
    if (summary) {
      summary.setAttribute("role", "button");
      summary.setAttribute("tabindex", "0");
    }
  });

  /* ═══════════════════════════════════════════════════
     LAZY IMAGE FADE
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) {
      img.style.opacity = "1";
    } else {
      img.style.opacity = "0";
      img.style.transition = "opacity .5s ease";
      img.addEventListener("load", () => { img.style.opacity = "1"; }, { once: true });
      img.addEventListener("error", () => { img.style.opacity = "1"; }, { once: true });
    }
  });

  /* ═══════════════════════════════════════════════════
     COPYRIGHT YEAR
     ═══════════════════════════════════════════════════ */
  const yearEl = document.getElementById("copyright-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ═══════════════════════════════════════════════════
     ANIMATED SEARCH PLACEHOLDER
     ═══════════════════════════════════════════════════ */
  const searchInputs = document.querySelectorAll('.search-input[data-placeholder-terms]');
  searchInputs.forEach(input => {
    const terms = JSON.parse(input.getAttribute('data-placeholder-terms') || '[]');
    if (!terms.length) return;

    const baseText = input.getAttribute('data-placeholder-base') || '';
    let termIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let pauseTimer = 0;
    const TYPING_SPEED = 80;
    const DELETING_SPEED = 40;
    const PAUSE_AFTER_TYPE = 2000;
    const PAUSE_AFTER_DELETE = 400;

    const animate = () => {
      const currentTerm = terms[termIdx];

      if (!isDeleting) {
        charIdx++;
        if (charIdx > currentTerm.length) {
          // Finished typing, pause before deleting
          pauseTimer = PAUSE_AFTER_TYPE;
          isDeleting = true;
        }
      } else {
        charIdx--;
        if (charIdx < 0) {
          charIdx = 0;
          isDeleting = false;
          termIdx = (termIdx + 1) % terms.length;
          pauseTimer = PAUSE_AFTER_DELETE;
        }
      }

      const display = baseText + currentTerm.substring(0, charIdx) + (charIdx < currentTerm.length || isDeleting ? '|' : '');
      input.setAttribute('placeholder', display);

      const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;
      setTimeout(animate, pauseTimer > 0 ? (pauseTimer, pauseTimer = 0, pauseTimer || speed) : speed);
    };

    // Fix the setTimeout logic
    const runAnimation = () => {
      const currentTerm = terms[termIdx];

      if (!isDeleting) {
        charIdx++;
        if (charIdx > currentTerm.length) {
          isDeleting = true;
          setTimeout(runAnimation, PAUSE_AFTER_TYPE);
          return;
        }
      } else {
        charIdx--;
        if (charIdx < 0) {
          charIdx = 0;
          isDeleting = false;
          termIdx = (termIdx + 1) % terms.length;
          setTimeout(runAnimation, PAUSE_AFTER_DELETE);
          return;
        }
      }

      const typed = terms[termIdx].substring(0, charIdx);
      const cursor = '|';
      input.setAttribute('placeholder', baseText + typed + cursor);

      setTimeout(runAnimation, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    };

    // Only animate when input is empty
    let animationRunning = true;
    input.addEventListener('focus', () => { animationRunning = false; });
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        animationRunning = true;
      }
    });

    // Start with a delay
    setTimeout(() => {
      const tick = () => {
        if (!animationRunning || input.value.trim()) {
          input.setAttribute('placeholder', baseText.replace(/\|$/, ''));
          setTimeout(tick, 500);
          return;
        }
        const currentTerm = terms[termIdx];

        if (!isDeleting) {
          charIdx++;
          if (charIdx > currentTerm.length) {
            isDeleting = true;
            setTimeout(tick, PAUSE_AFTER_TYPE);
            return;
          }
        } else {
          charIdx--;
          if (charIdx < 0) {
            charIdx = 0;
            isDeleting = false;
            termIdx = (termIdx + 1) % terms.length;
            setTimeout(tick, PAUSE_AFTER_DELETE);
            return;
          }
        }

        const typed = terms[termIdx].substring(0, charIdx);
        input.setAttribute('placeholder', baseText + typed + '│');
        setTimeout(tick, isDeleting ? DELETING_SPEED : TYPING_SPEED);
      };
      tick();
    }, 1200);
  });

  /* ═══════════════════════════════════════════════════
     FORM INTELLIGENCE & VALIDATION
     ═══════════════════════════════════════════════════ */
  class MashhorFormValidator {
    constructor() {
      // Regex for validating actual functional domains, not just a@b
      this.emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // Regex for phone numbers allowing international formats easily + and numbers
      this.phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      // Basic check for cyrillic or excessive URLs
      this.spamRegex = /([\u0400-\u04FF]|http:\/\/[^ ]+|https:\/\/[^ ]+)/i;
      
      this.init();
    }

    init() {
      // Find all forms that we want to validate (Contact forms and Newsletters)
      const forms = document.querySelectorAll('form[action*="formsubmit.co"], .contact-form, .newsletter-form');
      
      forms.forEach(form => {
        form.setAttribute('novalidate', 'true');
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        
        // Add real-time validation to inputs
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          // Add error container if it doesn't exist
          if (!input.nextElementSibling || !input.nextElementSibling.hasAttribute('data-form-error')) {
            const errorMsg = document.createElement('div');
            errorMsg.setAttribute('data-form-error', '');
            input.parentNode.appendChild(errorMsg);
          }
          
          input.addEventListener('blur', () => this.validateField(input));
          input.addEventListener('input', () => {
            if (input.classList.contains('input-invalid')) {
              this.validateField(input); // re-validate immediately if currently invalid
            }
          });
        });
      });
    }

    validateField(input) {
      let isValid = true;
      let errorText = "";
      const val = input.value.trim();
      const type = input.getAttribute('type') || input.tagName.toLowerCase();
      const isRequired = input.hasAttribute('required');

      if (isRequired && val === "") {
        isValid = false;
        errorText = isArabic ? "هذا الحقل مطلوب" : "This field is required";
      } else if (val !== "") {
        if (type === "email" || input.name === "email" || input.id.includes('email')) {
          if (!this.emailRegex.test(val)) {
            isValid = false;
            errorText = isArabic ? "صيغة البريد الإلكتروني غير صحيحة" : "Please enter a valid email format";
          }
        } 
        else if (type === "tel" || input.name === "phone" || input.id.includes('phone')) {
          // Remove spaces for checking
          const cleanPhone = val.replace(/\s/g, '');
          // Basic length check for phone
          if (cleanPhone.length < 8 || !this.phoneRegex.test(val)) {
             isValid = false;
             errorText = isArabic ? "رقم الهاتف غير صحيح" : "Please enter a valid phone number";
          }
        }
        else if (type === "textarea" || input.tagName.toLowerCase() === "textarea") {
          if (val.length < 15) {
            isValid = false;
            errorText = isArabic ? "الرسالة قصيرة جداً (الحد الأدنى 15 حرف)" : "Message is too short (minimum 15 characters)";
          } else if (this.spamRegex.test(val)) {
            isValid = false;
            errorText = isArabic ? "عذراً، الروابط والرموز غير مقبولة للحماية من البريد العشوائي" : "Sorry, URLs/links are not allowed in the message body";
          }
        }
      }

      const errorEl = input.parentNode.querySelector('[data-form-error]');
      if (!isValid) {
        input.classList.remove('input-valid');
        input.classList.add('input-invalid');
        if (errorEl) errorEl.textContent = errorText;
      } else {
        input.classList.remove('input-invalid');
        input.classList.add('input-valid');
        if (errorEl) errorEl.textContent = "";
      }
      return isValid;
    }

    handleSubmit(e, form) {
      let isFormValid = true;
      const inputs = form.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        e.preventDefault();
        // Scroll to first error smoothly
        const firstError = form.querySelector('.input-invalid');
        if (firstError) {
          firstError.focus();
        }
      } else {
        // Prevent double submission UI state
        form.classList.add('form-validating');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.innerHTML = isArabic ? '<span class="spinner"></span> جاري الإرسال...' : '<span class="spinner"></span> Sending...';
        }
      }
    }
  }

  const initAnnouncementBar = () => {
    const announcement = document.querySelector(".announcement");
    if (!announcement) return;

    const storageKey = "mashhor-announcement-dismissed";
    if (localStorage.getItem(storageKey) === "true") {
      announcement.classList.add("dismissed");
      return;
    }

    announcement.textContent = isArabic
      ? "أول منصة تسويق وذكاء اصطناعي متكاملة من الكويت تخدم الخليج ومصر والعالم العربي."
      : "Kuwait's first integrated marketing + AI platform, now serving the GCC, Egypt, and the wider Arab world.";

    if (!announcement.querySelector(".announcement-close")) {
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "announcement-close";
      closeBtn.setAttribute("aria-label", isArabic ? "إغلاق التنبيه" : "Dismiss announcement");
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", () => {
        announcement.classList.add("dismissed");
        localStorage.setItem(storageKey, "true");
      });
      announcement.appendChild(closeBtn);
    }
  };

  const initScrollProgress = () => {
    let progress = document.querySelector(".scroll-progress");
    if (!progress) {
      progress = document.createElement("div");
      progress.className = "scroll-progress";
      document.body.appendChild(progress);
    }

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = `${Math.max(0, Math.min(100, amount))}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  };

  const initStickyMobileCta = () => {
    if (window.innerWidth > 760 || document.querySelector(".sticky-mobile-cta")) return;

    const isContactPage = /\/contact(?:\.html)?$/i.test(currentPath);
    const isBookCallPage = /\/book-call\/?/i.test(currentPath);
    const bar = document.createElement("div");
    bar.className = "sticky-mobile-cta";

    const primaryLabel = isArabic
      ? (isContactPage ? "واتساب مباشر" : "ابدأ مشروعك")
      : (isContactPage ? "WhatsApp Now" : "Start Your Project");
    const primaryHref = isContactPage ? "https://wa.me/96555377309" : `${prefix}contact.html`;

    const secondaryLabel = isArabic
      ? (isBookCallPage ? "تواصل الآن" : "احجز مكالمة")
      : (isBookCallPage ? "Contact Us" : "Book a Call");
    const secondaryHref = isBookCallPage ? `${prefix}contact.html` : `${prefix}book-call/index.html`;

    bar.innerHTML = `
      <div class="sticky-cta-text">
        <strong>${isArabic ? "جاهز نبدأ؟" : "Ready to move fast?"}</strong>
        <span>${isArabic ? "وصول أسرع لأفضل خطوة تالية من الجوال." : "Quick access to the next best action on mobile."}</span>
      </div>
      <div class="sticky-cta-actions">
        <a class="sticky-cta-primary" href="${primaryHref}" ${primaryHref.startsWith("https://wa.me") ? 'target="_blank" rel="noopener noreferrer"' : ""}>${primaryLabel}</a>
        <a class="sticky-cta-secondary" href="${secondaryHref}">${secondaryLabel}</a>
      </div>
    `;

    document.body.appendChild(bar);
    document.body.classList.add("has-sticky-mobile-cta");
  };

  // Initialize after a slight delay to ensure DOM is fully ready
  setTimeout(() => {
    new MashhorFormValidator();
  }, 500);

  normalizeMetadata();
  initAnnouncementBar();
  normalizeDocumentText();
  initScrollProgress();
  initStickyMobileCta();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
          node.nodeValue = repairMojibake(node.nodeValue);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          normalizeDocumentText(node);
        }
      });
    });
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }


  /* ═══════════════════════════════════════════════════
     PROJECT SCOPE WIZARD LOGIC
     ═══════════════════════════════════════════════════ */
  const initProjectWizard = () => {
    const wizardCard = document.querySelector('.wizard-card');
    if (!wizardCard) return;

    let userGoal = '';
    let userBudget = '';

    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const progressBar = document.getElementById('wizard-progress-bar');
    
    const resultTitle = document.getElementById('result-title');
    const resultDesc = document.getElementById('result-desc');

    const goToStep = (step) => {
      // Hide all steps
      [step1, step2, step3].forEach(s => s && s.classList.remove('active'));

      // Show current step & update progress bar
      if (step === 1 && step1) {
        step1.classList.add('active');
        progressBar.style.width = '33%';
      } else if (step === 2 && step2) {
        step2.classList.add('active');
        progressBar.style.width = '66%';
      } else if (step === 3 && step3) {
        step3.classList.add('active');
        progressBar.style.width = '100%';
      }
    };

    const generateRecommendation = () => {
      let title = isArabic ? "استراتيجية نمو مخصصة" : "Custom Growth Strategy";
      let desc = isArabic ? "لدينا حل مصمم خصيصاً لعلامتك التجارية. دعنا نناقش التفاصيل." : "We have a tailored solution for your brand. Let's discuss the details.";

      if (userGoal === 'sales') {
        if (userBudget === 'low') {
          title = isArabic ? "باقة المبتدئين للأداء" : "Performance Starter Pack";
          desc = isArabic ? "نركز على إعلانات Meta عالية التحويل لاستهداف النتائج السريعة وزيادة العائد على الإنفاق الإعلاني." : "Focus on high-converting Meta Ads targeting low-hanging fruit to maximize your return on ad spend.";
        } else {
          title = isArabic ? "باقة التوسع الشاملة" : "Omnichannel Scaling Package";
          desc = isArabic ? "مزيج قوي من إعلانات Google Search و TikTok/Snapchat مع إعادة استهداف قوية لدفع المبيعات على نطاق واسع." : "A powerful mix of Google Search Intent Ads, TikTok/Snapchat awareness, and aggressive Meta retargeting to drive sales at scale.";
        }
      } else if (userGoal === 'awareness') {
        title = isArabic ? "مصفوفة الحضور والانتشار" : "Brand Presence & Influencer Matrix";
        desc = isArabic ? "نوصي بحملة مؤثرين محلية مدمجة مع إعلانات Snapchat و TikTok ذات التأثير العالي للسيطرة على حصة السوق." : "We recommend a localized influencer campaign combined with high-impact Snapchat and TikTok branding ads to dominate market share.";
      } else if (userGoal === 'content') {
        title = isArabic ? "محرك المحتوى المتميز" : "Premium Content & UI Engine";
        desc = isArabic ? "ارتقِ بعلامتك التجارية مع إنتاج فيديو عالي الجودة وكتابة محتوى ثنائية اللغة وتطوير واجهة المستخدم لبناء الثقة." : "Elevate your brand with high-end video production, bilingual copywriting, and a luxury UI/UX overhaul to build long-term trust.";
      }

      if (resultTitle) resultTitle.textContent = title;
      if (resultDesc) resultDesc.textContent = desc;
    };

    // Handle Step 1 Selections
    document.querySelectorAll('#step-1 .wizard-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        userGoal = e.currentTarget.getAttribute('data-goal');
        goToStep(2);
      });
    });

    // Handle Step 2 Selections
    document.querySelectorAll('#step-2 .wizard-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        userBudget = e.currentTarget.getAttribute('data-budget');
        generateRecommendation();
        goToStep(3);
      });
    });

    // Handle Navigation
    const backBtn = document.getElementById('back-to-1');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(1));

    const restartBtn = document.getElementById('wizard-restart');
    if (restartBtn) restartBtn.addEventListener('click', () => {
      userGoal = '';
      userBudget = '';
      goToStep(1);
    });
  };

  // Initialize wizard if element exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectWizard);
  } else {
    initProjectWizard();
  }

  // ═════ PREMIUM MICRO-INTERACTIONS (WOW FACTOR) ═════
  const initWowFactors = () => {
    // 1. SCROLL REVEALS
    const initScrollReveals = () => {
      const options = { threshold: 0.1, rootMargin: "0px 0px -40px 0px" };
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // Optimize memory
          }
        });
      }, options);

      const targets = document.querySelectorAll('h2, .portfolio-card, .service-box, .special-service-box');
      targets.forEach(el => {
        el.classList.add('mashhor-reveal');
        revealObserver.observe(el);
      });
    };

    // 2. 3D PHYSICAL TILT
    const initTiltEffect = () => {
      const isTouchDevice = window.matchMedia("(any-hover: none)").matches || window.innerWidth < 1024;
      if (isTouchDevice) return; // Save mobile battery and usability

      const isRTL = document.documentElement.dir === 'rtl';
      const tiltCards = document.querySelectorAll('.portfolio-card, .service-box, .special-service-box');
      
      tiltCards.forEach(card => {
        card.classList.add('mashhor-tilt');

        card.addEventListener('mousemove', (e) => {
          card.classList.add('is-tilting');
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          let rotateX = ((y - centerY) / centerY) * -12;
          let rotateY = ((x - centerX) / centerX) * 12;

          // Crucial RTL inversion for correct physical behavior
          if (isRTL) rotateY = rotateY * -1;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
          card.classList.remove('is-tilting');
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
      });
    };

    initScrollReveals();
    initTiltEffect();
  };

  // Safe init for Wow Factors
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWowFactors);
  } else {
    setTimeout(initWowFactors, 100); // Slight delay to ensure DOM templates are fully injected
  }

})();
