const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'prompts';

// ─── GET /api/prompts (Public — list all or filtered) ────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const { category, language } = req.query;
    let query = db.collection(COLLECTION);

    if (category) query = query.where('category', '==', category);
    if (language) query = query.where('language', '==', language);

    const snapshot = await query.get();
    const prompts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, count: prompts.length, data: prompts });
}));

// ─── POST /api/prompts (Admin) ────────────────────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const data = {
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION).add(data);
    res.status(201).json({ success: true, id: docRef.id, message: 'Prompt added.' });
}));

// ─── PUT /api/prompts/:id (Admin) ─────────────────────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTION).doc(req.params.id).update(updates);
    res.json({ success: true, message: 'Prompt updated.' });
}));

// ─── DELETE /api/prompts/:id (Admin) ──────────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true, message: 'Prompt deleted.' });
}));

module.exports = router;
