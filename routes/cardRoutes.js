const express = require('express');
const { body } = require('express-validator');
const cardController = require('../controllers/cardController');

const router = express.Router();

// Validation middleware for card creation and update
const cardValidation = [
  body('name').trim().notEmpty().withMessage('Card name is required'),
  body('closingDay')
    .isInt({ min: 1, max: 31 })
    .withMessage('Closing day must be between 1 and 31'),
  body('dueDay')
    .isInt({ min: 1, max: 31 })
    .withMessage('Due day must be between 1 and 31'),
  body('cardType')
    .isIn(['Credit', 'Debit'])
    .withMessage('Invalid card type'),
  body('lastFourDigits')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('Last four digits must be 4 numeric characters')
];

// Routes for card operations
router.post('/', cardValidation, cardController.createCard);
router.get('/', cardController.getAllCards);
router.get('/:id', cardController.getCardById);
router.put('/:id', cardValidation, cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

module.exports = router;
