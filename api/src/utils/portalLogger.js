const { db } = require('../config/firebase');

/**
 * Logs user activity within the Customer/Influencer Portal
 * @param {string} userId - ID of the user (from Firebase Auth)
 * @param {string} userType - 'client' or 'influencer'
 * @param {string} action - e.g., 'USER_LOGGED_IN', 'INVOICE_DOWNLOADED', 'COURSE_VIEWED'
 * @param {object} metadata - Additional info (e.g., { invoiceId: '...', courseName: '...' })
 */
const logPortalActivity = async (userId, userType, action, metadata = {}) => {
    if (!db) {
        console.warn('[PortalLogger] Database not initialized');
        return;
    }

    try {
        const logEntry = {
            userId,
            userType,
            action,
            metadata,
            timestamp: new Date().toISOString()
        };

        await db.collection('portal_logs').add(logEntry);
    } catch (error) {
        console.error('[PortalLogger] Failed to log activity:', error);
    }
};

module.exports = logPortalActivity;
