const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { admin, db }  = require('../config/firebase');
const auth    = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'admins';

// ─── Validation Rules ────────────────────────────────────────────────────────
const userValidation = [
    body('email').isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('role').isIn(['superadmin', 'admin', 'editor', 'moderator']).withMessage('Invalid role specified.'),
    body('displayName').optional().trim().escape()
];

// ─── GET /api/users (Admin — list all admins) ─────────────────────────────────
// Only superadmins and admins can view the user list.
router.get('/', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    if (!db) {
        throw new AppError('Database connection is not initialized. Check server logs for Firebase Admin errors.', 500);
    }
    const snapshot = await db.collection(COLLECTION).get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: users.length, users });
}));

// ─── POST /api/users (Admin — create new admin/moderator) ─────────────────────
// Only superadmins can create new users.
router.post('/', auth, authorizeRole('superadmin'), userValidation, validate, asyncHandler(async (req, res) => {
    if (!db) {
        throw new AppError('Database connection is not initialized. Check server logs.', 500);
    }
    const { email, password, displayName, role } = req.body;

    try {
        // 1. Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: displayName || '',
        });

        // 2. Set Custom Claims (role)
        await admin.auth().setCustomUserClaims(userRecord.uid, { role });

        // 3. Store user metadata in Firestore
        const userData = {
            email,
            displayName: displayName || '',
            role,
            createdAt: new Date().toISOString(),
            createdBy: req.admin.uid
        };
        await db.collection(COLLECTION).doc(userRecord.uid).set(userData);

        res.status(201).json({ success: true, uid: userRecord.uid, message: 'User created successfully.' });
    } catch (error) {
        // Handle specific Firebase Auth errors
        if (error.code === 'auth/email-already-exists') {
            throw new AppError('The email address is already in use by another account.', 400);
        }
        throw new AppError(error.message || 'Server error creating user.', 500);
    }
}));

// ─── DELETE /api/users/:uid (Admin — delete user) ─────────────────────────────
// Only superadmins can delete users.
router.delete('/:uid', auth, authorizeRole('superadmin'), asyncHandler(async (req, res) => {
    if (!db) {
        throw new AppError('Database connection is not initialized. Check server logs.', 500);
    }
    const { uid } = req.params;

    if (uid === req.admin.uid) {
        throw new AppError('You cannot delete your own account.', 400);
    }

    try {
        // 1. Delete from Firebase Auth
        await admin.auth().deleteUser(uid);

        // 2. Delete from Firestore
        await db.collection(COLLECTION).doc(uid).delete();

        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            throw new AppError('User not found.', 404);
        }
        throw new AppError(error.message || 'Server error deleting user.', 500);
    }
}));

module.exports = router;
