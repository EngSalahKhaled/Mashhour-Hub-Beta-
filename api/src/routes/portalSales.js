const express = require('express');
const router  = express.Router();
const { db, admin }  = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ─── GET /api/portal/orders ──────────────────────────────────────────────────
router.get('/orders', authMiddleware, asyncHandler(async (req, res) => {
    const { uid, role } = req.admin;
    let query = db.collection('orders');
    
    if (role === 'influencer') {
        query = query.where('influencer_id', '==', uid);
    } else {
        query = query.where('client_id', '==', uid);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, orders });
}));

// ─── POST /api/portal/withdrawals ─────────────────────────────────────────────
router.post('/withdrawals', authMiddleware, asyncHandler(async (req, res) => {
    const { amount, method, details } = req.body;
    const { uid } = req.admin;

    if (!amount || amount <= 0) throw new AppError('Invalid amount.', 400);

    // Check balance
    const userDoc = await db.collection('portal_users').doc(uid).get();
    const balance = userDoc.data().balance || 0;

    if (balance < amount) {
        throw new AppError('Insufficient balance.', 400);
    }

    const withdrawalRequest = {
        user_id: uid,
        amount,
        method,
        details,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    await db.collection('withdrawals').add(withdrawalRequest);
    
    // Deduct from balance (Optimistic update, in production use transactions)
    await db.collection('portal_users').doc(uid).update({
        balance: admin.firestore.FieldValue.increment(-amount)
    });

    res.json({ success: true, message: 'Withdrawal request submitted.' });
}));

// ─── GET /api/portal/transactions ─────────────────────────────────────────────
router.get('/transactions', authMiddleware, asyncHandler(async (req, res) => {
    const snapshot = await db.collection('transactions')
        .where('user_id', '==', req.admin.uid)
        .orderBy('createdAt', 'desc').get();
        
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, transactions });
}));

// ─── POST /api/portal/sales/checkout ──────────────────────────────────────────
router.post('/checkout', authMiddleware, asyncHandler(async (req, res) => {
    const { productId, influencerId, amount, productTitle } = req.body;
    const { uid } = req.admin; // Current logged in client

    if (!productId || !influencerId) throw new AppError('Missing order details.', 400);

    const orderData = {
        client_id: uid,
        influencer_id: influencerId,
        product_id: productId,
        product_title: productTitle,
        amount: parseFloat(amount),
        status: 'pending', // Initially pending
        createdAt: new Date().toISOString()
    };

    const orderRef = await db.collection('orders').add(orderData);

    // In a real production setup:
    // 1. Initialize MyFatoorah/Stripe payment session here
    // 2. Return the paymentUrl to the frontend
    
    res.json({ 
        success: true, 
        message: 'Order created.', 
        orderId: orderRef.id,
        paymentUrl: null // Set to real URL in production
    });
}));

module.exports = router;
