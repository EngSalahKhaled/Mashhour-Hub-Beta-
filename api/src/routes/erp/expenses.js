const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');
const auth = require('../../middleware/auth');
const authorizeRole = require('../../middleware/role');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const COLLECTION = 'erp_expenses';

// Validation
const expenseValidation = [
    body('title').notEmpty().withMessage('Title is required.').trim(),
    body('category').notEmpty().withMessage('Category is required.').trim(),
    body('amount').isNumeric().withMessage('Amount must be a number.'),
    body('date').isISO8601().withMessage('Valid date is required.'),
    body('notes').optional().trim()
];

// ─── GET /api/erp/expenses ────────────────────────────────────────────────
router.get('/', auth, authorizeRole('superadmin', 'admin', 'accountant'), asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection is not initialized.', 500);

    const snapshot = await db.collection(COLLECTION).orderBy('date', 'desc').get();
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate total
    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    res.json({ success: true, count: expenses.length, totalAmount, expenses });
}));

// ─── POST /api/erp/expenses ───────────────────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'accountant'), expenseValidation, validate, asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection is not initialized.', 500);

    const expenseData = {
        ...req.body,
        amount: parseFloat(req.body.amount),
        createdBy: req.admin.uid,
        createdAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION).add(expenseData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Expense added successfully.' });
}));

// ─── DELETE /api/erp/expenses/:id ─────────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin', 'accountant'), asyncHandler(async (req, res) => {
    if (!db) throw new AppError('Database connection is not initialized.', 500);

    await db.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true, message: 'Expense deleted successfully.' });
}));

module.exports = router;
