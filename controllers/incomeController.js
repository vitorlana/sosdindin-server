const Income = require('../models/Income');
const { validationResult } = require('express-validator');

exports.createIncome = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const income = new Income(req.body);
    
    // Handle recurring income next occurrence
    if (income.recurring.isRecurring) {
      income.recurring.nextOccurrence = calculateNextOccurrence(
        income.date, 
        income.recurring.frequency
      );
    }

    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating income', 
      error: error.message 
    });
  }
};

exports.getAllIncomes = async (req, res) => {
  try {
    const { source, tag, startDate, endDate, status } = req.query;
    const filter = {};

    if (source) filter.source = source;
    if (tag) filter.tag = tag;
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const incomes = await Income.find(filter)
      .sort({ date: -1 });

    res.json(incomes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching incomes', 
      error: error.message 
    });
  }
};

exports.getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching income', 
      error: error.message 
    });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const income = await Income.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating income', 
      error: error.message 
    });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting income', 
      error: error.message 
    });
  }
};

// Utility function to calculate next occurrence
function calculateNextOccurrence(date, frequency) {
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
