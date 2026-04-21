const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');

// ─── GET /api/settings (Public — get global settings) ──────────────────────────
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('site_settings').limit(1).get();
        if (snapshot.empty) {
            return res.json({ success: true, settings: {} });
        }
        const doc = snapshot.docs[0];
        res.json({ success: true, settings: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('[SETTINGS GET ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── GET /api/settings/pages/:pageId (Public — get page content) ────────────────
router.get('/pages/:pageId', async (req, res) => {
    try {
        const snapshot = await db.collection('site_pages')
            .where('pageId', '==', req.params.pageId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Page content not found.' });
        }

        const doc = snapshot.docs[0];
        res.json({ success: true, page: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('[PAGE CONTENT GET ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
