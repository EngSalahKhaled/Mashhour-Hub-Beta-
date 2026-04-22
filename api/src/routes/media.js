const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'media_library';

// ─── GET /api/media (Admin — list all media) ──────────────────────────────────
router.get('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();

    const media = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: media.length, data: media });
}));

// ─── POST /api/media (Admin — upload base64 or URL) ───────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const { name, url, base64, type, size } = req.body;

    if (!url && !base64) {
        throw new AppError('Either a url or base64 data must be provided.', 400);
    }

    if (!name) {
        throw new AppError('File name is required.', 400);
    }

    // Note: Storing Base64 in Firestore can hit the 1MB limit. 
    // This is a temporary solution as requested until Firebase Storage is enabled.
    if (base64 && base64.length > 1000000) { // roughly 1MB string limit
        throw new AppError('Base64 string is too large. Max size is roughly 750KB.', 413);
    }

    const fileData = {
        name,
        type: type || 'unknown',
        size: size || 0,
        url: url || null,
        base64: base64 || null, // Will be null if it's just an external URL link
        uploadedBy: req.admin.uid,
        createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(fileData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Media uploaded successfully.', file: { id: docRef.id, ...fileData } });
}));

// ─── DELETE /api/media/:id (Admin — delete media) ─────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        throw new AppError('Media not found.', 404);
    }

    await docRef.delete();
    res.json({ success: true, message: 'Media deleted successfully.' });
}));

module.exports = router;
