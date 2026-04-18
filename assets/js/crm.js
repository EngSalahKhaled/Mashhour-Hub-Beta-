/**
 * Mashhour Hub CRM Tracker v2
 * Captures UTMs, automates AJAX forms, logs telemetry.
 * Uses hidden iframe for reliable Google Apps Script submission.
 */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXa2mrKqwrfL93D_vfs9mTRc8-BevsYhjRjnNFqHxcmq3tIfxfOMU6gLz5Jw9NkJTN0Q/exec";

(function() {

    // ─── Toast Notification System ───
    function injectToastStyles() {
        if (document.getElementById('crm-toast-styles')) return;
        const style = document.createElement('style');
        style.id = 'crm-toast-styles';
        style.textContent = `
            .crm-toast-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
                z-index: 99999; display: flex; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
            }
            .crm-toast-overlay.active { opacity: 1; pointer-events: all; }
            .crm-toast-box {
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 1px solid rgba(244,205,85,0.3);
                border-radius: 20px; padding: 40px 36px; max-width: 420px; width: 90%;
                text-align: center; transform: scale(0.85); transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
                box-shadow: 0 25px 60px rgba(0,0,0,0.5);
            }
            .crm-toast-overlay.active .crm-toast-box { transform: scale(1); }
            .crm-toast-icon { font-size: 3.5rem; margin-bottom: 16px; }
            .crm-toast-title {
                font-family: 'Space Grotesk', 'Alexandria', sans-serif;
                font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 10px;
            }
            .crm-toast-msg {
                font-size: 0.95rem; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 24px;
            }
            .crm-toast-btn {
                background: linear-gradient(135deg, #f4cd55, #e8b730);
                color: #0a0a1a; border: none; padding: 12px 40px; border-radius: 100px;
                font-weight: 700; font-size: 1rem; cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .crm-toast-btn:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(244,205,85,0.4); }
            .crm-toast-error .crm-toast-box { border-color: rgba(255,80,80,0.4); }
        `;
        document.head.appendChild(style);
    }

    function showToast(icon, title, message, isError) {
        injectToastStyles();
        // Remove existing toast
        const existing = document.querySelector('.crm-toast-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'crm-toast-overlay' + (isError ? ' crm-toast-error' : '');
        overlay.innerHTML = `
            <div class="crm-toast-box">
                <div class="crm-toast-icon">${icon}</div>
                <div class="crm-toast-title">${title}</div>
                <div class="crm-toast-msg">${message}</div>
                <button class="crm-toast-btn" onclick="this.closest('.crm-toast-overlay').classList.remove('active');setTimeout(()=>this.closest('.crm-toast-overlay').remove(),300)">OK</button>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));
    }

    // ─── UTM Capture ───
    function getUTMs() {
        const urlParams = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(param => {
            if (urlParams.has(param)) {
                localStorage.setItem(param, urlParams.get(param));
            }
        });
    }
    getUTMs();

    // ─── Hidden Iframe Submission (Bypass CORS) ───
    function submitViaIframe(url, params, callback) {
        const iframeName = 'crm_iframe_' + Date.now();
        const iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = iframeName;
        form.style.display = 'none';

        for (const [key, value] of params.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }

        document.body.appendChild(form);

        iframe.onload = function() {
            // Cleanup after submit
            setTimeout(() => {
                iframe.remove();
                form.remove();
            }, 2000);
            if (callback) callback(true);
        };

        iframe.onerror = function() {
            setTimeout(() => {
                iframe.remove();
                form.remove();
            }, 2000);
            if (callback) callback(false);
        };

        form.submit();
    }

    // ─── Form Interception ───
    document.addEventListener('DOMContentLoaded', () => {
        const crmForms = document.querySelectorAll('form[data-crm]');

        crmForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // Change button to loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn ? submitBtn.innerText : '';
                if (submitBtn) {
                    submitBtn.innerText = 'Processing ...';
                    submitBtn.disabled = true;
                }

                // Build payload
                const formData = new FormData(this);
                const payload = new URLSearchParams();

                for (const pair of formData.entries()) {
                    payload.append(pair[0], pair[1]);
                }

                // CRM Telemetry
                const formType = this.getAttribute('data-crm') || 'Inbox';
                payload.append('formType', formType);
                payload.append('timestamp', new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuwait' }));
                payload.append('page_url', window.location.href);
                payload.append('language', navigator.language);

                // UTMs
                ['utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
                    const val = localStorage.getItem(param);
                    if (val) payload.append(param, val);
                });

                // Submit via hidden iframe
                const currentForm = this;
                submitViaIframe(APPS_SCRIPT_URL, payload, function(success) {
                    if (success) {
                        if (formType === 'Subscribers') {
                            showToast('🎉', 'You\'re In!', 'Your subscription has been confirmed. Check your inbox for the exclusive report.', false);
                            currentForm.reset();
                            if (submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
                        } else if (formType === 'Influencers') {
                            let successMsg = document.getElementById('form-success');
                            if (successMsg) {
                                successMsg.style.display = 'flex';
                                currentForm.style.display = 'none';
                            } else {
                                showToast('🌟', 'Application Received!', 'Thank you for applying to join our influencer network. Our team will review your profile and get back to you soon.', false);
                                currentForm.reset();
                                if (submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
                            }
                        } else if (formType === 'Unsubscribers') {
                            showToast('👋', 'Unsubscribed Successfully', 'Your email has been removed from our active marketing lists. We wish you all the best!', false);
                            currentForm.reset();
                            if (submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
                        } else {
                            // Contacts
                            showToast('✅', 'Message Sent!', 'Thank you for reaching out. Our team will review your inquiry and get back to you within 24 hours.', false);
                            currentForm.reset();
                            if (submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
                        }
                    } else {
                        showToast('⚠️', 'Something Went Wrong', 'There was an error submitting the form. Please try again or contact us directly.', true);
                        if (submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
                    }
                });
            });
        });
    });
})();
