const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const COLLECTION = 'portal_users';

// ─── GET /api/portal/profile ──────────────────────────────────────────────────
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const userDoc = await db.collection(COLLECTION).doc(req.admin.uid).get();
    if (!userDoc.exists) throw new AppError('User not found.', 404);
    
    res.json({ success: true, profile: userDoc.data() });
}));

// ─── PUT /api/portal/profile ──────────────────────────────────────────────────
router.put('/', authMiddleware, asyncHandler(async (req, res) => {
    const { 
        userType, // 'influencer', 'company'
        subscriptionPlan, // 'free', 'basic', 'pro', 'elite'
        isVerified,
        verificationType, // 'blue' (creator), 'yellow' (company)
        pageName, workField, shortBio, longBio, language, 
        contactMethod, whatsappNumber, 
        logoUrl, coverUrl, themeColor,
        socialLinks,
        // Detailed Trainer Info from images
        educationalQualification, profession, websiteUrl,
        facebookUrl, instagramUrl, linkedinUrl, country, phone
    } = req.body;
    
    const userRef = db.collection(COLLECTION).doc(req.admin.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new AppError('User not found.', 404);

    const updateData = {
        updatedAt: new Date().toISOString()
    };

    if (userType) updateData.userType = userType;
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (verificationType) updateData.verificationType = verificationType;

    // Bank Details (New)
    if (req.body.bankDetails) {
        updateData.bankDetails = {
            iban: req.body.bankDetails.iban,
            accountNumber: req.body.bankDetails.accountNumber,
            bankName: req.body.bankDetails.bankName,
            swiftCode: req.body.bankDetails.swiftCode,
            updatedAt: new Date().toISOString()
        };
    }

    if (pageName) updateData.pageName = pageName;
    if (workField) updateData.workField = workField;
    if (shortBio) updateData.shortBio = shortBio;
    if (longBio) updateData.longBio = longBio;
    if (language) updateData.language = language;
    if (contactMethod) updateData.contactMethod = contactMethod;
    if (whatsappNumber) updateData.whatsappNumber = whatsappNumber;
    if (phone) updateData.phone = phone;
    if (country) updateData.country = country;

    // Detailed Profile
    if (educationalQualification) updateData.educationalQualification = educationalQualification;
    if (profession) updateData.profession = profession;
    if (websiteUrl) updateData.websiteUrl = websiteUrl;

    // Appearance
    if (logoUrl) updateData.logoUrl = logoUrl;
    if (coverUrl) updateData.coverUrl = coverUrl;
    if (themeColor) updateData.themeColor = themeColor;

    // Social Links
    if (socialLinks) updateData.socialLinks = socialLinks;
    if (facebookUrl) updateData.facebookUrl = facebookUrl;
    if (instagramUrl) updateData.instagramUrl = instagramUrl;
    if (linkedinUrl) updateData.linkedinUrl = linkedinUrl;

    await userRef.update(updateData);
    res.json({ success: true, message: 'Settings updated successfully.' });
}));

// ─── GET /api/portal/profile/public/:username ─────────────────────────────
router.get('/public/:username', asyncHandler(async (req, res) => {
    const { username } = req.params;
    
    // Find user by username (or pageName slug)
    const snapshot = await db.collection(COLLECTION).where('pageName', '==', username).limit(1).get();
    if (snapshot.empty) throw new AppError('Profile not found.', 404);
    
    const userData = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;
    
    // Fetch products for this user
    const productsSnapshot = await db.collection('products').where('owner_id', '==', userId).get();
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({ 
        success: true, 
        profile: { ...userData, products } 
    });
}));

module.exports = router;
