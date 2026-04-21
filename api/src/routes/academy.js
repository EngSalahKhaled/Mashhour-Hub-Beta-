const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');

const COLLECTION = 'academy_courses';

// ─── GET /api/academy (Public — list all published courses) ───────────────────────
router.get('/', async (req, res) => {
    try {
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
    } catch (error) {
        console.error('[ACADEMY GET ALL ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── GET /api/academy/:slug (Public — get single course by slug) ──────────────────
router.get('/:slug', async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('slug', '==', req.params.slug)
            .where('status', '==', 'published')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        const doc = snapshot.docs[0];
        res.json({ success: true, course: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('[ACADEMY GET ONE ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── POST /api/academy (Admin — create course) ────────────────────────────────────
router.post('/', auth, async (req, res) => {
    const {
        title_en, title_ar, slug, excerpt_en, excerpt_ar, 
        content_en, content_ar, thumbnail, video_url, 
        price, instructor, status,
    } = req.body;

    if (!title_en || !slug) {
        return res.status(400).json({ success: false, message: 'title_en and slug are required.' });
    }

    try {
        const now = new Date().toISOString();
        const courseData = {
            title_en, title_ar, slug,
            excerpt_en:  excerpt_en  || '',
            excerpt_ar:  excerpt_ar  || '',
            content_en:  content_en  || '',
            content_ar:  content_ar  || '',
            thumbnail:   thumbnail   || null,
            video_url:   video_url   || null,
            price:       price       || 0,
            instructor:  instructor  || '',
            status:      status      || 'draft',
            authorId:    req.admin.uid,
            createdAt:   now,
            updatedAt:   now,
        };

        const docRef = await db.collection(COLLECTION).add(courseData);
        res.status(201).json({ success: true, id: docRef.id, message: 'Course created successfully.' });
    } catch (error) {
        console.error('[ACADEMY POST ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error. Check for duplicate slug.' });
    }
});

// ─── PUT /api/academy/:id (Admin — update course) ─────────────────────────────────
router.put('/:id', auth, async (req, res) => {
    const {
        title_en, title_ar, slug, excerpt_en, excerpt_ar, 
        content_en, content_ar, thumbnail, video_url, 
        price, instructor, status,
    } = req.body;

    const { id } = req.params;

    try {
        const docRef  = db.collection(COLLECTION).doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        const updates = {
            title_en, title_ar, slug,
            excerpt_en, excerpt_ar,
            content_en, content_ar,
            thumbnail, video_url, price, instructor, status,
            updatedAt: new Date().toISOString(),
        };

        await docRef.update(updates);
        res.json({ success: true, message: 'Course updated successfully.' });
    } catch (error) {
        console.error('[ACADEMY PUT ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── DELETE /api/academy/:id (Admin) ────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).delete();
        res.json({ success: true, message: 'Course deleted.' });
    } catch (error) {
        console.error('[ACADEMY DELETE ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
