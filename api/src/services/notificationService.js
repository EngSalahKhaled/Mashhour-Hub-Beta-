const { admin } = require('../config/firebase');

/**
 * Push Notification Service using Firebase Cloud Messaging (FCM)
 */
class NotificationService {
    /**
     * Sends a push notification to a specific user device token
     */
    async sendToDevice(token, title, body, data = {}) {
        const message = {
            notification: { title, body },
            data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
            token: token,
        };

        try {
            const response = await admin.messaging().send(message);
            console.log('[Notification] Sent successfully:', response);
            return true;
        } catch (error) {
            console.error('[Notification] Error sending to device:', error);
            return false;
        }
    }

    /**
     * Broadcasts a notification to a specific topic (e.g., 'influencers')
     */
    async broadcastToTopic(topic, title, body, data = {}) {
        const message = {
            notification: { title, body },
            topic: topic,
        };

        try {
            const response = await admin.messaging().send(message);
            console.log(`[Notification] Broadcast to ${topic} successful:`, response);
            return true;
        } catch (error) {
            console.error(`[Notification] Error broadcasting to ${topic}:`, error);
            return false;
        }
    }
}

module.exports = new NotificationService();
