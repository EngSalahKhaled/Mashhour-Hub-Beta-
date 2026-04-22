const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { db, bucket } = require('../config/firebase');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'media_library';

// Configure Multer (Memory Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ─── GET /api/media (Admin — list all media) ──────────────────────────────────
router.get('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();

    const media = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: media.length, data: media });
}));

// ─── POST /api/media/upload (Admin — Upload File to Storage) ──────────────────
router.post('/upload', auth, authorizeRole('superadmin', 'admin', 'editor'), upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    const blob = bucket.file(`media/${Date.now()}_${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: { contentType: req.file.mimetype }
    });

    blobStream.on('error', (err) => { throw new AppError(err.message, 500); });

    blobStream.on('finish', async () => {
        // Make the file public
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        const fileData = {
            name: req.file.originalname,
            type: req.file.mimetype.startsWith('image') ? 'image' : 'file',
            size: req.file.size,
            url: publicUrl,
            storagePath: blob.name,
            uploadedBy: req.admin.uid,
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection(COLLECTION).add(fileData);
        res.status(201).json({ success: true, id: docRef.id, file: { id: docRef.id, ...fileData } });
    });

    blobStream.end(req.file.buffer);
}));

// ─── POST /api/media (Admin — External URL or legacy Base64) ───────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const { name, url, base64, type, size } = req.body;
    if (!url && !base64) throw new AppError('URL or Base64 required.', 400);
    if (!name) throw new AppError('File name required.', 400);

    const fileData = {
        name,
        type: type || 'image',
        size: size || 0,
        url: url || null,
        base64: base64 || null,
        uploadedBy: req.admin.uid,
        createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(fileData);
    res.status(201).json({ success: true, id: docRef.id, file: { id: docRef.id, ...fileData } });
}));

// ─── DELETE /api/media/:id (Admin — delete media) ─────────────────────────────
router.delete('/:id', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const docRef = db.collection(COLLECTION).doc(req.params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) throw new AppError('Media not found.', 404);

    const data = docSnap.data();
    
    // Delete from Storage if it exists
    if (data.storagePath) {
        try {
            await bucket.file(data.storagePath).delete();
        } catch (e) {
            console.error('Failed to delete file from Storage:', e.message);
        }
    }

    await docRef.delete();
    res.json({ success: true, message: 'Media deleted successfully.' });
}));

module.exports = router;
