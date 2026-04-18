
/**
 * Mashhour Hub CRM Tracker
 * Captures UTMs, automates AJAX forms, and logs advanced telemetry.
 */

// Global CRM Endpoint (Will be updated once WebApp URL is provided)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXa2mrKqwrfL93D_vfs9mTRc8-BevsYhjRjnNFqHxcmq3tIfxfOMU6gLz5Jw9NkJTN0Q/exec"; 

(function() {
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
                   alert('هذا النموذج يعمل الآن ولكن بانتظار ربط نظام الـ CRM ليتم الإرسال.');
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
                    body: payload
                })
                .then(response => response.json())
                .then(data => {
                    // Navigate securely based on form type
                    if (formType === 'Subscribers') {
                        window.location.href = "subscribe.html";
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
                    alert("There was an error submitting the form. Please try again.");
                    if(submitBtn) {
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                });
            });
        });
    });
})();
