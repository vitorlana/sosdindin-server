const jwt = require('jsonwebtoken');

class AuthMiddleware {
  // Verify JWT token
  static authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
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

module.exports = AuthMiddleware;
