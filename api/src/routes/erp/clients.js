const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { db }  = require('../../config/firebase');
const auth = require('../../middleware/auth');
const authorizeRole = require('../../middleware/role');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const COLLECTION = 'erp_clients';

// ─── Validation Rules ────────────────────────────────────────────────────────
const clientValidation = [
    body('name').notEmpty().withMessage('Client name is required.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address.').normalizeEmail(),
    body('phone').optional().trim(),
    body('company').optional().trim(),
    body('taxId').optional().trim(),
    body('address').optional().trim(),
];

// ─── GET /api/erp/clients ─────────────────────────────────────────────────────
router.get('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: clients.length, data: clients });
}));

// ─── GET /api/erp/clients/:id ─────────────────────────────────────────────────
router.get('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const docSnap = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!docSnap.exists) throw new AppError('Client not found', 404);
    res.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
}));

// ─── POST /api/erp/clients ────────────────────────────────────────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), clientValidation, validate, asyncHandler(async (req, res) => {
    const clientData = {
        ...req.body,
        createdBy: req.admin.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION).add(clientData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Client created successfully.' });
}));

// ─── PUT /api/erp/clients/:id ─────────────────────────────────────────────────
router.put('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), clientValidation, validate, asyncHandler(async (req, res) => {
    const updates = {
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new AppError('Client not found', 404);

    await docRef.update(updates);
    res.json({ success: true, message: 'Client updated successfully.' });
}));

// ─── DELETE /api/erp/clients/:id ──────────────────────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin'), asyncHandler(async (req, res) => {
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new AppError('Client not found', 404);

    await docRef.delete();
    res.json({ success: true, message: 'Client deleted successfully.' });
}));

module.exports = router;
