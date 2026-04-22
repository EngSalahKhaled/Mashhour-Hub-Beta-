/**
 * Async Handler Wrapper
 * Catches errors in async route handlers and passes them to the global error handler (next).
 * This eliminates the need for repetitive try/catch blocks in every route.
 * 
 * @param {Function} fn - The asynchronous Express route handler or middleware.
 * @returns {Function} - A middleware function that wraps the handler.
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;
