const express = require('express');
const router  = express.Router();
const { admin, db }  = require('../config/firebase');
const auth    = require('../middleware/auth');

const COLLECTION = 'admins';

// Security Helper: Only superadmin or admin can manage users
// For now, we assume any authenticated token reaching this route is allowed,
// but we should ideally check `req.admin.role === 'superadmin'`

// ─── GET /api/users (Admin — list all admins) ─────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        console.error('[USERS GET ALL ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─── POST /api/users (Admin — create new admin/moderator) ─────────────────────
router.post('/', auth, async (req, res) => {
    const { email, password, displayName, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }

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
        console.error('[USERS POST ERROR]', error.message);
        res.status(500).json({ success: false, message: error.message || 'Server error creating user.' });
    }
});

// ─── DELETE /api/users/:uid (Admin — delete user) ─────────────────────────────
router.delete('/:uid', auth, async (req, res) => {
    const { uid } = req.params;

    if (uid === req.admin.uid) {
        return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
    }

    try {
        // 1. Delete from Firebase Auth
        await admin.auth().deleteUser(uid);

        // 2. Delete from Firestore
        await db.collection(COLLECTION).doc(uid).delete();

        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('[USERS DELETE ERROR]', error.message);
        res.status(500).json({ success: false, message: error.message || 'Server error.' });
    }
});

module.exports = router;
