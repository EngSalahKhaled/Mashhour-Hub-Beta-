document.addEventListener('DOMContentLoaded', () => {
const isArabic = document.documentElement.lang?.toLowerCase().startsWith('ar');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const smoothBehavior = prefersReducedMotion ? 'auto' : 'smooth';
/* ── Load enhancements.css dynamically ── */
const selfScript = document.querySelector('script[src*="main.js"]');
if (selfScript) {
const enhPath = selfScript.getAttribute('src').replace(/js\/main\.js.*$/, 'css/enhancements.css?v=20260405');
if (!document.querySelector('link[href*="enhancements.css"]')) {
const enhLink = document.createElement('link');
enhLink.rel = 'stylesheet';
enhLink.href = enhPath;
document.head.appendChild(enhLink);
}
}
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const statusElements = [
{ id: 'toast', role: 'status', live: 'polite' },
{ id: 'nl-success', role: 'status', live: 'polite' },
{ id: 'nl-success-ar', role: 'status', live: 'polite' },
{ id: 'nl-error', role: 'alert', live: 'assertive' },
{ id: 'nl-error-ar', role: 'alert', live: 'assertive' }
];statusElements.forEach(({ id, role, live }) => {
const el = document.getElementById(id);
if (!el) return;
el.setAttribute('role', role);
el.setAttribute('aria-live', live);
el.setAttribute('aria-atomic', 'true');
});const mainContent = document.querySelector('main');
if (mainContent && !mainContent.id) {
mainContent.id = 'main-content';
}const oppositeLang = isArabic ? 'en' : 'ar';
const alternateLangLink = document.querySelector(`link[rel="alternate"][hreflang="${oppositeLang}"]`);
const languageSwitchTargets = document.querySelectorAll('.mnav-lang, .nav-lang-link');
if (alternateLangLink?.href) {
languageSwitchTargets.forEach((link) => {
let newHref = alternateLangLink.href;
// If testing locally, rewrite absolute mr-gfx.com paths to local paths without domain
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
try {
const urlObj = new URL(newHref);
newHref = urlObj.pathname + urlObj.search + urlObj.hash;
} catch(e) {}
}
link.setAttribute('href', newHref);
link.setAttribute('hreflang', oppositeLang);
link.setAttribute('lang', oppositeLang);
});
}
const preloader = document.getElementById('preloader');
const hidePreloader = () => {
if (preloader && preloader.style.display !== 'none') {
preloader.classList.add('loaded');
setTimeout(() => {
preloader.style.display = 'none';
}, prefersReducedMotion ? 0 : 300);
}
};if (document.readyState === 'complete') {
hidePreloader();
} else {
window.addEventListener('load', hidePreloader, { once: true });
setTimeout(hidePreloader, 2500);
}
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const cur = document.getElementById('cur');
const cring = document.getElementById('cring');
document.body.classList.toggle('cursor-enhanced', !isTouch && !!cur && !!cring);if (!isTouch && cur && cring) {
let mx = 0;
let my = 0;
let rx = 0;
let ry = 0;document.addEventListener('mousemove', (e) => {
mx = e.clientX;
my = e.clientY;
cur.style.cssText = `left:${mx}px;top:${my}px`;
});const cursorLoop = () => {
rx += (mx - rx) * 0.11;
ry += (my - ry) * 0.11;
cring.style.left = `${rx}px`;
cring.style.top = `${ry}px`;
requestAnimationFrame(cursorLoop);
};
cursorLoop();document.querySelectorAll('a, button, input, select, textarea').forEach((el) => {
el.addEventListener('mouseenter', () => {
cring.style.transform = 'translate(-50%, -50%) scale(1.6)';
cring.style.backgroundColor = 'rgba(196,255,71,0.05)';
cring.style.borderColor = 'var(--lime)';
});
el.addEventListener('mouseleave', () => {
cring.style.transform = 'translate(-50%, -50%) scale(1)';
cring.style.backgroundColor = 'transparent';
cring.style.borderColor = 'rgba(255,255,255,0.3)';
});
});
} else {
if (cur) cur.style.display = 'none';
if (cring) cring.style.display = 'none';
}
const nav = document.getElementById('nav');
const backToTop = document.getElementById('back-to-top');
let scrollTicking = false;const updateScrollUi = () => {
if (nav) nav.classList.toggle('sticky', window.scrollY > 40);
if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
scrollTicking = false;
};window.addEventListener('scroll', () => {
if (!scrollTicking) {
requestAnimationFrame(updateScrollUi);
scrollTicking = true;
}
}, { passive: true });
updateScrollUi();
document.querySelectorAll('.ndropdown').forEach((dropdown, index) => {
const trigger = dropdown.querySelector(':scope > a');
const menu = dropdown.querySelector(':scope > .ndropdown-menu');
if (!trigger || !menu) return;const menuId = menu.id || `ndropdown-menu-${index + 1}`;
const triggerLabel = trigger.textContent.replace('▾', '').trim();menu.id = menuId;
menu.setAttribute('role', 'menu');
menu.setAttribute('aria-label', triggerLabel);trigger.setAttribute('role', 'button');
trigger.setAttribute('tabindex', '0');
trigger.setAttribute('aria-haspopup', 'true');
trigger.setAttribute('aria-expanded', 'false');
trigger.setAttribute('aria-controls', menuId);menu.querySelectorAll('a').forEach((link) => {
link.setAttribute('role', 'menuitem');
if (!link.hasAttribute('tabindex')) {
link.setAttribute('tabindex', '-1');
}
});const setOpenState = (isOpen) => {
dropdown.classList.toggle('open', isOpen);
trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
menu.querySelectorAll('a').forEach((link) => {
link.setAttribute('tabindex', isOpen ? '0' : '-1');
});
};dropdown.addEventListener('mouseenter', () => setOpenState(true));
dropdown.addEventListener('mouseleave', () => setOpenState(false));
dropdown.addEventListener('focusin', () => setOpenState(true));
dropdown.addEventListener('focusout', () => {
requestAnimationFrame(() => {
if (!dropdown.contains(document.activeElement)) {
setOpenState(false);
}
});
});trigger.addEventListener('keydown', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
const isOpen = trigger.getAttribute('aria-expanded') === 'true';
setOpenState(!isOpen);
if (!isOpen) {
menu.querySelector('a')?.focus();
}
}if (e.key === 'ArrowDown') {
e.preventDefault();
setOpenState(true);
menu.querySelector('a')?.focus();
}if (e.key === 'Escape') {
setOpenState(false);
trigger.focus();
}
});menu.addEventListener('keydown', (e) => {
if (e.key === 'Escape') {
e.preventDefault();
setOpenState(false);
trigger.focus();
}
});
});
const hburg = document.getElementById('hburg');
const mnav = document.getElementById('mnav');
const mclose = document.getElementById('mclose');
let lastFocusedElement = null;// Some manually mirrored secondary pages use a lightweight top nav without
// the full mobile drawer. Keep links visible there instead of exposing a
// dead hamburger on small screens.
if (hburg && !mnav) {
hburg.hidden = true;
const navLinks = nav ? nav.querySelector('.nlinks') : null;
if (navLinks) {
const applySimpleNavLayout = () => {
navLinks.style.display = 'flex';
navLinks.style.flexWrap = 'wrap';
navLinks.style.gap = window.innerWidth < 768 ? '10px' : '';
navLinks.style.justifyContent = window.innerWidth < 768 ? 'flex-start' : '';
navLinks.style.width = window.innerWidth < 768 ? '100%' : '';
};
applySimpleNavLayout();
window.addEventListener('resize', applySimpleNavLayout);
}
}const getFocusableInMobileNav = () => (
mnav
? Array.from(mnav.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
: []
);const resetMobileSections = () => {
if (!mnav) return;
mnav.querySelectorAll('.mnav-dropdown-content').forEach((section) => section.classList.remove('open'));
mnav.querySelectorAll('.mnav-label').forEach((label) => {
label.style.color = '';
label.setAttribute('aria-expanded', 'false');
});
mnav.querySelectorAll('.m-arrow').forEach((arrow) => {
arrow.style.transform = '';
});
};const closeMobileNav = () => {
if (!mnav) return;
mnav.classList.remove('open');
mnav.setAttribute('aria-hidden', 'true');
resetMobileSections();
document.body.classList.remove('mnav-open');if (hburg) {
hburg.classList.remove('active');
hburg.setAttribute('aria-expanded', 'false');
}if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
lastFocusedElement.focus();
}
};const openMobileNav = () => {
if (!mnav) return;
lastFocusedElement = document.activeElement;
mnav.classList.add('open');
mnav.setAttribute('aria-hidden', 'false');
document.body.classList.add('mnav-open');if (hburg) {
hburg.classList.add('active');
hburg.setAttribute('aria-expanded', 'true');
}const [firstFocusable] = getFocusableInMobileNav();
if (firstFocusable) firstFocusable.focus();
};if (mnav) {
mnav.setAttribute('aria-hidden', 'true');
mnav.setAttribute('aria-modal', 'true');
mnav.setAttribute('role', 'dialog');let backdrop = document.getElementById('mnav-backdrop');
if (!backdrop) {
backdrop = document.createElement('div');
backdrop.id = 'mnav-backdrop';
backdrop.className = 'mnav-backdrop';
document.body.appendChild(backdrop);
}
backdrop.addEventListener('click', closeMobileNav);mnav.querySelectorAll('.mnav-label').forEach((label) => {
if (!label.querySelector('.mnav-label-meta')) {
label.insertAdjacentHTML('beforeend', '<span class="mnav-label-meta"><span class="m-arrow">▼</span></span>');
}const content = document.createElement('div');
content.className = 'mnav-dropdown-content';
label.after(content);let nextElem = content.nextElementSibling;
while (
nextElem &&
!nextElem.classList.contains('mnav-label') &&
!(nextElem.tagName === 'A' && (nextElem.classList.contains('mnav-cta') || nextElem.classList.contains('mnav-lang')))
) {
const toMove = nextElem;
nextElem = nextElem.nextElementSibling;
content.appendChild(toMove);
}label.setAttribute('role', 'button');
label.setAttribute('aria-expanded', 'false');
label.setAttribute('tabindex', '0');const toggleSection = () => {
const isOpen = content.classList.contains('open');
resetMobileSections();if (!isOpen) {
content.classList.add('open');
label.style.color = 'var(--lime)';
label.setAttribute('aria-expanded', 'true');
const arrow = label.querySelector('.m-arrow');
if (arrow) arrow.style.transform = 'rotate(180deg)';
}
};label.addEventListener('click', toggleSection);
label.addEventListener('keydown', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
toggleSection();
}
});
});
}if (hburg && mnav) {
hburg.setAttribute('aria-label', isArabic ? 'فتح أو إغلاق قائمة التنقل' : 'Toggle navigation menu');
hburg.setAttribute('aria-expanded', 'false');
hburg.setAttribute('aria-controls', 'mnav');
hburg.setAttribute('role', 'button');
hburg.setAttribute('tabindex', '0');hburg.addEventListener('click', () => {
if (mnav.classList.contains('open')) {
closeMobileNav();
} else {
openMobileNav();
}
});hburg.addEventListener('keydown', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
if (mnav.classList.contains('open')) {
closeMobileNav();
} else {
openMobileNav();
}
}
});
}if (mclose && mnav) {
mclose.setAttribute('aria-label', isArabic ? 'إغلاق قائمة التنقل' : 'Close navigation menu');
mclose.setAttribute('role', 'button');
mclose.setAttribute('tabindex', '0');
mclose.addEventListener('click', closeMobileNav);
mclose.addEventListener('keydown', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
closeMobileNav();
}
});
}document.querySelectorAll('.mnav a').forEach((anchor) => {
anchor.addEventListener('click', closeMobileNav);
});document.addEventListener('keydown', (e) => {
if (!mnav || !mnav.classList.contains('open')) return;if (e.key === 'Escape') {
closeMobileNav();
return;
}if (e.key === 'Tab') {
const focusable = getFocusableInMobileNav();
if (!focusable.length) return;
const first = focusable[0];
const last = focusable[focusable.length - 1];if (e.shiftKey && document.activeElement === first) {
e.preventDefault();
last.focus();
} else if (!e.shiftKey && document.activeElement === last) {
e.preventDefault();
first.focus();
}
}
});
const fallbackSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
const mainScript = document.querySelector('script[src*="main.js"]');
const mainScriptSrc = mainScript ? mainScript.getAttribute('src') : '';
const assetBase = mainScriptSrc && mainScriptSrc.includes('assets/js/')
? mainScriptSrc.replace(/js\/main\.js(?:\?.*)?$/, '')
: '/images/';
const imageFallback = `${assetBase}default-cover.svg`;
const blogFallbacks = Array.from({ length: 8 }, (_, index) => `${assetBase}blog-fallback-${index + 1}.svg`);const pickBlogFallback = (img) => {
const seedSource = [
img.getAttribute('src') || '',
img.getAttribute('alt') || '',
window.location.pathname || ''
].join('|');
let hash = 0;
for (let i = 0; i < seedSource.length; i += 1) {
hash = ((hash << 5) - hash) + seedSource.charCodeAt(i);
hash |= 0;
}
return blogFallbacks[Math.abs(hash) % blogFallbacks.length];
};const applyImageFallback = (img) => {
if (!img || img.dataset.fallbackApplied === 'true') return;if (img.getAttribute('src') === imageFallback) {
img.dataset.fallbackApplied = 'true';
img.classList.add('img-error');
const fallback = document.createElement('div');
fallback.className = img.closest('.bc-img') ? 'bc-img-fallback visible' : 'art-cover-fallback visible';
fallback.innerHTML = `${fallbackSVG}<span>Image unavailable</span>`;
if (img.parentNode && !img.parentNode.querySelector(`.${fallback.className.split(' ')[0]}`)) {
img.parentNode.appendChild(fallback);
}
return;
}img.dataset.fallbackApplied = 'true';
const isBlogVisual = img.classList.contains('ahero')
|| img.closest('.art-cover')
|| img.closest('.bc-img')
|| img.closest('.rc')
|| img.closest('.article-card')
|| window.location.pathname.includes('/blog/');img.src = isBlogVisual ? pickBlogFallback(img) : imageFallback;
img.classList.add('is-fallback-image');
};document.querySelectorAll('img').forEach((img) => {
img.addEventListener('error', () => applyImageFallback(img));
if (img.complete && (!img.naturalWidth || img.naturalWidth === 0)) {
applyImageFallback(img);
}
});
/* ── Native AOS Replacement (IntersectionObserver) ── */
const aosElements = document.querySelectorAll('[data-aos]');
if (aosElements.length && 'IntersectionObserver' in window) {
const aosObserver = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
const el = entry.target;
const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
if (delay > 0 && !prefersReducedMotion) {
setTimeout(() => el.classList.add('aos-animate'), delay);
} else {
el.classList.add('aos-animate');
}
aosObserver.unobserve(el);
}
});
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
aosElements.forEach((el) => {
if (prefersReducedMotion) {
el.classList.add('aos-animate');
} else {
aosObserver.observe(el);
}
});
} else if (aosElements.length) {
aosElements.forEach((el) => el.classList.add('aos-animate'));
}
function animateCounter(el) {
const target = parseInt(el.getAttribute('data-count'), 10);
if (Number.isNaN(target)) return;const suffix = el.getAttribute('data-suffix') || '';
const duration = prefersReducedMotion ? 0 : 1800;
const start = performance.now();const update = (now) => {
const elapsed = now - start;
const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
const eased = 1 - Math.pow(1 - progress, 3);
const current = Math.round(target * eased);
el.textContent = `${current}${suffix}`;
if (progress < 1) requestAnimationFrame(update);
};requestAnimationFrame(update);
}if ('IntersectionObserver' in window) {
const counterObserver = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
animateCounter(entry.target);
counterObserver.unobserve(entry.target);
}
});
}, { threshold: 0.5 });document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));
} else {
document.querySelectorAll('[data-count]').forEach(animateCounter);
}
if (backToTop) {
backToTop.setAttribute('aria-label', isArabic ? 'العودة إلى الأعلى' : 'Back to top');
backToTop.addEventListener('click', () => {
window.scrollTo({ top: 0, behavior: smoothBehavior });
});
}
const contactForm = document.getElementById('cf');
if (contactForm) {
const normalizeWhatsAppText = (value) => (value || '')
.replace(/\r\n?/g, '\n')
.replace(/[^\S\n]+/g, ' ')
.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
.trim();const markFieldState = (field, isInvalid) => {
if (!field) return;
field.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
};contactForm.querySelectorAll('input, select, textarea').forEach((field) => {
const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
markFieldState(field, false);
field.addEventListener(eventName, () => markFieldState(field, false));
});contactForm.addEventListener('submit', (e) => {
e.preventDefault();
const firstNameField = document.getElementById('f-name');
const lastNameField = document.getElementById('f-last');
const companyField = document.getElementById('f-company');
const serviceField = document.getElementById('f-service');
const budgetField = document.getElementById('f-budget');
const messageField = document.getElementById('f-msg');const name = normalizeWhatsAppText(firstNameField?.value);
const last = normalizeWhatsAppText(lastNameField?.value);
const company = normalizeWhatsAppText(companyField?.value);
const service = normalizeWhatsAppText(serviceField?.value);
const budget = normalizeWhatsAppText(budgetField?.value);
const message = normalizeWhatsAppText(messageField?.value);
if (!name || name.length < 2) {
markFieldState(firstNameField, true);
firstNameField?.focus();
return;
}
if (!service) {
markFieldState(serviceField, true);
serviceField?.focus();
return;
}if (!budget) {
markFieldState(budgetField, true);
budgetField?.focus();
return;
}if (!message || message.length < 10) {
markFieldState(messageField, true);
messageField?.focus();
return;
}
const text = `Hi Mohamed! 👋
*New Portfolio Inquiry*
*Name:* ${[name, last].filter(Boolean).join(' ')}
*Company:* ${company || 'N/A'}
*Service Needed:* ${service || 'N/A'}
*Budget:* ${budget || 'N/A'}
*Message:*
${message}`;
const waURL = `https://wa.me/96555377309?text=${encodeURIComponent(text)}`;
const toast = document.getElementById('toast');
if (toast) {
toast.classList.add('show');
setTimeout(() => toast.classList.remove('show'), 4000);
}
// CRM Webhook Integration
const WEBHOOK_URL = 'INSERT_GOOGLE_SCRIPT_WEBHOOK_URL_HERE';
if (WEBHOOK_URL.startsWith('http')) {
fetch(WEBHOOK_URL, {
method: 'POST',
mode: 'no-cors', // to avoid CORS preflight issues with Google Apps Script
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
date: new Date().toISOString(),
name: [name, last].filter(Boolean).join(' '),
company: company || 'N/A',
service: service || 'N/A',
budget: budget || 'N/A',
message: message,
source: 'Homepage Contact Form'
})
}).catch(err => console.error('CRM Sync Error', err));
}
setTimeout(() => {
const popup = window.open(waURL, '_blank', 'noopener,noreferrer');
if (!popup) {
window.location.href = waURL;
}
}, 500);
e.target.reset();
contactForm.querySelectorAll('input, select, textarea').forEach((field) => markFieldState(field, false));
});
}
const adSpendInput = document.getElementById('adSpend');
const spendValue = document.getElementById('spendValue');
const wastedSpend = document.getElementById('wastedSpend');
const aiSavings = document.getElementById('aiSavings');
const roiClaimBtn = document.getElementById('roiClaimBtn');if (adSpendInput && spendValue && wastedSpend && aiSavings && roiClaimBtn) {
const updateCalculator = () => {
const val = parseInt(adSpendInput.value, 10);
const safeVal = Number.isNaN(val) ? 0 : val;
const wasted = safeVal * 0.20;
const saved = safeVal * 0.35;spendValue.innerText = `$${safeVal.toLocaleString()}`;
wastedSpend.innerText = `$${wasted.toLocaleString()}`;
aiSavings.innerText = `$${saved.toLocaleString()}`;const msg = encodeURIComponent(`Hello Mohamed, my current monthly ad spend is $${safeVal.toLocaleString()} and I want to recover my wasted spend and automate using AI.`);
roiClaimBtn.href = `https://wa.me/96555377309?text=${msg}`;
};adSpendInput.addEventListener('input', updateCalculator);
updateCalculator();
}
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
anchor.addEventListener('click', (e) => {
const targetSelector = anchor.getAttribute('href');
if (!targetSelector || targetSelector === '#' || targetSelector === '#!') return;const target = document.querySelector(targetSelector);if (target) {
e.preventDefault();
if (!target.hasAttribute('tabindex')) {
target.setAttribute('tabindex', '-1');
}
target.scrollIntoView({ behavior: smoothBehavior, block: 'start' });
target.focus({ preventScroll: true });
}
});
});
const yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
if (img.complete) {
img.style.opacity = '1';
} else {
img.style.opacity = '0';
img.style.transition = 'opacity .5s cubic-bezier(.16,1,.3,1)';
img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
img.addEventListener('error', () => { img.style.opacity = '1'; }, { once: true });
}
});
if (!prefersReducedMotion) {
const revealCards = document.querySelectorAll(
'.vcard, .svcard, .tcard, .pcard, .course-card, .home-path-card, .home-faq-card, .cert-card, .value-item, .quote-card'
);
if (revealCards.length) {
const cardObserver = new IntersectionObserver((entries) => {
entries.forEach((entry, i) => {
if (entry.isIntersecting) {
entry.target.style.transitionDelay = (i * 0.05) + 's';
entry.target.style.opacity = '1';
entry.target.style.transform = 'translateY(0)';
cardObserver.unobserve(entry.target);
}
});
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });revealCards.forEach(card => {
card.style.opacity = '0';
card.style.transform = 'translateY(18px)';
card.style.transition = 'opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1)';
cardObserver.observe(card);
});
}
}
if (!prefersReducedMotion && !isTouch) {
const glowEls = document.querySelectorAll('.hbg-glow1, .hbg-glow2, .about-hero-glow');
if (glowEls.length) {
let ticking = false;
window.addEventListener('scroll', () => {
if (!ticking) {
requestAnimationFrame(() => {
const scrollY = window.scrollY;
glowEls.forEach((el, i) => {
const speed = i % 2 === 0 ? 0.04 : -0.03;
el.style.transform = `translateY(${scrollY * speed}px)`;
});
ticking = false;
});
ticking = true;
}
}, { passive: true });
}
}});if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
const activeScript = document.currentScript || document.querySelector('script[src*="main.js"]');
const scriptSrc = activeScript?.getAttribute('src') || 'js/main.js';
const swPath = scriptSrc.replace(/(?:assets\/)?js\/main\.js(?:\?.*)?$/, 'sw.js');navigator.serviceWorker.register(swPath).catch(() => {});
});
}document.addEventListener('contextmenu', function(e) {
e.preventDefault();
});document.addEventListener('keydown', function(e) {
if (e.keyCode === 123) { // F12
e.preventDefault();
return false;
}
if (e.ctrlKey && e.shiftKey && e.keyCode === 73) { // Ctrl+Shift+I
e.preventDefault();
return false;
}
if (e.ctrlKey && e.shiftKey && e.keyCode === 74) { // Ctrl+Shift+J
e.preventDefault();
return false;
}
if (e.ctrlKey && e.shiftKey && e.keyCode === 67) { // Ctrl+Shift+C
e.preventDefault();
return false;
}
if (e.ctrlKey && e.keyCode === 85) { // Ctrl+U
e.preventDefault();
return false;
}
});let _ds = false;
setInterval(function() {
const bf = performance.now();
debugger;
const af = performance.now();
if (af - bf > 100 && !_ds) {
_ds = true;
document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#c4ff47;font-family:sans-serif;font-size:24px;">Developer tools are not allowed.</div>';
}
}, 1000);const scrollMarkers = { 25: false, 50: false, 75: false, 100: false };
window.addEventListener('scroll', () => {
const scrollTop = window.scrollY || document.documentElement.scrollTop;
const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
const scrollPercent = (scrollTop / docHeight) * 100;[25, 50, 75, 100].forEach((marker) => {
if (scrollPercent >= marker && !scrollMarkers[marker]) {
scrollMarkers[marker] = true;
if (typeof gtag !== 'undefined') {
gtag('event', 'scroll_depth', { depth: marker + '%' });
}
if (typeof fbq !== 'undefined') {
fbq('trackCustom', 'ScrollDepth', { depth: marker + '%' });
}
}
});
}, { passive: true });document.addEventListener('click', (e) => {
const target = e.target.closest('a');
if (!target) return;const href = target.getAttribute('href') || '';
const text = target.innerText || 'button';
// Track Library/File Downloads
if (href.includes('.pdf') || href.includes('/downloads/') || target.hasAttribute('download')) {
if (typeof gtag !== 'undefined') {
gtag('event', 'file_download', { file_url: href, file_name: text.trim() });
}
if (typeof fbq !== 'undefined') {
fbq('trackCustom', 'FileDownload', { file_url: href });
}
}// Track important contact clicks
if (href.includes('wa.me')) {
if (typeof gtag !== 'undefined') {
gtag('event', 'whatsapp_click', { text: text.trim() });
}
}
});

/* ========================================================================= */
/* PREMIUM FEATURES: Read Progress, Animated Counters, Page Transitions      */
/* ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Read Progress Bar
    const initReadProgress = () => {
        let progress = document.createElement('div');
        progress.id = 'read-progress';
        document.body.appendChild(progress);

        window.addEventListener('scroll', () => {
            let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            let scrolled = (winScroll / height) * 100;
            progress.style.width = scrolled + "%";
        });
    };
    initReadProgress();

    // 2. Animated Counters
    const initCounters = () => {
        const counters = document.querySelectorAll('.stat-bar-num, .csnum, .cert-count-num');

        const animate = (counter) => {
            if(counter.classList.contains('counted')) return;
            
            // Find child span/s tags (like +, M+, etc)
            let suffixes = [];
            Array.from(counter.children).forEach(child => {
                suffixes.push(child.outerHTML);
            });
            const suffixHTML = suffixes.join('');
            
            let targetStr = counter.getAttribute('data-target');
            let isFloat = false;

            if (!targetStr) {
                // Get raw text content excluding children
                let clone = counter.cloneNode(true);
                Array.from(clone.children).forEach(c => c.remove());
                let textValue = clone.textContent.trim();
                targetStr = textValue;
                counter.setAttribute('data-target', textValue);
                counter.innerHTML = '0' + suffixHTML;
            }

            let target = parseFloat(targetStr);
            if(isNaN(target)) {
                counter.classList.add('counted');
                return; 
            }
            
            isFloat = targetStr.includes('.');

            const duration = 1500;
            const frameRate = 1000 / 60;
            const totalFrames = Math.round(duration / frameRate);
            const inc = target / totalFrames;
            let c = 0;

            const updateCount = () => {
                c += inc;
                if (c < target) {
                    let displayVal = isFloat ? c.toFixed(1) : Math.ceil(c);
                    counter.innerHTML = displayVal + suffixHTML;
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerHTML = targetStr + suffixHTML;
                    counter.classList.add('counted');
                }
            };
            requestAnimationFrame(updateCount);
        }

        // Only animate when visible on screen
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Small delay looks more natural
                    setTimeout(() => animate(entry.target), 150);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        counters.forEach(counter => observer.observe(counter));
    };
    initCounters();

    // 3. Smooth Page Transitions using existing Preloader
    const initPageTransitions = () => {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        // Force slight transition delay on links to allow preloader wipe
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                // Ignore modifier keys
                if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) return;
                
                const href = this.getAttribute('href');
                const target = this.getAttribute('target');
                
                // Allow internal non-hash links to trigger transition
                if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && target !== '_blank' && !this.hasAttribute('download')) {
                    const isInternal = href.startsWith('/') || href.startsWith('.') || !href.includes('://') || href.includes(window.location.hostname);
                    
                    if (isInternal) {
                        e.preventDefault();
                        preloader.classList.remove('loaded');
                        // Navigate after preloader is visible
                        setTimeout(() => {
                            window.location.href = href;
                        }, 450); 
                    }
                }
            });
        });

        // Browsers bfcache issue fix (making sure preloader hides when clicking back)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted && preloader) {
                preloader.classList.add('loaded');
            }
        });
    };
    initPageTransitions();

    // --- MR Chatbot — Premium Build ---
    const initChatBot = () => {
        const isAr = document.documentElement.lang?.toLowerCase().startsWith('ar');

        /* ── HTML Structure ── */
        const cbContainer = document.createElement('div');
        cbContainer.id = 'mr-chatbot-wrapper';
        cbContainer.innerHTML = `
            <div class="mr-chatbot-window">
                <div class="mr-cb-header">
                    <div class="mr-cb-header-left">
                        <div class="mr-cb-avatar">MR</div>
                        <div class="mr-cb-hinfo">
                            <div class="mr-cb-title">MR Assistant</div>
                            <div class="mr-cb-status"><span class="mr-cb-status-dot"></span>${isAr ? 'متصل الآن' : 'Online Now'}</div>
                        </div>
                    </div>
                    <div class="mr-cb-header-actions">
                        <button class="mr-cb-clear" id="mr-cb-clear" aria-label="${isAr ? 'مسح المحادثة' : 'Clear Chat'}" title="${isAr ? 'مسح المحادثة' : 'Clear Chat'}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                        <button class="mr-cb-close" aria-label="Close Chat">✕</button>
                    </div>
                </div>
                <div class="mr-cb-body" id="mr-cb-body"></div>
                <div class="mr-cb-options" id="mr-cb-options"></div>
                <div class="mr-cb-input-area">
                    <input type="text" class="mr-cb-input" id="mr-cb-input" placeholder="${isAr ? 'اكتب رسالتك هنا...' : 'Type your message...'}" autocomplete="off" />
                    <button class="mr-cb-send" id="mr-cb-send" aria-label="Send">
                        <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
                <div class="mr-cb-powered">${isAr ? 'مدعوم بواسطة MR Digital' : 'Powered by MR Digital'}</div>
            </div>
            <button class="mr-chatbot-float" aria-label="Open Chat">
                <span class="mr-cb-badge" id="mr-cb-badge">1</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>
        `;
        document.body.appendChild(cbContainer);

        /* ── DOM Refs ── */
        const cbFloat = cbContainer.querySelector('.mr-chatbot-float');
        const cbWindow = cbContainer.querySelector('.mr-chatbot-window');
        const cbClose = cbContainer.querySelector('.mr-cb-close');
        const cbBody = document.getElementById('mr-cb-body');
        const cbOptions = document.getElementById('mr-cb-options');
        const cbInput = document.getElementById('mr-cb-input');
        const cbSend = document.getElementById('mr-cb-send');
        const cbBadge = document.getElementById('mr-cb-badge');
        const cbClear = document.getElementById('mr-cb-clear');

        /* ── Chat History (localStorage) ── */
        const HISTORY_KEY = isAr ? 'mr_chatbot_history_ar' : 'mr_chatbot_history';
        const MAX_HISTORY = 50;

        const saveHistory = () => {
            try {
                const msgs = Array.from(cbBody.querySelectorAll('.mr-cb-msg')).map(m => {
                    const bubble = m.querySelector('.mr-cb-bubble');
                    const link = m.querySelector('.mr-cb-link');
                    const time = m.querySelector('.mr-cb-time');
                    return {
                        text: bubble ? bubble.textContent : '',
                        html: bubble ? bubble.innerHTML : '',
                        isBot: m.classList.contains('bot'),
                        link: link ? link.getAttribute('href') : null,
                        linkText: link ? link.textContent.replace(' →', '').trim() : '',
                        time: time ? time.textContent : ''
                    };
                }).slice(-MAX_HISTORY);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs));
            } catch (e) { /* quota exceeded — silently fail */ }
        };

        const loadHistory = () => {
            try {
                const raw = localStorage.getItem(HISTORY_KEY);
                if (!raw) return false;
                const msgs = JSON.parse(raw);
                if (!Array.isArray(msgs) || msgs.length === 0) return false;
                msgs.forEach(m => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = `mr-cb-msg ${m.isBot ? 'bot' : 'user'}`;
                    let html = `<div class="mr-cb-bubble">${m.html || m.text}</div>`;
                    if (m.link && m.linkText) {
                        html += `<a href="${m.link}" class="mr-cb-link" target="${m.link.startsWith('http') ? '_blank' : '_self'}" rel="noopener">${m.linkText} <span>→</span></a>`;
                    }
                    html += `<span class="mr-cb-time">${m.time}</span>`;
                    msgDiv.innerHTML = html;
                    cbBody.appendChild(msgDiv);
                });
                requestAnimationFrame(() => { cbBody.scrollTop = cbBody.scrollHeight; });
                return true;
            } catch (e) { return false; }
        };

        const clearHistory = () => {
            try { localStorage.removeItem(HISTORY_KEY); } catch (e) { /* noop */ }
            cbBody.innerHTML = '';
            hasInitialized = false;
        };

        /* ── Time-based greeting ── */
        const getGreeting = () => {
            const h = new Date().getHours();
            if (isAr) {
                if (h < 12)  return { emoji: '☀️', title: 'صباح الخير!', sub: 'كيف يمكنني مساعدتك اليوم؟' };
                if (h < 18)  return { emoji: '👋', title: 'مرحباً!', sub: 'كيف يمكنني مساعدتك؟' };
                return { emoji: '🌙', title: 'مساء الخير!', sub: 'كيف يمكنني خدمتك الآن؟' };
            }
            if (h < 12)  return { emoji: '☀️', title: 'Good Morning!', sub: 'How can I help you today?' };
            if (h < 18)  return { emoji: '👋', title: 'Hello!', sub: 'How can I assist you?' };
            return { emoji: '🌙', title: 'Good Evening!', sub: 'How can I help you tonight?' };
        };

        /* ── Content Dictionary ── */
        const content = {
            en: {
                viewDet: "View Details",
                inputPlaceholder: "Type your message...",
                options: {
                    services: "Explore Services 🎯",
                    pricing: "Pricing & Plans 💰",
                    academy: "Mashhor Academy 🎓",
                    contact: "Book a Call 📞",
                    back: "← Back to Main Menu"
                },
                responses: {
                    pricing: "I offer transparent, value-driven pricing models. Whether you need a one-time audit or a monthly growth partnership, we have a plan for you.",
                    pricingLink: "/pricing/",
                    pricingText: "View Pricing Details",
                    academy: "Mashhor Academy provides practical, no-fluff courses on AI, Performance Marketing, and Automation built from 10+ years of real execution.",
                    academyLink: "/academy/",
                    academyText: "Open The Academy",
                    contact: "Great! Let's build something that actually converts. You can book a direct strategy call to qualify your project.",
                    contactLink: "/book-call/",
                    contactText: "Book a Strategy Call",
                    services: "Which specific area are you looking to improve?"
                },
                serviceOpts: {
                    performance: "Performance & Ads 📈",
                    automation: "AI Automation 🤖",
                    creative: "Creative & Design 🎨",
                    consulting: "Consulting 🤝"
                },
                serviceRes: {
                    performance: "Lower CAC and better ROAS across Meta, TikTok, Snapchat, and Google Ads — built for the GCC market.",
                    performanceLink: "/services/e-marketing.html",
                    automation: "Automate 60%+ of your marketing overhead with Make.com, n8n, and AI-driven workflows.",
                    automationLink: "/services/smart-automation.html",
                    creative: "Scroll-stopping video production, brand identity design, and motion graphics.",
                    creativeLink: "/services/graphic-design.html",
                    consulting: "Marketing department restructuring, corporate AI workshops, and growth consulting.",
                    consultingLink: "/services/consultation.html"
                },
                fallback: "I am not sure I understand your question. Let me connect you with Mohamed directly for a quick chat!",
                fallbackLink: "https://wa.me/96555377309",
                fallbackText: "Chat on WhatsApp"
            },
            ar: {
                viewDet: "عرض التفاصيل",
                inputPlaceholder: "اكتب رسالتك هنا...",
                options: {
                    services: "استكشاف الخدمات 🎯",
                    pricing: "الأسعار والباقات 💰",
                    academy: "أكاديمية مشهور 🎓",
                    contact: "حجز استشارة 📞",
                    back: "← العودة للقائمة"
                },
                responses: {
                    pricing: "أقدم نماذج تسعير شفافة مبنية على القيمة. سواء كنت تحتاج إلى مراجعة لمرة واحدة أو شراكة نمو شهرية، لدينا باقة تناسبك.",
                    pricingLink: "/ar/pricing/",
                    pricingText: "عرض تفاصيل الأسعار",
                    academy: "تقدم أكاديمية مشهور دورات عملية في الذكاء الاصطناعي والتسويق الرقمي والأتمتة مبنية على خبرة تتجاوز 10 سنوات.",
                    academyLink: "/ar/academy/",
                    academyText: "اكتشف الأكاديمية",
                    contact: "رائع! لنبدأ في بناء نظام يجلب نتائج حقيقية. يمكنك حجز مكالمة استراتيجية مباشرة الآن.",
                    contactLink: "/ar/book-call/",
                    contactText: "حجز مكالمة استراتيجية",
                    services: "أي قسم بالتحديد تود التعرف عليه لتطوير عملك؟"
                },
                serviceOpts: {
                    performance: "التسويق والإعلانات 📈",
                    automation: "الأتمتة والذكاء الاصطناعي 🤖",
                    creative: "التصميم الإبداعي 🎨",
                    consulting: "الاستشارات التسويقية 🤝"
                },
                serviceRes: {
                    performance: "حملات تخفض تكلفة الاستحواذ وتزيد العائد عبر ميتا، تيك توك، سناب شات وجوجل — مصممة لسوق الخليج.",
                    performanceLink: "/ar/services/e-marketing.html",
                    automation: "أتمتة أكثر من 60% من المهام التسويقية عبر Make.com، n8n وأنظمة الذكاء الاصطناعي.",
                    automationLink: "/ar/services/smart-automation.html",
                    creative: "إنتاج محتوى مرئي يخطف الأنظار وبناء هويات بصرية وموشن جرافيك احترافي.",
                    creativeLink: "/ar/services/graphic-design.html",
                    consulting: "استشارات استراتيجية، تدريب على الذكاء الاصطناعي، وهيكلة أقسام التسويق.",
                    consultingLink: "/ar/services/consultation.html"
                },
                fallback: "لم أتمكن من فهم سؤالك بدقة. دعني أوصلك مع محمد مباشرة للمساعدة!",
                fallbackLink: "https://wa.me/96555377309",
                fallbackText: "تواصل عبر واتساب"
            }
        };

        /* ── Keyword Map for Smart Replies ── */
        const keywords = {
            pricing: {
                en: ['price', 'pricing', 'cost', 'how much', 'package', 'plan', 'budget', 'rate', 'fee', 'afford', 'expensive', 'cheap', 'quote'],
                ar: ['سعر', 'أسعار', 'تكلفة', 'كم', 'باقة', 'باقات', 'ميزانية', 'رسوم', 'عرض سعر', 'تسعير']
            },
            academy: {
                en: ['academy', 'course', 'learn', 'training', 'workshop', 'teach', 'study', 'certificate', 'class', 'education'],
                ar: ['أكاديمية', 'دورة', 'دورات', 'تعلم', 'تدريب', 'ورشة', 'تعليم', 'شهادة', 'كورس']
            },
            contact: {
                en: ['contact', 'call', 'book', 'meeting', 'schedule', 'talk', 'reach', 'consult', 'appointment', 'hire', 'work with'],
                ar: ['تواصل', 'اتصال', 'حجز', 'موعد', 'استشارة', 'مكالمة', 'تعاقد', 'أعمل معك']
            },
            performance: {
                en: ['ads', 'advertis', 'meta', 'google', 'tiktok', 'snapchat', 'ppc', 'roas', 'campaign', 'performance', 'paid', 'media buying'],
                ar: ['إعلان', 'إعلانات', 'ميتا', 'جوجل', 'تيك توك', 'سناب', 'حملة', 'حملات', 'إعلانات مدفوعة', 'أداء']
            },
            automation: {
                en: ['automat', 'ai', 'bot', 'make.com', 'n8n', 'zapier', 'workflow', 'crm', 'artificial intelligence'],
                ar: ['أتمتة', 'ذكاء اصطناعي', 'بوت', 'روبوت', 'سير عمل', 'أتمتة تسويقية']
            },
            creative: {
                en: ['design', 'creative', 'brand', 'logo', 'video', 'motion', 'graphic', 'visual', 'identity', 'ui', 'ux'],
                ar: ['تصميم', 'إبداع', 'هوية', 'شعار', 'فيديو', 'موشن', 'جرافيك', 'بصري']
            },
            consulting: {
                en: ['consult', 'strategy', 'mentor', 'advisor', 'restructure', 'audit', 'review', 'analysis'],
                ar: ['استشار', 'استراتيجي', 'مراجعة', 'تحليل', 'هيكلة', 'تقييم']
            }
        };

        const dict = isAr ? content.ar : content.en;
        let isOpen = false;
        let isTyping = false;
        let depth = 0;
        let hasInitialized = false;

        /* ── Helpers ── */
        const getTimeStr = () => {
            const now = new Date();
            let h = now.getHours();
            const m = String(now.getMinutes()).padStart(2, '0');
            const ampm = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
            h = h % 12 || 12;
            return `${h}:${m} ${ampm}`;
        };

        const appendMessage = (msg, isBot = true, link = null, linkText = "") => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `mr-cb-msg ${isBot ? 'bot' : 'user'}`;
            let html = `<div class="mr-cb-bubble">${msg}</div>`;
            if (link && linkText) {
                html += `<a href="${link}" class="mr-cb-link" target="${link.startsWith('http') ? '_blank' : '_self'}" rel="noopener">${linkText} <span>→</span></a>`;
            }
            html += `<span class="mr-cb-time">${getTimeStr()}</span>`;
            msgDiv.innerHTML = html;
            cbBody.appendChild(msgDiv);
            requestAnimationFrame(() => { cbBody.scrollTop = cbBody.scrollHeight; });
            saveHistory();
        };

        const showWelcomeCard = () => {
            const g = getGreeting();
            const card = document.createElement('div');
            card.className = 'mr-cb-welcome';
            card.innerHTML = `
                <div class="mr-cb-welcome-emoji">${g.emoji}</div>
                <h4>${g.title}</h4>
                <p>${g.sub}</p>
            `;
            cbBody.appendChild(card);
        };

        const renderOptions = (opts) => {
            cbOptions.innerHTML = '';
            cbOptions.style.display = 'flex';
            opts.forEach(opt => {
                const key = Object.keys(opt)[0];
                const text = Object.values(opt)[0];
                const btn = document.createElement('button');
                btn.className = 'mr-cb-btn';
                btn.innerHTML = text;
                btn.onclick = () => handleOptionClick(key, text);
                cbOptions.appendChild(btn);
            });
        };

        const simulateTyping = (callback, duration = 700) => {
            if (isTyping) return;
            isTyping = true;
            cbOptions.style.display = 'none';
            const typingDiv = document.createElement('div');
            typingDiv.className = 'mr-cb-msg bot mr-cb-typing';
            typingDiv.innerHTML = `<div class="mr-cb-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
            cbBody.appendChild(typingDiv);
            cbBody.scrollTop = cbBody.scrollHeight;

            setTimeout(() => {
                typingDiv.remove();
                isTyping = false;
                callback();
            }, duration);
        };

        /* ── Menus ── */
        const showMainMenu = () => {
            depth = 0;
            renderOptions([
                { services: dict.options.services },
                { pricing: dict.options.pricing },
                { academy: dict.options.academy },
                { contact: dict.options.contact }
            ]);
        };

        const showServicesMenu = () => {
            depth = 1;
            renderOptions([
                { performance: dict.serviceOpts.performance },
                { automation: dict.serviceOpts.automation },
                { creative: dict.serviceOpts.creative },
                { consulting: dict.serviceOpts.consulting },
                { back: dict.options.back }
            ]);
        };

        /* ── Handle Button Clicks ── */
        const handleOptionClick = (key, text) => {
            if (isTyping) return;
            appendMessage(text, false);

            simulateTyping(() => {
                if (key === 'back') {
                    const g = getGreeting();
                    appendMessage(g.sub);
                    showMainMenu();
                    return;
                }

                if (depth === 0) {
                    if (key === 'services') {
                        appendMessage(dict.responses.services);
                        showServicesMenu();
                    } else if (key === 'pricing') {
                        appendMessage(dict.responses.pricing, true, dict.responses.pricingLink, dict.responses.pricingText);
                        showMainMenu();
                    } else if (key === 'academy') {
                        appendMessage(dict.responses.academy, true, dict.responses.academyLink, dict.responses.academyText);
                        showMainMenu();
                    } else if (key === 'contact') {
                        appendMessage(dict.responses.contact, true, dict.responses.contactLink, dict.responses.contactText);
                        showMainMenu();
                    }
                } else if (depth === 1) {
                    const linkKey = key + 'Link';
                    appendMessage(dict.serviceRes[key], true, dict.serviceRes[linkKey], dict.viewDet);
                    showMainMenu();
                }
            });
        };

        /* ── Smart Text Input Handler ── */
        const matchKeyword = (text) => {
            const lower = text.toLowerCase().trim();
            const lang = isAr ? 'ar' : 'en';

            for (const [category, langs] of Object.entries(keywords)) {
                const words = langs[lang] || langs.en;
                for (const w of words) {
                    if (lower.includes(w.toLowerCase())) {
                        return category;
                    }
                }
            }
            return null;
        };

        const handleTextInput = () => {
            const val = cbInput.value.trim();
            if (!val || isTyping) return;
            cbInput.value = '';

            appendMessage(val, false);

            simulateTyping(() => {
                const match = matchKeyword(val);

                if (match === 'pricing') {
                    appendMessage(dict.responses.pricing, true, dict.responses.pricingLink, dict.responses.pricingText);
                    showMainMenu();
                } else if (match === 'academy') {
                    appendMessage(dict.responses.academy, true, dict.responses.academyLink, dict.responses.academyText);
                    showMainMenu();
                } else if (match === 'contact') {
                    appendMessage(dict.responses.contact, true, dict.responses.contactLink, dict.responses.contactText);
                    showMainMenu();
                } else if (match === 'performance') {
                    appendMessage(dict.serviceRes.performance, true, dict.serviceRes.performanceLink, dict.viewDet);
                    showMainMenu();
                } else if (match === 'automation') {
                    appendMessage(dict.serviceRes.automation, true, dict.serviceRes.automationLink, dict.viewDet);
                    showMainMenu();
                } else if (match === 'creative') {
                    appendMessage(dict.serviceRes.creative, true, dict.serviceRes.creativeLink, dict.viewDet);
                    showMainMenu();
                } else if (match === 'consulting') {
                    appendMessage(dict.serviceRes.consulting, true, dict.serviceRes.consultingLink, dict.viewDet);
                    showMainMenu();
                } else {
                    // No match — fallback
                    appendMessage(dict.fallback, true, dict.fallbackLink, dict.fallbackText);
                    showMainMenu();
                }
            }, 850);
        };

        /* ── Toggle Chat ── */
        const toggleChat = () => {
            isOpen = !isOpen;
            cbContainer.classList.toggle('open', isOpen);

            // Lock body scroll on mobile
            if (window.innerWidth <= 768) {
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            if (isOpen) {
                cbBadge.classList.add('hide');
                if (!hasInitialized) {
                    hasInitialized = true;
                    const restored = loadHistory();
                    if (restored) {
                        showMainMenu();
                    } else {
                        simulateTyping(() => {
                            showWelcomeCard();
                            showMainMenu();
                        }, 600);
                    }
                }
                // Focus input after animation
                setTimeout(() => cbInput.focus(), 500);
            }
        };

        /* ── Event Listeners ── */
        cbFloat.addEventListener('click', toggleChat);
        cbClose.addEventListener('click', () => { if (isOpen) toggleChat(); });
        cbClear.addEventListener('click', () => {
            clearHistory();
            simulateTyping(() => {
                showWelcomeCard();
                showMainMenu();
            }, 400);
        });

        cbSend.addEventListener('click', handleTextInput);
        cbInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTextInput();
            }
        });

        // Close on click outside (desktop only)
        document.addEventListener('click', (e) => {
            if (isOpen && window.innerWidth > 768 && !cbContainer.contains(e.target) && !e.target.closest('.mr-chatbot-float')) {
                toggleChat();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) toggleChat();
        });

        // Restore body scroll on resize
        window.addEventListener('resize', () => {
            if (!isOpen) return;
            document.body.style.overflow = window.innerWidth <= 768 ? 'hidden' : '';
        });
    };
    initChatBot();

});
