const admin = require('firebase-admin');

// ─── Firebase Admin SDK Initialization ────────────────────────────────────────
// Called once at startup. The guard prevents duplicate initialization in
// Vercel's serverless environment where modules can be re-evaluated.
//
// ⚠️  FIREBASE_PRIVATE_KEY copied from the JSON export contains literal "\n"
//     strings — we must convert them to real newlines before passing to the SDK.

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId:   process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

const db     = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
