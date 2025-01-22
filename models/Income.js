const mongoose = require('mongoose');
const { INCOME_STATUSES } = require('../config/constants');

const IncomeSchema = new mongoose.Schema({
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
  source: {
    type: String,
    trim: true,
    required: true
  },
  tag: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(INCOME_STATUSES),
    default: INCOME_STATUSES.EXPECTED
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Yearly']
    },
    nextOccurrence: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Method to mark income as received
IncomeSchema.methods.markAsReceived = function() {
  this.status = INCOME_STATUSES.RECEIVED;
  return this.save();
};

// Virtual to check if income is overdue
IncomeSchema.virtual('isOverdue').get(function() {
  return this.status === INCOME_STATUSES.EXPECTED && this.date < new Date();
});

module.exports = mongoose.model('Income', IncomeSchema);
