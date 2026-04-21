const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/portfolio (Public - list all published items)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, title_en, title_ar, slug, client_name, category, thumbnail, status FROM portfolio_items WHERE status = "published" ORDER BY created_at DESC'
        );
        res.json({ success: true, count: rows.length, portfolio: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/portfolio/:slug (Public - get single item)
router.get('/:slug', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM portfolio_items WHERE slug = ? AND status = "published"',
            [req.params.slug]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, item: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/portfolio (Admin - create item)
router.post('/', auth, async (req, res) => {
    const { title_en, title_ar, slug, client_name, category, description_en, description_ar, thumbnail, gallery_json, results_json, status } = req.body;

    try {
        const [result] = await db.execute(
            `INSERT INTO portfolio_items (title_en, title_ar, slug, client_name, category, description_en, description_ar, thumbnail, gallery_json, results_json, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title_en, title_ar, slug, client_name, category, description_en, description_ar, thumbnail, JSON.stringify(gallery_json || []), JSON.stringify(results_json || {}), status || 'draft']
        );

        res.status(201).json({ success: true, id: result.insertId, message: 'Portfolio item created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error (duplicate slug?)' });
    }
});

// PUT /api/portfolio/:id (Admin - update item)
router.put('/:id', auth, async (req, res) => {
    const { title_en, title_ar, slug, client_name, category, description_en, description_ar, thumbnail, gallery_json, results_json, status } = req.body;
    const { id } = req.params;

    try {
        await db.execute(
            `UPDATE portfolio_items SET 
                title_en = ?, title_ar = ?, slug = ?, client_name = ?, category = ?, 
                description_en = ?, description_ar = ?, thumbnail = ?, 
                gallery_json = ?, results_json = ?, status = ?
             WHERE id = ?`,
            [title_en, title_ar, slug, client_name, category, description_en, description_ar, thumbnail, JSON.stringify(gallery_json), JSON.stringify(results_json), status, id]
        );

        res.json({ success: true, message: 'Portfolio item updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
