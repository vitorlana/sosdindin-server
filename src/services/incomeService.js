const Income = require('../models/Income');

class IncomeService {
  async createIncome(incomeData) {
    try {
      const income = new Income(incomeData);

      // Handle recurring income
      if (income.recurring.isRecurring) {
        income.recurring.nextOccurrence = this.calculateNextOccurrence(
          income.date, 
          income.recurring.frequency
        );
      }

      await income.save();
      return income;
    } catch (error) {
      throw new Error(`Failed to create income: ${error.message}`);
    }
  }

  calculateNextOccurrence(date, frequency) {
    const nextDate = new Date(date);
    
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

  async getAllIncomes(filter = {}, options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sort = { date: -1 } 
    } = options;

    return Income.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async getRecurringIncomes() {
    return Income.find({ 'recurring.isRecurring': true });
  }

  async updateIncome(id, updateData) {
    return Income.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async deleteIncome(id) {
    return Income.findByIdAndDelete(id);
  }

  async calculateTotalIncome(filter = {}) {
    const result = await Income.aggregate([
      { $match: filter },
      { $group: { 
        _id: null, 
        total: { $sum: '$amount' } 
      }}
    ]);

    return result[0] ? result[0].total : 0;
  }
}

module.exports = new IncomeService();
