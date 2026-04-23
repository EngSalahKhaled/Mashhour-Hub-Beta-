const nodemailer = require('nodemailer');

/**
 * Professional Email Service for Mashhor Hub
 * Configured for Hostinger SMTP
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'info@mashhor-hub.com',
                pass: process.env.SMTP_PASS,
            },
            tls: {
                // Do not fail on invalid certs
                rejectUnauthorized: false
            }
        });
    }

    /**
     * Sends a welcome email to new portal users or customers
     */
    async sendWelcomeEmail(to, name, role) {
        const isAr = true; // Support Arabic branding
        const subject = isAr ? 'مرحباً بك في مشهور هب | بوابتك للنمو الرقمي' : 'Welcome to Mashhor Hub | Your Digital Growth Portal';
        
        const logoUrl = 'https://www.mashhor-hub.com/assets/images/icons/logo.png';
        
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: ${isAr ? 'rtl' : 'ltr'}; text-align: ${isAr ? 'right' : 'left'}; background-color: #f9fafb; padding: 40px; color: #1f2937;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background: #07152b; padding: 30px; text-align: center;">
                        <img src="${logoUrl}" alt="Mashhor Hub" style="height: 50px;">
                    </div>
                    <div style="padding: 40px;">
                        <h1 style="color: #07152b; margin-top: 0; font-size: 24px;">مرحباً ${name}! 👋</h1>
                        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                            يسعدنا جداً انضمامك إلى مجتمع **مشهور هب** كـ <strong>${role === 'influencer' ? 'مؤثر وشريك إبداعي' : 'عميل مميز'}</strong>.
                        </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                            لقد تم إعداد حسابك بنجاح. يمكنك الآن البدء في استكشاف ميزات المنصة، إدارة مشاريعك، والتواصل مع فريقنا الاحترافي.
                        </p>
                        
                        <div style="margin: 40px 0; text-align: center;">
                            <a href="https://www.mashhor-hub.com/login" style="background: #f4cd55; color: #000; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 18px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(244, 205, 85, 0.3);">
                                دخول لوحة التحكم
                            </a>
                        </div>
                        
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="font-size: 14px; color: #6b7280; text-align: center;">
                            إذا كانت لديك أي أسئلة، لا تتردد في الرد على هذا الإيميل مباشرة.
                        </p>
                    </div>
                    <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                        &copy; ${new Date().getFullYear()} Mashhor Hub. جميع الحقوق محفوظة.
                    </div>
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"Mashhor Hub" <${process.env.SMTP_USER || 'info@mashhor-hub.com'}>`,
                to,
                subject,
                html,
            });
            console.log(`[Email] Automated email sent to ${to}`);
            return true;
        } catch (error) {
            console.error('[Email] SMTP Error:', error.message);
            return false;
        }
    }
    /**
     * Sends a generic marketing/newsletter email
     */
    async sendMarketingEmail(to, subject, htmlBody) {
        const logoUrl = 'https://www.mashhor-hub.com/assets/images/icons/logo.png';
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f9fafb; padding: 40px; color: #1f2937;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background: #07152b; padding: 30px; text-align: center;">
                        <img src="${logoUrl}" alt="Mashhor Hub" style="height: 50px;">
                    </div>
                    <div style="padding: 40px;">
                        ${htmlBody}
                    </div>
                    <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                        &copy; ${new Date().getFullYear()} Mashhor Hub. جميع الحقوق محفوظة.<br>
                        <a href="https://www.mashhor-hub.com/unsubscribe" style="color: #6b7280; text-decoration: underline;">إلغاء الاشتراك</a>
                    </div>
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: `"Mashhor Hub" <${process.env.SMTP_USER || 'info@mashhor-hub.com'}>`,
                to,
                subject,
                html,
            });
            console.log(`[Email] Marketing email sent to ${to}`);
            return true;
        } catch (error) {
            console.error('[Email] SMTP Error:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();
