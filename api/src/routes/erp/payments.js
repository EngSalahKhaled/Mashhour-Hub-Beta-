const express = require('express');
const router  = express.Router();
const { db }  = require('../../config/firebase');
const auth = require('../../middleware/auth');
const authorizeRole = require('../../middleware/role');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const { sendPayment, getPaymentStatus } = require('../../utils/myfatoorah');
const crypto = require('crypto');

const COLLECTION_INVOICES = 'erp_invoices';
const COLLECTION_PAYMENTS = 'erp_payments';

// ─── POST /api/erp/payments/initiate ──────────────────────────────────────────
// Generates a payment link for an invoice
router.post('/initiate', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    const { invoiceId } = req.body;
    if (!invoiceId) throw new AppError('invoiceId is required.', 400);

    // 1. Get Invoice Data
    const docRef = db.collection(COLLECTION_INVOICES).doc(invoiceId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) throw new AppError('Invoice not found.', 404);
    
    const invoice = docSnap.data();
    
    if (invoice.status === 'Paid') {
        throw new AppError('This invoice is already paid.', 400);
    }

    // 2. Get Client Data
    let customerName = 'Customer';
    let customerEmail = 'billing@mashhor-hub.com';
    let customerMobile = '';

    if (invoice.clientId) {
        const clientSnap = await db.collection('erp_clients').doc(invoice.clientId).get();
        if (clientSnap.exists) {
            const client = clientSnap.data();
            customerName = client.name || customerName;
            customerEmail = client.email || customerEmail;
            customerMobile = client.phone || customerMobile;
        }
    }

    // 3. Prepare MyFatoorah Payload
    // Required fields: InvoiceValue, NotificationOption, CustomerName, CustomerEmail
    const paymentData = {
        CustomerName: customerName,
        NotificationOption: 'LNK', // LNK to just get the link and return it to dashboard
        InvoiceValue: invoice.total,
        CustomerEmail: customerEmail,
        CustomerMobile: customerMobile,
        CallBackUrl: `${process.env.FRONTEND_URL || 'https://mashhor-hub.com'}/payment-success`, // Where user is redirected after payment
        ErrorUrl: `${process.env.FRONTEND_URL || 'https://mashhor-hub.com'}/payment-error`,
        Language: 'ar',
        UserDefinedField: invoiceId // Important: Store invoice ID to cross-reference in webhook
    };

    // 4. Call MyFatoorah API
    const result = await sendPayment(paymentData);

    // 5. Update Invoice with Payment URL and Gateway ID
    await docRef.update({
        paymentUrl: result.InvoiceURL,
        myFatoorahInvoiceId: result.InvoiceId,
        updatedAt: new Date().toISOString()
    });

    res.json({ 
        success: true, 
        paymentUrl: result.InvoiceURL,
        message: 'Payment link generated successfully.' 
    });
}));

// ─── POST /api/erp/payments/webhook ───────────────────────────────────────────
// Webhook endpoint called securely by MyFatoorah when payment status changes
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
    const signature = req.headers['myfatoorah-signature'];
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.warn('⚠️ Webhook secret not configured. Webhooks will fail.');
        return res.status(500).send('Webhook secret not configured.');
    }

    // Validate Signature
    const payloadString = req.body.toString();
    const hash = crypto.createHmac('sha256', webhookSecret).update(payloadString).digest('base64');

    if (hash !== signature) {
        console.error('Invalid Webhook Signature');
        return res.status(401).send('Invalid signature.');
    }

    const payload = JSON.parse(payloadString);

    // EventType 1 usually means Payment Status Changed
    if (payload.EventType === 1 && payload.Data && payload.Data.PaymentId) {
        const paymentId = payload.Data.PaymentId;
        const transactionStatus = payload.Data.TransactionStatus; // 'SUCCESS' or 'FAILED'
        const invoiceId = payload.Data.UserDefinedField;

        // Verify with API to be absolutely sure (Security best practice)
        const verification = await getPaymentStatus(paymentId);

        if (verification.InvoiceStatus === 'Paid' && invoiceId) {
            // Update Invoice Status
            await db.collection(COLLECTION_INVOICES).doc(invoiceId).update({
                status: 'Paid',
                updatedAt: new Date().toISOString()
            });

            // Log Transaction
            await db.collection(COLLECTION_PAYMENTS).add({
                invoiceId: invoiceId,
                paymentId: paymentId,
                amount: verification.InvoiceValue,
                gateway: 'MyFatoorah',
                status: 'Success',
                createdAt: new Date().toISOString()
            });

            return res.json({ success: true, message: 'Invoice updated to Paid.' });
        }
    }

    res.json({ success: true, message: 'Webhook received but no action taken.' });
}));

// ─── GET /api/erp/payments ────────────────────────────────────────────────────
// List all payment transactions
router.get('/', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION_PAYMENTS).orderBy('createdAt', 'desc').get();
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: payments.length, data: payments });
}));

module.exports = router;
