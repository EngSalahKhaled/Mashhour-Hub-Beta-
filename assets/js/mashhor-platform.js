(() => {
  const html = document.documentElement;
  const isArabic = html.lang && html.lang.toLowerCase().startsWith("ar");
  const isRTL = html.dir === "rtl";
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ─── reCAPTCHA Enterprise Injection (Disabled for Domain Error Fix) ───
  const RECAPTCHA_SITE_KEY = '6LcOBhAsAAAAAIxIpzP5txnOSfcBKHdfPG5cYAPv';
  const recaptchaScript = document.createElement('script');
  recaptchaScript.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
  recaptchaScript.async = true;
  document.head.appendChild(recaptchaScript);
  */

  /* ═══════════════════════════════════════════════════
     THEME SYSTEM (Color Selection)
     ═══════════════════════════════════════════════════ */
  // Clear old light/dark preference if it exists
  if (localStorage.getItem("mashhor-theme")) {
    localStorage.removeItem("mashhor-theme");
    html.removeAttribute("data-theme");
  }

  const initTheme = () => {
    const savedColor = localStorage.getItem("mashhor-color-theme");
    if (savedColor && savedColor !== "default") {
      html.setAttribute("data-color", savedColor);

      // ── iOS WebKit Repaint Hack (On Load) ──
      html.style.display = "none";
      html.offsetHeight; // Force reflow
      html.style.display = "";
    }
  };
  const ensureMetaTag = (name) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      document.head.appendChild(meta);
    }
    return meta;
  };

  const browserThemeMap = {
    default: { scheme: "dark", chrome: "#041121", statusBar: "black-translucent" },
    blue: { scheme: "dark", chrome: "#0b1830", statusBar: "black-translucent" },
    green: { scheme: "dark", chrome: "#08221c", statusBar: "black-translucent" },
    purple: { scheme: "dark", chrome: "#18112b", statusBar: "black-translucent" },
    rose: { scheme: "dark", chrome: "#2a1017", statusBar: "black-translucent" },
    light: { scheme: "light", chrome: "#f4f1ec", statusBar: "default" }
  };

  const applyBrowserChromeTheme = (colorName = "default") => {
    const theme = browserThemeMap[colorName] || browserThemeMap.default;
    html.style.colorScheme = theme.scheme;
    ensureMetaTag("color-scheme").setAttribute("content", "light dark");
    ensureMetaTag("supported-color-schemes").setAttribute("content", "light dark");
    ensureMetaTag("theme-color").setAttribute("content", theme.chrome);
    ensureMetaTag("apple-mobile-web-app-status-bar-style").setAttribute("content", theme.statusBar);
  };
  initTheme();
  applyBrowserChromeTheme(html.getAttribute("data-color") || "default");

  const mojibakePattern =
    /(?:â€¦|â€”|â€“|â€|â€¢|â†’|â†|âœ|â–¾|â”‚|ï¸|ðŸ|Ã|Ø|Ù|ط|ظ|€|™|œ|¢|£|¤|¥)/;
  const repairMojibake = (value) => {
    if (typeof value !== "string" || !value || !mojibakePattern.test(value))
      return value;

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
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName))
          return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !mojibakePattern.test(node.nodeValue))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
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
    document.querySelectorAll("meta[name], meta[property]").forEach((meta) => {
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
      const script =
        document.currentScript ||
        document.querySelector('script[src*="mashhor-platform.js"]');
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

  const toCleanInternalPath = (value) => {
    if (!value || typeof value !== "string") return value;

    const trimmed = value.trim();
    if (
      !trimmed ||
      /^(mailto:|tel:|javascript:|data:|#)/i.test(trimmed) ||
      /\.(jpg|jpeg|png|webp|gif|svg|pdf|xml|txt|json|js|css|ico|woff2?|ttf|map)(\?.*)?$/i.test(trimmed)
    ) {
      return trimmed;
    }

    const cleanPathname = (pathname) => pathname
      .replace(/\/index\.html$/i, "/")
      .replace(/\.html$/i, "")
      .replace(/\/+/g, "/");

    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const url = new URL(trimmed);
        if (url.origin !== window.location.origin) return trimmed;
        url.pathname = cleanPathname(url.pathname);
        return `${url.pathname}${url.search}${url.hash}`;
      } catch (e) {
        return trimmed;
      }
    }

    if (trimmed.startsWith("/")) {
      return cleanPathname(trimmed);
    }

    return trimmed
      .replace(/(^|\/)index\.html$/i, "$1")
      .replace(/\.html(?=$|[?#])/i, "");
  };

  const normalizeInternalNavigation = (root = document) => {
    root.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      const normalized = toCleanInternalPath(href);
      if (normalized && normalized !== href) {
        link.setAttribute("href", normalized);
      }
    });

    root
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"], meta[property="og:url"], meta[name="twitter:url"]')
      .forEach((node) => {
        const attr = node.tagName === "META" ? "content" : "href";
        const current = node.getAttribute(attr);
        const normalized = toCleanInternalPath(current);
        if (normalized && normalized !== current) {
          node.setAttribute(attr, normalized);
        }
      });
  };

  // ─── MAINTENANCE MODE CHECK & THEME CONFIG ───
  const fetchGlobalSettings = async () => {
    const isMaintenancePage = window.location.pathname.includes('maintenance.html');
    try {
      const apiBase = (window.MashhorAPI && window.MashhorAPI.API_BASE) || (window.location.origin + '/api');
      const response = await fetch(`${apiBase}/settings`);
      const result = await response.json();
      
      if (result.success && result.settings) {
        // Maintenance Mode
        if (result.settings.maintenanceMode) {
          if (!isMaintenancePage) {
            window.location.href = `${prefix}maintenance.html`;
          }
        } else if (isMaintenancePage) {
          window.location.href = `${prefix}`;
        }

        // Apply Global Theme Colors
        if (result.settings.theme) {
          if (result.settings.theme.primaryColor) {
            html.style.setProperty('--color-primary', result.settings.theme.primaryColor);
            html.style.setProperty('--color-gold', result.settings.theme.primaryColor);
          }
          if (result.settings.theme.secondaryColor) {
            html.style.setProperty('--color-secondary', result.settings.theme.secondaryColor);
            html.style.setProperty('--color-cyan', result.settings.theme.secondaryColor);
          }
        }
      }
    } catch (e) {
      console.warn('[GlobalSettingsCheck] Failed to fetch settings', e);
    }
  };
  fetchGlobalSettings();
  normalizeInternalNavigation();

  const brandSrc = `${prefix}assets/images/icons/logo-flat.png`;
  const currentPath = window.location.pathname.replace(/\\/g, "/");

  /* ═══════════════════════════════════════════════════
     ACTIVE LINK DETECTION
     ═══════════════════════════════════════════════════ */
  const isActive = (href) => {
    const norm = (p) =>
      p
        .replace(/\\/g, "/")
        .replace(/\/index\.html$/, "/")
        .replace(/\/$/, "")
        .toLowerCase();
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
      home: { text: "الرئيسية", href: `${arBase}` },
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
        { text: "الأعمال", href: `${arBase}portfolio/` },
        { text: "اكتشف المؤثرين", href: `${arBase}discover.html` },
        { text: "الأكاديمية", href: `${arBase}academy/` },
        { text: "Mashhor AI", href: `${arBase}services/mashhor-ai.html` },
        { text: "الباقات", href: `${arBase}pricing/` }
      ]},
      blog: { text: "المدونة", href: `${arBase}blog/` },
      contact: { text: "تواصل", href: `${arBase}contact.html` },
      langText: "English",
      langHref: `${arBase}../`,
      ctaText: "ابدأ مشروعك",
      ctaHref: `${arBase}contact.html`,
      brandName: "مشهور هب",
      brandSub: "MARKETING • AI • GROWTH"
    } : {
      home: { text: "Home", href: `${enP}` },
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
        { text: "Portfolio", href: `${enP}portfolio/` },
        { text: "Discover Influencers", href: `${enP}discover.html` },
        { text: "Academy", href: `${enP}academy/` },
        { text: "Mashhor AI", href: `${enP}services/mashhor-ai.html` },
        { text: "Pricing", href: `${enP}pricing/` }
      ]},
      blog: { text: "Blog", href: `${enP}blog/` },
      contact: { text: "Contact", href: `${enP}contact.html` },
      langText: "العربية",
      langHref: `${p}ar/`,
      ctaText: "Start Project",
      ctaHref: `${p}contact.html`,
      brandName: "Mashhor Hub",
      brandSub: "MARKETING • AI • GROWTH"
    };

    // Fix lang href based on alternate hreflang
    // Only use the hreflang URL override on the real production domain.
    // On localhost / file:// the hreflang tags point to https://mashhor-hub.com/…
    // which would extract an absolute path like /ar/ and cause "Cannot GET /ar/" errors.
    const altLink = document.querySelector(
      'link[rel="alternate"][hreflang="' + (isArabic ? "en" : "ar") + '"]',
    );
    if (altLink) {
      try {
        const u = new URL(altLink.href);
        const isProduction =
          window.location.hostname === u.hostname &&
          u.hostname !== "" &&
          u.hostname !== "localhost" &&
          u.hostname !== "127.0.0.1";
        if (isProduction) {
          // On production the hreflang href is a reliable absolute URL — use its pathname directly
          nav.langHref = u.pathname;
        }
        // On local dev / file:// we keep the relative-path langHref already computed above
      } catch (e) {}
    }

    const activeClass = (href) => (isActive(href) ? " is-active" : "");

    const servicesDropdown = nav.services.children
      .map(
        (c) =>
          `<a class="global-dropdown-link${activeClass(c.href)}" href="${c.href}">${c.text}</a>`,
      )
      .join("");

    const exploreDropdown = nav.explore.children
      .map(
        (c) =>
          `<a class="global-dropdown-link${activeClass(c.href)}" href="${c.href}">${c.text}</a>`,
      )
      .join("");

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
            <input type="search" class="bilingual-search-input search-input" 
                   placeholder="${isArabic ? "ابحث..." : "Search..."}" 
                   autocomplete="off"
                   data-placeholder-base="${isArabic ? "ابحث عن " : "Search "}"
                   data-placeholder-terms='${isArabic ? '["الخدمات","الأسعار","الأكاديمية","الذكاء الاصطناعي","الأعمال","دراسات الحالة","التسويق بالمؤثرين","الاستشارات","تحسين محركات البحث","المحتوى","الأتمتة","البرومبتات"]' : '["services","pricing","academy","AI tools","portfolio","case studies","influencer marketing","consultation","SEO","content writing","automation","prompts"]'}'>
            <ul class="bilingual-search-dropdown" hidden></ul>
          </div>
          <div class="theme-color-picker" id="theme-color-picker">
            <button class="color-picker-toggle" aria-label="${isArabic ? "اختر لون الواجهة" : "Select Theme Color"}">
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
          <button class="global-burger" id="global-burger" aria-label="${isArabic ? "القائمة" : "Menu"}" aria-expanded="false">
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
              <button class="color-picker-toggle" aria-label="${isArabic ? "اختر لون الواجهة" : "Select Theme Color"}">
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
            <button type="button" class="global-mobile-close" id="global-mobile-close" aria-label="${isArabic ? "إغلاق" : "Close"}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div class="global-mobile-nav-frame">
          <div class="bilingual-search-wrapper mobile-search">
            <input type="search" class="bilingual-search-input search-input" 
                   placeholder="${isArabic ? "ابحث عن خدمة..." : "Search services..."}" 
                   autocomplete="off"
                   data-placeholder-base="${isArabic ? "ابحث عن " : "Search "}"
                   data-placeholder-terms='${isArabic ? '["الخدمات","الأسعار","الأكاديمية","الذكاء الاصطناعي","الأعمال","دراسات الحالة","التسويق بالمؤثرين","الاستشارات","تحسين محركات البحث","المحتوى","الأتمتة","البرومبتات"]' : '["services","pricing","academy","AI tools","portfolio","case studies","influencer marketing","consultation","SEO","content writing","automation","prompts"]'}'>
            <ul class="bilingual-search-dropdown" hidden></ul>
          </div>
          <a class="global-mobile-link${activeClass(nav.home.href)}" href="${nav.home.href}">${nav.home.text}</a>
          <a class="global-mobile-link${activeClass(nav.about.href)}" href="${nav.about.href}">${nav.about.text}</a>
          <details class="global-mobile-group">
            <summary>${nav.services.text}</summary>
            ${nav.services.children.map((c) => `<a class="global-mobile-link${activeClass(c.href)}" href="${c.href}">${c.text}</a>`).join("")}
          </details>
          <details class="global-mobile-group">
            <summary>${nav.explore.text}</summary>
            ${nav.explore.children.map((c) => `<a class="global-mobile-link${activeClass(c.href)}" href="${c.href}">${c.text}</a>`).join("")}
          </details>
          <a class="global-mobile-link${activeClass(nav.blog.href)}" href="${nav.blog.href}">${nav.blog.text}</a>
          <a class="global-mobile-link${activeClass(nav.contact.href)}" href="${nav.contact.href}">${nav.contact.text}</a>
        </div>
        <div class="mobile-actions">
          <a class="mobile-lang" href="${nav.langHref}">${nav.langText}</a>
          <a class="mobile-cta" href="${nav.ctaHref}">${nav.ctaText}</a>
        </div>
        <div class="mobile-social">
          <a href="https://www.linkedin.com/company/mashhor-hub/" aria-label="LinkedIn"><img src="${p}assets/images/icons/social/linkedin.webp" alt="LinkedIn"></a>
          <a href="https://www.instagram.com/mohamedr.ai" aria-label="Instagram"><img src="${p}assets/images/icons/social/instagram.webp" alt="Instagram"></a>
          <a href="https://www.facebook.com/mashhor.hub" aria-label="Facebook"><img src="${p}assets/images/icons/social/fb.webp" alt="Facebook"></a>
          <a href="https://www.snapchat.com/@mashhorhub" aria-label="Snapchat" class="social-snapchat"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.83 1.156A6.29 6.29 0 0 0 7.82.022 6.06 6.06 0 0 0 1.956 5.86c0 1.25-.098 2.21-.302 2.872a.81.81 0 0 1-.508.52 1.48 1.48 0 0 1-.617.069C.207 9.278 0 9.38 0 9.54c0 .151.78.685 1.547 1.05.514.246.906.402.956.467.042.054.06.183.048.337-.021.282-.164.717-.384 1.144a1.86 1.86 0 0 0-.156.404c-.035.155 0 .285.105.39.117.116.327.172.607.166.425-.01.996-.134 1.583-.346.42-.15.753-.292.83-.357.062-.052.17-.066.27-.035.104.032.253.111.385.203 1.085.761 2.373 1.168 3.731 1.168 1.424 0 2.766-.437 3.868-1.25.13-.095.27-.168.367-.196.09-.026.195-.011.25.034.072.06.4.2 1.002.43 1.254.475 2.502.73 3.031.6.143-.035.21-.107.24-.26a2.6 2.6 0 0 0-.083-.455c-.244-.795-.36-1.127-.403-1.189-.048-.069-.025-.2.062-.357.17-.306.94-1.026 1.62-1.503.491-.345.867-.655 1.09-.9.232-.253.307-.387.26-.467-.091-.157-1.13-.505-1.921-.637-.167-.027-.3-.07-.376-.118a.386.386 0 0 1-.22-.249 5 5 0 0 1-.229-1.272c-.105-1.428-.592-2.825-1.397-4.004C18.667 3.3 16.924 1.863 14.887 1.1c-.818-.306-1.98-.38-3.057.056Z"/></svg></a>
          <a href="https://www.tiktok.com/@mashhorhub" aria-label="TikTok" class="social-tiktok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.5-.32 3.03-1.05 4.38-1.05 1.94-2.89 3.32-4.99 3.82-1.89.44-3.95.27-5.71-.56-2.02-.95-3.56-2.71-4.22-4.81-.62-1.94-.49-4.14.37-5.96 1.07-2.28 3.25-3.92 5.68-4.32 1.06-.18 2.14-.14 3.19.06V11.7c-.55-.07-1.12-.04-1.66.08a4.918 4.918 0 0 0-3.32 2.37c-.7 1.12-.99 2.52-.77 3.83.21 1.23.86 2.37 1.84 3.12.98.74 2.23 1.08 3.45 1.01 1.48-.09 2.92-.85 3.8-2.05.74-1.02 1.14-2.3 1.14-3.58V.02z"/></svg></a>
          <a href="https://www.pinterest.com/mashhorhub/" aria-label="Pinterest" class="social-pinterest"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/></svg></a>
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
        mobileBackdrop.setAttribute(
          "aria-label",
          isArabic ? "إغلاق القائمة" : "Close menu",
        );
        document.body.appendChild(mobileBackdrop);
      }

      const mobileFocusableSelector =
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
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
          const focusables = Array.from(
            mobilePanel.querySelectorAll(mobileFocusableSelector),
          ).filter(
            (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
          );
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
      mobilePanel.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
          closeMobileNav();
        });
      });
    }

    // Theme color picker handler
    const colorDots = document.querySelectorAll(".color-dot");
    colorDots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedColor = e.currentTarget.getAttribute("data-color");
        if (selectedColor === "default") {
          html.removeAttribute("data-color");
          localStorage.removeItem("mashhor-color-theme");
        } else {
          html.setAttribute("data-color", selectedColor);
          localStorage.setItem("mashhor-color-theme", selectedColor);
        }
        applyBrowserChromeTheme(selectedColor);

        // ── iOS WebKit Repaint Hack ──
        // Toggle display to force Safari to flush its render queue
        html.style.display = "none";
        html.offsetHeight; // Force reflow
        html.style.display = "";

        document
          .querySelectorAll(".color-dot")
          .forEach((d) => d.classList.remove("active"));
        document
          .querySelectorAll(`.color-dot[data-color="${selectedColor}"]`)
          .forEach((d) => d.classList.add("active"));

        // Close menu after selection
        document
          .querySelectorAll(".color-picker-menu")
          .forEach((m) => m.classList.remove("show"));
      });

      const currentTheme = html.getAttribute("data-color") || "default";
      if (currentTheme === dot.getAttribute("data-color")) {
        dot.classList.add("active");
      }
    });

    const pickerToggles = document.querySelectorAll(".color-picker-toggle");
    pickerToggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const menu = toggle.nextElementSibling;
        const isShowing = menu.classList.contains("show");
        document
          .querySelectorAll(".color-picker-menu")
          .forEach((m) => m.classList.remove("show"));
        if (!isShowing) menu.classList.add("show");
      });
    });

    document.addEventListener("click", () => {
      document
        .querySelectorAll(".color-picker-menu")
        .forEach((m) => m.classList.remove("show"));
    });

    // Bilingual Search Integration
    const searchBase = isArabic ? arBase : p;
    const servicesDB = [
      { url: "${p}services/web-development.html", titleAr: "تطوير الويب", titleEn: "Web Development", keywords: ["برمجة", "مواقع", "منصات", "web", "coding", "development", "website"] },
      { url: "${p}services/graphic-design.html", titleAr: "الهوية البصرية", titleEn: "Brand Identity & Design", keywords: ["تصميم", "واجهة", "تجربة", "design", "interface", "experience", "ui", "ux", "graphic"] },
      { url: "${p}services/seo.html", titleAr: "تحسين محركات البحث", titleEn: "SEO", keywords: ["جوجل", "ارشفة", "محركات", "بحث", "google", "search", "ranking", "optimization"] },
      { url: "${p}services/e-marketing.html", titleAr: "الإعلانات الرقمية", titleEn: "Digital Advertising", keywords: ["تسويق", "إعلانات", "مبيعات", "ads", "digital", "marketing", "sales", "meta", "tiktok"] },
      { url: "${p}services/influencer-marketing.html", titleAr: "التسويق المؤثر", titleEn: "Influencer Marketing", keywords: ["مؤثرين", "مشاهير", "حملات", "creator", "campaigns", "influencer"] },
      { url: "${p}services/video-production.html", titleAr: "الإنتاج المرئي", titleEn: "Video Production", keywords: ["فيديو", "تصوير", "انتاج", "video", "production", "shooting"] },
      { url: "${p}services/smart-automation.html", titleAr: "الذكاء الاصطناعي والأتمتة", titleEn: "AI & Automation", keywords: ["ذكاء", "اصطناعي", "روبوت", "اتمتة", "ai", "automation", "systems", "bots"] }
    ];

    const normalizeText = (text) => {
      if (!text) return "";
      return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ـ/g, "");
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
            return (
              normalizeText(item.titleAr).includes(normQuery) ||
              normalizeText(item.titleEn).includes(normQuery) ||
              item.keywords.some((kw) => normalizeText(kw).includes(normQuery))
            );
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
            li.textContent = isArabic
              ? "لم يتم العثور على نتائج"
              : "No results found";
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
      document
        .querySelectorAll(".bilingual-search-wrapper")
        .forEach((wrapper) => {
          const dropdown = wrapper.querySelector(".bilingual-search-dropdown");
          if (dropdown && !wrapper.contains(e.target)) dropdown.hidden = true;
        });
    });

    // Header scroll behavior
    const globalHeader = document.getElementById("global-header");
    if (globalHeader) {
      let lastScroll = 0;
      let headerHidden = false;
      window.addEventListener(
        "scroll",
        () => {
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
        },
        { passive: true },
      );
    }
    // Re-initialize animations for the newly injected header
    if (typeof initSearchAnimations === 'function') {
      initSearchAnimations();
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
            <div class="global-footer-social">
              <a href="https://www.linkedin.com/company/mashhor-hub/" aria-label="LinkedIn"><img src="${p}assets/images/icons/social/linkedin.webp" alt="LinkedIn"></a>
              <a href="https://www.instagram.com/mohamedr.ai" aria-label="Instagram"><img src="${p}assets/images/icons/social/instagram.webp" alt="Instagram"></a>
              <a href="https://www.facebook.com/mashhor.hub" aria-label="Facebook"><img src="${p}assets/images/icons/social/fb.webp" alt="Facebook"></a>
              <a href="https://www.snapchat.com/@mashhorhub" aria-label="Snapchat" class="social-snapchat"><svg viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M11.83 1.156A6.29 6.29 0 0 0 7.82.022 6.06 6.06 0 0 0 1.956 5.86c0 1.25-.098 2.21-.302 2.872a.81.81 0 0 1-.508.52 1.48 1.48 0 0 1-.617.069C.207 9.278 0 9.38 0 9.54c0 .151.78.685 1.547 1.05.514.246.906.402.956.467.042.054.06.183.048.337-.021.282-.164.717-.384 1.144a1.86 1.86 0 0 0-.156.404c-.035.155 0 .285.105.39.117.116.327.172.607.166.425-.01.996-.134 1.583-.346.42-.15.753-.292.83-.357.062-.052.17-.066.27-.035.104.032.253.111.385.203 1.085.761 2.373 1.168 3.731 1.168 1.424 0 2.766-.437 3.868-1.25.13-.095.27-.168.367-.196.09-.026.195-.011.25.034.072.06.4.2 1.002.43 1.254.475 2.502.73 3.031.6.143-.035.21-.107.24-.26a2.6 2.6 0 0 0-.083-.455c-.244-.795-.36-1.127-.403-1.189-.048-.069-.025-.2.062-.357.17-.306.94-1.026 1.62-1.503.491-.345.867-.655 1.09-.9.232-.253.307-.387.26-.467-.091-.157-1.13-.505-1.921-.637-.167-.027-.3-.07-.376-.118a.386.386 0 0 1-.22-.249 5 5 0 0 1-.229-1.272c-.105-1.428-.592-2.825-1.397-4.004C18.667 3.3 16.924 1.863 14.887 1.1c-.818-.306-1.98-.38-3.057.056Z"/></svg></a>
              <a href="https://www.tiktok.com/@mashhorhub" aria-label="TikTok" class="social-tiktok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.5-.32 3.03-1.05 4.38-1.05 1.94-2.89 3.32-4.99 3.82-1.89.44-3.95.27-5.71-.56-2.02-.95-3.56-2.71-4.22-4.81-.62-1.94-.49-4.14.37-5.96 1.07-2.28 3.25-3.92 5.68-4.32 1.06-.18 2.14-.14 3.19.06V11.7c-.55-.07-1.12-.04-1.66.08a4.918 4.918 0 0 0-3.32 2.37c-.7 1.12-.99 2.52-.77 3.83.21 1.23.86 2.37 1.84 3.12.98.74 2.23 1.08 3.45 1.01 1.48-.09 2.92-.85 3.8-2.05.74-1.02 1.14-2.3 1.14-3.58V.02z"/></svg></a>
              <a href="https://www.pinterest.com/mashhorhub/" aria-label="Pinterest" class="social-pinterest"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/></svg></a>
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
            <a href="${arFp}portfolio/">الأعمال</a>
            <a href="${arFp}case-studies/">دراسات الحالة</a>
            <a href="${arFp}pricing/">الباقات</a>
            <a href="${arFp}blog/">المدونة</a>
            <a href="${arFp}academy/">الأكاديمية</a>
          </div>
          <div class="global-footer-col">
            <h4>تواصل</h4>
            <a href="https://wa.me/96555377309" target="_blank" rel="noopener" aria-label="WhatsApp Contact">واتساب</a>
            <a href="mailto:info@mashhor-hub.com">البريد الإلكتروني</a>
            <a href="tel:+96555377309">هاتف: +965 5537 7309</a>
            <a href="${arFp}book-call/">حجز مكالمة</a>
            <a href="${arFp}faqs.html">الأسئلة الشائعة</a>
          </div>
        </div>
        <div class="global-footer-legal">
          <a href="${arFp}legal/privacy.html">سياسة الخصوصية</a>
          <a href="${arFp}legal/terms.html">الشروط والأحكام</a>
          <a href="${arFp}sitemap.html">خريطة الموقع</a>
        </div>
        <div class="global-footer-bottom">
          <div class="footer-bottom-parteners">
            <img src="${p}assets/images/Parteners/Google_Premiere_2026.png" alt="Google Premiere" title="Google Partner">
            <img src="${p}assets/images/Parteners/meta_badge_HD.png" alt="Meta Partner" title="Meta Business Partner">
            <img src="${p}assets/images/Parteners/tiktok-badge-hd.webp" alt="TikTok Ads" title="TikTok Partner">
            <img src="${p}assets/images/Parteners/pinterest_logo.png" alt="Pinterest Partner" title="Pinterest Partner">
          </div>
          <div class="footer-copy">© ${year} مشهور هب. جميع الحقوق محفوظة. الكويت</div>
          <div class="footer-bottom-payments">
            <img src="${p}assets/images/Payments/visa-svgrepo-com.svg" alt="Visa">
            <img src="${p}assets/images/Payments/Mastercard-logo.svg" alt="Mastercard">
            <img src="${p}assets/images/Payments/Apple_Pay_logo.svg" alt="Apple Pay">
            <img src="${p}assets/images/Payments/Google_Pay_Logo.svg" alt="Google Pay">
            <img src="${p}assets/images/Payments/paypal-svgrepo-com.svg" alt="PayPal">
            <img src="${p}assets/images/Payments/knet-seeklogo.png" alt="KNET">
          </div>
        </div>
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
            <div class="global-footer-social">
              <a href="https://www.linkedin.com/company/mashhor-hub/" aria-label="LinkedIn"><img src="${p}assets/images/icons/social/linkedin.webp" alt="LinkedIn"></a>
              <a href="https://www.instagram.com/mohamedr.ai" aria-label="Instagram"><img src="${p}assets/images/icons/social/instagram.webp" alt="Instagram"></a>
              <a href="https://www.facebook.com/mashhor.hub" aria-label="Facebook"><img src="${p}assets/images/icons/social/fb.webp" alt="Facebook"></a>
              <a href="https://www.snapchat.com/@mashhorhub" aria-label="Snapchat" class="social-snapchat"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.83 1.156A6.29 6.29 0 0 0 7.82.022 6.06 6.06 0 0 0 1.956 5.86c0 1.25-.098 2.21-.302 2.872a.81.81 0 0 1-.508.52 1.48 1.48 0 0 1-.617.069C.207 9.278 0 9.38 0 9.54c0 .151.78.685 1.547 1.05.514.246.906.402.956.467.042.054.06.183.048.337-.021.282-.164.717-.384 1.144a1.86 1.86 0 0 0-.156.404c-.035.155 0 .285.105.39.117.116.327.172.607.166.425-.01.996-.134 1.583-.346.42-.15.753-.292.83-.357.062-.052.17-.066.27-.035.104.032.253.111.385.203 1.085.761 2.373 1.168 3.731 1.168 1.424 0 2.766-.437 3.868-1.25.13-.095.27-.168.367-.196.09-.026.195-.011.25.034.072.06.4.2 1.002.43 1.254.475 2.502.73 3.031.6.143-.035.21-.107.24-.26a2.6 2.6 0 0 0-.083-.455c-.244-.795-.36-1.127-.403-1.189-.048-.069-.025-.2.062-.357.17-.306.94-1.026 1.62-1.503.491-.345.867-.655 1.09-.9.232-.253.307-.387.26-.467-.091-.157-1.13-.505-1.921-.637-.167-.027-.3-.07-.376-.118a.386.386 0 0 1-.22-.249 5 5 0 0 1-.229-1.272c-.105-1.428-.592-2.825-1.397-4.004C18.667 3.3 16.924 1.863 14.887 1.1c-.818-.306-1.98-.38-3.057.056Z"/></svg></a>
              <a href="https://www.tiktok.com/@mashhorhub" aria-label="TikTok" class="social-tiktok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.5-.32 3.03-1.05 4.38-1.05 1.94-2.89 3.32-4.99 3.82-1.89.44-3.95.27-5.71-.56-2.02-.95-3.56-2.71-4.22-4.81-.62-1.94-.49-4.14.37-5.96 1.07-2.28 3.25-3.92 5.68-4.32 1.06-.18 2.14-.14 3.19.06V11.7c-.55-.07-1.12-.04-1.66.08a4.918 4.918 0 0 0-3.32 2.37c-.7 1.12-.99 2.52-.77 3.83.21 1.23.86 2.37 1.84 3.12.98.74 2.23 1.08 3.45 1.01 1.48-.09 2.92-.85 3.8-2.05.74-1.02 1.14-2.3 1.14-3.58V.02z"/></svg></a>
              <a href="https://www.pinterest.com/mashhorhub/" aria-label="Pinterest" class="social-pinterest"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/></svg></a>
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
            <a href="${p}portfolio/">Portfolio</a>
            <a href="${p}case-studies/">Case Studies</a>
            <a href="${p}pricing/">Pricing</a>
            <a href="${p}blog/">Blog</a>
            <a href="${p}academy/">Academy</a>
          </div>
          <div class="global-footer-col">
            <h4>Connect</h4>
            <a href="https://wa.me/96555377309" target="_blank" rel="noopener" aria-label="WhatsApp Contact">WhatsApp</a>
            <a href="mailto:info@mashhor-hub.com">Email</a>
            <a href="tel:+96555377309">Phone: +965 5537 7309</a>
            <a href="${p}book-call/">Book a Call</a>
            <a href="${p}faqs.html">FAQs</a>
          </div>
        </div>
        <div class="global-footer-legal">
          <a href="${p}legal/privacy.html">Privacy Policy</a>
          <a href="${p}legal/terms.html">Terms & Conditions</a>
          <a href="${p}sitemap.html">Sitemap</a>
        </div>
        <div class="global-footer-bottom">
          <div class="footer-bottom-parteners">
            <img src="${p}assets/images/Parteners/Google_Premiere_2026.png" alt="Google Premiere" title="Google Partner">
            <img src="${p}assets/images/Parteners/meta_badge_HD.png" alt="Meta Partner" title="Meta Business Partner">
            <img src="${p}assets/images/Parteners/tiktok-badge-hd.webp" alt="TikTok Ads" title="TikTok Partner">
            <img src="${p}assets/images/Parteners/pinterest_logo.png" alt="Pinterest Partner" title="Pinterest Partner">
          </div>
          <div class="footer-copy">© ${year} Mashhor Hub. All rights reserved. Kuwait</div>
          <div class="footer-bottom-payments">
            <img src="${p}assets/images/Payments/visa-svgrepo-com.svg" alt="Visa">
            <img src="${p}assets/images/Payments/Mastercard-logo.svg" alt="Mastercard">
            <img src="${p}assets/images/Payments/Apple_Pay_logo.svg" alt="Apple Pay">
            <img src="${p}assets/images/Payments/Google_Pay_Logo.svg" alt="Google Pay">
            <img src="${p}assets/images/Payments/paypal-svgrepo-com.svg" alt="PayPal">
            <img src="${p}assets/images/Payments/knet-seeklogo.png" alt="KNET">
          </div>
        </div>
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
  backToTop.setAttribute(
    "aria-label",
    isArabic ? "العودة للأعلى" : "Back to top",
  );
  backToTop.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
  document.body.appendChild(backToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  // Scroll handler for progress + back-to-top
  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
          progressBar.style.width = pct + "%";
          backToTop.classList.toggle("visible", scrollY > 400);
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    },
    { passive: true },
  );

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
    if (msg) {
      msg.classList.add("show");
      setTimeout(() => msg.classList.remove("show"), 5000);
    }
  }, 3000);

  /* ═══════════════════════════════════════════════════
     ANNOUNCEMENT CLOSE BUTTON
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll(".announcement").forEach((ann) => {
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
    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
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
            const progress =
              duration === 0 ? 1 : Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            el.innerHTML = current + suffixHTML;
            if (progress < 1) requestAnimationFrame(update);
            else el.innerHTML = target + suffixHTML;
          };
          requestAnimationFrame(update);
          counterObs.unobserve(el);
        });
      },
      { threshold: 0.4 },
    );

    counterEls.forEach((el) => counterObs.observe(el));
  }

  /* ═══════════════════════════════════════════════════
     TESTIMONIALS SLIDER
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll("[data-testimonials]").forEach((slider) => {
    const slides = slider.querySelectorAll(".testimonial-slide");
    const dots = slider.querySelectorAll(".testimonial-dot");
    if (!slides.length) return;

    let current = 0;
    let autoPlay;

    const goTo = (idx) => {
      slides.forEach((s) => s.classList.remove("active"));
      dots.forEach((d) => d.classList.remove("active"));
      current = idx;
      slides[current].classList.add("active");
      if (dots[current]) dots[current].classList.add("active");
    };

    dots.forEach((dot) => {
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
    slider.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    slider.addEventListener(
      "touchend",
      (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) goTo((current + 1) % slides.length);
          else goTo((current - 1 + slides.length) % slides.length);
          resetAutoPlay();
        }
      },
      { passive: true },
    );

    resetAutoPlay();
  });

  /* ═══════════════════════════════════════════════════
     REVEAL ANIMATIONS (IntersectionObserver)
     ═══════════════════════════════════════════════════ */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealEls = document.querySelectorAll(
      ".reveal, .service-icon-card, .why-card, .stat-item, .process-step, .geo-point, .geo-stat-card, .project-card, .statement-card, .insight-card, .pillar-card, .pricing-card, .contact-route-card, .detail-slab, .matrix-card, .call-step, .faq-item, .proof-chip, .subhero-metric, .archive-link, .tag-link",
    );

    if (revealEls.length) {
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              entry.target.style.transitionDelay = i * 0.04 + "s";
              entry.target.classList.add("in-view");
              revealObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
      );

      revealEls.forEach((el) => {
        if (!el.classList.contains("reveal")) {
          el.classList.add("reveal");
        }
        revealObs.observe(el);
      });
    }
  } else {
    // No animation: make all visible
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("in-view"));
  }

  /* ═══════════════════════════════════════════════════
     PARTICLE CANVAS
     ═══════════════════════════════════════════════════ */
  const canvas = document.getElementById("particles-canvas");
  if (canvas && !prefersReducedMotion && window.innerWidth > 768) {
    const ctx = canvas.getContext("2d");
    let w,
      h,
      particles = [];
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
        o: Math.random() * 0.3 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
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

      const baseLeft = (i / brandIcons.length) * 90 + Math.random() * 5;
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
    window.addEventListener(
      "mousemove",
      (e) => {
        document.body.style.setProperty("--spotlight-x", `${e.clientX}px`);
        document.body.style.setProperty("--spotlight-y", `${e.clientY}px`);
      },
      { passive: true },
    );
  }

  /* ═══════════════════════════════════════════════════
     HERO CAROUSEL
     ═══════════════════════════════════════════════════ */
  const initHeroCarousels = () => {
    document.querySelectorAll(".hero-carousel").forEach((carousel) => {
      const track = carousel.querySelector(".hero-carousel-track");
      const slides = carousel.querySelectorAll(".hero-slide");
      if (!track || slides.length === 0) return;

      if (carousel.dataset.carouselIntervalId) {
        window.clearInterval(Number(carousel.dataset.carouselIntervalId));
        delete carousel.dataset.carouselIntervalId;
      }

      carousel
        .querySelectorAll(
          ".hero-carousel-prev, .hero-carousel-next, .hero-carousel-dots",
        )
        .forEach((el) => el.remove());

      track.style.transform = "translateX(0%)";

      let currentIdx = 0;

      const prevBtn = document.createElement("button");
      prevBtn.className = "hero-carousel-prev";
      prevBtn.setAttribute("aria-label", isArabic ? "السابق" : "Previous");
      prevBtn.innerHTML = isArabic ? "➔" : "←";

      const nextBtn = document.createElement("button");
      nextBtn.className = "hero-carousel-next";
      nextBtn.setAttribute("aria-label", isArabic ? "التالي" : "Next");
      nextBtn.innerHTML = isArabic ? "←" : "➔";

      const dotsContainer = document.createElement("div");
      dotsContainer.className = "hero-carousel-dots";

      const updateDots = () => {
        dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
          dot.classList.toggle("active", i === currentIdx);
        });
      };

      const goToSlide = (idx) => {
        if (idx < 0) idx = slides.length - 1;
        if (idx >= slides.length) idx = 0;
        currentIdx = idx;

        const offset = isRTL ? currentIdx * 100 : -(currentIdx * 100);
        track.style.transform = `translateX(${offset}%)`;
        updateDots();
      };

      slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.className = "carousel-dot" + (i === 0 ? " active" : "");
        dot.addEventListener("click", () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });

      carousel.appendChild(prevBtn);
      carousel.appendChild(nextBtn);
      carousel.appendChild(dotsContainer);

      prevBtn.addEventListener("click", () => goToSlide(currentIdx - 1));
      nextBtn.addEventListener("click", () => goToSlide(currentIdx + 1));

      const intervalId = window.setInterval(() => {
        goToSlide(currentIdx + 1);
      }, 6000);

      carousel.dataset.carouselIntervalId = String(intervalId);
    });
  };

  initHeroCarousels();

  /* ═══════════════════════════════════════════════════
     CONTACT FORM — TYPE TOGGLE
     ═══════════════════════════════════════════════════ */
  const typeBtns = document.querySelectorAll(".contact-type-btn[data-type]");
  if (typeBtns.length) {
    const companyFields = document.getElementById("company-fields");
    const individualFields = document.getElementById("individual-fields");
    const hiddenType = document.getElementById("hidden-client-type");

    typeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        typeBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const type = btn.getAttribute("data-type");
        if (hiddenType) hiddenType.value = type;
        if (companyFields)
          companyFields.style.display = type === "company" ? "" : "none";
        if (individualFields)
          individualFields.style.display = type === "individual" ? "" : "none";
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     LAZY IMAGE FADE
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    if (img.complete) {
      img.style.opacity = "1";
    } else {
      img.style.opacity = "0";
      img.style.transition = "opacity .5s ease";
      img.addEventListener(
        "load",
        () => {
          img.style.opacity = "1";
        },
        { once: true },
      );
      img.addEventListener(
        "error",
        () => {
          img.style.opacity = "1";
        },
        { once: true },
      );
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
  window.initSearchAnimations = () => {
    const searchInputs = document.querySelectorAll('.search-input[data-placeholder-terms]');
    searchInputs.forEach(input => {
      // Prevent double initialization
      if (input.dataset.animationInitialized) return;
      input.dataset.animationInitialized = "true";

      const terms = JSON.parse(input.getAttribute('data-placeholder-terms') || '[]');
      if (!terms.length) return;

      const baseText = input.getAttribute("data-placeholder-base") || "";
      let termIdx = 0;
      let charIdx = 0;
      let isDeleting = false;
      const TYPING_SPEED = 80;
      const DELETING_SPEED = 40;
      const PAUSE_AFTER_TYPE = 2000;
      const PAUSE_AFTER_DELETE = 400;

      const runAnimation = () => {
        const currentTerm = terms[termIdx];
        let nextInterval = isDeleting ? DELETING_SPEED : TYPING_SPEED;

        if (!isDeleting) {
          charIdx++;
          if (charIdx > currentTerm.length) {
            isDeleting = true;
            nextInterval = PAUSE_AFTER_TYPE;
          }
        } else {
          charIdx--;
          if (charIdx < 0) {
            charIdx = 0;
            isDeleting = false;
            termIdx = (termIdx + 1) % terms.length;
            nextInterval = PAUSE_AFTER_DELETE;
          }
        }

        const typed = terms[termIdx].substring(0, charIdx);
        const cursor = "|";
        input.setAttribute("placeholder", baseText + typed + cursor);

        setTimeout(runAnimation, nextInterval);
      };

      runAnimation();
    });
  };

  // Initial call on DOMContentLoaded
  initSearchAnimations();


  /* ═══════════════════════════════════════════════════
     FORM INTELLIGENCE & VALIDATION
     ═══════════════════════════════════════════════════ */
  class MashhorFormValidator {
    constructor() {
      // Regex for validating actual functional domains, not just a@b
      this.emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // Regex for phone numbers allowing international formats easily + and numbers
      this.phoneRegex =
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      // Basic check for cyrillic or excessive URLs
      this.spamRegex = /([\u0400-\u04FF]|http:\/\/[^ ]+|https:\/\/[^ ]+)/i;

      this.init();
    }

    init() {
      // Find all forms that we want to validate (Contact forms and Newsletters)
      const forms = document.querySelectorAll(
        'form[action*="formsubmit.co"], .contact-form, .newsletter-form',
      );

      forms.forEach((form) => {
        form.setAttribute("novalidate", "true");
        form.addEventListener("submit", (e) => this.handleSubmit(e, form));

        // Add real-time validation to inputs
        const inputs = form.querySelectorAll("input, textarea");
        inputs.forEach((input) => {
          // Add error container if it doesn't exist
          if (
            !input.nextElementSibling ||
            !input.nextElementSibling.hasAttribute("data-form-error")
          ) {
            const errorMsg = document.createElement("div");
            errorMsg.setAttribute("data-form-error", "");
            input.parentNode.appendChild(errorMsg);
          }

          input.addEventListener("blur", () => this.validateField(input));
          input.addEventListener("input", () => {
            if (input.classList.contains("input-invalid")) {
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
      const type = input.getAttribute("type") || input.tagName.toLowerCase();
      const isRequired = input.hasAttribute("required");

      if (isRequired && val === "") {
        isValid = false;
        errorText = isArabic ? "هذا الحقل مطلوب" : "This field is required";
      } else if (val !== "") {
        if (
          type === "email" ||
          input.name === "email" ||
          input.id.includes("email")
        ) {
          if (!this.emailRegex.test(val)) {
            isValid = false;
            errorText = isArabic
              ? "صيغة البريد الإلكتروني غير صحيحة"
              : "Please enter a valid email format";
          }
        } else if (
          type === "tel" ||
          input.name === "phone" ||
          input.id.includes("phone")
        ) {
          // Remove spaces for checking
          const cleanPhone = val.replace(/\s/g, "");
          // Basic length check for phone
          if (cleanPhone.length < 8 || !this.phoneRegex.test(val)) {
            isValid = false;
            errorText = isArabic
              ? "رقم الهاتف غير صحيح"
              : "Please enter a valid phone number";
          }
        } else if (
          type === "textarea" ||
          input.tagName.toLowerCase() === "textarea"
        ) {
          if (val.length < 15) {
            isValid = false;
            errorText = isArabic
              ? "الرسالة قصيرة جداً (الحد الأدنى 15 حرف)"
              : "Message is too short (minimum 15 characters)";
          } else if (this.spamRegex.test(val)) {
            isValid = false;
            errorText = isArabic
              ? "عذراً، الروابط والرموز غير مقبولة للحماية من البريد العشوائي"
              : "Sorry, URLs/links are not allowed in the message body";
          }
        }
      }

      const errorEl = input.parentNode.querySelector("[data-form-error]");
      if (!isValid) {
        input.classList.remove("input-valid");
        input.classList.add("input-invalid");
        if (errorEl) errorEl.textContent = errorText;
      } else {
        input.classList.remove("input-invalid");
        input.classList.add("input-valid");
        if (errorEl) errorEl.textContent = "";
      }
      return isValid;
    }

    handleSubmit(e, form) {
      let isFormValid = true;
      const inputs = form.querySelectorAll("input, textarea");

      inputs.forEach((input) => {
        if (!this.validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        e.preventDefault();
        // Scroll to first error smoothly
        const firstError = form.querySelector(".input-invalid");
        if (firstError) {
          firstError.focus();
        }
      } else {
        // Prevent double submission UI state
        form.classList.add("form-validating");
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.innerHTML = isArabic
            ? '<span class="spinner"></span> جاري الإرسال...'
            : '<span class="spinner"></span> Sending...';
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
      closeBtn.setAttribute(
        "aria-label",
        isArabic ? "إغلاق التنبيه" : "Dismiss announcement",
      );
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
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = `${Math.max(0, Math.min(100, amount))}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  };

  const initStickyMobileCta = () => {
    if (window.innerWidth > 760 || document.querySelector(".sticky-mobile-cta"))
      return;

    const isContactPage = /\/contact(?:\.html)?$/i.test(currentPath);
    const isBookCallPage = /\/book-call\/?/i.test(currentPath);
    const bar = document.createElement("div");
    bar.className = "sticky-mobile-cta";

    const primaryLabel = isArabic
      ? isContactPage
        ? "واتساب مباشر"
        : "ابدأ مشروعك"
      : isContactPage
        ? "WhatsApp Now"
        : "Start Your Project";
    const primaryHref = isContactPage
      ? "https://wa.me/96555377309"
      : `${prefix}contact.html`;

    const secondaryLabel = isArabic
      ? isBookCallPage
        ? "تواصل الآن"
        : "احجز مكالمة"
      : isBookCallPage
        ? "Contact Us"
        : "Book a Call";
    const secondaryHref = isBookCallPage
      ? `${prefix}contact.html`
      : `${prefix}book-call/`;

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
    const wizardCard = document.querySelector(".wizard-card");
    if (!wizardCard) return;

    let userGoal = "";
    let userBudget = "";

    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const step3 = document.getElementById("step-3");
    const progressBar = document.getElementById("wizard-progress-bar");

    const resultTitle = document.getElementById("result-title");
    const resultDesc = document.getElementById("result-desc");

    const goToStep = (step) => {
      // Hide all steps
      [step1, step2, step3].forEach((s) => s && s.classList.remove("active"));

      // Show current step & update progress bar
      if (step === 1 && step1) {
        step1.classList.add("active");
        progressBar.style.width = "33%";
      } else if (step === 2 && step2) {
        step2.classList.add("active");
        progressBar.style.width = "66%";
      } else if (step === 3 && step3) {
        step3.classList.add("active");
        progressBar.style.width = "100%";
      }
    };

    const generateRecommendation = () => {
      let title = isArabic ? "استراتيجية نمو مخصصة" : "Custom Growth Strategy";
      let desc = isArabic
        ? "لدينا حل مصمم خصيصاً لعلامتك التجارية. دعنا نناقش التفاصيل."
        : "We have a tailored solution for your brand. Let's discuss the details.";

      if (userGoal === "sales") {
        if (userBudget === "low") {
          title = isArabic
            ? "باقة المبتدئين للأداء"
            : "Performance Starter Pack";
          desc = isArabic
            ? "نركز على إعلانات Meta عالية التحويل لاستهداف النتائج السريعة وزيادة العائد على الإنفاق الإعلاني."
            : "Focus on high-converting Meta Ads targeting low-hanging fruit to maximize your return on ad spend.";
        } else {
          title = isArabic
            ? "باقة التوسع الشاملة"
            : "Omnichannel Scaling Package";
          desc = isArabic
            ? "مزيج قوي من إعلانات Google Search و TikTok/Snapchat مع إعادة استهداف قوية لدفع المبيعات على نطاق واسع."
            : "A powerful mix of Google Search Intent Ads, TikTok/Snapchat awareness, and aggressive Meta retargeting to drive sales at scale.";
        }
      } else if (userGoal === "awareness") {
        title = isArabic
          ? "مصفوفة الحضور والانتشار"
          : "Brand Presence & Influencer Matrix";
        desc = isArabic
          ? "نوصي بحملة مؤثرين محلية مدمجة مع إعلانات Snapchat و TikTok ذات التأثير العالي للسيطرة على حصة السوق."
          : "We recommend a localized influencer campaign combined with high-impact Snapchat and TikTok branding ads to dominate market share.";
      } else if (userGoal === "content") {
        title = isArabic
          ? "محرك المحتوى المتميز"
          : "Premium Content & UI Engine";
        desc = isArabic
          ? "ارتقِ بعلامتك التجارية مع إنتاج فيديو عالي الجودة وكتابة محتوى ثنائية اللغة وتطوير واجهة المستخدم لبناء الثقة."
          : "Elevate your brand with high-end video production, bilingual copywriting, and a luxury UI/UX overhaul to build long-term trust.";
      }

      if (resultTitle) resultTitle.textContent = title;
      if (resultDesc) resultDesc.textContent = desc;
    };

    // Handle Step 1 Selections
    document.querySelectorAll("#step-1 .wizard-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        userGoal = e.currentTarget.getAttribute("data-goal");
        goToStep(2);
      });
    });

    // Handle Step 2 Selections
    document.querySelectorAll("#step-2 .wizard-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        userBudget = e.currentTarget.getAttribute("data-budget");
        generateRecommendation();
        goToStep(3);
      });
    });

    // Handle Navigation
    const backBtn = document.getElementById("back-to-1");
    if (backBtn) backBtn.addEventListener("click", () => goToStep(1));

    const restartBtn = document.getElementById("wizard-restart");
    if (restartBtn)
      restartBtn.addEventListener("click", () => {
        userGoal = "";
        userBudget = "";
        goToStep(1);
      });
  };

  // Initialize wizard if element exists
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectWizard);
  } else {
    initProjectWizard();
  }

  // ═════ PREMIUM MICRO-INTERACTIONS (WOW FACTOR) ═════
  const initWowFactors = () => {
    // 1. SCROLL REVEALS
    const initScrollReveals = () => {
      const options = { threshold: 0.1, rootMargin: "0px 0px -40px 0px" };
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // Optimize memory
          }
        });
      }, options);

      const targets = document.querySelectorAll(
        "h2, .portfolio-card, .service-box, .special-service-box",
      );
      targets.forEach((el) => {
        el.classList.add("mashhor-reveal");
        revealObserver.observe(el);
      });
    };

    // 2. 3D PHYSICAL TILT
    const initTiltEffect = () => {
      const isTouchDevice =
        window.matchMedia("(any-hover: none)").matches ||
        window.innerWidth < 1024;
      if (isTouchDevice) return; // Save mobile battery and usability

      const isRTL = document.documentElement.dir === "rtl";
      const tiltCards = document.querySelectorAll(
        ".portfolio-card, .service-box, .special-service-box",
      );

      tiltCards.forEach((card) => {
        card.classList.add("mashhor-tilt");

        card.addEventListener("mousemove", (e) => {
          card.classList.add("is-tilting");
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

        card.addEventListener("mouseleave", () => {
          card.classList.remove("is-tilting");
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
      });
    };

    initScrollReveals();
    initTiltEffect();
  };

  // Safe init for Wow Factors
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWowFactors);
  } else {
    setTimeout(initWowFactors, 100); // Slight delay to ensure DOM templates are fully injected
  }

  /* ═══════════════════════════════════════════════════
     GLOBAL EVENT TRACKING (GTM & FBQ)
     ═══════════════════════════════════════════════════ */
  const initGlobalTracking = () => {
    const pushEvent = (eventName, eventData = {}) => {
      // 1. Google Tag Manager
      if (window.dataLayer) {
        window.dataLayer.push({ event: eventName, ...eventData });
      }
      
      // 2. Facebook Pixel (Meta)
      if (typeof fbq === 'function') {
        const standardEvents = ['Lead', 'Contact', 'SubmitApplication', 'ViewContent', 'Schedule'];
        let fbEventName = eventName;
        
        if (eventName === 'high_intent_click') fbEventName = 'Lead';
        if (eventName === 'contact_initiation') fbEventName = 'Contact';
        if (eventName === 'form_submission') fbEventName = 'SubmitApplication';
        if (eventName === 'resource_download') fbEventName = 'ViewContent';

        if (standardEvents.includes(fbEventName)) {
           fbq('track', fbEventName, eventData);
        } else {
           fbq('trackCustom', fbEventName, eventData);
        }
      }
    };

    // Buttons
    document.querySelectorAll('.button, .button-gold').forEach(btn => {
      btn.addEventListener('click', (e) => {
        pushEvent('high_intent_click', {
          button_text: e.target.innerText || 'Button Click',
          button_url: e.currentTarget.getAttribute('href') || ''
        });
      });
    });

    // Contact Links
    document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href^="https://wa.me"]').forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        pushEvent('contact_initiation', {
          contact_type: href.startsWith('tel') ? 'Phone' : href.startsWith('mailto') ? 'Email' : 'WhatsApp',
          contact_url: href
        });
      });
    });

    // PDF / Resources
    document.querySelectorAll('.service-pdf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pushEvent('resource_download', {
          file_url: btn.getAttribute('href')
        });
      });
    });

    // Form Submits
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        pushEvent('form_submission', {
          form_id: form.id || form.getAttribute('name') || 'generic_form'
        });
      });
    });
  };

  const enhanceFaqAccessibility = (scope = document) => {
    scope.querySelectorAll(".faq-item").forEach((item) => {
      const summary = item.querySelector("summary");
      if (summary) {
        summary.setAttribute("role", "button");
        summary.setAttribute("tabindex", "0");
      }
    });
  };

  enhanceFaqAccessibility();

  // ═════ DYNAMIC CONTENT INTEGRATION ═════
  const initDynamicContent = async () => {
    // Determine API URL (default to localhost if not specified)
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000' 
      : window.location.origin;

    const fetchJson = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    };

    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const resolveSiteUrl = (value) => {
      if (!value) return "";
      const str = String(value).trim();
      if (!str) return "";
      if (/^(https?:|mailto:|tel:|#|data:)/i.test(str)) return str;
      if (str.startsWith("/")) return str;
      return `${prefix}${str.replace(/^\.?\//, "")}`;
    };

    const getLocalizedValue = (item, key) => {
      const arKey = `${key}Ar`;
      if (isArabic) return item[arKey] || item[key] || "";
      return item[key] || item[arKey] || "";
    };

    const toVisibleItems = (items) =>
      items
        .filter((item) => item && item.visible !== false)
        .sort((a, b) => {
          const num = (value, fallback) =>
            Number.isFinite(Number(value)) ? Number(value) : fallback;
          const orderDiff =
            num(a.order, num(a.position, 9999)) -
            num(b.order, num(b.position, 9999));
          if (orderDiff !== 0) return orderDiff;
          return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
        });

    const fetchCollection = async (collection) => {
      const data = await fetchJson(
        `${API_URL}/api/site-content/${collection.replace(/_/g, "-")}`,
      );
      return Array.isArray(data.data) ? data.data : [];
    };

    const renderAnnouncement = (items) => {
      const announcementEl = document.querySelector(".announcement");
      const announcement = items[0];
      if (!announcementEl || !announcement) return;

      const text =
        getLocalizedValue(announcement, "text") ||
        getLocalizedValue(announcement, "title");
      if (!text) return;

      const href = resolveSiteUrl(announcement.linkUrl);
      announcementEl.innerHTML = href
        ? `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`
        : escapeHtml(text);
    };

    const renderHeroSlides = (items) => {
      const track = document.querySelector(".hero-carousel-track");
      if (!track || !items.length) return;

      track.innerHTML = items
        .map((item) => {
          const title = getLocalizedValue(item, "title");
          const subtitle =
            getLocalizedValue(item, "subtitle") ||
            getLocalizedValue(item, "description");
          const label = getLocalizedValue(item, "label");
          const imageUrl = resolveSiteUrl(item.imageUrl);
          const linkUrl = resolveSiteUrl(item.linkUrl) || "#";
          if (!title || !imageUrl) return "";

          return `
          <div class="hero-slide">
            <a href="${escapeHtml(linkUrl)}" style="display:block; width:100%; height:100%;">
              <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" fetchpriority="low" style="object-fit: cover;" loading="lazy">
              <div class="hero-slide-overlay">
                ${
                  label
                    ? `<span class="mini-label" style="color:var(--gold); margin-bottom:8px; display:inline-block;">${escapeHtml(label)}</span>`
                    : ""
                }
                <h3 class="hero-slide-title">${escapeHtml(title)}</h3>
                ${
                  subtitle
                    ? `<p style="color: var(--muted); margin: 0;">${escapeHtml(subtitle)}</p>`
                    : ""
                }
              </div>
            </a>
          </div>`;
        })
        .filter(Boolean)
        .join("");

      initHeroCarousels();
      normalizeInternalNavigation(track);
    };

    const renderHeroMetrics = (items) => {
      const metricsRow = document.querySelector(".hero .metrics-row");
      if (!metricsRow || !items.length) return;

      metricsRow.innerHTML = items
        .map((item) => {
          const number = item.number || item.value || "";
          const label = getLocalizedValue(item, "label");
          if (!number && !label) return "";

          return `
          <div class="metric">
            <strong>${escapeHtml(number)}</strong>
            <span>${escapeHtml(label)}</span>
          </div>`;
        })
        .filter(Boolean)
        .join("");
    };

    const renderServices = (items) => {
      const servicesGrid = document.querySelector('[data-cms="services-list"]');
      if (!servicesGrid || !items.length) return;

      servicesGrid.innerHTML = items
        .map((item) => {
          const title = getLocalizedValue(item, "title");
          const description = getLocalizedValue(item, "description");
          const icon = item.icon || "⚙️";
          const linkUrl = resolveSiteUrl(item.linkUrl) || "#";
          if (!title || !description) return "";

          return `
          <article class="service-icon-card">
            <div class="svc-icon">${escapeHtml(icon)}</div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
            <a class="text-link" href="${escapeHtml(linkUrl)}">${
              isArabic ? "عرض التفاصيل ←" : "View Details →"
            }</a>
          </article>`;
        })
        .filter(Boolean)
        .join("");
    };

    const renderClientLogos = (items) => {
      const logoTrack = document.querySelector("[data-logo-carousel]");
      if (!logoTrack || !items.length) return;

      const markup = items
        .map((item) => {
          const title = getLocalizedValue(item, "title") || "Client";
          const imageUrl = resolveSiteUrl(item.imageUrl);
          const linkUrl = resolveSiteUrl(item.linkUrl);
          if (!imageUrl) return "";

          const logo = `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy">`;
          return `<div class="client-logo-item">${
            linkUrl
              ? `<a href="${escapeHtml(linkUrl)}" aria-label="${escapeHtml(title)}">${logo}</a>`
              : logo
          }</div>`;
        })
        .filter(Boolean)
        .join("");

      if (!markup) return;
      logoTrack.innerHTML = `${markup}${markup}`;
      normalizeInternalNavigation(logoTrack);
    };

    const renderProcess = (items) => {
      const processWrap = document.querySelector(".process-section .process-timeline-wrap");
      if (!processWrap || !items.length) return;

      processWrap.innerHTML = items
        .map((item, index) => {
          const title = getLocalizedValue(item, "title");
          const description = getLocalizedValue(item, "description");
          const icon = item.icon || "•";
          if (!title || !description) return "";

          return `
          <div class="p-step">
            <div class="p-step-icon"><span aria-hidden="true" style="font-size:1.25rem;line-height:1;">${escapeHtml(icon)}</span></div>
            <div class="p-step-content">
              <h3>${escapeHtml(`${index + 1}. ${title}`)}</h3>
              <p>${escapeHtml(description)}</p>
            </div>
          </div>`;
        })
        .filter(Boolean)
        .join("");
    };

    const ensureHomeFaqSection = () => {
      let section = document.querySelector("[data-home-faq-section]");
      if (section) return section;

      const processSection = document.querySelector(".process-section");
      const nextSection = document.querySelector(".distinct-services");
      if (!processSection || !processSection.parentElement) return null;

      section = document.createElement("section");
      section.className = "section";
      section.setAttribute("data-home-faq-section", "true");
      section.innerHTML = `
        <div class="section-header">
          <p class="eyebrow">${isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</p>
          <h2>${isArabic ? 'إجابات سريعة على <span>أهم الأسئلة.</span>' : 'Quick answers to <span>common questions.</span>'}</h2>
        </div>
        <div class="faq-stack" data-cms="home-faqs"></div>
      `;

      processSection.parentElement.insertBefore(section, nextSection || processSection.nextSibling);
      return section;
    };

    const renderFaqs = (items) => {
      const faqSection = ensureHomeFaqSection();
      const faqStack = faqSection?.querySelector('[data-cms="home-faqs"]');
      if (!faqStack || !items.length) return;

      faqStack.innerHTML = items
        .map((item, index) => {
          const question = getLocalizedValue(item, "question");
          const answer = getLocalizedValue(item, "answer");
          if (!question || !answer) return "";

          return `
          <details class="faq-item reveal"${index === 0 ? " open" : ""}>
            <summary>${escapeHtml(question)}</summary>
            <p>${escapeHtml(answer)}</p>
          </details>`;
        })
        .filter(Boolean)
        .join("");

      enhanceFaqAccessibility(faqStack);
      normalizeInternalNavigation(faqStack);
    };

    try {
      // 1. Fetch Global Settings (Contact & Social)
      const settingsData = await fetchJson(`${API_URL}/api/settings`);

      if (settingsData.success && settingsData.settings) {
        const s = settingsData.settings;

        // Update Social Links in Footer & Mobile Menu
        const socialMappings = [
          { key: 'linkedinUrl', selector: 'a[aria-label="LinkedIn"]' },
          { key: 'instagramUrl', selector: 'a[aria-label="Instagram"]' },
          { key: 'facebookUrl', selector: 'a[aria-label="Facebook"]' },
          { key: 'snapchatUrl', selector: '.social-snapchat' },
          { key: 'tiktokUrl', selector: '.social-tiktok' },
          { key: 'pinterestUrl', selector: '.social-pinterest' },
        ];

        socialMappings.forEach(m => {
          if (s[m.key]) {
            document.querySelectorAll(m.selector).forEach(el => el.href = s[m.key]);
          }
        });

        // Update Contact Info
        if (s.email) {
          document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
            el.href = `mailto:${s.email}`;
            if (el.textContent.includes('@')) el.textContent = s.email;
          });
        }
        if (s.phone) {
          document.querySelectorAll('a[href^="tel:"]').forEach(el => {
            el.href = `tel:${s.phone}`;
            if (el.textContent.match(/\+\d+/)) el.textContent = s.phone;
          });
        }
        if (s.whatsapp) {
          document.querySelectorAll('a[href*="wa.me"]').forEach(el => el.href = s.whatsapp);
        }
      }

      // 2. Fetch Page-Specific Content
      // Identify current page ID
      let pageId = '';
      if (currentPath === '/' || currentPath.endsWith('/index.html')) pageId = 'home';
      else if (currentPath.includes('/about.html')) pageId = 'about';
      else if (currentPath.includes('/academy/')) pageId = 'academy';
      else if (currentPath.includes('/blog/')) pageId = 'blog';
      else if (currentPath.includes('/privacy.html')) pageId = 'privacy';
      else if (currentPath.includes('/terms.html')) pageId = 'terms';
      else if (currentPath.includes('/sitemap.html')) pageId = 'sitemap';

      if (pageId) {
        const pageData = await fetchJson(`${API_URL}/api/settings/pages/${pageId}`);

        if (pageData.success && pageData.page) {
          const content = isArabic ? pageData.page.contentAr : pageData.page.contentEn;
          if (content) {
            // Look for a specific container to inject content
            const container = document.querySelector('[data-dynamic-content]');
            if (container) {
              container.innerHTML = content;
            }
          }
        }
      }

      // 3. Fetch Portfolio if on Portfolio page
      if (currentPath.includes('/portfolio/')) {
        const portfolioData = await fetchJson(`${API_URL}/api/portfolio`);
        if (portfolioData.success && portfolioData.items) {
          const grid = document.querySelector('.portfolio-grid');
          if (grid) {
            // Optionally clear static items and render dynamic ones
            // grid.innerHTML = portfolioData.items.map(item => renderPortfolioCard(item)).join('');
          }
        }
      }

      // 4. Home CMS sections
      const isHomePage =
        currentPath === "/" ||
        currentPath.endsWith("/index.html") ||
        currentPath.endsWith("/ar/") ||
        currentPath.endsWith("/ar/index.html");

      if (isHomePage) {
        const [
          announcementItems,
          heroItems,
          metricItems,
          serviceItems,
          clientItems,
          processItems,
          faqItems,
        ] = await Promise.all([
          fetchCollection("site_announcements").catch(() => []),
          fetchCollection("site_hero").catch(() => []),
          fetchCollection("site_metrics").catch(() => []),
          fetchCollection("site_services").catch(() => []),
          fetchCollection("site_clients").catch(() => []),
          fetchCollection("site_process").catch(() => []),
          fetchCollection("site_faqs").catch(() => []),
        ]);

        renderAnnouncement(toVisibleItems(announcementItems));
        renderHeroSlides(toVisibleItems(heroItems));
        renderHeroMetrics(toVisibleItems(metricItems));
        renderServices(toVisibleItems(serviceItems));
        renderClientLogos(toVisibleItems(clientItems));
        renderProcess(toVisibleItems(processItems));
        renderFaqs(toVisibleItems(faqItems));
      }

    } catch (err) {
      console.warn('Dynamic content failed to load:', err);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initGlobalTracking();
      initDynamicContent();
      normalizeInternalNavigation();
    });
  } else {
    setTimeout(() => {
      initGlobalTracking();
      initDynamicContent();
      normalizeInternalNavigation();
    }, 200);
  }

  // ─── Global Preloader & Branding Fix ───
  // Remove branding text immediately and hide faster
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const logo = preloader.querySelector('.preloader-logo');
    if (logo) logo.style.display = 'none'; // Completely remove the letters
  }

  window.addEventListener('load', () => {
    if (preloader) {
      preloader.classList.add('loaded');
      // Hide almost instantly after load
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 300); 
    }
  });
})();
