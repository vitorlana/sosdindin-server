const jwt = require('jsonwebtoken');
const { body } = require('express-validator');

class AuthMiddleware {
  // Verify JWT token
  static authenticateToken(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ 
        message: req.jwtError?.message || 'Authentication required' 
      });
    }
    next();
  }

  // Generate JWT token
  static generateToken(payload) {
    return jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );
  }

  // Optional role-based access control
  static requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    };
  }
}

// Validation rules for user registration
const userRegistrationValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Validation rules for user login
const userLoginValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
  AuthMiddleware,
  userRegistrationValidation,
  userLoginValidation
};
