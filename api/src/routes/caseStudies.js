const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');

const COLLECTION = 'case-studies';

// ─── GET /api/case-studies (Public) ───────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION).orderBy('title', 'asc').get();
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: list });
}));

// ─── POST /api/case-studies (Admin) ──────────────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const data = {
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION).add(data);
    res.status(201).json({ success: true, id: docRef.id, message: 'Case study created.' });
}));

// ─── PUT /api/case-studies/:id (Admin) ─────────────────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTION).doc(req.params.id).update(updates);
    res.json({ success: true, message: 'Case study updated.' });
}));

// ─── DELETE /api/case-studies/:id (Admin) ──────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true, message: 'Case study deleted.' });
}));

module.exports = router;
