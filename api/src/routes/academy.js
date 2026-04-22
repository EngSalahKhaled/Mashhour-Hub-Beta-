const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'academy_courses';

// ─── Validation Rules ────────────────────────────────────────────────────────
const courseValidation = [
    body('title_en').notEmpty().withMessage('title_en is required.'),
    body('slug').notEmpty().withMessage('slug is required.'),
    body('title_ar').optional(),
    body('excerpt_en').optional(),
    body('excerpt_ar').optional(),
    body('content_en').optional(),
    body('content_ar').optional(),
    body('thumbnail').optional(),
    body('video_url').optional(),
    body('price').optional().isNumeric().withMessage('Price must be a number.'),
    body('instructor').optional(),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status.')
];

// ─── GET /api/academy (Public — list all published courses) ───────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .get();

    const courses = snapshot.docs.map(doc => {
        const data = doc.data();
        // Don't send full content to list view, only summary
        const { content_en, content_ar, ...summary } = data;
        return { id: doc.id, ...summary };
    });

    res.json({ success: true, count: courses.length, courses });
}));

// ─── GET /api/academy/:slug (Public — get single course by slug) ──────────────────
router.get('/:slug', asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .where('slug', '==', req.params.slug)
        .where('status', '==', 'published')
        .limit(1)
        .get();

    if (snapshot.empty) {
        throw new AppError('Course not found.', 404);
    }

    const doc = snapshot.docs[0];
    res.json({ success: true, course: { id: doc.id, ...doc.data() } });
}));

// ─── POST /api/academy (Admin — create course) ────────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), courseValidation, validate, asyncHandler(async (req, res) => {
    const {
        title_en, title_ar, slug, excerpt_en, excerpt_ar, 
        content_en, content_ar, thumbnail, video_url, 
        price, instructor, status,
    } = req.body;

    const now = new Date().toISOString();
    const courseData = {
        title_en, title_ar, slug,
        excerpt_en:  excerpt_en  || '',
        excerpt_ar:  excerpt_ar  || '',
        content_en:  content_en  || '',
        content_ar:  content_ar  || '',
        thumbnail:   thumbnail   || null,
        video_url:   video_url   || null,
        price:       Number(price) || 0,
        instructor:  instructor  || '',
        status:      status      || 'draft',
        authorId:    req.admin.uid,
        createdAt:   now,
        updatedAt:   now,
    };

    const docRef = await db.collection(COLLECTION).add(courseData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Course created successfully.' });
}));

// ─── PUT /api/academy/:id (Admin — update course) ─────────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), courseValidation, validate, asyncHandler(async (req, res) => {
    const {
        title_en, title_ar, slug, excerpt_en, excerpt_ar, 
        content_en, content_ar, thumbnail, video_url, 
        price, instructor, status,
    } = req.body;

    const { id } = req.params;

    const docRef  = db.collection(COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        throw new AppError('Course not found.', 404);
    }

    const updates = {
        title_en, title_ar, slug,
        excerpt_en, excerpt_ar,
        content_en, content_ar,
        thumbnail, video_url, 
        price: Number(price) || 0, 
        instructor, status,
        updatedAt: new Date().toISOString(),
    };

    await docRef.update(updates);
    res.json({ success: true, message: 'Course updated successfully.' });
}));

// ─── DELETE /api/academy/:id (Admin) ────────────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true, message: 'Course deleted.' });
}));

module.exports = router;
