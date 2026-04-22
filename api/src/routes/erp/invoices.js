const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { db }  = require('../../config/firebase');
const auth = require('../../middleware/auth');
const authorizeRole = require('../../middleware/role');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const COLLECTION = 'erp_invoices';

// ─── Helper: Calculate Totals ────────────────────────────────────────────────
const calculateTotals = (items, taxRate = 0, discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
    const tax = (subtotal - discount) * (Number(taxRate) / 100);
    const total = subtotal - discount + tax;
    return { subtotal, tax, total };
};

// ─── Validation Rules ────────────────────────────────────────────────────────
const invoiceValidation = [
    body('clientId').notEmpty().withMessage('Client ID is required.'),
    body('quotationId').optional(),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required.'),
    body('items.*.desc').notEmpty(),
    body('items.*.qty').isNumeric(),
    body('items.*.price').isNumeric(),
    body('taxRate').optional().isNumeric(),
    body('discount').optional().isNumeric(),
    body('status').optional().isIn(['Unpaid', 'Partial', 'Paid', 'Cancelled']).withMessage('Invalid status.'),
    body('dueDate').optional(),
    body('paymentMethod').optional()
];

// ─── GET /api/erp/invoices ────────────────────────────────────────────────────
router.get('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: invoices.length, data: invoices });
}));

// ─── GET /api/erp/invoices/:id ────────────────────────────────────────────────
router.get('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const docSnap = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!docSnap.exists) throw new AppError('Invoice not found', 404);
    res.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
}));

// ─── POST /api/erp/invoices ───────────────────────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), invoiceValidation, validate, asyncHandler(async (req, res) => {
    const { clientId, quotationId, items, taxRate = 0, discount = 0, status = 'Unpaid', dueDate, notes, paymentMethod } = req.body;

    const totals = calculateTotals(items, taxRate, discount);

    // Generate an invoice number (e.g., INV-YYYYMMDD-XXXX)
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoiceData = {
        invoiceNumber,
        clientId,
        quotationId: quotationId || null,
        items,
        taxRate: Number(taxRate),
        discount: Number(discount),
        ...totals,
        status,
        dueDate: dueDate || null,
        notes: notes || '',
        paymentMethod: paymentMethod || null,
        paymentUrl: null, // To be populated by MyFatoorah
        myFatoorahInvoiceId: null,
        createdBy: req.admin.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION).add(invoiceData);
    res.status(201).json({ success: true, id: docRef.id, invoiceNumber, message: 'Invoice created successfully.' });
}));

// ─── PUT /api/erp/invoices/:id ────────────────────────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), invoiceValidation, validate, asyncHandler(async (req, res) => {
    const { clientId, items, taxRate = 0, discount = 0, status, dueDate, notes, paymentMethod } = req.body;
    const totals = calculateTotals(items, taxRate, discount);

    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new AppError('Invoice not found', 404);

    const updates = {
        clientId,
        items,
        taxRate: Number(taxRate),
        discount: Number(discount),
        ...totals,
        status: status || docSnap.data().status,
        dueDate: dueDate || docSnap.data().dueDate,
        notes: notes !== undefined ? notes : docSnap.data().notes,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : docSnap.data().paymentMethod,
        updatedAt: new Date().toISOString()
    };

    await docRef.update(updates);
    res.json({ success: true, message: 'Invoice updated successfully.' });
}));

// ─── DELETE /api/erp/invoices/:id ─────────────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new AppError('Invoice not found', 404);

    await docRef.delete();
    res.json({ success: true, message: 'Invoice deleted successfully.' });
}));

// ─── POST /api/erp/invoices/:id/mark-paid ─────────────────────────────────────
// Manual override to mark as paid
router.post('/:id/mark-paid', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new AppError('Invoice not found', 404);

    await docRef.update({
        status: 'Paid',
        updatedAt: new Date().toISOString()
    });
    
    // Create a transaction record
    await db.collection('erp_payments').add({
        invoiceId: docSnap.id,
        amount: docSnap.data().total,
        paymentMethod: 'Manual',
        status: 'Success',
        createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Invoice marked as paid manually.' });
}));

module.exports = router;
