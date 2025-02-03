const Expense = require('../models/Expense');
const Card = require('../models/Card');
const { validationResult } = require('express-validator');

exports.createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = new Expense({
      ...req.body,
      user: req.user.id
    });

    // Handle card balance update for card expenses
    if (expense.type === 'Card' && expense.card) {
      const card = await Card.findById(expense.card);
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
      await card.updateBalance(expense.amount);
    }

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error: error.message });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const { type, tag, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (type) filter.type = type;
    if (tag) filter.tag = tag;
    if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const expenses = await Expense.find(filter)
      .populate('card')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('card');
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};
