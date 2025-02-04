const USER_ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin'
});

// Expense Types
exports.EXPENSE_TYPES = Object.freeze({
  CARD: 'Card',
  VARIABLE: 'Variable',
  FIXED: 'Fixed'
});

// Recurring Frequencies
exports.RECURRING_FREQUENCIES = Object.freeze({
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom'
});

// Expense Statuses
exports.EXPENSE_STATUSES = Object.freeze({
  PENDING: 'Pending',
  PAID: 'Paid',
  CANCELLED: 'Cancelled'
});

// Card Types
exports.CARD_TYPES = Object.freeze({
  CREDIT: 'Credit',
  DEBIT: 'Debit'
});

// Income Statuses
exports.INCOME_STATUSES = Object.freeze({
  EXPECTED: 'Expected',
  RECEIVED: 'Received',
  CANCELLED: 'Cancelled'
});

// Report Types
exports.REPORT_TYPES = Object.freeze({
  EXPENSE: 'Expense',
  INCOME: 'Income',
  SUMMARY: 'Summary'
});

// Business Day Configuration
exports.BUSINESS_DAYS = Object.freeze([1, 2, 3, 4, 5]); // Monday to Friday

// Validation Constants
exports.VALIDATION = Object.freeze({
  MIN_AMOUNT: 0,
  MAX_INSTALLMENTS: 12,
  MAX_CARD_NAME_LENGTH: 50
});

exports.USER_ROLES = USER_ROLES;
