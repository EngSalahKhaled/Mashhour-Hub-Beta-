const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// ─── GET /api/portal/notifications ──────────────────────────────────────────
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const { uid } = req.admin;
    const snapshot = await db.collection('notifications')
        .where('user_id', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
        
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, notifications });
}));

// ─── PUT /api/portal/notifications/:id/read ─────────────────────────────────
router.put('/:id/read', authMiddleware, asyncHandler(async (req, res) => {
    await db.collection('notifications').doc(req.params.id).update({ read: true });
    res.json({ success: true });
}));

module.exports = router;
