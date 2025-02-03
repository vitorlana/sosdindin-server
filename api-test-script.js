const axios = require('axios');

class APITestSuite {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.axios = axios.create({ baseURL });
    this.token = null;
  }

  async runAllTests() {
    console.log('Starting API Test Suite...');
    await this.testUserOperations();
    await this.testCardOperations();
    await this.testExpenseOperations();
    await this.testIncomeOperations();
    await this.testReportGeneration();
    console.log('API Test Suite Completed.');
  }

  async testUserOperations() {
    console.log('\n--- User Operations Tests ---');
    try {
      // Register User
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      };
      const registerResponse = await this.axios.post('/users/register', newUser);
      console.log('User Registration ✓', registerResponse.data.message);

      // Login User
      const loginResponse = await this.axios.post('/users/login', {
        email: newUser.email,
        password: newUser.password
      });
      this.token = loginResponse.data.token;
      console.log('User Login ✓', this.token);
    } catch (error) {
      console.error('User Operations Test Failed:', error.response?.data || error.message);
    }
  }

  async testCardOperations() {
    console.log('\n--- Card Operations Tests ---');
    try {
      // Create 5 Credit Cards
      for (let i = 1; i <= 5; i++) {
        const newCard = {
          name: `Test Credit Card ${i}`,
          closingDay: 15,
          dueDay: 25,
          cardType: 'Credit',
          lastFourDigits: `123${i}`
        };
        const createResponse = await this.axios.post('/cards', newCard, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        console.log(`Card Creation ${i} ✓`, createResponse.data._id);
      }

      // Get All Cards
      const listResponse = await this.axios.get('/cards', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Card Listing ✓', listResponse.data.length);

      // Update Card
      const cardId = listResponse.data[0]._id;
      const updateResponse = await this.axios.put(`/cards/${cardId}`, {
        name: 'Updated Test Card',
        closingDay: 15,
        dueDay: 25,
        cardType: 'Credit',
        lastFourDigits: '1234'
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Card Update ✓', updateResponse.data.name);

      // Delete Card
      await this.axios.delete(`/cards/${cardId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
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
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const cardId = cardResponse.data._id;

      // Create Expenses for 2 Months
      for (let month = 0; month < 2; month++) {
        const newExpense = {
          type: 'Card',
          amount: 250.50,
          date: new Date(new Date().setMonth(new Date().getMonth() - month)),
          card: cardId,
          tag: 'Test Expense',
          installments: {
            current: 1,
            total: 3
          }
        };
        const createResponse = await this.axios.post('/expenses', newExpense, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        console.log(`Expense Creation Month ${month + 1} ✓`, createResponse.data._id);
      }

      // Get Expenses
      const listResponse = await this.axios.get('/expenses', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Expense Listing ✓', listResponse.data.length);

      // Update Expense
      const expenseId = listResponse.data[0]._id;
      const updateResponse = await this.axios.put(`/expenses/${expenseId}`, {
        amount: 300.75
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Expense Update ✓', updateResponse.data.amount);
    } catch (error) {
      console.error('Expense Operations Test Failed:', error.response?.data || error.message);
    }
  }

  async testIncomeOperations() {
    console.log('\n--- Income Operations Tests ---');
    try {
      // Create Incomes for 2 Months
      for (let month = 0; month < 2; month++) {
        const newIncome = {
          amount: 5000,
          date: new Date(new Date().setMonth(new Date().getMonth() - month)),
          source: 'Salary',
          tag: 'Monthly Income',
          recurring: {
            isRecurring: true,
            frequency: 'Monthly'
          }
        };
        const createResponse = await this.axios.post('/incomes', newIncome, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        console.log(`Income Creation Month ${month + 1} ✓`, createResponse.data._id);
      }

      // Get Incomes
      const listResponse = await this.axios.get('/incomes', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Income Listing ✓', listResponse.data.length);

      // Update Income
      const incomeId = listResponse.data[0]._id;
      const updateResponse = await this.axios.put(`/incomes/${incomeId}`, {
        amount: 5500
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
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
      const expenseReportResponse = await this.axios.get('/reports/expenses', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Expense Report Generation ✓', expenseReportResponse.data);

      // Generate Income Report
      const incomeReportResponse = await this.axios.get('/reports/incomes', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Income Report Generation ✓', incomeReportResponse.data);

      // Generate Financial Summary
      const summaryResponse = await this.axios.get('/reports/summary', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Financial Summary Generation ✓', summaryResponse.data);
    } catch (error) {
      console.error('Report Generation Test Failed:', error.response?.data || error.message);
    }
  }
}

// Run the tests
const testSuite = new APITestSuite();
testSuite.runAllTests().catch(console.error);
