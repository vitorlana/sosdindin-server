const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const AuthMiddleware = require('../middlewares/validationMiddleware');

const router = express.Router();

// Validation middleware for user registration and login
const userValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Routes for user operations
router.post('/register', userValidation, userController.registerUser);
router.post('/login', userValidation, userController.loginUser);
router.get('/me', AuthMiddleware.authenticateToken, userController.getUserDetails);

module.exports = router;
