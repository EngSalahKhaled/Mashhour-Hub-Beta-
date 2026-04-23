const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const emailService = require('../services/emailService');

// ─── Validation ─────────────────────────────────────────────────────────────
const broadcastValidation = [
    body('subject').notEmpty().withMessage('Subject is required.').trim(),
    body('htmlBody').notEmpty().withMessage('Email content is required.').trim(),
    body('segment').isIn(['all', 'newsletter']).withMessage('Invalid segment.').default('all')
];

// ─── POST /api/marketing/broadcast ──────────────────────────────────────────
// Send marketing email to leads
router.post('/broadcast', auth, authorizeRole('superadmin', 'admin', 'marketer'), broadcastValidation, validate, asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection is not initialized.', 500);

    const { subject, htmlBody, segment } = req.body;

    // 1. Fetch target audience (leads)
    let query = db.collection('leads');
    // In the future, we could add .where('subscribed', '==', true) if we add that field
    const snapshot = await query.get();
    
    if (snapshot.empty) {
        return res.status(404).json({ success: false, message: 'No recipients found for this segment.' });
    }

    // 2. Extract unique valid emails
    const emails = new Set();
    snapshot.forEach(doc => {
        const lead = doc.data();
        if (lead.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
            emails.add(lead.email);
        }
    });

    if (emails.size === 0) {
        return res.status(400).json({ success: false, message: 'Found leads but none have valid email addresses.' });
    }

    const emailArray = Array.from(emails);

    // 3. Send emails
    // We send them individually or in bcc to avoid exposing emails to everyone
    // For simplicity with our emailService, we will map over them and send one by one
    // In a high-volume production environment, we should use bulk APIs (SendGrid/Mailgun)
    let successCount = 0;
    let failCount = 0;

    // Sending in background to not block the request for too long, but we will wait for them here since it's a small list usually.
    // If it's a huge list, we should push to a queue. For now, Promise.all.
    const sendPromises = emailArray.map(async (email) => {
        const success = await emailService.sendMarketingEmail(email, subject, htmlBody);
        if (success) successCount++;
        else failCount++;
    });

    await Promise.all(sendPromises);

    res.json({
        success: true,
        message: 'Broadcast completed.',
        stats: {
            totalAttempted: emailArray.length,
            successCount,
            failCount
        }
    });
}));

module.exports = router;
