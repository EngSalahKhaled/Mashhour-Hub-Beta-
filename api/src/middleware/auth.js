const { admin } = require('../config/firebase');
const { db } = require('../config/firebase');

const ADMIN_COLLECTION = 'admins';

const resolveRole = async (decodedToken) => {
    if (decodedToken.role) return decodedToken.role;

    if (!db || !decodedToken.uid) return null;

    try {
        const adminDoc = await db.collection(ADMIN_COLLECTION).doc(decodedToken.uid).get();
        if (adminDoc.exists && adminDoc.data()?.role) {
            return adminDoc.data().role;
        }
    } catch (error) {
        console.error('[AUTH ROLE FALLBACK ERROR]', error.message);
    }

    return null;
};

/**
 * Firebase Auth Token Verification Middleware
 *
 * Expects: Authorization: Bearer <Firebase ID Token>
 *
 * The token is obtained on the client via:
 *   const token = await firebase.auth().currentUser.getIdToken();
 *
 * The Admin SDK verifies the token without a network call (uses Firebase's
 * public keys cached locally), making it fast and serverless-safe.
 */
module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: No token provided.',
            });
        }

        const idToken = authHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const resolvedRole = await resolveRole(decodedToken);

        // Attach decoded Firebase user to request
        req.admin = {
            uid:   decodedToken.uid,
            email: decodedToken.email,
            role:  resolvedRole,
        };

        next();
    } catch (error) {
        console.error('[AUTH ERROR]', error.message);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed: Invalid or expired token.',
        });
    }
};
