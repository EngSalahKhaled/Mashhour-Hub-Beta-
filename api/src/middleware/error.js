const AppError = require('../utils/AppError');

/**
 * Global Error Handling Middleware
 * Centralizes error responses and formatting.
 */
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Development Mode: Send detailed error with stack trace
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[SERVER ERROR - ${req.method} ${req.originalUrl}]`, err);
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
    }

    // Production Mode: Send clean error messages, hide internal details for non-operational errors
    if (err.isOperational) {
        // Operational, trusted error: send message to client
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        });
    }

    // Programming or other unknown error: don't leak error details
    console.error(`[CRITICAL ERROR - ${req.method} ${req.originalUrl}]`, err);
    return res.status(500).json({
        success: false,
        status: 'error',
        message: err.message || 'Something went very wrong. Internal Server Error.',
        stack: err.stack
    });
};

module.exports = globalErrorHandler;
