<?php
session_start();

$password = 'MR-PROMPTS-2026';
$ips_file = __DIR__ . '/ips_log.txt';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input_pass = isset($_POST['password']) ? trim($_POST['password']) : '';

    if ($input_pass === $password) {
        $ip   = $_SERVER['REMOTE_ADDR'];
        $logs = file_exists($ips_file) ? file_get_contents($ips_file) : '';

        if (strpos($logs, $ip . PHP_EOL) !== false) {
            // IP مسجّل مسبقاً — السماح بالمشاهدة مجدداً دون تسجيل
            $_SESSION['vault_unlocked_ar'] = true;
            header('Location: vault-viewer.php');
            exit;
        } else {
            file_put_contents($ips_file, $ip . PHP_EOL, FILE_APPEND);
            $_SESSION['vault_unlocked_ar'] = true;
            header('Location: vault-viewer.php');
            exit;
        }
    } else {
        $error = 'كلمة المرور غير صحيحة. يرجى التحقق من بيانات الوصول.';
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>الوصول إلى مكتبة البرومبتات · مشهور هب</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap"></noscript>
<link rel="stylesheet" href="assets/css/mashhor-platform.css">
<link rel="stylesheet" href="../../assets/css/rtl.css?v=20260402">
<link rel="icon" type="image/png" href="../../assets/images/cropped-MR-LOGO-4.webp?v=20260402">
<style>
/* ── VAULT PAGE RESET ── */
html, body {
  min-height: 100%;
  overflow-x: hidden;
}
body {
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100svh;
  font-family: var(--fb), sans-serif;
  padding: 40px 20px;
  position: relative;
}

/* ── ANIMATED BACKGROUND ── */
.vault-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.vault-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(196,255,71,.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(196,255,71,.015) 1px, transparent 1px);
  background-size: 60px 60px;
}
.vault-bg-glow1 {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(196,255,71,.07) 0%, transparent 65%);
  animation: vglow 9s ease-in-out infinite alternate;
}
.vault-bg-glow2 {
  position: absolute;
  bottom: -15%;
  right: -8%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,87,34,.04) 0%, transparent 65%);
  animation: vglow 11s ease-in-out 2s infinite alternate-reverse;
}
@keyframes vglow {
  from { transform: scale(1); opacity: .7; }
  to   { transform: scale(1.1); opacity: 1; }
}

/* ── VAULT CARD ── */
.vault-card {
  position: relative;
  z-index: 2;
  width: min(480px, 100%);
  background: linear-gradient(160deg,
    rgba(255,255,255,.055) 0%,
    rgba(255,255,255,.02) 100%);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 28px;
  padding: 48px 40px;
  box-shadow:
    0 30px 70px rgba(0,0,0,.45),
    0 0 0 1px rgba(196,255,71,.04),
    inset 0 1px 0 rgba(255,255,255,.06);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  animation: vfade .6s var(--ease) both;
  text-align: center;
}
@keyframes vfade {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
.vault-card::before {
  content: '';
  position: absolute;
  top: 0; right: 24px; left: 24px;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(196,255,71,.55) 30%,
    rgba(196,255,71,.8) 50%,
    rgba(196,255,71,.55) 70%,
    transparent);
}

/* ── HEADER ── */
.vault-eyebrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
  flex-direction: row-reverse;
}
.vault-logo-wrap {
  display: flex;
  align-items: center;
  gap: 11px;
  flex-direction: row-reverse;
}
.vault-lock-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(196,255,71,.1);
  border: 1px solid rgba(196,255,71,.22);
  display: flex; align-items: center; justify-content: center;
  color: var(--lime);
  flex-shrink: 0;
}
.vault-lock-icon svg { width: 20px; height: 20px; }
.vault-brand {
  font-family: var(--fh);
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--white);
  letter-spacing: -.03em;
  line-height: 1.2;
  text-align: right;
}
.vault-brand span { color: var(--lime); }
.vault-brand-sub {
  font-family: var(--fm);
  font-size: .6rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-top: 2px;
  text-align: right;
}
.vault-secure-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--fm);
  font-size: .58rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--lime);
  background: rgba(196,255,71,.07);
  border: 1px solid rgba(196,255,71,.15);
  border-radius: 100px;
  padding: 5px 11px;
}
.vault-secure-badge .dot {
  width: 6px; height: 6px;
  background: var(--lime);
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity:1; transform:scale(1); }
  50%       { opacity:.35; transform:scale(.65); }
}

/* ── TITLE ── */
.vault-title {
  font-family: var(--fh);
  font-weight: 800;
  font-size: 2rem;
  color: var(--white);
  letter-spacing: -.02em;
  line-height: 1.1;
  margin-bottom: 10px;
}
.vault-title em { color: var(--lime); font-style: normal; }
.vault-subtitle {
  font-size: .88rem;
  color: var(--muted);
  line-height: 1.75;
  margin-bottom: 32px;
  font-family: var(--fb);
}
.vault-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.07) 40%, rgba(255,255,255,.07) 60%, transparent);
  margin-bottom: 32px;
}

/* ── FORM ── */
.vault-label {
  display: block;
  font-family: var(--fm);
  font-size: .62rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--lime);
  margin-bottom: 10px;
  text-align: right;
}
.vault-input-wrap {
  position: relative;
  margin-bottom: 18px;
  direction: ltr;
}
.vault-input-icon {
  position: absolute;
  top: 50%; right: 18px;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
  display: flex; align-items: center;
}
.vault-input-icon svg { width: 16px; height: 16px; }
.vault-input {
  width: 100%;
  padding: 16px 50px 16px 50px;
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.09);
  color: var(--white);
  border-radius: 14px;
  font-family: var(--fm);
  font-size: .95rem;
  letter-spacing: .06em;
  outline: none;
  text-align: center;
  transition: border-color .25s, box-shadow .25s, background .25s;
}
.vault-input::placeholder {
  color: rgba(255,255,255,.28);
  letter-spacing: .04em;
}
.vault-input:focus {
  border-color: rgba(196,255,71,.45);
  background: rgba(0,0,0,.45);
  box-shadow: 0 0 0 4px rgba(196,255,71,.1);
}
.vault-toggle {
  position: absolute;
  top: 50%; left: 16px;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer;
  color: var(--muted);
  display: flex; align-items: center;
  padding: 4px; border-radius: 6px;
  transition: color .2s;
}
.vault-toggle:hover { color: var(--white); }
.vault-toggle svg { width: 16px; height: 16px; }

/* ── SUBMIT ── */
.vault-btn {
  width: 100%;
  padding: 17px;
  background: var(--lime);
  color: #000;
  font-family: var(--fh);
  font-weight: 800;
  font-size: 1rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: transform .2s var(--ease), box-shadow .2s, background .2s;
  display: flex; align-items: center; justify-content: center;
  gap: 10px;
  position: relative; overflow: hidden;
}
.vault-btn::before {
  content: '';
  position: absolute; inset: 0;
  background: rgba(255,255,255,.08);
  opacity: 0; transition: opacity .2s;
}
.vault-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(196,255,71,.35); }
.vault-btn:hover::before { opacity: 1; }
.vault-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

/* ── ERROR ── */
.vault-error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #ff6b6b;
  background: rgba(255,107,107,.07);
  border: 1px solid rgba(255,107,107,.2);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  font-size: .85rem;
  line-height: 1.65;
  text-align: right;
  animation: shake .4s ease;
  flex-direction: row-reverse;
}
.vault-error svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(6px); }
  40%     { transform: translateX(-6px); }
  60%     { transform: translateX(4px); }
  80%     { transform: translateX(-4px); }
}

/* ── SECURITY STRIP ── */
.vault-security-strip {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,.05);
}
.vss-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 6px; text-align: center;
}
.vss-icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  display: flex; align-items: center; justify-content: center;
  color: var(--dim);
}
.vss-icon svg { width: 14px; height: 14px; }
.vss-label {
  font-family: var(--fm);
  font-size: .54rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--dim);
  line-height: 1.4;
}

/* ── BACK LINK ── */
.vault-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  font-family: var(--fm);
  font-size: .68rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  transition: color .2s, gap .2s var(--ease);
}
.vault-back:hover { color: var(--white); gap: 12px; }
.vault-back svg { width: 14px; height: 14px; }

/* ── FOOTER ── */
.vault-footer {
  position: relative; z-index: 2;
  margin-top: 32px;
  text-align: center;
  font-family: var(--fm);
  font-size: .6rem;
  letter-spacing: .06em;
  color: var(--dim);
  line-height: 1.6;
}
.vault-footer a { color: var(--muted); transition: color .2s; }
.vault-footer a:hover { color: var(--lime); }

@media (max-width: 520px) {
  .vault-card { padding: 36px 24px; border-radius: 24px; }
  .vault-title { font-size: 1.65rem; }
  .vault-eyebrow { flex-direction: column; align-items: flex-end; gap: 12px; }
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
</head>
<body>

<div class="vault-bg" aria-hidden="true">
  <div class="vault-bg-grid"></div>
  <div class="vault-bg-glow1"></div>
  <div class="vault-bg-glow2"></div>
</div>

<main class="vault-card" role="main">

  <!-- ─── نموذج الوصول ─── -->
  <div class="vault-eyebrow">
    <div class="vault-logo-wrap">
      <div class="vault-lock-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div>
        <div class="vault-brand">مشهور هب<span>.</span></div>
        <div class="vault-brand-sub">Prompt Vault · وصول آمن</div>
      </div>
    </div>
    <div class="vault-secure-badge" aria-label="جلسة مشفرة نشطة">
      <div class="dot"></div>
      مشفّر
    </div>
  </div>

  <h1 class="vault-title">بوابة <em>الوصول</em></h1>
  <p class="vault-subtitle">
    أدخل كلمة مرور اشتراكك لفتح مكتبة البرومبتات الكاملة (300+) وعرضها مباشرةً في متصفحك.
  </p>

  <div class="vault-divider"></div>

  <?php if ($error): ?>
  <div class="vault-error" role="alert">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <span><?php echo htmlspecialchars($error); ?></span>
  </div>
  <?php endif; ?>

  <form method="POST" autocomplete="off" novalidate>
    <label class="vault-label" for="vault-pw-ar">كلمة المرور</label>
    <div class="vault-input-wrap">
      <span class="vault-input-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </svg>
      </span>
      <input
        type="password"
        id="vault-pw-ar"
        name="password"
        class="vault-input"
        placeholder="••••••••••••••••"
        required
        autocomplete="off"
        spellcheck="false"
        aria-label="كلمة مرور الوصول إلى المكتبة"
      >
      <button type="button" class="vault-toggle" onclick="togglePw()" aria-label="إظهار/إخفاء كلمة المرور" id="pw-toggle">
        <svg id="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </div>
    <button type="submit" class="vault-btn" id="vault-submit">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      فتح المكتبة ومشاهدتها
    </button>
  </form>

  <div class="vault-security-strip" aria-label="معلومات الأمان">
    <div class="vss-item">
      <div class="vss-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div class="vss-label">SSL آمن</div>
    </div>
    <div class="vss-item">
      <div class="vss-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div class="vss-label">ترخيص فردي</div>
    </div>
    <div class="vss-item">
      <div class="vss-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="3"/>
        </svg>
      </div>
      <div class="vss-label">مباشر في المتصفح</div>
    </div>
  </div>

  <a href="index.html" class="vault-back" aria-label="العودة إلى صفحة البرومبتات">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
    عودة للمكتبة
  </a>

</main>

<footer class="vault-footer" aria-label="تذييل الصفحة">
  تحتاج وصولاً؟ تواصل مع محمد عبر
  <a href="https://wa.me/96555377309?text=مرحباً%20محمد!%20أريد%20الوصول%20إلى%20مكتبة%20البرومبتات%20الكاملة." target="_blank" rel="noopener noreferrer">واتساب</a>
  أو
  <a href="mailto:info@mashhor-hub.com?subject=Prompt%20Vault%20Access">البريد الإلكتروني</a>
  ·
  <a href="../../index.html">mashhor-hub.com</a>
</footer>

<script>
function togglePw() {
  const inp  = document.getElementById('vault-pw-ar');
  const icon = document.getElementById('eye-icon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.innerHTML = `
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 7 11 7a9.74 9.74 0 0 0 5.39-1.61"/>
    `;
  } else {
    inp.type = 'password';
    icon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
}

document.querySelector('form') && document.querySelector('form').addEventListener('submit', function() {
  const btn = document.getElementById('vault-submit');
  if (btn) {
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
           style="animation:spin .8s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      جارٍ التحقق…
    `;
    btn.style.opacity = '.8';
    btn.style.cursor  = 'not-allowed';
  }
});
</script>
<style>@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }</style>

</body>
</html>