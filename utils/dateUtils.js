const { BUSINESS_DAYS } = require('../config/constants');

class DateUtils {
  // Find next business day
  static findNextBusinessDay(date) {
    let nextDate = new Date(date);
    while (!this.isBusinessDay(nextDate)) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate;
  }

  // Find previous business day
  static findPreviousBusinessDay(date) {
    let prevDate = new Date(date);
    while (!this.isBusinessDay(prevDate)) {
      prevDate.setDate(prevDate.getDate() - 1);
    }
    return prevDate;
  }

  // Check if date is a business day
  static isBusinessDay(date) {
    return BUSINESS_DAYS.includes(date.getDay());
  }

  // Calculate days between two dates
  static daysBetween(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((endDate - startDate) / oneDay));
  }

  // Calculate next occurrence for recurring events
  static calculateNextOccurrence(baseDate, frequency) {
    const nextDate = new Date(baseDate);
    
    switch (frequency) {
      case 'Daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'Weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'Monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'Yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return null;
    }

    return nextDate;
  }

  // Adjust date to billing cycle
  static adjustToBillingCycle(date, closingDay, dueDay) {
    const adjustedDate = new Date(date);
    const currentMonth = adjustedDate.getMonth();
    const currentYear = adjustedDate.getFullYear();

    // Determine billing cycle dates
    const cycleClosing = new Date(currentYear, currentMonth, closingDay);
    const cycleDue = new Date(currentYear, currentMonth, dueDay);

    // Adjust if date is after closing day
    if (adjustedDate > cycleClosing) {
      cycleClosing.setMonth(currentMonth + 1);
      cycleDue.setMonth(currentMonth + 1);
    }

    return {
      cycleClosing,
      cycleDue
    };
  }
}

module.exports = DateUtils;
