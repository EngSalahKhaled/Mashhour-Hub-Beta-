const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { db }  = require('../../config/firebase');
const auth = require('../../middleware/auth');
const authorizeRole = require('../../middleware/role');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const COLLECTION = 'erp_quotations';

// ─── Helper: Calculate Totals ────────────────────────────────────────────────
const calculateTotals = (items, taxRate = 0, discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
    const tax = (subtotal - discount) * (Number(taxRate) / 100);
    const total = subtotal - discount + tax;
    return { subtotal, tax, total };
};

// ─── Validation Rules ────────────────────────────────────────────────────────
const quoteValidation = [
    body('clientId').notEmpty().withMessage('Client ID is required.'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required.'),
    body('items.*.desc').notEmpty(),
    body('items.*.qty').isNumeric(),
    body('items.*.price').isNumeric(),
    body('taxRate').optional().isNumeric(),
    body('discount').optional().isNumeric(),
    body('status').optional().isIn(['Draft', 'Sent', 'Accepted', 'Rejected']).withMessage('Invalid status.'),
    body('expiryDate').optional()
];

// ─── GET /api/erp/quotations ──────────────────────────────────────────────────
router.get('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const quotations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: quotations.length, data: quotations });
}));

// ─── GET /api/erp/quotations/:id ──────────────────────────────────────────────
router.get('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const docSnap = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!docSnap.exists) throw new AppError('Quotation not found', 404);
    res.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
}));

// ─── POST /api/erp/quotations ─────────────────────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), quoteValidation, validate, asyncHandler(async (req, res) => {
    const { clientId, items, taxRate = 0, discount = 0, status = 'Draft', expiryDate, notes } = req.body;

    const totals = calculateTotals(items, taxRate, discount);

    // Generate a quotation number (e.g., Q-YYYYMMDD-XXXX)
    const quoteNumber = `Q-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const quoteData = {
        quoteNumber,
        clientId,
        items,
        taxRate: Number(taxRate),
        discount: Number(discount),
        ...totals,
        status,
        expiryDate: expiryDate || null,
        notes: notes || '',
        createdBy: req.admin.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION).add(quoteData);
    res.status(201).json({ success: true, id: docRef.id, quoteNumber, message: 'Quotation created successfully.' });
}));

// ─── PUT /api/erp/quotations/:id ──────────────────────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), quoteValidation, validate, asyncHandler(async (req, res) => {
    const { clientId, items, taxRate = 0, discount = 0, status, expiryDate, notes } = req.body;
    const totals = calculateTotals(items, taxRate, discount);

    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new AppError('Quotation not found', 404);

    const updates = {
        clientId,
        items,
        taxRate: Number(taxRate),
        discount: Number(discount),
        ...totals,
        status: status || docSnap.data().status,
        expiryDate: expiryDate || docSnap.data().expiryDate,
        notes: notes !== undefined ? notes : docSnap.data().notes,
        updatedAt: new Date().toISOString()
    };

    await docRef.update(updates);
    res.json({ success: true, message: 'Quotation updated successfully.' });
}));

// ─── DELETE /api/erp/quotations/:id ───────────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new AppError('Quotation not found', 404);

    await docRef.delete();
    res.json({ success: true, message: 'Quotation deleted successfully.' });
}));

module.exports = router;
