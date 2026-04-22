const express = require('express');
const router  = express.Router();
const { admin } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const speakeasy = require('speakeasy');
const qrcode    = require('qrcode');

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

// ─── POST /api/auth/2fa/setup ────────────────────────────────────────────────
// Generates a new TOTP secret and returns a QR code URL.
router.post('/2fa/setup', authMiddleware, async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({ name: `Mashhor Hub (${req.admin.email})` });
        
        // Save temporary secret to user's metadata in Firestore or custom claims
        // Real implementation should store this securely in Firestore users collection
        await admin.firestore().collection('users').doc(req.admin.uid).update({
            tempTwoFactorSecret: secret.base32,
            twoFactorEnabled: false
        });

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        res.json({ success: true, qrCode: qrCodeUrl, secret: secret.base32 });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to setup 2FA.' });
    }
});

// ─── POST /api/auth/2fa/verify ───────────────────────────────────────────────
// Verifies the 2FA code and enables it permanently for the user.
router.post('/2fa/verify', authMiddleware, async (req, res) => {
    const { token } = req.body;
    try {
        const userDoc = await admin.firestore().collection('users').doc(req.admin.uid).get();
        const secret = userDoc.data().tempTwoFactorSecret;

        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            await admin.firestore().collection('users').doc(req.admin.uid).update({
                twoFactorSecret: secret,
                twoFactorEnabled: true,
                tempTwoFactorSecret: null
            });
            res.json({ success: true, message: '2FA enabled successfully.' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid 2FA token.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Verification failed.' });
    }
});

module.exports = router;
