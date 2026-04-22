const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

const COLLECTION = 'notifications';

// ─── GET /api/notifications ──────────────────────────────────────────────────
// Fetch recent notifications for the authenticated admin.
router.get('/', authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('[NOTIFICATIONS ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
});

// ─── POST /api/notifications/read/:id ────────────────────────────────────────
// Mark a notification as read.
router.post('/read/:id', authMiddleware, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).update({ read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
    }
});

// ─── POST /api/notifications/clear-all ────────────────────────────────────────
// Mark all notifications as read.
router.post('/clear-all', authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION).where('read', '==', false).get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.update(doc.ref, { read: true }));
        await batch.commit();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear notifications.' });
    }
});

module.exports = router;
