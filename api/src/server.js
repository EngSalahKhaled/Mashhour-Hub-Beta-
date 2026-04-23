const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const dotenv      = require('dotenv');

// Load environment variables FIRST — before any other imports that read process.env
dotenv.config();

// ─── Firebase Admin (initializes on first require) ────────────────────────────
require('./config/firebase');

const globalErrorHandler = require('./middleware/error');

const app = express();

// Trust reverse proxy for Hostinger / Vercel
app.set('trust proxy', 1);

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting (Public endpoints protection) ─────────────────────────────
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // max 10 submissions per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many submissions. Please try again later.' },
});

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

// ─── Rate Limiting for AI endpoints ───────────────────────────────────────────
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,             // max 10 AI requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many AI requests. Please slow down.' },
});

// ─── API Routes ───────────────────────────────────────────────────────────────

// Apply rate limiting to public endpoints BEFORE the routes
app.use('/api/leads', publicLimiter);
app.use('/api/ai',    aiLimiter);

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/leads',     require('./routes/leads'));
app.use('/api/blog',      require('./routes/blog'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/academy',   require('./routes/academy'));
app.use('/api/prompts',   require('./routes/prompts'));
app.use('/api/tools',     require('./routes/tools'));
app.use('/api/library',   require('./routes/library'));
app.use('/api/pricing',   require('./routes/pricing'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/settings',  require('./routes/settings'));
app.use('/api/media',     require('./routes/media'));
app.use('/api/logs',      require('./routes/logs'));
app.use('/api/influencers', require('./routes/influencers'));
app.use('/api/services',    require('./routes/services'));
app.use('/api/sitemap',     require('./routes/sitemap'));
app.use('/api/auth/portal', require('./routes/portalAuth'));
app.use('/api/portal/profile', require('./routes/portalProfiles'));
app.use('/api/portal/projects', require('./routes/portalProjects'));
app.use('/api/portal/sales', require('./routes/portalSales'));
app.use('/api/portal/apps',  require('./routes/portalApps'));
app.use('/api/portal/academy', require('./routes/portalAcademy'));
app.use('/api/ai',             require('./routes/ai'));
app.use('/api/vault',          require('./routes/vault'));
app.use('/api/portal/notifications', require('./routes/portalNotifications'));
app.use('/api/super-admin',          require('./routes/superAdmin'));

// ERP Modules
app.use('/api/erp/clients',    require('./routes/erp/clients'));
app.use('/api/erp/quotations', require('./routes/erp/quotations'));
app.use('/api/erp/invoices',   require('./routes/erp/invoices'));
app.use('/api/erp/payments',   require('./routes/erp/payments'));

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

app.use(globalErrorHandler);

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
