/* =========================================================================
   PORTAL CORE — Global logic for Mashhor Hub User Portal
   Handles: Navigation, Notifications, Auth Checks, and Global Stats
   ========================================================================= */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../login.html';
            return;
        }

        // 1. Initialize Navigation
        initSidebar();

        // 2. Fetch Global Data (Profile, Notifications)
        const userData = await fetchPortalData();
        if (userData) {
            updateUI(userData);
        }

        // 3. Load Notifications
        fetchNotifications();
    });

    function initSidebar() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.includes(href)) {
                link.classList.add('active');
            }
            
            // Fix absolute paths if needed
            link.addEventListener('click', (e) => {
                if (href === '#' || !href) e.preventDefault();
            });
        });
    }

    async function fetchPortalData() {
        try {
            const res = await fetch(`${window.location.origin.replace('3000', '5000')}/api/portal/profile`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            return data.success ? data.profile : null;
        } catch (e) { return null; }
    }

    function updateUI(profile) {
        // Update Balance
        const balanceEl = document.querySelector('.stat-card:nth-child(1) .value');
        if (balanceEl) {
            balanceEl.innerHTML = `${profile.balance || '0.00'} ج.م <span class="text-xs text-muted">0.00 $</span>`;
        }

        // Update Name/Avatar in sidebar
        const userNameEl = document.getElementById('sidebar-user-name');
        if (userNameEl) {
            userNameEl.innerHTML = (profile.pageName || 'مستخدم مشهور') + 
                `<span id="user-badge" class="badge-verified ${profile.verificationType === 'yellow' ? 'badge-yellow' : 'badge-blue'}" 
                 style="display: ${profile.isVerified ? 'inline-flex' : 'none'}">✓</span>`;
        }

        // Update Plan Label
        const planEl = document.getElementById('user-plan-label');
        if (planEl) {
            const plans = { 'free': 'خطة مجانية', 'basic': 'خطة أساسية', 'pro': 'خطة سنوية ✨', 'elite': 'خطة غير محدودة 🔥' };
            planEl.innerText = plans[profile.subscriptionPlan] || 'خطة مجانية';
        }
    }

    async function fetchNotifications() {
        try {
            const res = await fetch(`${window.location.origin.replace('3000', '5000')}/api/portal/notifications`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success && data.notifications.length > 0) {
                // Show notification badge
                const badge = document.getElementById('notif-badge');
                if (badge) {
                    badge.innerText = data.notifications.filter(n => !n.read).length;
                    badge.style.display = 'block';
                }
            }
        } catch (e) {}
    }

})();
