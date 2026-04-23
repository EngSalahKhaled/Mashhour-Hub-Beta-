const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'blog_posts';

// ─── Validation Rules ────────────────────────────────────────────────────────
const postValidation = [
    body('title_en').notEmpty().withMessage('title_en is required.'),
    body('slug').notEmpty().withMessage('slug is required.'),
    body('title_ar').optional(),
    body('content_en').optional(),
    body('content_ar').optional(),
    body('excerpt_en').optional(),
    body('excerpt_ar').optional(),
    body('thumbnail').optional(),
    body('category').optional(),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status.')
];

// ─── GET /api/blog/admin/all (Admin — list ALL posts including drafts) ────────
router.get('/admin/all', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();

    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: posts.length, posts });
}));

// ─── GET /api/blog (Public — list all published posts) ───────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .get();

    const posts = snapshot.docs.map(doc => {
        const { content_en, content_ar, ...summary } = doc.data(); // omit body fields in list
        return { id: doc.id, ...summary };
    });

    res.json({ success: true, count: posts.length, posts });
}));

// ─── GET /api/blog/:slug (Public — get single post by slug) ──────────────────
router.get('/:slug', asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .where('slug', '==', req.params.slug)
        .where('status', '==', 'published')
        .limit(1)
        .get();

    if (snapshot.empty) {
        throw new AppError('Post not found.', 404);
    }

    const doc = snapshot.docs[0];
    res.json({ success: true, post: { id: doc.id, ...doc.data() } });
}));

// ─── POST /api/blog (Admin — create post) ────────────────────────────────────
// Allowed for superadmin, admin, and editor
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), postValidation, validate, asyncHandler(async (req, res) => {
    const {
        title_en, title_ar, slug, content_en, content_ar,
        excerpt_en, excerpt_ar, thumbnail, category, status,
    } = req.body;

    const now = new Date().toISOString();
    const postData = {
        title_en, title_ar, slug,
        content_en:  content_en  || '',
        content_ar:  content_ar  || '',
        excerpt_en:  excerpt_en  || '',
        excerpt_ar:  excerpt_ar  || '',
        thumbnail:   thumbnail   || null,
        category:    category    || 'general',
        status:      status      || 'draft',
        authorId:    req.admin.uid,
        publishedAt: status === 'published' ? now : null,
        createdAt:   now,
        updatedAt:   now,
    };

    const docRef = await db.collection(COLLECTION).add(postData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Post created successfully.' });
}));

// ─── PUT /api/blog/:id (Admin — update post) ─────────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), postValidation, validate, asyncHandler(async (req, res) => {
    const {
        title_en, title_ar, slug, content_en, content_ar,
        excerpt_en, excerpt_ar, thumbnail, category, status,
    } = req.body;

    const { id } = req.params;

    const docRef  = db.collection(COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        throw new AppError('Post not found.', 404);
    }

    const current = docSnap.data();
    const updates = {
        title_en, title_ar, slug,
        content_en, content_ar,
        excerpt_en, excerpt_ar,
        thumbnail, category, status,
        updatedAt: new Date().toISOString(),
        // Only set publishedAt the first time a post is published; never overwrite it
        publishedAt: status === 'published'
            ? (current.publishedAt || new Date().toISOString())
            : current.publishedAt,
    };

    await docRef.update(updates);
    res.json({ success: true, message: 'Post updated successfully.' });
}));

// ─── DELETE /api/blog/:id (Admin) ────────────────────────────────────────────
// Only superadmins and admins can delete posts
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true, message: 'Post deleted.' });
}));

module.exports = router;
