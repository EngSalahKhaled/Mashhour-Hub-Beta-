const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');
const { sanitizeSitePayload } = require('../utils/contentSanitizer');

// ─── List of allowed site collections for security ───
const ALLOWED_COLLECTIONS = [
    'site_hero', 
    'site_services', 
    'site_portfolio', 
    'site_metrics', 
    'site_testimonials', 
    'site_team', 
    'site_announcements', 
    'site_settings', 
    'site_pages',
    'site_clients',
    'site_faqs',
    'site_process',
    'site_values',
    'site_partners'
];

// ─── GET /api/site-content/:collection ─────────────────────────────────────────
router.get('/:collection', asyncHandler(async (req, res) => {
    const col = req.params.collection.replace(/-/g, '_');
    if (!ALLOWED_COLLECTIONS.includes(col)) throw new AppError('Invalid collection', 400);
    
    const snapshot = await db.collection(col).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data });
}));

// ─── GET /api/site-content/:collection/:id ─────────────────────────────────────
router.get('/:collection/:id', asyncHandler(async (req, res) => {
    const col = req.params.collection.replace(/-/g, '_');
    if (!ALLOWED_COLLECTIONS.includes(col)) throw new AppError('Invalid collection', 400);
    
    const docSnap = await db.collection(col).doc(req.params.id).get();
    if (!docSnap.exists) throw new AppError('Document not found', 404);
    
    res.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
}));

// ─── POST /api/site-content/:collection ────────────────────────────────────────
router.post('/:collection', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const col = req.params.collection.replace(/-/g, '_');
    if (!ALLOWED_COLLECTIONS.includes(col)) throw new AppError('Invalid collection', 400);
    const sanitizedPayload = sanitizeSitePayload(col, req.body);

    const docData = {
        ...sanitizedPayload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(col).add(docData);
    await logActivity(db, {
        user: req.admin,
        action: 'site_content_created',
        details: { collection: col, documentId: docRef.id },
    });
    res.status(201).json({ success: true, id: docRef.id, data: { id: docRef.id, ...docData } });
}));

// ─── PUT /api/site-content/:collection/:id ─────────────────────────────────────
router.put('/:collection/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const col = req.params.collection.replace(/-/g, '_');
    if (!ALLOWED_COLLECTIONS.includes(col)) throw new AppError('Invalid collection', 400);
    const sanitizedPayload = sanitizeSitePayload(col, req.body);

    const updates = {
        ...sanitizedPayload,
        updatedAt: new Date().toISOString(),
    };

    await db.collection(col).doc(req.params.id).set(updates, { merge: true });
    await logActivity(db, {
        user: req.admin,
        action: 'site_content_updated',
        details: { collection: col, documentId: req.params.id, method: 'put' },
    });
    res.json({ success: true, message: 'Updated successfully.' });
}));

// ─── PATCH /api/site-content/:collection/:id ────────────────────────────────────
router.patch('/:collection/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const col = req.params.collection.replace(/-/g, '_');
    if (!ALLOWED_COLLECTIONS.includes(col)) throw new AppError('Invalid collection', 400);
    const sanitizedPayload = sanitizeSitePayload(col, req.body);

    const updates = {
        ...sanitizedPayload,
        updatedAt: new Date().toISOString(),
    };

    await db.collection(col).doc(req.params.id).update(updates);
    await logActivity(db, {
        user: req.admin,
        action: 'site_content_updated',
        details: { collection: col, documentId: req.params.id, method: 'patch' },
    });
    res.json({ success: true, message: 'Updated successfully.' });
}));

// ─── DELETE /api/site-content/:collection/:id ──────────────────────────────────
router.delete('/:collection/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const col = req.params.collection.replace(/-/g, '_');
    if (!ALLOWED_COLLECTIONS.includes(col)) throw new AppError('Invalid collection', 400);
    
    await db.collection(col).doc(req.params.id).delete();
    await logActivity(db, {
        user: req.admin,
        action: 'site_content_deleted',
        details: { collection: col, documentId: req.params.id },
    });
    res.json({ success: true, message: 'Deleted successfully.' });
}));

module.exports = router;
