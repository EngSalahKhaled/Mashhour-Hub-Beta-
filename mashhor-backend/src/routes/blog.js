const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/blog (Public - list all published posts)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, title_en, title_ar, slug, excerpt_en, excerpt_ar, thumbnail, category, published_at FROM blog_posts WHERE status = "published" ORDER BY published_at DESC'
        );
        res.json({ success: true, count: rows.length, posts: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/blog/:slug (Public - get single post)
router.get('/:slug', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM blog_posts WHERE slug = ? AND status = "published"',
            [req.params.slug]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, post: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/blog (Admin - create post)
router.post('/', auth, async (req, res) => {
    const { title_en, title_ar, slug, content_en, content_ar, excerpt_en, excerpt_ar, thumbnail, category, status } = req.body;

    try {
        const [result] = await db.execute(
            `INSERT INTO blog_posts (title_en, title_ar, slug, content_en, content_ar, excerpt_en, excerpt_ar, thumbnail, category, status, author_id, published_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title_en, title_ar, slug, content_en, content_ar, excerpt_en, excerpt_ar, thumbnail, category, status || 'draft', req.admin.id, status === 'published' ? new Date() : null]
        );

        res.status(201).json({ success: true, id: result.insertId, message: 'Post created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error (duplicate slug?)' });
    }
});

// PUT /api/blog/:id (Admin - update post)
router.put('/:id', auth, async (req, res) => {
    const { title_en, title_ar, slug, content_en, content_ar, excerpt_en, excerpt_ar, thumbnail, category, status } = req.body;
    const { id } = req.params;

    try {
        // Query to handle published_at logic
        let publishedAtQuery = '';
        if (status === 'published') {
            publishedAtQuery = ', published_at = COALESCE(published_at, NOW())';
        }

        await db.execute(
            `UPDATE blog_posts SET 
                title_en = ?, title_ar = ?, slug = ?, content_en = ?, content_ar = ?, 
                excerpt_en = ?, excerpt_ar = ?, thumbnail = ?, category = ?, status = ?
                ${publishedAtQuery}
             WHERE id = ?`,
            [title_en, title_ar, slug, content_en, content_ar, excerpt_en, excerpt_ar, thumbnail, category, status, id]
        );

        res.json({ success: true, message: 'Post updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
