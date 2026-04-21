const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');

const COLLECTION = 'leads';

// ─── Sanitize helper: strip HTML tags from any string ─────────────────────────
function sanitize(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '').trim();
}

// ─── Validation rules for public form submission ──────────────────────────────
const formValidation = [
    body('email').isEmail().withMessage('Invalid email address.').normalizeEmail(),
    body('name').optional().trim().escape(),
    body('phone').optional().trim().escape(),
];

// ─── POST /api/leads (Public — CRM form submission) ───────────────────────────
router.post('/', formValidation, async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { 
        formType, timestamp, page_url, language, 
        utm_source, utm_medium, utm_campaign, utm_content,
        name, email, phone, ...rest 
    } = req.body;

    // Determine the target collection based on formType
    let targetCollection = 'leads';
    if (formType === 'Subscribers') targetCollection = 'subscribers';
    else if (formType === 'Unsubscribe' || formType === 'Unsubscribers') targetCollection = 'unsubscribers';
    else if (formType === 'Influencers') targetCollection = 'influencers';
    else if (formType === 'Contacts') targetCollection = 'leads';

    try {
        // Sanitize all dynamic fields from rest
        const sanitizedRest = {};
        for (const [key, value] of Object.entries(rest)) {
            sanitizedRest[key] = sanitize(value);
        }

        const leadData = {
            email: sanitize(email),
            name: sanitize(name) || null,
            phone: sanitize(phone) || null,
            formType: sanitize(formType) || 'Inbox',
            page_url: sanitize(page_url) || null,
            language: sanitize(language) || null,
            
            // UTMs
            utm_source: sanitize(utm_source) || null,
            utm_medium: sanitize(utm_medium) || null,
            utm_campaign: sanitize(utm_campaign) || null,
            utm_content: sanitize(utm_content) || null,
            
            // Other dynamic fields (sanitized)
            ...sanitizedRest,
            
            status: 'new',
            createdAt: timestamp || new Date().toISOString(),
        };

        const docRef = await db.collection(targetCollection).add(leadData);

        res.status(201).json({
            success: true,
            id: docRef.id,
            collection: targetCollection,
            message: 'Form submitted successfully!',
        });
    } catch (error) {
        console.error(`[CRM POST ERROR - ${targetCollection}]`, error.message);
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

// ─── GET /api/leads/subscribers (Admin — list all subscribers) ────────────────
router.get('/subscribers', auth, async (req, res) => {
    try {
        const snapshot = await db.collection('subscribers')
            .orderBy('createdAt', 'desc')
            .get();

        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, count: items.length, subscribers: items });
    } catch (error) {
        console.error('[SUBSCRIBERS GET ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── GET /api/leads/influencers (Admin — list all influencer applications) ────
router.get('/influencers', auth, async (req, res) => {
    try {
        const snapshot = await db.collection('influencers')
            .orderBy('createdAt', 'desc')
            .get();

        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, count: items.length, influencers: items });
    } catch (error) {
        console.error('[INFLUENCERS GET ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── GET /api/leads/all (Admin — aggregate all CRM data) ─────────────────────
router.get('/all', auth, async (req, res) => {
    try {
        const collections = ['leads', 'subscribers', 'influencers'];
        const results = {};
        let totalCount = 0;

        for (const col of collections) {
            try {
                const snapshot = await db.collection(col)
                    .orderBy('createdAt', 'desc')
                    .get();
                results[col] = snapshot.docs.map(doc => ({ id: doc.id, collection: col, ...doc.data() }));
                totalCount += results[col].length;
            } catch {
                results[col] = [];
            }
        }

        res.json({ success: true, totalCount, ...results });
    } catch (error) {
        console.error('[ALL CRM GET ERROR]', error.message);
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
