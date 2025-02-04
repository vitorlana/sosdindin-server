const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Report = require('../models/Report');

class ReportService {
  async generateExpenseReport(options = {}) {
    const { startDate, endDate, cardId, tag } = options;
    const filter = {
      date: {
        $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: new Date(endDate || Date.now())
      }
    };

    if (cardId) filter.card = cardId;
    if (tag) filter.tag = tag;

    const expenses = await Expense.aggregate([
      { $match: filter },
      { 
        $group: {
          _id: { 
            month: { $month: '$date' }, 
            year: { $year: '$date' },
            tag: '$tag'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return new Report({
      type: 'Expense',
      startDate: filter.date.$gte,
      endDate: filter.date.$lte,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.total, 0),
      details: expenses.map(exp => ({
        date: new Date(exp._id.year, exp._id.month - 1),
        amount: exp.total,
        category: exp._id.tag
      }))
    });
  }

  async generateIncomeReport(options = {}) {
    const { startDate, endDate, source, tag } = options;
    const filter = {
      date: {
        $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: new Date(endDate || Date.now())
      }
    };

    if (source) filter.source = source;
    if (tag) filter.tag = tag;

    const incomes = await Income.aggregate([
      { $match: filter },
      { 
        $group: {
          _id: { 
            month: { $month: '$date' }, 
            year: { $year: '$date' },
            source: '$source'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return new Report({
      type: 'Income',
      startDate: filter.date.$gte,
      endDate: filter.date.$lte,
      totalAmount: incomes.reduce((sum, inc) => sum + inc.total, 0),
      details: incomes.map(inc => ({
        date: new Date(inc._id.year, inc._id.month - 1),
        amount: inc.total,
        category: inc._id.source
      }))
    });
  }

  async generateFinancialSummary(options = {}) {
    const { startDate, endDate } = options;
    const dateFilter = {
      $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: new Date(endDate || Date.now())
    };

    const [expenses, incomes] = await Promise.all([
      Expense.aggregate([
        { $match: { date: dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { date: dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    return new Report({
      type: 'Summary',
      startDate: dateFilter.$gte,
      endDate: dateFilter.$lte,
      totalAmount: (incomes[0]?.total || 0) - (expenses[0]?.total || 0),
      details: [
        { 
          category: 'Total Income', 
          amount: incomes[0]?.total || 0 
        },
        { 
          category: 'Total Expenses', 
          amount: expenses[0]?.total || 0 
        }
      ]
    });
  }
}

module.exports = new ReportService();
