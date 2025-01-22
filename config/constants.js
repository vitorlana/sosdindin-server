// Expense Types
exports.EXPENSE_TYPES = {
  CARD: 'Card',
  VARIABLE: 'Variable',
  FIXED: 'Fixed'
};

// Recurring Frequencies
exports.RECURRING_FREQUENCIES = {
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom'
};

// Expense Statuses
exports.EXPENSE_STATUSES = {
  PENDING: 'Pending',
  PAID: 'Paid',
  CANCELLED: 'Cancelled'
};

// Card Types
exports.CARD_TYPES = {
  CREDIT: 'Credit',
  DEBIT: 'Debit'
};

// Income Statuses
exports.INCOME_STATUSES = {
  EXPECTED: 'Expected',
  RECEIVED: 'Received',
  CANCELLED: 'Cancelled'
};

// Report Types
exports.REPORT_TYPES = {
  EXPENSE: 'Expense',
  INCOME: 'Income',
  SUMMARY: 'Summary'
};

// Business Day Configuration
exports.BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday

// Validation Constants
exports.VALIDATION = {
  MIN_AMOUNT: 0,
  MAX_INSTALLMENTS: 12,
  MAX_CARD_NAME_LENGTH: 50
};
