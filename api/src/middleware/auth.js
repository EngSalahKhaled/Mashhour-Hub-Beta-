const { admin } = require('../config/firebase');

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

        // Attach decoded Firebase user to request
        req.admin = {
            uid:   decodedToken.uid,
            email: decodedToken.email,
            role:  decodedToken.role || 'admin', // set custom claims via Admin SDK if needed
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
