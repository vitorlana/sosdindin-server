const axios = require('axios');

class APITestSuite {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.axios = axios.create({ baseURL });
  }

  async runAllTests() {
    console.log('Starting API Test Suite...');
    await this.testCardOperations();
    await this.testExpenseOperations();
    await this.testIncomeOperations();
    await this.testReportGeneration();
    console.log('API Test Suite Completed.');
  }

  async testCardOperations() {
    console.log('\n--- Card Operations Tests ---');
    try {
      // Create Card
      const newCard = {
        name: 'Test Credit Card',
        closingDay: 15,
        dueDay: 25,
        cardType: 'Credit',
        lastFourDigits: '1234'
      };
      const createResponse = await this.axios.post('/cards', newCard);
      console.log('Card Creation ✓', createResponse.data._id);

      // Get All Cards
      const listResponse = await this.axios.get('/cards');
      console.log('Card Listing ✓', listResponse.data.length);

      // Update Card
      const cardId = createResponse.data._id;
      const updateResponse = await this.axios.put(`/cards/${cardId}`, {
        ...newCard,
        name: 'Updated Test Card'
      });
      console.log('Card Update ✓', updateResponse.data.name);

      // Delete Card
      await this.axios.delete(`/cards/${cardId}`);
      console.log('Card Deletion ✓');
    } catch (error) {
      console.error('Card Operations Test Failed:', error.response?.data || error.message);
    }
  }

  async testExpenseOperations() {
    console.log('\n--- Expense Operations Tests ---');
    try {
      // Create Card for Expense
      const cardResponse = await this.axios.post('/cards', {
        name: 'Expense Test Card',
        closingDay: 15,
        dueDay: 25,
        cardType: 'Credit',
        lastFourDigits: '5678'
      });
      const cardId = cardResponse.data._id;

      // Create Expense
      const newExpense = {
        type: 'Card',
        amount: 250.50,
        date: new Date(),
        card: cardId,
        tag: 'Test Expense',
        installments: {
          current: 1,
          total: 3
        }
      };
      const createResponse = await this.axios.post('/expenses', newExpense);
      console.log('Expense Creation ✓', createResponse.data._id);

      // Get Expenses
      const listResponse = await this.axios.get('/expenses');
      console.log('Expense Listing ✓', listResponse.data.length);

      // Update Expense
      const expenseId = createResponse.data._id;
      const updateResponse = await this.axios.put(`/expenses/${expenseId}`, {
        ...newExpense,
        amount: 300.75
      });
      console.log('Expense Update ✓', updateResponse.data.amount);
    } catch (error) {
      console.error('Expense Operations Test Failed:', error.response?.data || error.message);
    }
  }

  async testIncomeOperations() {
    console.log('\n--- Income Operations Tests ---');
    try {
      // Create Income
      const newIncome = {
        amount: 5000,
        date: new Date(),
        source: 'Salary',
        tag: 'Monthly Income',
        recurring: {
          isRecurring: true,
          frequency: 'Monthly'
        }
      };
      const createResponse = await this.axios.post('/incomes', newIncome);
      console.log('Income Creation ✓', createResponse.data._id);

      // Get Incomes
      const listResponse = await this.axios.get('/incomes');
      console.log('Income Listing ✓', listResponse.data.length);

      // Update Income
      const incomeId = createResponse.data._id;
      const updateResponse = await this.axios.put(`/incomes/${incomeId}`, {
        ...newIncome,
        amount: 5500
      });
      console.log('Income Update ✓', updateResponse.data.amount);
    } catch (error) {
      console.error('Income Operations Test Failed:', error.response?.data || error.message);
    }
  }

  async testReportGeneration() {
    console.log('\n--- Report Generation Tests ---');
    try {
      // Generate Expense Report
      const expenseReportResponse = await this.axios.get('/reports/expenses');
      console.log('Expense Report Generation ✓', expenseReportResponse.data);

      // Generate Income Report
      const incomeReportResponse = await this.axios.get('/reports/incomes');
      console.log('Income Report Generation ✓', incomeReportResponse.data);

      // Generate Financial Summary
      const summaryResponse = await this.axios.get('/reports/summary');
      console.log('Financial Summary Generation ✓', summaryResponse.data);
    } catch (error) {
      console.error('Report Generation Test Failed:', error.response?.data || error.message);
    }
  }
}

// Run the tests
const testSuite = new APITestSuite();
testSuite.runAllTests().catch(console.error);
