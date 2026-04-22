/**
 * AppError Class
 * Used to represent expected (operational) errors.
 * Distinguishes from programming errors or unhandled exceptions.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Capture stack trace, excluding the constructor call itself
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
