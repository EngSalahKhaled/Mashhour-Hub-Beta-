const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const asyncHandler = require('../utils/asyncHandler');

const COLLECTION = 'services';

// ─── GET /api/services (Public) ───────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION).get();
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: list });
}));

module.exports = router;
