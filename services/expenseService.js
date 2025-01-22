const Expense = require('../models/Expense');
const Card = require('../models/Card');

class ExpenseService {
  async createExpense(expenseData) {
    const session = await Expense.startSession();
    try {
      session.startTransaction();

      const expense = new Expense(expenseData);

      // Handle card expense specific logic
      if (expense.type === 'Card' && expense.card) {
        const card = await Card.findById(expense.card);
        if (!card) {
          throw new Error('Card not found');
        }
        
        // Update card balance
        card.balance += expense.amount;
        await card.save({ session });
      }

      // Handle installment expenses
      if (expense.installments.total > 1) {
        expense.installments.current = 1;
        await this.createInstallmentExpenses(expense, session);
      }

      await expense.save({ session });
      await session.commitTransaction();
      return expense;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async createInstallmentExpenses(baseExpense, session) {
    const installmentExpenses = [];

    for (let i = 2; i <= baseExpense.installments.total; i++) {
      const installmentExpense = new Expense({
        ...baseExpense.toObject(),
        _id: undefined, // Create new document
        installments: {
          current: i,
          total: baseExpense.installments.total
        },
        date: this.calculateNextInstallmentDate(baseExpense.date, i)
      });

      await installmentExpense.save({ session });
      installmentExpenses.push(installmentExpense);
    }

    return installmentExpenses;
  }

  calculateNextInstallmentDate(baseDate, installmentNumber) {
    const nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + (installmentNumber - 1));
    return nextDate;
  }

  async getAllExpenses(filter = {}, options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sort = { date: -1 } 
    } = options;

    return Expense.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('card');
  }

  async getExpensesByRecurringType(type) {
    return Expense.find({ 
      'recurringDetails.frequency': type 
    });
  }

  async updateExpense(id, updateData) {
    return Expense.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async deleteExpense(id) {
    return Expense.findByIdAndDelete(id);
  }
}

module.exports = new ExpenseService();
