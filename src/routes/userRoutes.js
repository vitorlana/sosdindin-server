const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const {
  AuthMiddleware,
  userRegistrationValidation,
  userLoginValidation,
} = require("../middlewares/validationMiddleware");
const router = express.Router();

// Routes for user operations
router.post("/register", userRegistrationValidation, userController.registerUser);
router.post("/login", userLoginValidation, userController.loginUser);
router.get(
  "/me",
  AuthMiddleware.authenticateToken,
  userController.getUserDetails,
);

module.exports = router;