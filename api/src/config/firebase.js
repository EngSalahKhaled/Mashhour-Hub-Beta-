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
        // Remove surrounding quotes (single or double) if Vercel added them
        if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
        if (rawKey.startsWith("'") && rawKey.endsWith("'")) rawKey = rawKey.slice(1, -1);
        // Replace literal \n with actual newline characters
        const parsedKey = rawKey.replace(/\\n/g, '\n');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId:   process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  parsedKey,
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

