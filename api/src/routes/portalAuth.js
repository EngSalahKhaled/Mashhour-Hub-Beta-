const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { admin, db }  = require('../config/firebase');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const emailService = require('../services/emailService');
const logPortalActivity = require('../utils/portalLogger');

const COLLECTION = 'portal_users';

// ─── Registration Validation ──────────────────────────────────────────────────
const registerValidation = [
    body('email').isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars.'),
    body('name').notEmpty().withMessage('Name is required.'),
    body('role').isIn(['client', 'influencer']).withMessage('Invalid role.')
];

// ─── POST /api/auth/portal/register ──────────────────────────────────────────
router.post('/register', registerValidation, validate, asyncHandler(async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        // 1. Create in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        // 2. Set Portal Claims
        await admin.auth().setCustomUserClaims(userRecord.uid, { portal: true, role });

        // 3. Store in Firestore
        const userData = {
            uid: userRecord.uid,
            email,
            name,
            role,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        await db.collection(COLLECTION).doc(userRecord.uid).set(userData);

        // 4. Automation: Send Welcome Email
        await emailService.sendWelcomeEmail(email, name, role);

        // 5. Log Activity
        await logPortalActivity(userRecord.uid, role, 'USER_REGISTERED', { email, name });

        res.status(201).json({ 
            success: true, 
            message: 'Registration successful! Check your email.',
            uid: userRecord.uid 
        });
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            throw new AppError('Email already registered.', 400);
        }
        throw new AppError(error.message, 500);
    }
}));

// ─── POST /api/auth/portal/login-check ────────────────────────────────────────
// Verifies user exists in portal_users (prevents admins logging in here)
router.post('/login-check', asyncHandler(async (req, res) => {
    const { uid } = req.body;
    if (!uid) throw new AppError('UID required.', 400);

    const userDoc = await db.collection(COLLECTION).doc(uid).get();
    if (!userDoc.exists) {
        throw new AppError('User not found in portal.', 403);
    }

    const userData = userDoc.data();
    await logPortalActivity(uid, userData.role, 'USER_LOGGED_IN', { email: userData.email });

    res.json({ success: true, user: userData });
}));

module.exports = router;
