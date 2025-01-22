const express = require('express');
const { body, query } = require('express-validator');
const incomeController = require('../controllers/incomeController');

const router = express.Router();

// Validation middleware for income creation and update
const incomeValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Income source is required'),
  body('recurring.isRecurring')
    .optional()
    .isBoolean(),
  body('recurring.frequency')
    .optional()
    .isIn(['Daily', 'Weekly', 'Monthly', 'Yearly'])
];

// Query validation for income listing
const incomeQueryValidation = [
  query('source')
    .optional()
    .trim(),
  query('startDate')
    .optional()
    .isISO8601()
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .toDate(),
  query('status')
    .optional()
    .isIn(['Expected', 'Received', 'Cancelled'])
];

// Routes for income operations
router.post('/', incomeValidation, incomeController.createIncome);
router.get('/', incomeQueryValidation, incomeController.getAllIncomes);
router.get('/:id', incomeController.getIncomeById);
router.put('/:id', incomeValidation, incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
