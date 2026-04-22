const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'projects';

// ─── GET /api/portal/projects ────────────────────────────────────────────────
// Fetches projects where the current user is either the client or the influencer
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const { uid, role } = req.admin; // Assuming middleware adds role
    
    let query;
    if (role === 'influencer') {
        query = db.collection(COLLECTION).where('influencer_id', '==', uid);
    } else {
        query = db.collection(COLLECTION).where('client_id', '==', uid);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({ success: true, projects });
}));

// ─── POST /api/portal/projects ───────────────────────────────────────────────
// Clients can create new project requests
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
    const { title, description, budget, category } = req.body;
    const { uid, role } = req.admin;

    if (role !== 'client') throw new AppError('Only clients can create projects.', 403);

    const projectData = {
        title,
        description,
        budget,
        category,
        client_id: uid,
        status: 'pending',
        progress: 0,
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION).add(projectData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Project request created.' });
}));

// ─── PATCH /api/portal/projects/:id/files ────────────────────────────────────
// Add files to a project
router.patch('/:id/files', authMiddleware, asyncHandler(async (req, res) => {
    const { fileUrl, fileName } = req.body;
    const projectRef = db.collection(COLLECTION).doc(req.params.id);
    const project = await projectRef.get();

    if (!project.exists) throw new AppError('Project not found.', 404);
    
    // Check ownership
    const data = project.data();
    if (data.client_id !== req.admin.uid && data.influencer_id !== req.admin.uid) {
        throw new AppError('Access denied.', 403);
    }

    await projectRef.update({
        files: admin.firestore.FieldValue.arrayUnion({ url: fileUrl, name: fileName, uploadedAt: new Date().toISOString() }),
        updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'File added to project.' });
}));

module.exports = router;
