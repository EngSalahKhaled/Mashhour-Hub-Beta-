const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');

const COLLECTION = 'portfolio_items';

// ─── GET /api/portfolio (Public — list all published items) ──────────────────
router.get('/', async (req, res) => {
    try {
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
    } catch (error) {
        console.error('[PORTFOLIO GET ALL ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── GET /api/portfolio/:slug (Public — get single item) ─────────────────────
router.get('/:slug', async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('slug', '==', req.params.slug)
            .where('status', '==', 'published')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Portfolio item not found.' });
        }

        const doc = snapshot.docs[0];
        res.json({ success: true, item: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('[PORTFOLIO GET ONE ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── POST /api/portfolio (Admin — create item) ────────────────────────────────
router.post('/', auth, async (req, res) => {
    const {
        title_en, title_ar, slug, client_name, category,
        description_en, description_ar, thumbnail,
        gallery, results, status,
    } = req.body;

    if (!title_en || !slug) {
        return res.status(400).json({ success: false, message: 'title_en and slug are required.' });
    }

    try {
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
    } catch (error) {
        console.error('[PORTFOLIO POST ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error. Check for duplicate slug.' });
    }
});

// ─── PUT /api/portfolio/:id (Admin — update item) ────────────────────────────
router.put('/:id', auth, async (req, res) => {
    const {
        title_en, title_ar, slug, client_name, category,
        description_en, description_ar, thumbnail,
        gallery, results, status,
    } = req.body;

    const { id } = req.params;

    try {
        const docRef  = db.collection(COLLECTION).doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ success: false, message: 'Portfolio item not found.' });
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
    } catch (error) {
        console.error('[PORTFOLIO PUT ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── DELETE /api/portfolio/:id (Admin) ───────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).delete();
        res.json({ success: true, message: 'Portfolio item deleted.' });
    } catch (error) {
        console.error('[PORTFOLIO DELETE ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
