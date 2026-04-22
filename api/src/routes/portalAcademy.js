const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'products';

// ─── GET /api/portal/academy/products ──────────────────────────────────────────
router.get('/products', authMiddleware, asyncHandler(async (req, res) => {
    const { type } = req.query; // 'recorded', 'live', 'session', 'digital'
    const { uid } = req.admin;
    
    let query = db.collection(COLLECTION).where('owner_id', '==', uid);
    if (type) query = query.where('type', '==', type);

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({ success: true, products });
}));

// ─── POST /api/portal/academy/products ─────────────────────────────────────────
router.post('/products', authMiddleware, asyncHandler(async (req, res) => {
    const { title, type, price, description, coverUrl } = req.body;
    const { uid } = req.admin;

    const productData = {
        title,
        type, // recorded-course, live-session, private-meeting, digital-asset
        price,
        description,
        coverUrl,
        owner_id: uid,
        status: 'draft',
        rating: 0,
        salesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION).add(productData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Product created successfully.' });
}));

module.exports = router;
