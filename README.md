# Expense Management System

## Project Structure
```
expense-management/
│
├── config/
│   ├── database.js
│   └── constants.js
│
├── models/
│   ├── Card.js
│   ├── Expense.js
│   ├── Income.js
│   └── Report.js
│   └── User.js
│
├── controllers/
│   ├── cardController.js
│   ├── expenseController.js
│   ├── incomeController.js
│   └── reportController.js
│   └── userController.js
│
├── routes/
│   ├── cardRoutes.js
│   ├── expenseRoutes.js
│   ├── incomeRoutes.js
│   ├── reportRoutes.js
│   └── userRoutes.js
│
├── services/
│   ├── expenseService.js
│   ├── incomeService.js
│   └── reportService.js
│
├── utils/
│   ├── dateUtils.js
│   └── validationUtils.js
│
├── middlewares/
│   └── validationMiddleware.js
│
├── .env
├── app.js
├── package.json
└── README.md
```

## Endpoints

### Cards
- `POST /api/cards`: Create a new card
- `GET /api/cards`: List all cards
- `GET /api/cards/:id`: Get specific card details
- `PUT /api/cards/:id`: Update card
- `DELETE /api/cards/:id`: Delete card

### Expenses
- `POST /api/expenses`: Add new expense
- `GET /api/expenses`: List expenses
- `GET /api/expenses/:id`: Get specific expense
- `PUT /api/expenses/:id`: Update expense
- `DELETE /api/expenses/:id`: Delete expense

### Incomes
- `POST /api/incomes`: Add new income
- `GET /api/incomes`: List incomes
- `GET /api/incomes/:id`: Get specific income
- `PUT /api/incomes/:id`: Update income
- `DELETE /api/incomes/:id`: Delete income

### Reports
- `GET /api/reports/expenses/current`: Current month expense report
- `GET /api/reports/expenses/future`: Future expense projection
- `GET /api/reports/incomes`: Income report
- `GET /api/reports/summary`: Overall financial summary

### Users
- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: Login a user
- `GET /api/users/me`: Get user details

## Database Schema

### Card Model
- name: String
- closingDay: Number
- dueDay: Number
- cardType: Enum (Credit, Debit)

### Expense Model
- type: Enum (Card, Variable, Fixed)
- amount: Number
- date: Date
- tag: String
- card: Reference to Card (if type is Card)
- installments: Number
- recurringDetails: {
    frequency: Enum (Monthly, Yearly)
    endDate: Date
}

### Income Model
- amount: Number
- date: Date
- tag: String
- type: String

### Report Model
- type: Enum (Expense, Income, Summary)
- startDate: Date
- endDate: Date
- totalAmount: Number
- details: Array

### User Model
- username: String
- email: String
- password: String
- role: Enum (user, admin)
```

## Key Requirements Implementation Notes
1. Support for different expense types (Card, Variable, Fixed)
2. Card-based expense tracking
3. Installment support
4. Reporting mechanism for current and future expenses
5. Flexible date handling for business days
6. Tagging system for expenses and incomes
7. Aggregation of expenses across cards
8. Projection of future financial state
9. User registration and authentication
```

