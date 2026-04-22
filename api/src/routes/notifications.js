const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'notifications';

// ─── GET /api/notifications ──────────────────────────────────────────────────
// Fetch recent notifications for the authenticated admin.
router.get('/', auth, asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: notifications });
}));

// ─── POST /api/notifications/read/:id ────────────────────────────────────────
// Mark a notification as read.
router.post('/read/:id', auth, asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).update({ read: true });
    res.json({ success: true });
}));

// ─── POST /api/notifications/clear-all ────────────────────────────────────────
// Mark all notifications as read.
router.post('/clear-all', auth, asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION).where('read', '==', false).get();
    
    if (snapshot.empty) {
        return res.json({ success: true });
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.update(doc.ref, { read: true }));
    await batch.commit();
    
    res.json({ success: true });
}));

module.exports = router;
