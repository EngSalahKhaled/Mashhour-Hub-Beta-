const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');

const COLLECTION = 'tools';

// ─── GET /api/tools (Public) ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { category, language } = req.query;
        let query = db.collection(COLLECTION);

        if (category) query = query.where('category', '==', category);
        if (language) query = query.where('language', '==', language);

        const snapshot = await query.get();
        const tools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json({ success: true, count: tools.length, data: tools });
    } catch (error) {
        console.error('[TOOLS GET ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── POST /api/tools (Admin) ──────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const data = {
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const docRef = await db.collection(COLLECTION).add(data);
        res.status(201).json({ success: true, id: docRef.id, message: 'Tool added.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── PUT /api/tools/:id (Admin) ───────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: new Date().toISOString() };
        await db.collection(COLLECTION).doc(req.params.id).update(updates);
        res.json({ success: true, message: 'Tool updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── DELETE /api/tools/:id (Admin) ────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).delete();
        res.json({ success: true, message: 'Tool deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
