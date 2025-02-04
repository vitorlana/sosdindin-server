const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  generateExpenseReport, 
  generateIncomeReport,
  generateFinancialSummary 
} = require('../controllers/reportController');

// Report routes
router.get('/expenses', auth, generateExpenseReport);
router.get('/income', auth, generateIncomeReport); // Changed from '/incomes' to '/income'
router.get('/summary', auth, generateFinancialSummary);

module.exports = router;
