const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

// Load environment variables FIRST — before any other imports that read process.env
dotenv.config();

// ─── Firebase Admin (initializes on first require) ────────────────────────────
require('./config/firebase');

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Set CORS_ORIGIN in your Vercel env vars (comma-separated if multiple origins):
//   CORS_ORIGIN=https://your-admin.vercel.app,https://mashhor-hub.com
//
// If unset, all origins are allowed — acceptable for development only.

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : '*';

const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle all preflight (OPTIONS) requests

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/leads',     require('./routes/leads'));
app.use('/api/blog',      require('./routes/blog'));
app.use('/api/portfolio', require('./routes/portfolio'));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
    res.json({
        success:     true,
        status:      'Mashhor Hub API is running ✓',
        environment: process.env.NODE_ENV || 'development',
        timestamp:   new Date().toISOString(),
    });
});

// ─── 404 Catch-All ───────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// ─── Local Development Server ─────────────────────────────────────────────────
// On Vercel the file is imported as a module — listen() must NOT run.
// `require.main === module` is only true when executed directly via `node src/server.js`.

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log('──────────────────────────────────');
        console.log('  🚀 Mashhor Hub API Server');
        console.log(`  Port        : ${PORT}`);
        console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
        console.log('──────────────────────────────────');
    });
}

// ─── Vercel Serverless Export ─────────────────────────────────────────────────
// Vercel imports this file as a module and uses the exported Express app
// as the serverless function handler. This MUST be the default export.

module.exports = app;
