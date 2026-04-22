const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const asyncHandler = require('../utils/asyncHandler');

// ─── GET /api/sitemap ─────────────────────────────────────────────────────────
// Generates a dynamic XML sitemap based on CMS content
router.get('/', asyncHandler(async (req, res) => {
    const baseUrl = process.env.FRONTEND_URL || 'https://mashhor-hub.com';
    
    // 1. Define Static Pages
    const staticPages = [
        '',
        '/services',
        '/influencers',
        '/portfolio',
        '/academy',
        '/contact',
        '/about'
    ];

    // 2. Fetch Dynamic Pages from Firestore
    const [blogs, services, influencers] = await Promise.all([
        db.collection('blog').get(),
        db.collection('services').get(),
        db.collection('influencers').get()
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add Statics
    staticPages.forEach(page => {
        xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Add Blogs
    blogs.docs.forEach(doc => {
        const post = doc.data();
        if (post.slug) {
            xml += `  <url>\n    <loc>${baseUrl}/blog-details.html?slug=${post.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        }
    });

    // Add Services
    services.docs.forEach(doc => {
        xml += `  <url>\n    <loc>${baseUrl}/service-details.html?id=${doc.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Add Influencers
    influencers.docs.forEach(doc => {
        xml += `  <url>\n    <loc>${baseUrl}/influencers/profile.html?id=${doc.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
}));

module.exports = router;
