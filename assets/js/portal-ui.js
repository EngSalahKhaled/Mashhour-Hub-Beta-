/* =========================================================================
   PORTAL UI INJECTOR — Dynamically injects Header and Sidebar
   Ensures 100% consistency across all portal sub-pages
   ========================================================================= */

(function() {
    'use strict';

    const sidebarHTML = `
        <div class="mb-8" style="padding: 0 10px;">
            <img src="../assets/images/icons/logo.png" alt="Logo" style="height: 35px;">
        </div>

        <div class="sidebar-section">
            <nav>
                <a href="dashboard.html" class="nav-link" data-page="dashboard"><i>🏠</i> الرئيسية</a>
                <a href="store-settings.html" class="nav-link" data-page="store"><i>⚙️</i> إعدادات المتجر</a>
                <a href="apps.html" class="nav-link" data-page="apps"><i>🧩</i> التطبيقات</a>
                <a href="schedules.html" class="nav-link" data-page="schedules"><i>📅</i> جداول المواعيد</a>
                <a href="referral.html" class="nav-link" data-page="referral"><i>🔗</i> برنامج الإحالة</a>
            </nav>
        </div>

        <div class="sidebar-section">
            <div class="sidebar-label">المنتجات</div>
            <nav>
                <a href="academy.html" class="nav-link" data-page="academy"><i>📹</i> دورات مسجلة</a>
                <a href="#" class="nav-link"><i>⚡</i> دورات لايف</a>
                <a href="#" class="nav-link"><i>👤</i> جلسات فردية</a>
                <a href="creative-lab.html" class="nav-link" data-page="creative"><i>🎨</i> مختبر الإبداع AI</a>
            </nav>
        </div>

        <div class="sidebar-section">
            <div class="sidebar-label">المبيعات</div>
            <nav>
                <a href="orders.html" class="nav-link" data-page="orders"><i>🛒</i> الطلبات</a>
                <a href="customers.html" class="nav-link" data-page="customers"><i>👥</i> العملاء</a>
            </nav>
        </div>

        <div class="sidebar-section">
            <div class="sidebar-label">التسويق</div>
            <nav>
                <a href="coupons.html" class="nav-link" data-page="coupons"><i>🏷️</i> أكواد الخصم</a>
                <a href="#" class="nav-link"><i>🤝</i> المسوقون بالعمولة</a>
            </nav>
        </div>

        <div class="sidebar-section">
            <div class="sidebar-label">إعدادات الحساب</div>
            <nav>
                <a href="withdrawals.html" class="nav-link" data-page="withdrawals"><i>💰</i> إعدادات السحب</a>
                <a href="profile-settings.html" class="nav-link" data-page="profile"><i>👤</i> تعديل بياناتي</a>
            </nav>
        </div>

        <div style="margin-top: auto; padding: 20px 0;">
            <div id="sidebar-user-card" style="display: flex; align-items: center; gap: 10px; padding: 15px; background: #f8fafc; border-radius: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 10px; background: #8b5cf6; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800;">MR</div>
                <div style="overflow: hidden;">
                    <div id="sidebar-user-name" style="font-weight: 700; font-size: 0.85rem; white-space: nowrap; text-overflow: ellipsis; display: flex; align-items: center;">
                        جاري التحميل...
                        <span id="user-badge" class="badge-verified" style="display: none;">✓</span>
                    </div>
                    <div id="user-plan-label" style="font-size: 0.7rem; color: #94a3b8;">خطة بريميوم ✨</div>
                </div>
            </div>
        </div>
    `;

    document.addEventListener('DOMContentLoaded', () => {
        const sidebarEl = document.querySelector('.portal-sidebar');
        if (sidebarEl) {
            sidebarEl.innerHTML = sidebarHTML;
            
            // Mark active link
            const currentFile = window.location.pathname.split('/').pop().replace('.html', '');
            const activeLink = sidebarEl.querySelector(`[data-page="${currentFile}"]`) || 
                               sidebarEl.querySelector(`[href="${currentFile}.html"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });

})();
