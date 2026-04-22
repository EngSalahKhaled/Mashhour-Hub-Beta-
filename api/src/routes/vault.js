const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');

const COLLECTION = 'vault';

// ─── GET /api/vault (Public) ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { category, language } = req.query;
        let query = db.collection(COLLECTION);

        if (category) query = query.where('category', '==', category);
        if (language) query = query.where('language', '==', language);

        const snapshot = await query.get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json({ success: true, count: items.length, data: items });
    } catch (error) {
        console.error('[VAULT GET ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── POST /api/vault (Admin) ──────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const data = {
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const docRef = await db.collection(COLLECTION).add(data);
        res.status(201).json({ success: true, id: docRef.id, message: 'Vault item added.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── PUT /api/vault/:id (Admin) ───────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: new Date().toISOString() };
        await db.collection(COLLECTION).doc(req.params.id).update(updates);
        res.json({ success: true, message: 'Vault item updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── DELETE /api/vault/:id (Admin) ────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).delete();
        res.json({ success: true, message: 'Vault item deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
