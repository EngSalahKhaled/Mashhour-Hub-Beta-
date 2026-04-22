/**
 * Mashhor Hub - Hostinger Entry Point
 * This file serves as the main application entry point for Hostinger's Node.js Selector.
 */

const app = require('./src/server');

// Hostinger assigns a port via the PORT environment variable
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 API Server live on Hostinger (Port: ${PORT})`);
});
