const AppError = require('../utils/AppError');

/**
 * Role Authorization Middleware
 * Must be used AFTER the standard `auth.js` middleware.
 * Checks if the authenticated user's role matches one of the required roles.
 * 
 * @param {...String} roles - Allowed roles (e.g., 'superadmin', 'admin')
 * @returns {Function} - Express middleware
 */
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        // Check if user object exists (should be set by auth middleware)
        if (!req.admin || !req.admin.role) {
            return next(new AppError('Unauthorized: No role assigned to this user.', 403));
        }

        // Check if user's role is included in the allowed roles
        if (!roles.includes(req.admin.role)) {
            return next(new AppError('Forbidden: You do not have permission to perform this action.', 403));
        }

        next();
    };
};

module.exports = authorizeRole;
