const mongoose = require('mongoose');
const { 
  EXPENSE_TYPES, 
  EXPENSE_STATUSES, 
  RECURRING_FREQUENCIES 
} = require('../config/constants');

const ExpenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(EXPENSE_TYPES),
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  tag: {
    type: String,
    trim: true
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: function() {
      return this.type === EXPENSE_TYPES.CARD;
    }
  },
  installments: {
    current: {
      type: Number,
      default: 1,
      min: 1
    },
    total: {
      type: Number,
      default: 1,
      min: 1,
      max: 12
    }
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: Object.values(RECURRING_FREQUENCIES)
    },
    endDate: Date
  },
  status: {
    type: String,
    enum: Object.values(EXPENSE_STATUSES),
    default: EXPENSE_STATUSES.PENDING
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to calculate remaining installments
ExpenseSchema.virtual('remainingInstallments').get(function() {
  return this.installments.total - this.installments.current;
});

// Pre-save middleware for installment tracking
ExpenseSchema.pre('save', function(next) {
  if (this.type === EXPENSE_TYPES.CARD && this.installments.total > 1) {
    // Additional logic for managing installment expenses
    const installmentAmount = this.amount / this.installments.total;
    // You could generate future expense records here
  }
  next();
});

module.exports = mongoose.model('Expense', ExpenseSchema);
