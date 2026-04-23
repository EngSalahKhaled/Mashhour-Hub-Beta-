const express = require('express');
const router  = express.Router();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * GA4 Analytics Service
 * Proxies Google Analytics Data API to the dashboard.
 */

const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '0'; // User must set this
const KEY_FILE = path.resolve(__dirname, '../config/service-account.json');

let analyticsClient;
try {
    if (fs.existsSync(KEY_FILE)) {
        analyticsClient = new BetaAnalyticsDataClient({
            keyFilename: KEY_FILE,
        });
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
        try { if (rawKey.trim().startsWith('"')) rawKey = JSON.parse(rawKey); } catch (e) {}
        rawKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '').replace(/'/g, '').trim();
        if (rawKey && !rawKey.includes('\n')) {
            rawKey = rawKey.replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n');
            rawKey = rawKey.replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----');
            const parts = rawKey.split('\n');
            if (parts.length === 3) { parts[1] = parts[1].replace(/\s+/g, '\n'); rawKey = parts.join('\n'); }
        }

        analyticsClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: rawKey
            }
        });
    }
} catch (e) {
    console.error("Analytics init failed:", e.message);
}

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
// Returns key metrics: Active Users (Realtime), Top Source, Daily Visits.
router.get('/overview', auth, asyncHandler(async (req, res) => {
    if (!analyticsClient) {
        return res.json({ 
            success: true, 
            mode: 'demo', 
            data: {
                activeUsers: 12,
                topSource: 'Direct',
                dailyVisits: [
                    { date: '20260415', sessions: 120 },
                    { date: '20260416', sessions: 150 },
                    { date: '20260417', sessions: 180 },
                    { date: '20260418', sessions: 140 },
                    { date: '20260419', sessions: 210 },
                    { date: '20260420', sessions: 250 },
                    { date: '20260421', sessions: 310 },
                ]
            }
        });
    }

    // 1. Fetch Realtime Active Users
    const [realtimeResponse] = await analyticsClient.runRealtimeReport({
        property: `properties/${PROPERTY_ID}`,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
    });

    const activeUsersCount = realtimeResponse.rows?.reduce((acc, row) => acc + parseInt(row.metricValues[0].value), 0) || 0;

    // 2. Fetch Sessions & Sources (Last 7 Days)
    const [reportResponse] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }, { name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
    });

    // Process report data...
    const dailyData = {};
    let topSource = 'N/A';
    let maxSourceCount = 0;
    const sourceCounts = {};

    reportResponse.rows?.forEach(row => {
        const date = row.dimensionValues[0].value;
        const source = row.dimensionValues[1].value;
        const count = parseInt(row.metricValues[0].value);

        dailyData[date] = (dailyData[date] || 0) + count;
        sourceCounts[source] = (sourceCounts[source] || 0) + count;
        if (sourceCounts[source] > maxSourceCount) {
            maxSourceCount = sourceCounts[source];
            topSource = source;
        }
    });

    res.json({
        success: true,
        mode: 'live',
        data: {
            activeUsers: activeUsersCount,
            topSource: topSource,
            dailyVisits: Object.entries(dailyData).map(([date, sessions]) => ({ date, sessions })),
        }
    });
}));

module.exports = router;
