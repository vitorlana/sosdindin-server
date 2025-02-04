const express = require('express');
const { body, query } = require('express-validator');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

// Validation middleware for expense creation and update
const expenseValidation = [
  body('type')
    .isIn(['Card', 'Variable', 'Fixed'])
    .withMessage('Invalid expense type'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format'),
  body('card')
    .optional()
    .custom((value, { req }) => {
      return req.body.type === 'Card' ? !!value : true;
    })
    .withMessage('Card is required for card expenses')
];

// Query validation for expense listing
const expenseQueryValidation = [
  query('type')
    .optional()
    .isIn(['Card', 'Variable', 'Fixed'])
    .withMessage('Invalid expense type'),
  query('startDate')
    .optional()
    .isISO8601()
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
];

// Routes for expense operations
router.post('/', expenseValidation, expenseController.createExpense);
router.get('/', expenseQueryValidation, expenseController.getAllExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', expenseValidation, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;