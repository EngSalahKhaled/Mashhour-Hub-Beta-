const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// ─── GET /api/portal/apps ─────────────────────────────────────────────────────
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const userDoc = await db.collection('portal_users').doc(req.admin.uid).get();
    const apps = userDoc.data().integrations || {};
    res.json({ success: true, apps });
}));

// ─── POST /api/portal/apps/:appId ─────────────────────────────────────────────
router.post('/:appId', authMiddleware, asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const config = req.body; // e.g., { pixelId: '...' }

    await db.collection('portal_users').doc(req.admin.uid).update({
        [`integrations.${appId}`]: {
            ...config,
            connected: true,
            updatedAt: new Date().toISOString()
        }
    });

    res.json({ success: true, message: `${appId} connected successfully.` });
}));

// ─── DELETE /api/portal/apps/:appId ──────────────────────────────────────────
router.delete('/:appId', authMiddleware, asyncHandler(async (req, res) => {
    const { appId } = req.params;

    await db.collection('portal_users').doc(req.admin.uid).update({
        [`integrations.${appId}.connected`]: false
    });

    res.json({ success: true, message: `${appId} disconnected.` });
}));

module.exports = router;
