// backend/middleware/role.js

/**
 * Middleware factory that checks if the authenticated user has one of the allowed roles
 * @param {...string} allowedRoles - e.g. 'HSE', or 'HSE', 'Admin'
 * @returns {Function} express middleware
 */
// middleware/role.js
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Role not found in token' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

export default restrictTo;