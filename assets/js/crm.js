/**
 * Mashhour Hub CRM Tracker
 * Captures UTMs, automates AJAX forms, and logs advanced telemetry.
 * Submits directly to the Node.js API endpoint.
 */

(function() {
    // Custom Toast Promt
    function showPromtToast(message, type = 'success') {
        const isAr = document.documentElement.lang && document.documentElement.lang.startsWith("ar");
        const existing = document.getElementById('mashhor-promt-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.id = 'mashhor-promt-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 2147483647;
            font-family: var(--fm, 'Space Grotesk', 'Alexandria', sans-serif);
            font-size: 1rem;
            font-weight: 500;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            width: calc(100% - 40px);
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: ${isAr ? 'right' : 'left'};
            direction: ${isAr ? 'rtl' : 'ltr'};
        `;
        
        if (isAr) {
            toast.style.borderRight = type === 'success' ? '4px solid var(--gold, #f4cd55)' : '4px solid #ef4444';
        } else {
            toast.style.borderLeft = type === 'success' ? '4px solid var(--gold, #f4cd55)' : '4px solid #ef4444';
        }

        const icon = type === 'success' ? '✅' : '⚠️';
        toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> <span>${message}</span>`;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
        }, 3000);
    }

    function getUTMs() {
        const urlParams = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(param => {
            if (urlParams.has(param)) {
                localStorage.setItem(param, urlParams.get(param));
            }
        });
    }
    getUTMs();

    // ─── API Submission (Node.js Express Backend) ───
    async function submitToApi(url, payload) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return data.success === true;
        } catch (error) {
            console.error('CRM Submission Error:', error);
            return false;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const crmForms = document.querySelectorAll('form[data-crm]');
        
        crmForms.forEach(form => {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Change button to loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn ? submitBtn.innerText : '';
                if(submitBtn) {
                    submitBtn.innerText = 'Processing...';
                    submitBtn.disabled = true;
                }

                // Gather Data using FormData
                const formData = new FormData(this);
                const payload = {};
                
                // Add base fields
                for (const [key, value] of formData.entries()) {
                    payload[key] = value;
                }

                // Inject Advanced CRM Telemetry
                const formType = this.getAttribute('data-crm') || 'Inbox';
                payload.formType = formType;
                payload.timestamp = new Date().toISOString();
                payload.page_url = window.location.href;
                payload.language = navigator.language;
                
                // Inject UTMs from cache if they exist
                ['utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
                    const val = localStorage.getItem(param);
                    if (val) payload[param] = val;
                });

                // Submit via JSON fetch
                // Depending on deployment, the API runs on /api/leads
                const API_URL = '/api/leads';
                const success = await submitToApi(API_URL, payload);

                if (success) {
                    const isAr = document.documentElement.lang && document.documentElement.lang.startsWith("ar");
                    if (formType === 'Subscribers') {
                        showPromtToast(isAr ? "تم الاشتراك بنجاح" : "Successfully subscribed", "success");
                        e.target.reset();
                        if(submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
                    } else if (formType === 'Unsubscribe' || formType === 'Unsubscribers') {
                        showPromtToast(isAr ? "تم الغاء الاشتراك بنجاح" : "Successfully unsubscribed", "success");
                        e.target.reset();
                        if(submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
                    } else if (formType === 'Influencers') {
                        let successMsg = document.getElementById('form-success');
                        if(successMsg) {
                            successMsg.style.display = 'flex';
                            e.target.style.display = 'none';
                        } else {
                            window.location.href = "thank-you.html";
                        }
                    } else {
                        window.location.href = "thank-you.html";
                    }
                } else {
                    const isAr = document.documentElement.lang && document.documentElement.lang.startsWith("ar");
                    showPromtToast(isAr ? "حدث خطأ أثناء إرسال النموذج. يرجى المحاولة مرة أخرى." : "There was an error submitting the form. Please try again.", "error");
                    if(submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
                }
            });
        });
    });
})();
