const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { db, bucket } = require('../config/firebase');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');

const COLLECTION = 'media_library';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
]);

const sanitizeFileName = (value = 'file') =>
    String(value)
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_')
        .slice(-120);

// Configure Multer (Memory Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(new AppError('Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, SVG, PDF.', 400));
        }
        cb(null, true);
    }
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
router.post('/upload', auth, authorizeRole('superadmin', 'admin', 'editor'), upload.single('file'), asyncHandler(async (req, res, next) => {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    if (!bucket) throw new AppError('Storage bucket is not configured.', 500);

    const safeFileName = sanitizeFileName(req.file.originalname);
    const blob = bucket.file(`media/${Date.now()}_${safeFileName}`);
    const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: { contentType: req.file.mimetype }
    });

    blobStream.on('error', (err) => {
        next(new AppError(`Upload failed: ${err.message}`, 500));
    });

    blobStream.on('finish', async () => {
        try {
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
            await logActivity(db, {
                user: req.admin,
                action: 'media_uploaded',
                details: { documentId: docRef.id, name: fileData.name, type: fileData.type },
            });
            res.status(201).json({ success: true, id: docRef.id, file: { id: docRef.id, ...fileData } });
        } catch (err) {
            next(new AppError(`Failed to save media record: ${err.message}`, 500));
        }
    });

    blobStream.end(req.file.buffer);
}));

// ─── POST /api/media (Admin — External URL or legacy Base64) ───────────────────
router.post('/', auth, authorizeRole('superadmin', 'admin', 'editor'), asyncHandler(async (req, res) => {
    const { name, url, base64, type, size } = req.body;
    if (!url && !base64) throw new AppError('URL or Base64 required.', 400);
    if (!name) throw new AppError('File name required.', 400);
    if (url) {
        try {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                throw new AppError('Only HTTP(S) URLs are allowed.', 400);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Invalid media URL.', 400);
        }
    }

    const fileData = {
        name: sanitizeFileName(name),
        type: type || 'image',
        size: size || 0,
        url: url || null,
        base64: base64 || null,
        uploadedBy: req.admin.uid,
        createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(fileData);
    await logActivity(db, {
        user: req.admin,
        action: 'media_created',
        details: { documentId: docRef.id, name: fileData.name, type: fileData.type },
    });
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
    await logActivity(db, {
        user: req.admin,
        action: 'media_deleted',
        details: { documentId: req.params.id, name: data.name || null },
    });
    res.json({ success: true, message: 'Media deleted successfully.' });
}));

module.exports = router;
