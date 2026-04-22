const nodemailer = require('nodemailer');

/**
 * Mashhor Notifier Utility
 * Handles Email and WhatsApp (via future API integration)
 */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Mashhor Hub" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        console.log(`Email sent to ${to}`);
    } catch (e) {
        console.error('Email error:', e);
    }
};

const sendWhatsApp = async (to, message) => {
    // Placeholder for Twilio / Wati / UltraMsg integration
    console.log(`WhatsApp to ${to}: ${message}`);
    // In production:
    // await fetch('https://api.ultramsg.com/.../sendMessage', { ... });
};

module.exports = {
    sendOrderAlert: async (client, influencer, order) => {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@mashhor-hub.com';
        
        const clientHtml = `<h1>تم تأكيد طلبك! 🛍️</h1><p>عزيزي ${client.name}، تم شراء ${order.product_title} من ${influencer.name} بنجاح.</p>`;
        const influencerHtml = `<h1>طلب جديد وارد! 💰</h1><p>مرحباً ${influencer.name}، قام ${client.name} بشراء ${order.product_title}. يرجى البدء في التنفيذ.</p>`;
        const adminHtml = `<h1>عملية بيع جديدة 📊</h1><p>تم بيع ${order.product_title} بقيمة ${order.amount} ج.م. عمولتنا: ${order.amount * 0.15} ج.م</p>`;

        // Send Emails
        await sendEmail(client.email, 'تأكيد الشراء - مشهور هب', clientHtml);
        await sendEmail(influencer.email, 'لديك طلب جديد! - مشهور هب', influencerHtml);
        await sendEmail(adminEmail, 'إشعار مبيعات جديد - الإدارة', adminHtml);

        // Send WhatsApps
        await sendWhatsApp(client.phone, `تم تأكيد طلبك لـ ${order.product_title}!`);
        await sendWhatsApp(influencer.phone, `لديك طلب جديد لـ ${order.product_title} من ${client.name}!`);
    },

    sendWelcomeMessage: async (user) => {
        const html = `<h1>مرحباً بك في مشهور هب! 🚀</h1><p>أهلاً ${user.name}، أنت الآن جزء من أكبر تجمع للمشاهير والشركات.</p>`;
        await sendEmail(user.email, 'مرحباً بك في مشهور هب', html);
    }
};
