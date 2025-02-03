const mongoose = require('mongoose');
const { CARD_TYPES } = require('../config/constants');

const CardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  brand: {
    type: String,
    trim: true
  },
  closingDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  dueDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  cardType: {
    type: String,
    enum: Object.values(CARD_TYPES),
    required: true
  },
  lastFourDigits: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid last 4 digits!`
    }
  },
  creditLimit: {
    type: Number,
    min: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

// Virtual to calculate available credit
CardSchema.virtual('availableCredit').get(function() {
  return this.cardType === 'Credit' 
    ? this.creditLimit - this.balance 
    : null;
});

// Method to update balance
CardSchema.methods.updateBalance = function(amount) {
  if (this.cardType === 'Credit') {
    this.balance += amount;
  }
  return this.save();
};

module.exports = mongoose.model('Card', CardSchema);
