const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { db }  = require('../config/firebase');
const auth    = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const emailService = require('../services/emailService');

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

const verifyRecaptcha = require('../utils/verifyRecaptcha');

// ─── POST /api/leads (Public — CRM form submission) ───────────────────────────
router.post('/', formValidation, validate, asyncHandler(async (req, res) => {
    const { 
        formType, timestamp, page_url, language, 
        utm_source, utm_medium, utm_campaign, utm_content,
        name, email, phone, recaptchaToken, ...rest 
    } = req.body;

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
        throw new AppError('reCAPTCHA verification failed. Please try again.', 400);
    }

    // Determine the target collection based on formType
    let targetCollection = 'leads';
    if (formType === 'Subscribers') targetCollection = 'subscribers';
    else if (formType === 'Unsubscribe' || formType === 'Unsubscribers') targetCollection = 'unsubscribers';
    else if (formType === 'Influencers') targetCollection = 'influencers';
    else if (formType === 'Contacts') targetCollection = 'leads';

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

    // ─── Trigger Internal Notification ───────────────────────────────────────
    try {
        await db.collection('notifications').add({
            title: `New ${formType || 'Lead'}`,
            message: `${name || 'Someone'} submitted a form from ${page_url || 'the website'}.`,
            type: targetCollection,
            link: `/leads?tab=${targetCollection}&id=${docRef.id}`,
            read: false,
            createdAt: new Date().toISOString(),
        });
        
        // Automation: Send Confirmation Email
        await emailService.sendWelcomeEmail(email, name, 'customer');
    } catch (e) {
        console.error('Notification trigger failed:', e.message);
    }

    res.status(201).json({
        success: true,
        id: docRef.id,
        collection: targetCollection,
        message: 'Form submitted successfully!',
    });
}));

// ─── GET /api/leads (Admin — list all leads, newest first) ───────────────────
router.get('/', auth, asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();

    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, count: leads.length, leads });
}));

// ─── GET /api/leads/subscribers (Admin — list all subscribers) ────────────────
router.get('/subscribers', auth, asyncHandler(async (req, res) => {
    const snapshot = await db.collection('subscribers')
        .orderBy('createdAt', 'desc')
        .get();

    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: items.length, subscribers: items });
}));

// ─── GET /api/leads/influencers (Admin — list all influencer applications) ────
router.get('/influencers', auth, asyncHandler(async (req, res) => {
    const snapshot = await db.collection('influencers')
        .orderBy('createdAt', 'desc')
        .get();

    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: items.length, influencers: items });
}));

// ─── GET /api/leads/all (Admin — aggregate all CRM data) ─────────────────────
router.get('/all', auth, asyncHandler(async (req, res) => {
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
            // It's acceptable for a collection to not exist yet
            results[col] = [];
        }
    }

    res.json({ success: true, totalCount, ...results });
}));

// ─── PATCH /api/leads/:id (Admin — update status or assignment) ───────────────
router.patch('/:id', auth, asyncHandler(async (req, res) => {
    const { status, assigned_to } = req.body;
    const { id } = req.params;

    const updates = {};
    if (status      !== undefined) updates.status      = status;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;

    if (Object.keys(updates).length === 0) {
        throw new AppError('No fields provided for update.', 400);
    }

    updates.updatedAt = new Date().toISOString();

    await db.collection(COLLECTION).doc(id).update(updates);
    res.json({ success: true, message: 'Lead updated successfully.' });
}));

// ─── DELETE /api/leads/:id (Admin) ────────────────────────────────────────────
router.delete('/:id', auth, asyncHandler(async (req, res) => {
    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true, message: 'Lead deleted.' });
}));

module.exports = router;
