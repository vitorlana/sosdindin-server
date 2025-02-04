const { VALIDATION } = require('../config/constants');

class ValidationUtils {
  // Validate amount
  static validateAmount(amount) {
    if (typeof amount !== 'number' || amount < VALIDATION.MIN_AMOUNT) {
      throw new Error(`Invalid amount. Must be >= ${VALIDATION.MIN_AMOUNT}`);
    }
  }

  // Validate installments
  static validateInstallments(current, total) {
    if (current < 1 || total < 1 || total > VALIDATION.MAX_INSTALLMENTS) {
      throw new Error(`Invalid installments. Current must be >= 1, total must be <= ${VALIDATION.MAX_INSTALLMENTS}`);
    }
  }

  // Validate card name
  static validateCardName(name) {
    if (!name || name.length > VALIDATION.MAX_CARD_NAME_LENGTH) {
      throw new Error(`Card name must be <= ${VALIDATION.MAX_CARD_NAME_LENGTH} characters`);
    }
  }

  // Validate date range
  static validateDateRange(startDate, endDate) {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error('Invalid date format');
    }
    
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }
  }

  // Sanitize input string
  static sanitizeString(input) {
    return input 
      ? input.trim().replace(/[<>]/g, '')  // Remove HTML tags
      : '';
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }
}

module.exports = ValidationUtils;
