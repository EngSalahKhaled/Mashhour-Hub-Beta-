const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { body, validationResult } = require('express-validator');

const COLLECTION = 'pricing_packages';

// ─── Protected Middleware ─────────────────────────────────────────────────────
const { verifyAdmin } = require('../routes/auth');

/**
 * GET /api/pricing
 * Public: Fetch all pricing packages (filterable by language)
 */
router.get('/', async (req, res) => {
    try {
        const { language } = req.query;
        let query = db.collection(COLLECTION).orderBy('order', 'asc');

        if (language) {
            query = query.where('language', '==', language);
        }

        const snapshot = await query.get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/pricing
 * Admin: Create a new package
 */
router.post('/', verifyAdmin, [
    body('title').notEmpty(),
    body('price').notEmpty(),
    body('features').isArray(),
    body('language').isIn(['en', 'ar'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
        const docRef = await db.collection(COLLECTION).add({
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        res.json({ success: true, id: docRef.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /api/pricing/:id
 * Admin: Update a package
 */
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).update({
            ...req.body,
            updatedAt: new Date().toISOString()
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/pricing/:id
 * Admin: Delete a package
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).delete();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
