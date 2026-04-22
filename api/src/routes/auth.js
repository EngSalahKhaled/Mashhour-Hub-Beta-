const express = require('express');
const router  = express.Router();
const { admin } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const speakeasy = require('speakeasy');
const qrcode    = require('qrcode');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ─── POST /api/auth/verify ────────────────────────────────────────────────────
// Verifies a Firebase ID token and returns the decoded user profile.
router.post('/verify', authMiddleware, asyncHandler(async (req, res) => {
    // If we reach here, authMiddleware already verified the token
    res.json({
        success: true,
        user: {
            uid:   req.admin.uid,
            email: req.admin.email,
            role:  req.admin.role,
        },
    });
}));

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the currently authenticated user's profile.
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
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
}));

// ─── POST /api/auth/2fa/setup ────────────────────────────────────────────────
// Generates a new TOTP secret and returns a QR code URL.
router.post('/2fa/setup', authMiddleware, asyncHandler(async (req, res) => {
    const secret = speakeasy.generateSecret({ name: `Mashhor Hub (${req.admin.email})` });
    
    // Save temporary secret to user's metadata in Firestore
    const userRef = admin.firestore().collection('admins').doc(req.admin.uid); // Changed to 'admins' collection based on users.js
    
    // Ensure document exists before updating, or use set with merge
    await userRef.set({
        tempTwoFactorSecret: secret.base32,
        twoFactorEnabled: false
    }, { merge: true });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ success: true, qrCode: qrCodeUrl, secret: secret.base32 });
}));

// ─── POST /api/auth/2fa/verify ───────────────────────────────────────────────
// Verifies the 2FA code and enables it permanently for the user.
router.post('/2fa/verify', authMiddleware, asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) throw new AppError('Token is required.', 400);

    const userDoc = await admin.firestore().collection('admins').doc(req.admin.uid).get();
    
    if (!userDoc.exists || !userDoc.data().tempTwoFactorSecret) {
        throw new AppError('2FA setup not initiated.', 400);
    }

    const secret = userDoc.data().tempTwoFactorSecret;

    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        await admin.firestore().collection('admins').doc(req.admin.uid).update({
            twoFactorSecret: secret,
            twoFactorEnabled: true,
            tempTwoFactorSecret: null // Use null instead of delete for simplicity in Firebase
        });
        res.json({ success: true, message: '2FA enabled successfully.' });
    } else {
        throw new AppError('Invalid 2FA token.', 400);
    }
}));

// ─── POST /api/auth/2fa/login-check ──────────────────────────────────────────
// Verifies 2FA token during login process.
router.post('/2fa/login-check', authMiddleware, asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) throw new AppError('Token is required.', 400);

    const userDoc = await admin.firestore().collection('admins').doc(req.admin.uid).get();
    
    if (!userDoc.exists || !userDoc.data().twoFactorEnabled) {
        // If 2FA is not enabled, technically they shouldn't even hit this endpoint, 
        // but we return success to allow them in if it was somehow disabled mid-session.
        return res.json({ success: true, message: '2FA not required.' });
    }

    const secret = userDoc.data().twoFactorSecret;
    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        res.json({ success: true, message: '2FA verified successfully.' });
    } else {
        throw new AppError('Invalid 2FA token.', 400);
    }
}));

module.exports = router;
