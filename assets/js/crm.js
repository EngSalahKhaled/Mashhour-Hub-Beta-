
/**
 * Mashhour Hub CRM Tracker
 * Captures UTMs, automates AJAX forms, and logs advanced telemetry.
 */

// Global CRM Endpoint (Will be updated once WebApp URL is provided)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXa2mrKqwrfL93D_vfs9mTRc8-BevsYhjRjnNFqHxcmq3tIfxfOMU6gLz5Jw9NkJTN0Q/exec"; 

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

    // 1. Capture UTM Parameters securely across sessions
    function getUTMs() {
        const urlParams = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(param => {
            if (urlParams.has(param)) {
                localStorage.setItem(param, urlParams.get(param));
            }
        });
    }
    getUTMs();

    // 2. Form Interception Logic
    document.addEventListener('DOMContentLoaded', () => {
        const crmForms = document.querySelectorAll('form[data-crm]');
        
        crmForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if(APPS_SCRIPT_URL === "INSERT_WEB_APP_URL_HERE") {
                   showPromtToast('هذا النموذج يعمل الآن ولكن بانتظار ربط نظام الـ CRM ليتم الإرسال.', 'error');
                   return; // Prevent action if URL is missing
                }

                // Change button to loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn ? submitBtn.innerText : '';
                if(submitBtn) {
                    submitBtn.innerText = 'Processing...';
                    submitBtn.disabled = true;
                }

                // Gather Data using FormData
                const formData = new FormData(this);
                const payload = new URLSearchParams();
                
                // Add base fields
                for (const pair of formData.entries()) {
                    payload.append(pair[0], pair[1]);
                }

                // Inject Advanced CRM Telemetry
                const formType = this.getAttribute('data-crm') || 'Inbox';
                payload.append('formType', formType);
                payload.append('timestamp', new Date().toISOString());
                payload.append('page_url', window.location.href);
                payload.append('language', navigator.language);
                
                // Inject UTMs from cache if they exist
                ['utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
                    if (localStorage.getItem(param)) {
                        payload.append(param, localStorage.getItem(param));
                    }
                });

                // Send silently
                fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: payload,
                    mode: 'no-cors'
                })
                .then(() => {
                    // Navigate securely based on form type
                    if (formType === 'Subscribers') {
                        const isAr = document.documentElement.lang && document.documentElement.lang.startsWith("ar");
                        showPromtToast(isAr ? "تم الاشتراك بنجاح" : "Successfully subscribed", "success");
                        e.target.reset();
                        if(submitBtn) {
                            submitBtn.innerText = originalBtnText;
                            submitBtn.disabled = false;
                        }
                    } else if (formType === 'Unsubscribe') {
                        const isAr = document.documentElement.lang && document.documentElement.lang.startsWith("ar");
                        showPromtToast(isAr ? "تم الغاء الاشتراك بنجاح" : "Successfully unsubscribed", "success");
                        e.target.reset();
                        if(submitBtn) {
                            submitBtn.innerText = originalBtnText;
                            submitBtn.disabled = false;
                        }
                    } else if (formType === 'Influencers') {
                        let successMsg = document.getElementById('form-success');
                        if(successMsg) {
                            successMsg.style.display = 'flex';
                            this.style.display = 'none';
                        } else {
                            window.location.href = "thank-you.html";
                        }
                    } else {
                        window.location.href = "thank-you.html";
                    }
                })
                .catch(error => {
                    console.error('CRM Error:', error);
                    const isAr = document.documentElement.lang && document.documentElement.lang.startsWith("ar");
                    showPromtToast(isAr ? "حدث خطأ أثناء إرسال النموذج. يرجى المحاولة مرة أخرى." : "There was an error submitting the form. Please try again.", "error");
                    if(submitBtn) {
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                });
            });
        });
    });
})();
