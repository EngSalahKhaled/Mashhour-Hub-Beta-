const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'pricing_packages';

// ─── GET /api/pricing ─────────────────────────────────────────────────────────
// Public: Fetch all pricing packages (filterable by language)
router.get('/', asyncHandler(async (req, res) => {
    const { language } = req.query;
    let query = db.collection(COLLECTION).orderBy('order', 'asc');

    if (language) {
        query = query.where('language', '==', language);
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, data: items });
}));

// ─── POST /api/pricing ────────────────────────────────────────────────────────
// Admin: Create a new package
router.post('/', auth, authorizeRole('superadmin', 'admin'), [
    body('title').notEmpty().withMessage('Title is required.'),
    body('price').notEmpty().withMessage('Price is required.'),
    body('features').isArray().withMessage('Features must be an array.'),
    body('language').isIn(['en', 'ar']).withMessage('Language must be en or ar.')
], validate, asyncHandler(async (req, res) => {
    const docRef = await db.collection(COLLECTION).add({
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    res.json({ success: true, id: docRef.id });
}));

// ─── PUT /api/pricing/:id ─────────────────────────────────────────────────────
// Admin: Update a package
router.put('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).update({
        ...req.body,
        updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
}));

// ─── DELETE /api/pricing/:id ──────────────────────────────────────────────────
// Admin: Delete a package
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true });
}));

module.exports = router;
