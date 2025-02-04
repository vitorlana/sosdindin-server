const jwt = require('jsonwebtoken');

const jwtInterceptor = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.token = token;
    } catch (error) {
      // Don't throw error here, just add error info to request
      req.jwtError = {
        message: error.message,
        name: error.name
      };
    }
  }

  next();
};

module.exports = jwtInterceptor;
