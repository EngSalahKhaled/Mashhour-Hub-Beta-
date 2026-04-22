/**
 * Mashhor Hub CMS Bridge
 * Dynamically injects CMS content into static HTML pages.
 */

const CMSBridge = (() => {
  const API_BASE = (window.MashhorAPI && window.MashhorAPI.API_BASE) || (window.location.origin + '/api');
  const LANG = document.documentElement.lang || 'ar';

  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`);
      const data = await response.json();
      return data.success ? (data.data || data.posts || data.courses || data.settings || []) : [];
    } catch (e) {
      console.error(`[CMSBridge] Failed to fetch ${endpoint}:`, e);
      return [];
    }
  };

  const handleMaintenance = async (settings) => {
    if (settings && settings.maintenanceMode) {
        // If we are not on maintenance.html, redirect there
        if (!window.location.pathname.includes('maintenance.html')) {
            window.location.href = '/maintenance.html';
        }
    }
  };

  const syncGlobalSettings = (settings) => {
    if (!settings) return;
    
    // Announcement bar
    const announcement = document.querySelector('.announcement');
    if (announcement && settings.announcementText) {
        announcement.innerText = settings.announcementText;
    }

    // SEO / Meta
    if (settings.siteTitle) {
        // Only update if it's a generic page
        if (document.title.includes('| Mashhor Hub') && document.title.startsWith('Mashhor Hub')) {
            document.title = settings.siteTitle;
        }
    }
  };

  const renderBlog = async () => {
    const containers = document.querySelectorAll('[data-cms="blog-posts"]');
    if (!containers.length) return;

    const posts = await fetchData('blog');
    const recentPosts = posts.slice(0, 3);

    containers.forEach(container => {
      container.innerHTML = recentPosts.map(post => `
        <div class="blog-card" data-aos="fade-up">
          <div class="blog-card-image">
            <img src="${post.thumbnail || 'assets/images/placeholder.jpg'}" alt="${LANG === 'ar' ? post.title_ar : post.title_en}">
          </div>
          <div class="blog-card-content">
            <span class="blog-category">${post.category || 'General'}</span>
            <h3>${LANG === 'ar' ? post.title_ar : post.title_en}</h3>
            <p>${LANG === 'ar' ? (post.excerpt_ar || '') : (post.excerpt_en || '')}</p>
            <a href="blog-details.html?slug=${post.slug}" class="read-more">
              ${LANG === 'ar' ? 'اقرأ المزيد' : 'Read More'}
              <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      `).join('');
    });
  };

  const updateSEO = (title, description) => {
    if (title) document.title = `${title} | Mashhor Hub`;
    if (description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = description;
    }
  };

  const renderSinglePost = async (slug) => {
    const posts = await fetchData('blog');
    const post = posts.find(p => p.slug === slug);
    if (!post) return;

    const title = LANG === 'ar' ? post.title_ar : post.title_en;
    const excerpt = LANG === 'ar' ? post.excerpt_ar : post.excerpt_en;
    updateSEO(title, excerpt);

    const titleEl = document.getElementById('post-title');
    const metaEl = document.getElementById('post-meta');
    const contentEl = document.getElementById('post-content');
    const imageEl = document.getElementById('post-image');

    if (titleEl) titleEl.innerText = LANG === 'ar' ? post.title_ar : post.title_en;
    if (metaEl) metaEl.innerText = post.category || 'Insights';
    if (contentEl) contentEl.innerHTML = LANG === 'ar' ? post.content_ar : post.content_en;
    if (imageEl && post.thumbnail) {
        imageEl.src = post.thumbnail;
        imageEl.style.display = 'block';
    }
  };

  const renderServices = async () => {
    const containers = document.querySelectorAll('[data-cms="services-list"]');
    if (!containers.length) return;

    const services = await fetchData('services');

    containers.forEach(container => {
      container.innerHTML = services.map(service => `
        <article class="service-icon-card" data-aos="zoom-in">
          <div class="svc-icon">
            <img src="${service.imageUrl || 'assets/images/icons/service-default.png'}" alt="${service.title}" style="width:40px; height:40px; object-fit:contain;">
          </div>
          <h3>${service.title}</h3>
          <p>${service.description}</p>
          <a class="text-link" href="service-details.html?id=${service.id}">${LANG === 'ar' ? 'عرض التفاصيل ←' : 'View Details →'}</a>
        </article>
      `).join('');
    });
  };

  const renderSingleService = async (id) => {
    const services = await fetchData('services');
    const service = services.find(s => s.id === id);
    if (!service) return;

    updateSEO(service.title, service.description);

    const titleEl = document.getElementById('service-title');
    const descEl = document.getElementById('service-description');
    const catEl = document.getElementById('service-category');
    const imageEl = document.getElementById('service-image');

    if (titleEl) titleEl.innerText = service.title;
    if (descEl) descEl.innerText = service.description;
    if (catEl) catEl.innerText = service.category || 'Premium Service';
    if (imageEl && service.imageUrl) imageEl.src = service.imageUrl;
  };

  const renderInfluencers = async () => {
    const containers = document.querySelectorAll('[data-cms="influencer-grid"]');
    if (!containers.length) return;

    const influencers = await fetchData('influencers');

    containers.forEach(container => {
      container.innerHTML = influencers.map(inf => `
        <article class="influencer-card" data-category="${inf.category || 'lifestyle'}" data-aos="fade-up">
          <div class="influencer-avatar">${inf.imageUrl ? `<img src="${inf.imageUrl}" alt="${inf.name}">` : '👤'}</div>
          <div class="influencer-info">
            <h3>${inf.name}</h3>
            <p class="influencer-handle">${inf.handle || `@${inf.name.toLowerCase().replace(/\s+/g, '.')}`}</p>
            <div class="case-metrics" style="justify-content:center;">
              <span class="case-chip">${inf.country || 'GCC'}</span>
              <span class="case-chip">${inf.category || 'Lifestyle'}</span>
            </div>
            <div class="influencer-stats">
              <div><strong>${inf.followers || '—'}</strong><span>Followers</span></div>
              <div><strong>${inf.engagement || '—'}%</strong><span>Engagement</span></div>
            </div>
            <a href="profile.html?id=${inf.id}" class="button button-gold" style="margin-top:20px; width:100%;">${LANG === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}</a>
          </div>
        </article>
      `).join('');
    });
  };

  const renderSingleInfluencer = async (id) => {
    const influencers = await fetchData('influencers');
    const inf = influencers.find(i => i.id === id);
    if (!inf) return;

    updateSEO(inf.name, inf.bio);

    const nameEl = document.getElementById('inf-name');
    const handleEl = document.getElementById('inf-handle');
    const bioEl = document.getElementById('inf-bio');
    const imageEl = document.getElementById('inf-image');
    
    if (nameEl) nameEl.innerText = inf.name;
    if (handleEl) handleEl.innerText = inf.handle || `@${inf.name.toLowerCase()}`;
    if (bioEl) bioEl.innerText = inf.bio || 'Professional creator in our network.';
    if (imageEl && inf.imageUrl) imageEl.src = inf.imageUrl;
  };

  const renderRelatedArticles = async (currentSlug) => {
    const container = document.querySelector('[data-cms="related-articles"]');
    if (!container) return;

    const posts = await fetchData('blog');
    const related = posts.filter(p => p.slug !== currentSlug).slice(0, 3);

    container.innerHTML = related.map(post => `
      <a href="../blog/${post.slug}.html" class="bcard" data-aos="fade-up">
        <div class="bc-img">
          <img src="${post.thumbnail || '../assets/images/thumbs/thumb_uns_img_blog_index.webp'}" alt="${LANG === 'ar' ? post.title_ar : post.title_en}" loading="lazy">
        </div>
        <div class="bc-body">
          <h3 class="bc-title">${LANG === 'ar' ? post.title_ar : post.title_en}</h3>
          <div class="bc-read">${LANG === 'ar' ? 'اقرأ المقال ←' : 'Read Article →'}</div>
        </div>
      </a>
    `).join('');
  };

  const renderRelatedCourses = async (currentId) => {
    const container = document.querySelector('[data-cms="related-courses"]');
    if (!container) return;

    const courses = await fetchData('courses');
    const related = courses.filter(c => c.id !== currentId).slice(0, 3);

    container.innerHTML = related.map(course => `
      <a href="../academy/courses/${course.slug}.html" class="course-card" data-aos="fade-up">
        <div class="cc-img">
          <img src="${course.thumbnail || '../assets/images/thumbs/thumb_uns_img_blog_index.webp'}" alt="${course.title}" loading="lazy">
        </div>
        <div class="cc-body">
          <span class="cc-label">${course.level || 'Intermediate'}</span>
          <h3>${course.title}</h3>
          <p>${course.shortDesc || ''}</p>
          <div class="cc-meta">
            <span>${course.duration || '2h 30m'}</span>
            <span>${course.price === 0 ? (LANG === 'ar' ? 'مجاني' : 'Free') : (course.price + ' KD')}</span>
          </div>
        </div>
      </a>
    `).join('');
  };

  const renderPricingPlans = async () => {
    const containers = document.querySelectorAll('[data-cms="pricing-grid"]');
    if (!containers.length) return;

    const plans = await fetchData('pricing');
    if (!plans || !plans.length) return;

    containers.forEach(container => {
      container.innerHTML = plans.map((plan, index) => `
        <div class="price-card ${plan.isPopular ? 'popular' : ''}" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
          ${plan.isPopular ? `<div class="popular-badge">${LANG === 'ar' ? 'الأكثر توفيراً ✨' : 'Best Value ✨'}</div>` : ''}
          <div class="plan-name">${LANG === 'ar' ? plan.name_ar : plan.name_en}</div>
          <ul class="feature-list">
            ${(LANG === 'ar' ? plan.features_ar : plan.features_en).map(f => `
              <li class="feature-item"><i>✦</i> ${f}</li>
            `).join('')}
          </ul>
          <div class="price-box">
            ${plan.oldPrice ? `<div class="old-price">${plan.oldPrice} ${plan.currency || 'KWD'}</div>` : ''}
            <div class="current-price">${plan.price}</div>
            <div class="price-suffix">${plan.currency || 'KWD'} / ${LANG === 'ar' ? plan.period_ar : plan.period_en}</div>
            ${plan.badgeText ? `<span class="free-tag">${plan.badgeText}</span>` : ''}
          </div>
          <a href="https://wa.me/96555377309?text=${encodeURIComponent((LANG === 'ar' ? 'السلام عليكم، أرغب في الاشتراك في باقة ' : 'Hello, I would like to subscribe to the ') + (LANG === 'ar' ? plan.name_ar : plan.name_en) + (LANG === 'ar' ? ' بأكاديمية مشهور.' : ' at Mashhor Academy.'))}" target="_blank" class="btn-subscribe">
            ${LANG === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
          </a>
        </div>
      `).join('');
    });
  };

  const init = async () => {
    const settings = await fetchData('settings');
    handleMaintenance(settings);
    syncGlobalSettings(settings);

    renderBlog();
    renderServices();
    renderInfluencers();
    renderPricingPlans();
    
    // Auto-detect single page contexts
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const slug = params.get('slug') || window.location.pathname.split('/').pop().replace('.html', '');

    if (document.querySelector('[data-cms="related-articles"]')) renderRelatedArticles(slug);
    if (document.querySelector('[data-cms="related-courses"]')) renderRelatedCourses(id);
  };

  return { init, renderSinglePost, renderSingleService, renderSingleInfluencer, renderRelatedArticles, renderRelatedCourses, renderPricingPlans };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', CMSBridge.init);
