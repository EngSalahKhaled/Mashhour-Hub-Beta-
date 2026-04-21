const express = require('express');
const router  = express.Router();
const { admin } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// ─── POST /api/auth/verify ────────────────────────────────────────────────────
// Verifies a Firebase ID token and returns the decoded user profile.
// Use this as a "me" endpoint — the client sends its current token and
// the server confirms it's valid and returns the user's info.
router.post('/verify', authMiddleware, async (req, res) => {
    // If we reach here, authMiddleware already verified the token
    res.json({
        success: true,
        user: {
            uid:   req.admin.uid,
            email: req.admin.email,
            role:  req.admin.role,
        },
    });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the currently authenticated user's profile.
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userRecord = await admin.auth().getUser(req.admin.uid);
        res.json({
            success: true,
            user: {
                uid:          userRecord.uid,
                email:        userRecord.email,
                displayName:  userRecord.displayName || null,
                photoURL:     userRecord.photoURL || null,
                emailVerified: userRecord.emailVerified,
                customClaims: userRecord.customClaims || {},
            },
        });
    } catch (error) {
        console.error('[AUTH/ME ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
    }
});

module.exports = router;
