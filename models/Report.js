const mongoose = require('mongoose');
const { REPORT_TYPES } = require('../config/constants');

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(REPORT_TYPES),
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  details: [{
    date: Date,
    amount: Number,
    category: String,
    description: String
  }],
  metadata: {
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card'
    },
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to calculate average daily amount
ReportSchema.virtual('averageDailyAmount').get(function() {
  const days = (this.endDate - this.startDate) / (1000 * 60 * 60 * 24);
  return days > 0 ? this.totalAmount / days : 0;
});

module.exports = mongoose.model('Report', ReportSchema);
