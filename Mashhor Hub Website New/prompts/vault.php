<?php
session_start();

$password = 'MR-PROMPTS-2026';
$ips_file = __DIR__ . '/ips_log_en.txt';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input_pass = isset($_POST['password']) ? trim($_POST['password']) : '';

    if ($input_pass === $password) {
        $ip   = $_SERVER['REMOTE_ADDR'];
        $logs = file_exists($ips_file) ? file_get_contents($ips_file) : '';

        if (strpos($logs, $ip . PHP_EOL) !== false) {
            // IP already used — still allow viewing (just don't log again)
            $_SESSION['vault_unlocked'] = true;
            header('Location: vault-viewer.php');
            exit;
        } else {
            file_put_contents($ips_file, $ip . PHP_EOL, FILE_APPEND);
            $_SESSION['vault_unlocked'] = true;
            header('Location: vault-viewer.php');
            exit;
        }
    } else {
        $error = 'Incorrect password. Please check your access credentials.';
    }
}
?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Secure Vault Access · Mashhor Hub</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap"></noscript>
<link rel="stylesheet" href="assets/css/mashhor-platform.css">
<link rel="icon" type="image/png" href="../assets/images/cropped-MR-LOGO-4.webp?v=20260402">
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
  right: -10%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(196,255,71,.07) 0%, transparent 65%);
  animation: vglow 9s ease-in-out infinite alternate;
}
.vault-bg-glow2 {
  position: absolute;
  bottom: -15%;
  left: -8%;
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
}
@keyframes vfade {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}

/* top accent line */
.vault-card::before {
  content: '';
  position: absolute;
  top: 0; left: 24px; right: 24px;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(196,255,71,.55) 30%,
    rgba(196,255,71,.8) 50%,
    rgba(196,255,71,.55) 70%,
    transparent);
  border-radius: 0 0 4px 4px;
}

/* ── HEADER ── */
.vault-eyebrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
}
.vault-logo-wrap {
  display: flex;
  align-items: center;
  gap: 11px;
}
.vault-lock-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(196,255,71,.1);
  border: 1px solid rgba(196,255,71,.22);
  display: flex;
  align-items: center;
  justify-content: center;
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
}
.vault-brand span { color: var(--lime); }
.vault-brand-sub {
  font-family: var(--fm);
  font-size: .6rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-top: 2px;
}
.vault-secure-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--fm);
  font-size: .58rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--lime);
  background: rgba(196,255,71,.07);
  border: 1px solid rgba(196,255,71,.15);
  border-radius: 100px;
  padding: 5px 11px;
}
.vault-secure-badge .dot {
  width: 6px;
  height: 6px;
  background: var(--lime);
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity:1; transform:scale(1); }
  50%       { opacity:.35; transform:scale(.65); }
}

/* ── TITLE AREA ── */
.vault-title {
  font-family: var(--fh);
  font-weight: 800;
  font-size: 2rem;
  color: var(--white);
  letter-spacing: -.04em;
  line-height: 1.1;
  margin-bottom: 10px;
}
.vault-title em {
  color: var(--lime);
  font-style: normal;
}
.vault-subtitle {
  font-size: .88rem;
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 32px;
}

/* ── DIVIDER ── */
.vault-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.06) 40%, rgba(255,255,255,.06) 60%, transparent);
  margin-bottom: 32px;
}

/* ── FORM ── */
.vault-label {
  display: block;
  font-family: var(--fm);
  font-size: .62rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--lime);
  margin-bottom: 10px;
}
.vault-input-wrap {
  position: relative;
  margin-bottom: 18px;
}
.vault-input-icon {
  position: absolute;
  top: 50%;
  left: 18px;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
  display: flex;
  align-items: center;
}
.vault-input-icon svg { width: 16px; height: 16px; }
.vault-input {
  width: 100%;
  padding: 16px 52px 16px 50px;
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.09);
  color: var(--white);
  border-radius: 14px;
  font-family: var(--fm);
  font-size: .95rem;
  letter-spacing: .06em;
  outline: none;
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
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: color .2s;
}
.vault-toggle:hover { color: var(--white); }
.vault-toggle svg { width: 16px; height: 16px; }

/* ── SUBMIT BUTTON ── */
.vault-btn {
  width: 100%;
  padding: 17px;
  background: var(--lime);
  color: #000;
  font-family: var(--fh);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: .01em;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: transform .2s var(--ease), box-shadow .2s, background .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}
.vault-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,.08);
  opacity: 0;
  transition: opacity .2s;
}
.vault-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(196,255,71,.35);
}
.vault-btn:hover::before { opacity: 1; }
.vault-btn:active { transform: translateY(0); }
.vault-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

/* ── ERROR STATE ── */
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
  line-height: 1.6;
  animation: shake .4s ease;
}
.vault-error svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}

/* ── SUCCESS STATE ── */
.vault-success-wrap {
  text-align: center;
  animation: vfade .5s var(--ease) both;
}
.vault-success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(196,255,71,.1);
  border: 1px solid rgba(196,255,71,.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lime);
  margin: 0 auto 28px;
  animation: pop .5s var(--eback) both;
}
.vault-success-icon svg { width: 36px; height: 36px; }
@keyframes pop {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
.vault-success-title {
  font-family: var(--fh);
  font-weight: 800;
  font-size: 1.65rem;
  color: var(--white);
  letter-spacing: -.04em;
  margin-bottom: 12px;
}
.vault-success-title span { color: var(--lime); }
.vault-success-text {
  color: var(--muted);
  line-height: 1.75;
  font-size: .9rem;
  max-width: 340px;
  margin: 0 auto 28px;
}
.vault-progress {
  height: 3px;
  background: rgba(255,255,255,.06);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 24px;
}
.vault-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--lime), #8eff1a);
  border-radius: 4px;
  animation: fill 4s linear forwards;
  width: 0%;
}
@keyframes fill {
  from { width: 0%; }
  to   { width: 100%; }
}
.vault-redirect-note {
  font-family: var(--fm);
  font-size: .65rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--dim);
  margin-top: 12px;
}

/* ── SECURITY INFO STRIP ── */
.vault-security-strip {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,.05);
}
.vss-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.vss-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dim);
}
.vss-icon svg { width: 14px; height: 14px; }
.vss-label {
  font-family: var(--fm);
  font-size: .56rem;
  letter-spacing: .08em;
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
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  transition: color .2s, gap .2s var(--ease);
}
.vault-back:hover { color: var(--white); gap: 12px; }
.vault-back svg { width: 14px; height: 14px; }

/* ── FOOTER NOTE ── */
.vault-footer {
  position: relative;
  z-index: 2;
  margin-top: 32px;
  text-align: center;
  font-family: var(--fm);
  font-size: .6rem;
  letter-spacing: .08em;
  color: var(--dim);
  line-height: 1.6;
}
.vault-footer a {
  color: var(--muted);
  transition: color .2s;
}
.vault-footer a:hover { color: var(--lime); }

@media (max-width: 520px) {
  .vault-card {
    padding: 36px 24px;
    border-radius: 24px;
  }
  .vault-title { font-size: 1.65rem; }
  .vault-eyebrow { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
</head>
<body>

<!-- Animated background -->
<div class="vault-bg" aria-hidden="true">
  <div class="vault-bg-grid"></div>
  <div class="vault-bg-glow1"></div>
  <div class="vault-bg-glow2"></div>
</div>

<!-- noise overlay from style.css body::after is already applied -->

<main class="vault-card" role="main">

  <?php if ($success): ?>
  <!-- ─── SUCCESS VIEW ─── -->
  <div class="vault-success-wrap">
    <div class="vault-success-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <h1 class="vault-success-title">Vault <span>Unlocked</span></h1>
    <p class="vault-success-text">
      Authentication successful. Your complete 300+ Prompt Vault is being prepared for download.
      Check your browser's download bar.
    </p>
    <div class="vault-progress" role="progressbar" aria-label="Redirecting">
      <div class="vault-progress-fill"></div>
    </div>
    <p class="vault-redirect-note">Returning to Prompt Vault in 4 seconds…</p>
  </div>

  <script>
    (function() {
      const base64Data = "<?php echo $vault_base64; ?>";
      const byteChars = atob(base64Data);
      const byteNums  = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([byteNums], { type: 'text/html' });
      const link = document.createElement('a');
      link.href     = URL.createObjectURL(blob);
      link.download = 'MR_Prompts_Vault_300_En.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => { window.location.replace('index.html'); }, 4000);
    })();
  </script>

  <?php else: ?>
  <!-- ─── ACCESS FORM VIEW ─── -->

  <!-- Header row -->
  <div class="vault-eyebrow">
    <div class="vault-logo-wrap">
      <div class="vault-lock-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div>
        <div class="vault-brand">Mashhor Hub<span>.</span></div>
        <div class="vault-brand-sub">Prompt Vault · Secure Access</div>
      </div>
    </div>
    <div class="vault-secure-badge" aria-label="Encrypted session active">
      <div class="dot"></div>
      Encrypted
    </div>
  </div>

  <h1 class="vault-title">Vault <em>Access</em></h1>
  <p class="vault-subtitle">
    Enter your subscriber password to unlock and download the complete 300+ Prompt library.
    One download per license.
  </p>

  <div class="vault-divider"></div>

  <!-- Error message -->
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

  <!-- Form -->
  <form method="POST" autocomplete="off" novalidate>
    <label class="vault-label" for="vault-pw">Access Password</label>
    <div class="vault-input-wrap">
      <span class="vault-input-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </svg>
      </span>
      <input
        type="password"
        id="vault-pw"
        name="password"
        class="vault-input"
        placeholder="••••••••••••••••"
        required
        autocomplete="off"
        spellcheck="false"
        aria-label="Vault access password"
      >
      <button type="button" class="vault-toggle" onclick="togglePw()" aria-label="Toggle password visibility" id="pw-toggle">
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
      Unlock &amp; Download Vault
    </button>
  </form>

  <!-- Security info strip -->
  <div class="vault-security-strip" aria-label="Security information">
    <div class="vss-item">
      <div class="vss-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div class="vss-label">SSL Secured</div>
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
      <div class="vss-label">Per-license Access</div>
    </div>
    <div class="vss-item">
      <div class="vss-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="12 22 12 12"/>
          <path d="M17 17l-5 5-5-5"/>
          <path d="M21 7a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
        </svg>
      </div>
      <div class="vss-label">Direct Download</div>
    </div>
  </div>

  <!-- Back link -->
  <a href="index.html" class="vault-back" aria-label="Return to Prompt Vault page">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
    Back to Prompts
  </a>

  <?php endif; ?>

</main>

<!-- Footer note -->
<footer class="vault-footer" aria-label="Footer">
  Need access? Contact Mashhor via
  <a href="https://wa.me/96565099769?text=Hi%20Mashhor!%20I%20want%20access%20to%20the%20full%20Prompt%20Vault." target="_blank" rel="noopener noreferrer">WhatsApp</a>
  or
  <a href="mailto:info@mashhor-hub.com?subject=Prompt%20Vault%20Access">Email</a>
  ·
  <a href="../index.html">mashhor-hub.com</a>
</footer>

<script>
// Toggle password visibility
function togglePw() {
  const inp  = document.getElementById('vault-pw');
  const icon = document.getElementById('eye-icon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.innerHTML = `
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 7 11 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
  } else {
    inp.type = 'password';
    icon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
}

// Submit state feedback
document.querySelector('form') && document.querySelector('form').addEventListener('submit', function() {
  const btn = document.getElementById('vault-submit');
  if (btn) {
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="animation:spin .8s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Verifying…
    `;
    btn.style.opacity = '.8';
    btn.style.cursor  = 'not-allowed';
  }
});
</script>
<style>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>

</body>
</html>