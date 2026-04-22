const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ─── GET /api/settings (Public — get global settings) ──────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const docRef = db.collection('site_settings').doc('global');
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        return res.json({ success: true, settings: {} });
    }
    
    res.json({ success: true, settings: { id: docSnap.id, ...docSnap.data() } });
}));

// ─── PUT /api/settings/:id (Admin — update global settings) ───────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    // Check if doc exists
    const docRef = db.collection('site_settings').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
        // Create if it doesn't exist
        await docRef.set({ ...updates, createdAt: new Date().toISOString() });
    } else {
        await docRef.update(updates);
    }
    
    res.json({ success: true, message: 'Settings updated successfully.' });
}));

// ─── GET /api/settings/pages/:pageId (Public — get page content) ────────────────
router.get('/pages/:pageId', asyncHandler(async (req, res) => {
    const snapshot = await db.collection('site_pages')
        .where('pageId', '==', req.params.pageId)
        .limit(1)
        .get();

    if (snapshot.empty) {
        throw new AppError('Page content not found.', 404);
    }

    const doc = snapshot.docs[0];
    res.json({ success: true, page: { id: doc.id, ...doc.data() } });
}));

// ─── PUT /api/settings/pages/:pageId (Admin — update page content) ─────────────
router.put('/pages/:pageId', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    const snapshot = await db.collection('site_pages').where('pageId', '==', pageId).limit(1).get();
    
    if (snapshot.empty) {
        // Create it
        await db.collection('site_pages').add({
            pageId,
            ...updates,
            createdAt: new Date().toISOString()
        });
    } else {
        // Update it
        await snapshot.docs[0].ref.update(updates);
    }
    
    res.json({ success: true, message: 'Page updated successfully.' });
}));

// ─── POST /api/settings/maintenance (Admin — toggle maintenance mode) ──────────
router.post('/maintenance', auth, authorizeRole('superadmin'), asyncHandler(async (req, res) => {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
        throw new AppError('enabled must be a boolean', 400);
    }
    
    // We assume the global settings document has id 'global'
    const docRef = db.collection('site_settings').doc('global');
    await docRef.set({ maintenanceMode: enabled, updatedAt: new Date().toISOString() }, { merge: true });
    
    res.json({ success: true, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}.` });
}));

// ─── POST /api/settings/clear-cache (Admin — bump cache version) ───────────────
router.post('/clear-cache', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    // Generate a new unique cache string (timestamp based)
    const newCacheVersion = Date.now().toString();
    
    const docRef = db.collection('site_settings').doc('global');
    await docRef.set({ cacheVersion: newCacheVersion, updatedAt: new Date().toISOString() }, { merge: true });
    
    res.json({ 
        success: true, 
        message: 'Cache successfully cleared.', 
        cacheVersion: newCacheVersion 
    });
}));

module.exports = router;
