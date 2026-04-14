<?php
session_start();

// منع الوصول المباشر — يجب المرور عبر vault.php
if (empty($_SESSION['vault_unlocked_ar'])) {
    header('Location: vault.php');
    exit;
}

$vault_file = __DIR__ . '/Complete_Vault_Data.html';
if (!file_exists($vault_file)) {
    http_response_code(500);
    echo '<p style="color:red;font-family:sans-serif;padding:40px;direction:rtl">ملف المكتبة غير موجود. يرجى التواصل مع الدعم.</p>';
    exit;
}

$vault_html = file_get_contents($vault_file);
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>مكتبة البرومبتات الكاملة — مشهور هب</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"></noscript>
<link rel="icon" type="image/png" href="../../assets/images/cropped-MR-LOGO-4.webp?v=20260402">
<style>
/* ── TOKENS ── */
:root {
  --bg: #07070A; --surf: #0F0F14; --ink: #14141A;
  --white: #F2EEE8; --dim: #B0B0C0; --muted: #808090;
  --border: rgba(255,255,255,.06);
  --lime: #C4FF47; --orange: #FF5722; --gold: #E9C97B;
  --fh: 'Syne', sans-serif;
  --fm: 'JetBrains Mono', monospace;
  --fb: 'Outfit', sans-serif;
  --ease: cubic-bezier(0.16,1,0.3,1);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--dim);
  font-family: var(--fb);
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
  direction: rtl;
}

/* ── TOP BAR ── */
.viewer-topbar {
  position: sticky; top: 0; z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 5%;
  background: rgba(7,7,10,.94);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
}
.vtb-brand {
  font-family: var(--fh);
  font-weight: 800;
  font-size: 1rem;
  color: var(--white);
  letter-spacing: -.03em;
  display: flex; align-items: center; gap: 10px;
  text-decoration: none;
  flex-direction: row-reverse;
}
.vtb-brand span { color: var(--lime); }
.vtb-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--fm);
  font-size: .58rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--lime);
  background: rgba(196,255,71,.07);
  border: 1px solid rgba(196,255,71,.18);
  border-radius: 100px;
  padding: 5px 12px;
}
.vtb-badge .dot {
  width: 6px; height: 6px;
  background: var(--lime); border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(.65); }
}
.vtb-actions {
  display: flex; align-items: center; gap: 10px;
  flex-direction: row-reverse;
}
.vtb-btn {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--fm);
  font-size: .65rem; letter-spacing: .06em; text-transform: uppercase;
  padding: 9px 16px; border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.04);
  color: var(--muted);
  cursor: pointer; text-decoration: none;
  transition: color .2s, border-color .2s, background .2s;
}
.vtb-btn:hover {
  color: var(--white); border-color: rgba(255,255,255,.14);
  background: rgba(255,255,255,.07);
}
.vtb-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
.vtb-btn-wa {
  background: #25D366; color: #000;
  border-color: transparent; font-weight: 700;
}
.vtb-btn-wa:hover { background: #1dbd59; color: #000; border-color: transparent; }

/* ── SEARCH & FILTER ── */
.viewer-controls {
  position: sticky; top: 57px; z-index: 90;
  background: rgba(7,7,10,.94);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 14px 5%;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.vc-search { flex: 1; min-width: 200px; position: relative; }
.vc-search-icon {
  position: absolute; top: 50%; right: 14px;
  transform: translateY(-50%);
  color: var(--muted); pointer-events: none;
  display: flex; align-items: center;
}
.vc-search-icon svg { width: 15px; height: 15px; }
.vc-input {
  width: 100%;
  padding: 10px 40px 10px 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--white);
  font-family: var(--fb);
  font-size: .85rem;
  outline: none;
  text-align: right;
  transition: border-color .2s, box-shadow .2s;
}
.vc-input::placeholder { color: var(--muted); }
.vc-input:focus {
  border-color: rgba(196,255,71,.4);
  box-shadow: 0 0 0 3px rgba(196,255,71,.08);
}
.vc-filters { display: flex; gap: 7px; flex-wrap: wrap; flex-direction: row-reverse; }
.vcf-btn {
  padding: 7px 14px; border-radius: 100px;
  border: 1px solid var(--border);
  background: transparent;
  font-family: var(--fm);
  font-size: .58rem; letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted); cursor: pointer;
  transition: all .2s;
}
.vcf-btn:hover, .vcf-btn.active {
  background: rgba(196,255,71,.08);
  border-color: rgba(196,255,71,.3);
  color: var(--lime);
}
.vc-count {
  font-family: var(--fm); font-size: .6rem;
  color: var(--muted); letter-spacing: .06em; white-space: nowrap;
}

/* ── PROMPT GRID ── */
.viewer-grid-wrap {
  max-width: 1400px; margin: 0 auto;
  padding: 40px 5% 80px;
}
.viewer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}
.vcard {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  display: flex; flex-direction: column; gap: 14px;
  transition: transform .3s var(--ease), border-color .3s;
}
.vcard:hover { transform: translateY(-4px); border-color: rgba(255,255,255,.1); }
.vcard-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-direction: row-reverse;
}
.vcard-tags { display: flex; gap: 7px; flex-wrap: wrap; flex-direction: row-reverse; }
.vtag {
  font-family: var(--fm);
  font-size: .56rem; letter-spacing: .1em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 4px;
}
.vtag-cat        { background: rgba(196,255,71,.1);  color: var(--lime); }
.vtag-cat.Video  { background: rgba(255,79,30,.1);   color: var(--orange); }
.vtag-cat.Image  { background: rgba(233,201,123,.1); color: var(--gold); }
.vtag-cat.Ads    { background: rgba(255,180,30,.1);  color: #FFB41E; }
.vtag-cat.Tech   { background: rgba(79,142,255,.1);  color: #4F8EFF; }
.vtag-cat.Strategy   { background: rgba(200,180,255,.1); color: #c8b4ff; }
.vtag-cat.Automation { background: rgba(30,220,200,.1);  color: #1EDCC8; }
.vtag-cat.Design { background: rgba(255,79,130,.1); color: #FF4F82; }
.vtag-cat.Text   { background: rgba(196,255,71,.1);  color: var(--lime); }
.vtag-tool {
  background: rgba(255,255,255,.04); color: var(--muted);
  border: 1px solid transparent;
}
.vcard-copy-btn {
  width: 30px; height: 30px; border-radius: 6px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.03);
  color: var(--muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: color .2s, border-color .2s, background .2s;
}
.vcard-copy-btn:hover  { color: var(--lime); border-color: var(--lime); }
.vcard-copy-btn.copied { background: var(--lime); color: #000; border-color: var(--lime); }
.vcard-copy-btn svg { width: 13px; height: 13px; }
.vcard-title {
  font-family: var(--fh);
  font-weight: 700; font-size: 1.05rem;
  color: var(--white); letter-spacing: -.02em;
  line-height: 1.35; text-align: right;
}
.vcard-body {
  background: rgba(0,0,0,.3);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 16px;
  font-family: var(--fb);
  font-size: .82rem; color: var(--muted); line-height: 1.7;
  white-space: pre-wrap; flex: 1;
  max-height: 180px; overflow-y: auto;
  text-align: right;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.vcard-body::-webkit-scrollbar { width: 3px; }
.vcard-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

/* ── EMPTY ── */
.viewer-empty {
  display: none; grid-column: 1 / -1;
  text-align: center; padding: 60px 20px;
  color: var(--muted); font-family: var(--fb); font-size: .85rem;
}

/* ── TOAST ── */
.viewer-toast {
  position: fixed; bottom: 28px; left: 28px;
  background: var(--surf);
  border: 1px solid rgba(196,255,71,.3);
  border-radius: 10px; padding: 13px 20px;
  font-family: var(--fb); font-size: .78rem; color: var(--lime);
  z-index: 9999;
  transform: translateY(80px); opacity: 0;
  transition: transform .35s var(--ease), opacity .35s;
}
.viewer-toast.show { transform: none; opacity: 1; }

@media (max-width: 768px) {
  .viewer-controls { top: 54px; flex-direction: column; align-items: stretch; }
  .vc-filters { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 2px; }
  .vcf-btn { white-space: nowrap; }
  .viewer-grid { grid-template-columns: 1fr; }
  .vtb-actions .vtb-btn:not(.vtb-btn-wa) { display: none; }
}
</style>
</head>
<body>

<!-- شريط التنقل العلوي -->
<header class="viewer-topbar">
  <a href="../../ar/index.html" class="vtb-brand" aria-label="العودة إلى موقع مشهور هب">
    مشهور هب<span>.</span>
  </a>
  <div class="vtb-badge">
    <div class="dot"></div>
    المكتبة الكاملة · مفتوحة
  </div>
  <div class="vtb-actions">
    <a href="index.html" class="vtb-btn" aria-label="العودة إلى صفحة البرومبتات">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      العودة
    </a>
    <a href="https://wa.me/96565099769?text=مرحباً%20محمد!%20لدي%20سؤال%20حول%20مكتبة%20البرومبتات." target="_blank" rel="noopener noreferrer" class="vtb-btn vtb-btn-wa" aria-label="تواصل عبر واتساب">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      واتساب
    </a>
  </div>
</header>

<!-- شريط البحث والفرز -->
<div class="viewer-controls" role="search">
  <div class="vc-search">
    <span class="vc-search-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </span>
    <input type="text" id="vSearch" class="vc-input" placeholder="ابحث في البرومبتات، الأدوات، التصنيفات…" aria-label="البحث في البرومبتات">
  </div>
  <div class="vc-filters" id="vFilters" role="group" aria-label="التصفية حسب الفئة">
    <button class="vcf-btn active" data-cat="all">الكل</button>
    <button class="vcf-btn" data-cat="Ads">إعلانات</button>
    <button class="vcf-btn" data-cat="Text">نصوص</button>
    <button class="vcf-btn" data-cat="Strategy">استراتيجية</button>
    <button class="vcf-btn" data-cat="Image">صور</button>
    <button class="vcf-btn" data-cat="Video">فيديو</button>
    <button class="vcf-btn" data-cat="Automation">أتمتة</button>
    <button class="vcf-btn" data-cat="Tech">تقنية</button>
    <button class="vcf-btn" data-cat="Design">تصميم</button>
  </div>
  <div class="vc-count" id="vCount" aria-live="polite"></div>
</div>

<!-- شبكة البرومبتات -->
<div class="viewer-grid-wrap">
  <div class="viewer-grid" id="vGrid">
    <div class="viewer-empty" id="vEmpty">لا توجد برومبتات تطابق بحثك. جرّب كلمة مختلفة.</div>
  </div>
</div>

<!-- إشعار النسخ -->
<div class="viewer-toast" id="vToast" role="status" aria-live="polite">✓ تم النسخ إلى الحافظة</div>

<script>
(function () {
  const vaultHTML = <?php echo json_encode($vault_html); ?>;
  const parser    = new DOMParser();
  const doc       = parser.parseFromString(vaultHTML, 'text/html');
  const rawCards  = Array.from(doc.querySelectorAll('.card'));

  const prompts = rawCards.map(card => ({
    cat:   (card.querySelector('.cat')  || {}).textContent?.trim() || '',
    tool:  (card.querySelector('.tool') || {}).textContent?.trim() || '',
    title: (card.querySelector('h3')    || {}).textContent?.trim() || '',
    text:  (card.querySelector('.text') || {}).textContent?.trim() || '',
  }));

  const grid    = document.getElementById('vGrid');
  const empty   = document.getElementById('vEmpty');
  const counter = document.getElementById('vCount');
  const toast   = document.getElementById('vToast');

  function catClass(cat) {
    return 'vtag vtag-cat ' + (cat || '');
  }

  function render(list) {
    grid.querySelectorAll('.vcard').forEach(el => el.remove());
    if (list.length === 0) {
      empty.style.display = 'block';
      counter.textContent = '٠ برومبت';
      return;
    }
    empty.style.display = 'none';
    counter.textContent = list.length + ' برومبت';

    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'vcard';
      card.innerHTML = `
        <div class="vcard-head">
          <div class="vcard-tags">
            <span class="${catClass(p.cat)}">${p.cat}</span>
            <span class="vtag vtag-tool">${p.tool}</span>
          </div>
          <button class="vcard-copy-btn" title="نسخ البرومبت" aria-label="نسخ البرومبت إلى الحافظة">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
        <h3 class="vcard-title">${p.title}</h3>
        <div class="vcard-body">${p.text}</div>
      `;
      card.querySelector('.vcard-copy-btn').addEventListener('click', function() {
        navigator.clipboard.writeText(card.querySelector('.vcard-body').innerText).then(() => {
          this.classList.add('copied');
          this.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
          showToast();
          setTimeout(() => {
            this.classList.remove('copied');
            this.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
          }, 2000);
        }).catch(() => {});
      });
      grid.appendChild(card);
    });
  }

  let toastTimer;
  function showToast() {
    clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  let activeCat = 'all';
  let searchQ   = '';

  function applyFilters() {
    const q = searchQ.toLowerCase();
    const filtered = prompts.filter(p => {
      const matchCat  = activeCat === 'all' || p.cat === activeCat;
      const matchText = !q || p.title.toLowerCase().includes(q)
                           || p.text.toLowerCase().includes(q)
                           || p.tool.toLowerCase().includes(q)
                           || p.cat.toLowerCase().includes(q);
      return matchCat && matchText;
    });
    render(filtered);
  }

  document.getElementById('vSearch').addEventListener('input', function() {
    searchQ = this.value;
    applyFilters();
  });

  document.getElementById('vFilters').addEventListener('click', function(e) {
    const btn = e.target.closest('.vcf-btn');
    if (!btn) return;
    document.querySelectorAll('.vcf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    applyFilters();
  });

  render(prompts);
})();
</script>

</body>
</html>
