const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');

const COLLECTION = 'leads';

// ─── POST /api/leads (Public — contact/lead form submission) ──────────────────
router.post('/', async (req, res) => {
    const { name, email, phone, company, service_interest, message, source } = req.body;

    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    try {
        const leadData = {
            name,
            email,
            phone:            phone            || null,
            company:          company          || null,
            service_interest: service_interest || null,
            message:          message          || null,
            source:           source           || 'website',
            status:           'new',
            assigned_to:      null,
            createdAt:        new Date().toISOString(),
        };

        const docRef = await db.collection(COLLECTION).add(leadData);

        res.status(201).json({
            success: true,
            id:      docRef.id,
            message: 'Form submitted successfully!',
        });
    } catch (error) {
        console.error('[LEADS POST ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// ─── GET /api/leads (Admin — list all leads, newest first) ───────────────────
router.get('/', auth, async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .orderBy('createdAt', 'desc')
            .get();

        const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json({ success: true, count: leads.length, leads });
    } catch (error) {
        console.error('[LEADS GET ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── PATCH /api/leads/:id (Admin — update status or assignment) ───────────────
router.patch('/:id', auth, async (req, res) => {
    const { status, assigned_to } = req.body;
    const { id } = req.params;

    const updates = {};
    if (status      !== undefined) updates.status      = status;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    updates.updatedAt = new Date().toISOString();

    try {
        await db.collection(COLLECTION).doc(id).update(updates);
        res.json({ success: true, message: 'Lead updated successfully.' });
    } catch (error) {
        console.error('[LEADS PATCH ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── DELETE /api/leads/:id (Admin) ────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.collection(COLLECTION).doc(req.params.id).delete();
        res.json({ success: true, message: 'Lead deleted.' });
    } catch (error) {
        console.error('[LEADS DELETE ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
