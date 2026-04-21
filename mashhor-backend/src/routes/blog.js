const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');

const COLLECTION = 'blog_posts';

// ─── GET /api/blog (Public — list all published posts) ───────────────────────
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('status', '==', 'published')
            .orderBy('publishedAt', 'desc')
            .get();

        const posts = snapshot.docs.map(doc => {
            const { content_en, content_ar, ...summary } = doc.data(); // omit body fields in list
            return { id: doc.id, ...summary };
        });

        res.json({ success: true, count: posts.length, posts });
    } catch (error) {
        console.error('[BLOG GET ALL ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── GET /api/blog/:slug (Public — get single post by slug) ──────────────────
router.get('/:slug', async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('slug', '==', req.params.slug)
            .where('status', '==', 'published')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        const doc = snapshot.docs[0];
        res.json({ success: true, post: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('[BLOG GET ONE ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── POST /api/blog (Admin — create post) ────────────────────────────────────
router.post('/', auth, async (req, res) => {
    const {
        title_en, title_ar, slug, content_en, content_ar,
        excerpt_en, excerpt_ar, thumbnail, category, status,
    } = req.body;

    if (!title_en || !slug) {
        return res.status(400).json({ success: false, message: 'title_en and slug are required.' });
    }

    try {
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
    } catch (error) {
        console.error('[BLOG POST ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error. Check for duplicate slug.' });
    }
});

// ─── PUT /api/blog/:id (Admin — update post) ─────────────────────────────────
router.put('/:id', auth, async (req, res) => {
    const {
        title_en, title_ar, slug, content_en, content_ar,
        excerpt_en, excerpt_ar, thumbnail, category, status,
    } = req.body;

    const { id } = req.params;

    try {
        const docRef  = db.collection(COLLECTION).doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
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
    } catch (error) {
        console.error('[BLOG PUT ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── DELETE /api/blog/:id (Admin) ────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).delete();
        res.json({ success: true, message: 'Post deleted.' });
    } catch (error) {
        console.error('[BLOG DELETE ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
