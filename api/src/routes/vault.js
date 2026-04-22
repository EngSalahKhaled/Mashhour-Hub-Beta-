const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'vault';

// ─── GET /api/vault (Public) ──────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const { category, language } = req.query;
    let query = db.collection(COLLECTION);

    if (category) query = query.where('category', '==', category);
    if (language) query = query.where('language', '==', language);

    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, count: items.length, data: items });
}));

// ─── POST /api/vault (Admin) ──────────────────────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const data = {
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION).add(data);
    res.status(201).json({ success: true, id: docRef.id, message: 'Vault item added.' });
}));

// ─── PUT /api/vault/:id (Admin) ───────────────────────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTION).doc(req.params.id).update(updates);
    res.json({ success: true, message: 'Vault item updated.' });
}));

// ─── DELETE /api/vault/:id (Admin) ────────────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true, message: 'Vault item deleted.' });
}));

module.exports = router;
