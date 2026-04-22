/**
 * Mashhor Hub - Unified User Portal Logic
 * Handles session, profile, and dynamic dashboard data
 */

document.addEventListener('DOMContentLoaded', async () => {
    const portalUser = JSON.parse(localStorage.getItem('portalUser'));
    
    if (!portalUser) {
        window.location.href = '../login.html';
        return;
    }

    // Set UI basic info
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.innerText = portalUser.name;
    
    const userRoleEl = document.getElementById('user-role-label');
    if (userRoleEl) userRoleEl.innerText = portalUser.role === 'influencer' ? 'مؤثر' : 'عميل';

    // Handle Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('portalUser');
            window.location.href = '../login.html';
        });
    }

    // Load Stats/Data based on role
    loadGlobalStats(portalUser);
    if (portalUser.role === 'influencer') {
        loadInfluencerDashboard();
    } else {
        loadClientDashboard();
    }
});

async function loadGlobalStats(user) {
    // Fetch Balance and other shared stats
    try {
        const token = localStorage.getItem('token'); // Use stored token
        const res = await fetch(`${window.location.origin.replace('3000', '5000')}/api/portal/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            const balanceEl = document.querySelector('.balance-card h1');
            if (balanceEl) balanceEl.innerHTML = `${data.profile.balance || '0.00'} <span style="font-size: 1.2rem;">ج.م</span>`;
        }
    } catch (e) { console.error('Failed to load portal stats', e); }
}

async function loadInfluencerDashboard() {
    console.log('Loading Influencer View...');
}

async function loadClientDashboard() {
    console.log('Loading Client View...');
}
