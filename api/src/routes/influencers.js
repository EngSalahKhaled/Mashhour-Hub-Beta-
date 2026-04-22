const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const asyncHandler = require('../utils/asyncHandler');

const COLLECTION = 'influencers';

// ─── GET /api/influencers (Public) ─────────────────────────────────────────────
// Returns a list of influencers for the website directory
router.get('/', asyncHandler(async (req, res) => {
    // Only fetch influencers marked as 'approved' or 'public' (if we had that field)
    // For now, let's fetch those who have a profile image and social handles
    const snapshot = await db.collection(COLLECTION)
        .limit(20)
        .get();

    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter out items without a name or email to avoid trash data
    const filtered = list.filter(inf => inf.name && inf.email);

    res.json({ success: true, data: filtered });
}));

// ─── GET /api/influencers/:id (Public) ─────────────────────────────────────────
// Returns a single influencer profile
router.get('/:id', asyncHandler(async (req, res) => {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
        return res.status(404).json({ success: false, message: 'Influencer not found' });
    }
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
}));

module.exports = router;
