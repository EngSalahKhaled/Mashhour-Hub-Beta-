const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const asyncHandler = require('../utils/asyncHandler');
const { auth, authorizeRole } = require('../middleware/auth');

const COLLECTION = 'influencers';

// ─── GET /api/influencers (Public with Pagination) ──────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 9;
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category;

    let query = db.collection(COLLECTION);

    if (category && category !== 'all') {
        query = query.where('category', '==', category.toLowerCase());
    }

    const snapshot = await query
        .limit(limit * page) 
        .get();

    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filtered = list.filter(inf => inf.name);

    res.json({ 
        success: true, 
        data: filtered,
        hasMore: filtered.length >= (limit * page)
    });
}));

// ─── GET /api/influencers/admin/all (Admin) ───────────────────────────────────
router.get('/admin/all', auth, authorizeRole(['admin', 'editor']), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION).get();
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: list });
}));

// ─── GET /api/influencers/:id (Public) ─────────────────────────────────────────
router.get('/:id', asyncHandler(async (req, res) => {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
        return res.status(404).json({ success: false, message: 'Influencer not found' });
    }
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
}));

// ─── POST /api/influencers (Admin) ─────────────────────────────────────────────
router.post('/', auth, authorizeRole(['admin', 'editor']), asyncHandler(async (req, res) => {
    const docRef = await db.collection(COLLECTION).add({
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    res.json({ success: true, id: docRef.id });
}));

// ─── PUT /api/influencers/:id (Admin) ──────────────────────────────────────────
router.put('/:id', auth, authorizeRole(['admin', 'editor']), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).update({
        ...req.body,
        updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
}));

// ─── DELETE /api/influencers/:id (Admin) ───────────────────────────────────────
router.delete('/:id', auth, authorizeRole(['admin', 'editor']), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true });
}));

module.exports = router;
