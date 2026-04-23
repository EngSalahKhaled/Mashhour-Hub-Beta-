const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'portfolio_items';

// ─── Validation Rules ────────────────────────────────────────────────────────
const portfolioValidation = [
    body('title_en').notEmpty().withMessage('title_en is required.'),
    body('slug').notEmpty().withMessage('slug is required.'),
    body('title_ar').optional(),
    body('client_name').optional(),
    body('category').optional(),
    body('description_en').optional(),
    body('description_ar').optional(),
    body('thumbnail').optional(),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status.')
];

// ─── GET /api/portfolio/admin/all (Admin — list ALL items including drafts) ──
router.get('/admin/all', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: items.length, data: items });
}));

// ─── GET /api/portfolio (Public — list all published items) ──────────────────
router.get('/', asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .get();

    const items = snapshot.docs.map(doc => {
        // Omit heavy fields for the list view
        const { description_en, description_ar, gallery, results, ...summary } = doc.data();
        return { id: doc.id, ...summary };
    });

    res.json({ success: true, count: items.length, portfolio: items });
}));

// ─── GET /api/portfolio/:slug (Public — get single item) ─────────────────────
router.get('/:slug', asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .where('slug', '==', req.params.slug)
        .where('status', '==', 'published')
        .limit(1)
        .get();

    if (snapshot.empty) {
        throw new AppError('Portfolio item not found.', 404);
    }

    const doc = snapshot.docs[0];
    res.json({ success: true, item: { id: doc.id, ...doc.data() } });
}));

// ─── POST /api/portfolio (Admin — create item) ────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), portfolioValidation, validate, asyncHandler(async (req, res) => {
    const {
        title_en, title_ar, slug, client_name, category,
        description_en, description_ar, thumbnail,
        gallery, results, status,
    } = req.body;

    const now = new Date().toISOString();
    const itemData = {
        title_en, title_ar, slug,
        client_name:     client_name     || null,
        category:        category        || 'general',
        description_en:  description_en  || '',
        description_ar:  description_ar  || '',
        thumbnail:       thumbnail       || null,
        gallery:         Array.isArray(gallery)  ? gallery  : [],
        results:         typeof results === 'object' ? results : {},
        status:          status          || 'draft',
        authorId:        req.admin.uid,
        createdAt:       now,
        updatedAt:       now,
    };

    const docRef = await db.collection(COLLECTION).add(itemData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Portfolio item created.' });
}));

// ─── PUT /api/portfolio/:id (Admin — update item) ────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), portfolioValidation, validate, asyncHandler(async (req, res) => {
    const {
        title_en, title_ar, slug, client_name, category,
        description_en, description_ar, thumbnail,
        gallery, results, status,
    } = req.body;

    const { id } = req.params;

    const docRef  = db.collection(COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        throw new AppError('Portfolio item not found.', 404);
    }

    const updates = {
        title_en, title_ar, slug,
        client_name, category,
        description_en, description_ar,
        thumbnail,
        gallery:   Array.isArray(gallery)  ? gallery  : [],
        results:   typeof results === 'object' ? results : {},
        status,
        updatedAt: new Date().toISOString(),
    };

    await docRef.update(updates);
    res.json({ success: true, message: 'Portfolio item updated.' });
}));

// ─── DELETE /api/portfolio/:id (Admin) ───────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true, message: 'Portfolio item deleted.' });
}));

module.exports = router;
