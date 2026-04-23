const express = require('express');
const router  = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'activity_logs';

// ─── GET /api/logs ────────────────────────────────────────────────────────────
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database not initialized', 500);
    
    const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();
        
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: logs.length, data: logs });
}));

// ─── GET /api/logs/portal ───────────────────────────────────────────────────
router.get('/portal', authMiddleware, asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database not initialized', 500);
    
    const snapshot = await db.collection('portal_logs')
        .orderBy('timestamp', 'desc')
        .limit(200)
        .get();
        
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: logs.length, data: logs });
}));

// Helper to log activity (internal use)
router.post('/add', authMiddleware, asyncHandler(async (req, res) => {
    const { action, details } = req.body;
    await db.collection(COLLECTION).add({
        action,
        details,
        user: req.admin.email,
        createdAt: new Date().toISOString()
    });
    res.json({ success: true });
}));

module.exports = router;
