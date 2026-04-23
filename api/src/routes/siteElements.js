const express  = require('express');
const router   = express.Router();
const { db }   = require('../config/firebase');
const { body } = require('express-validator');
const auth          = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const validate      = require('../middleware/validate');
const asyncHandler  = require('../utils/asyncHandler');
const AppError      = require('../utils/AppError');

const COLLECTION = 'site_elements';

// ─── Validation Rules ─────────────────────────────────────────────────────────
const elementValidation = [
    body('elementId')
        .trim().notEmpty().withMessage('elementId is required.')
        .matches(/^[a-z0-9-]+$/).withMessage('elementId must be lowercase letters, numbers, and hyphens only (e.g. hero-title).'),
    body('type')
        .isIn(['text', 'textarea', 'image']).withMessage('type must be text, textarea, or image.'),
    body('content')
        .notEmpty().withMessage('content is required.'),
];

/**
 * GET /api/site-elements
 * Public: Fetch ALL site elements (optionally filter by ?type=text|textarea|image)
 */
router.get('/', asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection unavailable', 500);

    const { type } = req.query;
    let query = db.collection(COLLECTION);
    if (type) query = query.where('type', '==', type);

    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, count: data.length, data });
}));

/**
 * GET /api/site-elements/fetch-html
 * Admin: Proxy to fetch HTML of the live website to bypass CORS for the scanner.
 */
router.get('/fetch-html', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    const { url } = req.query;
    if (!url) throw new AppError('URL is required', 400);

    let targetUrl;
    try {
        targetUrl = new URL(url);
    } catch {
        throw new AppError('Invalid URL.', 400);
    }

    const allowedHosts = new Set([
        'mashhor-hub.com',
        'www.mashhor-hub.com',
        'localhost',
        '127.0.0.1',
    ]);

    if (!allowedHosts.has(targetUrl.hostname)) {
        throw new AppError('Only approved site hosts can be fetched.', 403);
    }
    
    try {
        const response = await fetch(targetUrl.toString());
        const html = await response.text();
        res.send(html);
    } catch (err) {
        throw new AppError('Failed to fetch URL: ' + err.message, 500);
    }
}));

/**
 * GET /api/site-elements/by-element-id/:elementId
 * Public: Fetch a SINGLE element by its unique elementId string (e.g. 'hero-title').
 * This is the endpoint the public frontend will call.
 */
router.get('/by-element-id/:elementId', asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection unavailable', 500);

    const { elementId } = req.params;
    const snapshot = await db.collection(COLLECTION)
        .where('elementId', '==', elementId)
        .limit(1)
        .get();

    if (snapshot.empty) {
        throw new AppError(`No element found with elementId: "${elementId}"`, 404);
    }

    const doc = snapshot.docs[0];
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
}));

/**
 * GET /api/site-elements/:id
 * Admin: Fetch a single element by Firestore document ID.
 */
router.get('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection unavailable', 500);

    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) throw new AppError('Element not found.', 404);

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
}));

/**
 * POST /api/site-elements
 * Admin: Create a new website element.
 * Body: { elementId, type, content, description? }
 */
router.post('/', auth, authorizeRole('superadmin', 'admin'), elementValidation, validate,
    asyncHandler(async (req, res) => {
        if (!db) throw new AppError('Database connection unavailable', 500);

        const { elementId, type, content, description = '', selector = '' } = req.body;

        // Enforce uniqueness of elementId
        const existing = await db.collection(COLLECTION)
            .where('elementId', '==', elementId).limit(1).get();
        if (!existing.empty) {
            throw new AppError(`An element with elementId "${elementId}" already exists.`, 409);
        }

        const payload = {
            elementId,
            type,
            content,
            description,
            selector,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await db.collection(COLLECTION).add(payload);
        res.status(201).json({ success: true, id: docRef.id, data: { id: docRef.id, ...payload } });
    })
);

/**
 * PATCH /api/site-elements/:id
 * Admin: Update an existing element (partial update). elementId cannot be changed.
 */
router.patch('/:id', auth, authorizeRole('superadmin', 'admin'),
    asyncHandler(async (req, res) => {
        if (!db) throw new AppError('Database connection unavailable', 500);

        const docRef = db.collection(COLLECTION).doc(req.params.id);
        const doc    = await docRef.get();
        if (!doc.exists) throw new AppError('Element not found.', 404);

        // Disallow changing elementId (it's used as a stable reference key)
        const { elementId, ...allowedUpdates } = req.body;

        const updates = {
            ...allowedUpdates,
            updatedAt: new Date().toISOString(),
        };

        await docRef.update(updates);
        res.json({ success: true, data: { id: doc.id, ...doc.data(), ...updates } });
    })
);

/**
 * DELETE /api/site-elements/:id
 * Admin: Permanently delete an element.
 */
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'),
    asyncHandler(async (req, res) => {
        if (!db) throw new AppError('Database connection unavailable', 500);

        const doc = await db.collection(COLLECTION).doc(req.params.id).get();
        if (!doc.exists) throw new AppError('Element not found.', 404);

        await db.collection(COLLECTION).doc(req.params.id).delete();
        res.json({ success: true, message: `Element "${doc.data().elementId}" deleted.` });
    })
);

module.exports = router;
