const express = require('express');
const { query } = require('express-validator');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Validation middleware for report queries
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
];

// Routes for generating reports
router.get('/expenses', dateRangeValidation, reportController.generateExpenseReport);
router.get('/incomes', dateRangeValidation, reportController.generateIncomeReport);
router.get('/summary', dateRangeValidation, reportController.generateFinancialSummary);

module.exports = router;
