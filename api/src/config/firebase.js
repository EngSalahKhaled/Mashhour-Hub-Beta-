const admin = require('firebase-admin');

// ─── Firebase Admin SDK Initialization ────────────────────────────────────────
// Called once at startup. The guard prevents duplicate initialization in
// Vercel's serverless environment where modules can be re-evaluated.
//
// ⚠️  FIREBASE_PRIVATE_KEY copied from the JSON export contains literal "\n"
//     strings — we must convert them to real newlines before passing to the SDK.

let db;
let bucket;

if (!admin.apps.length) {
    try {
        if (!process.env.FIREBASE_STORAGE_BUCKET) {
            console.warn('⚠️ WARNING: FIREBASE_STORAGE_BUCKET is undefined in process.env.');
        }

        let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
        
        // 1. Try parsing as JSON string (handles quotes and \n unescaping automatically)
        try {
            if (rawKey.trim().startsWith('"')) {
                rawKey = JSON.parse(rawKey);
            }
        } catch (e) { /* ignore */ }

        // 2. Manual fallback replacements
        rawKey = rawKey.replace(/\\n/g, '\n')
                       .replace(/"/g, '')
                       .replace(/'/g, '')
                       .trim();

        // 3. Reconstruct newlines if Vercel collapsed them into spaces
        if (rawKey && !rawKey.includes('\n')) {
            rawKey = rawKey.replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n');
            rawKey = rawKey.replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----');
            const parts = rawKey.split('\n');
            if (parts.length === 3) {
                // The base64 part might have spaces instead of newlines, replace them
                parts[1] = parts[1].replace(/\s+/g, '\n');
                rawKey = parts.join('\n');
            }
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId:   process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  rawKey,
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
        console.log('✅ Firebase Admin & Storage initialized successfully.');
    } catch (error) {
        console.error('❌ CRITICAL: Firebase Admin failed to initialize.');
        console.error('Reason:', error.message);
        console.log('⚠️  The server will continue to run, but Auth/Firestore/Storage features will fail until .env is fixed.');
    }
}

try {
    db = admin.firestore();
    bucket = admin.storage().bucket();
} catch (e) {
    console.error('❌ Could not initialize Services:', e.message);
}

module.exports = { admin, db, bucket };

