const LOG_COLLECTION = 'activity_logs';

const logActivity = async (db, { user, action, details = {}, source = 'api' }) => {
    if (!db || !action) return;

    try {
        await db.collection(LOG_COLLECTION).add({
            action,
            details,
            source,
            user: user?.email || user?.uid || 'system',
            userUid: user?.uid || null,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[ACTIVITY LOG ERROR]', error.message);
    }
};

module.exports = logActivity;
