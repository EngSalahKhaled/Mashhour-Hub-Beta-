const express = require('express');
const router  = express.Router();
const { db, admin }  = require('../config/firebase');
const authMiddleware = require('../middleware/auth'); // Should check for isAdmin flag
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Middleware to ensure user is Admin or Super Admin
const adminOnly = (req, res, next) => {
    if (req.admin && ['admin', 'superadmin'].includes(req.admin.role)) {
        next();
    } else {
        return next(new AppError('Unauthorized: Admin access only.', 403));
    }
};

// ─── GET /api/super-admin/stats ──────────────────────────────────────────────
router.get('/stats', authMiddleware, adminOnly, asyncHandler(async (req, res) => {
    // 1. Total Sales & Commission
    const salesSnapshot = await db.collection('orders').where('status', '==', 'completed').get();
    let totalVolume = 0;
    let totalCommission = 0;
    
    salesSnapshot.forEach(doc => {
        const amt = doc.data().amount || 0;
        totalVolume += amt;
        totalCommission += amt * 0.15; // Assuming 15% platform fee
    });

    // 2. User Counts
    const influencersCount = (await db.collection('portal_users').where('userType', '==', 'influencer').count().get()).data().count;
    const companiesCount = (await db.collection('portal_users').where('userType', '==', 'company').count().get()).data().count;

    // 3. Pending Withdrawals
    const pendingWithdrawals = (await db.collection('withdrawals').where('status', '==', 'pending').count().get()).data().count;

    res.json({
        success: true,
        stats: {
            totalVolume,
            totalCommission,
            influencersCount,
            companiesCount,
            pendingWithdrawals,
            activeUsers: influencersCount + companiesCount
        }
    });
}));

// ─── GET /api/super-admin/withdrawals ─────────────────────────────────────────
router.get('/withdrawals', authMiddleware, adminOnly, asyncHandler(async (req, res) => {
    const snapshot = await db.collection('withdrawals').orderBy('createdAt', 'desc').get();
    const withdrawals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, withdrawals });
}));

// ─── PATCH /api/super-admin/withdrawals/:id ───────────────────────────────────
router.patch('/withdrawals/:id', authMiddleware, adminOnly, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected'
    
    const ref = db.collection('withdrawals').doc(id);
    await ref.update({ status, processedAt: new Date().toISOString() });
    
    res.json({ success: true, message: `Withdrawal ${status}.` });
}));

// ─── PATCH /api/super-admin/users/:id/verify ──────────────────────────────────
router.patch('/users/:id/verify', authMiddleware, adminOnly, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isVerified, verificationType } = req.body;
    
    await db.collection('portal_users').doc(id).update({
        isVerified,
        verificationType,
        verifiedAt: isVerified ? new Date().toISOString() : null
    });
    
    res.json({ success: true, message: 'User verification updated.' });
}));

module.exports = router;
