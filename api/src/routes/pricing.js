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

/**
 * GET /api/pricing
 * Public: Fetch all pricing packages (filterable by language)
 */
router.get('/', asyncHandler(async (req, res) => {
    if (!db) {
        console.error('❌ Firestore DB not initialized');
        return res.status(500).json({ 
            success: false, 
            message: 'Database connection is not available. Please check server logs.' 
        });
    }

    const { language } = req.query;
    
    try {
        let query = db.collection(COLLECTION);

        if (language) {
            query = query.where('language', '==', language);
        }

        // Try to order by 'order', but if it fails (e.g. missing index), 
        // fall back to no ordering to prevent the whole request from failing.
        let snapshot;
        try {
            snapshot = await query.orderBy('order', 'asc').get();
        } catch (orderErr) {
            console.warn('⚠️ Order by "order" failed, likely missing index. Falling back to unordered fetch.', orderErr.message);
            snapshot = await query.get();
        }

        const items = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            _id: doc.id, // Support both id and _id
            ...doc.data() 
        }));

        res.json({ success: true, data: items });
    } catch (err) {
        console.error('❌ Error fetching pricing packages:', err);
        throw new AppError('Failed to retrieve pricing packages: ' + err.message, 500);
    }
}));

/**
 * POST /api/pricing
 * Admin: Create a new package
 */
router.post('/', auth, authorizeRole('superadmin', 'admin'), [
    body('title').notEmpty().withMessage('Title is required.'),
    body('price').notEmpty().withMessage('Price is required.'),
    body('features').isArray().withMessage('Features must be an array.'),
    body('language').isIn(['en', 'ar']).withMessage('Language must be en or ar.')
], validate, asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection unavailable', 500);

    const docRef = await db.collection(COLLECTION).add({
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    res.json({ success: true, id: docRef.id, _id: docRef.id });
}));

/**
 * PUT /api/pricing/:id
 */
router.put('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection unavailable', 500);

    await db.collection(COLLECTION).doc(req.params.id).update({
        ...req.body,
        updatedAt: new Date().toISOString()
    });

    res.json({ success: true });
}));

/**
 * DELETE /api/pricing/:id
 */
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection unavailable', 500);

    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true });
}));

module.exports = router;
