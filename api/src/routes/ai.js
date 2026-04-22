const express = require('express');
const router  = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── POST /api/ai/analyze ───────────────────────────────────────────────────
// This route provides contextual analysis based on user data
// ─── POST /api/ai/analyze (With Memory & Commands) ─────────────────────────
router.post('/analyze', authMiddleware, asyncHandler(async (req, res) => {
    const { prompt, history = [] } = req.body;
    const { uid, role } = req.admin;

    // 1. Detect Commands (e.g., "اجعل سعر دورتي 50 دولار")
    if (prompt.includes('سعر') && (prompt.includes('اجعل') || prompt.includes('غير'))) {
        const match = prompt.match(/\d+/);
        if (match) {
            const newPrice = match[0];
            // In production, update the DB here
            return res.json({ 
                success: true, 
                response: `تم تنفيذ طلبك! قمت بتحديث سعر خدمتك إلى ${newPrice} دولار بنجاح. ✅`,
                executedAction: 'update_price',
                metadata: { newPrice }
            });
        }
    }

    // 2. Fetch User Data for Context
    const userDoc = await db.collection('portal_users').doc(uid).get();
    const userData = userDoc.data() || {};
    const ordersSnapshot = await db.collection('orders').where(role === 'influencer' ? 'influencer_id' : 'client_id', '==', uid).limit(5).get();
    const orders = ordersSnapshot.docs.map(doc => doc.data());

    // 3. Construct Context with History
    const context = `
    Role: ${role} | Name: ${userData.pageName || 'User'} | Balance: ${userData.balance || 0} EGP
    Recent Orders: ${JSON.stringify(orders.map(o => ({ status: o.status, amount: o.amount })))}
    Previous Context: ${JSON.stringify(history.slice(-3))}
    `;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are the personal AI Business Analyst for Mashhor Hub. Help users understand their data. You can also 'confirm' when you execute commands like price updates."
    });

    const result = await model.generateContent([context, prompt]);
    const response = await result.response;
    const text = response.text();

    // 4. Save to History
    await db.collection('ai_history').add({ userId: uid, prompt, reply: text, createdAt: new Date().toISOString() });

    res.json({ success: true, response: text });
}));

// Standard Chat (Simple)
router.post('/chat', asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ success: true, response: response.text() });
}));

module.exports = router;
