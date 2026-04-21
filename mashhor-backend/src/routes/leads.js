const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// POST /api/leads (Public - for contact forms)
router.post('/', async (req, res) => {
    const { name, email, phone, company, service_interest, message, source } = req.body;

    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    try {
        await db.execute(
            `INSERT INTO leads (name, email, phone, company, service_interest, message, source) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone || null, company || null, service_interest || null, message || null, source || 'website']
        );

        res.status(201).json({ success: true, message: 'Form submitted successfully!' });
    } catch (error) {
        console.error('Lead submission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/leads (Admin - list all leads)
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM leads ORDER BY created_at DESC');
        res.json({ success: true, count: rows.length, leads: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PATCH /api/leads/:id (Admin - update status or assignment)
router.patch('/:id', auth, async (req, res) => {
    const { status, assigned_to } = req.body;
    const { id } = req.params;

    try {
        // Build dynamic query
        let query = 'UPDATE leads SET ';
        const values = [];
        
        if (status) {
            query += 'status = ?, ';
            values.push(status);
        }
        if (assigned_to !== undefined) {
            query += 'assigned_to = ?, ';
            values.push(assigned_to);
        }
        
        // Remove trailing comma and add WHERE
        query = query.slice(0, -2) + ' WHERE id = ?';
        values.push(id);

        if (values.length === 1) { // Only the ID was added
            return res.status(400).json({ success: false, message: 'No fields provided for update.' });
        }

        await db.execute(query, values);
        res.json({ success: true, message: 'Lead updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
