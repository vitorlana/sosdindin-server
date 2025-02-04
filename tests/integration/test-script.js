const axios = require('axios');
const fs = require('fs').promises;
const mongoose = require('mongoose');


const MONGODB_URI="mongodb+srv://vitorhugolana:Wd3VynqCmaJ7QtbB@sos-dindin.ninxu.mongodb.net/?retryWrites=true&w=majority&appName=sos-dindin";

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
  role: 'user'
};

// Store tokens and IDs
let authToken = '';
let cardId = '';
let expenseId = '';
let incomeId = '';


// Database connection and cleanup
async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to database');
    
    // Drop the development database
    console.log('Dropping development database...');
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed\n');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}


// Error logging function
async function logError(error, context) {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    error: {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data
      }
    }
  };

  const logEntry = `\n${'-'.repeat(80)}\n${JSON.stringify(errorLog, null, 2)}\n${'-'.repeat(80)}\n`;
  
  try {
    await fs.appendFile('api_error_log.txt', logEntry);
    console.error(`Error logged to api_error_log.txt`);
  } catch (fileError) {
    console.error('Failed to write to error log:', fileError);
  }
}

// Helper function to make authenticated requests
const authenticatedRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      ...(data && { data })
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    await logError(error, `${method.toUpperCase()} ${endpoint}`);
    throw error;
  }
};

// Main testing function
async function runTests() {
  try {

    await setupDatabase();


    console.log('Starting API tests...\n');

    // 1. User Registration
    console.log('1. Testing User Registration...');
    try {
      await axios.post(`${BASE_URL}/users/register`, TEST_USER);
      console.log('✓ User registration successful\n');
    } catch (error) {
      await logError(error, 'User Registration');
      throw error;
    }

    // 2. User Login
    console.log('2. Testing User Login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      authToken = loginResponse.data.token;
      console.log('✓ User login successful\n');
    } catch (error) {
      await logError(error, 'User Login');
      throw error;
    }

    // 3. Card Creation
    console.log('3. Testing Card Creation...');
    try {
      const cardData = {
        name: 'Test Card',
        closingDay: 15,
        dueDay: 22,
        cardType: 'Credit',
        lastFourDigits: '1234',
        limit: 10000,
        availableLimit: 10000
      };
      const cardResponse = await authenticatedRequest('post', '/cards', cardData);
      cardId = cardResponse._id;
      console.log('✓ Card creation successful\n');
    } catch (error) {
      await logError(error, 'Card Creation');
      throw error;
    }

    // 4. Create Income
    console.log('4. Testing Income Creation...');
    try {
      const incomeData = {
        amount: 5000.00,
        date: new Date().toISOString(),
        source: 'salary',
        tag: 'regular',
        recurring: {
          isRecurring: true,
          frequency: 'Monthly'
        }
      };
      const incomeResponse = await authenticatedRequest('post', '/incomes', incomeData);
      incomeId = incomeResponse._id;
      console.log('✓ Income creation successful\n');
    } catch (error) {
      await logError(error, 'Income Creation');
      throw error;
    }

    // 5. Create Expense
    console.log('5. Testing Expense Creation...');
    try {
      const expenseData = {
        title: 'Shopping Expense',
        amount: 150.50,
        date: new Date().toISOString(),
        category: 'Shopping',
        description: 'Grocery shopping',
        type: 'Card',
        card: cardId,
        status: 'Pending',
        installments: {
          current: 1,
          total: 1
        }
      };
      const expenseResponse = await authenticatedRequest('post', '/expenses', expenseData);
      expenseId = expenseResponse._id;
      console.log('✓ Expense creation successful\n');
    } catch (error) {
      await logError(error, 'Expense Creation');
      throw error;
    }

    // 6. Get Financial Reports
    console.log('6. Testing Financial Reports...');
    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      // Get expense report
      await authenticatedRequest('get', `/reports/expenses?startDate=${startDate}&endDate=${endDate}`);
      console.log('✓ Expense report generated');

      // Get income report
      await authenticatedRequest('get', `/reports/incomes?startDate=${startDate}&endDate=${endDate}`);
      console.log('✓ Income report generated');

      // Get financial summary
      await authenticatedRequest('get', `/reports/summary?startDate=${startDate}&endDate=${endDate}`);
      console.log('✓ Financial summary generated\n');
    } catch (error) {
      await logError(error, 'Financial Reports');
      throw error;
    }

    // 7. Update Operations
    console.log('7. Testing Update Operations...');
    try {
      // Update card
      await authenticatedRequest('put', `/cards/${cardId}`, {
        name: 'Updated Test Card',
        closingDay: 10,
        dueDay: 17,
        cardType: 'Debit',
      });
      console.log('✓ Card update successful');

      // Update expense
      await authenticatedRequest('put', `/expenses/${expenseId}`, {
        type: 'Variable',
        amount: 200.50,
        date: new Date().toISOString(),
      });
      console.log('✓ Expense update successful');

      // Update income
      await authenticatedRequest('put', `/incomes/${incomeId}`, {
        date: new Date().toISOString(),
        source: 'bonus',
        amount: 5500.00
      });
      console.log('✓ Income update successful\n');
    } catch (error) {
      await logError(error, 'Update Operations');
      throw error;
    }

    // 8. Cleanup Operations
    console.log('8. Testing Delete Operations...');
    try {
      // Delete expense
      await authenticatedRequest('delete', `/expenses/${expenseId}`);
      console.log('✓ Expense deletion successful');

      // Delete income
      await authenticatedRequest('delete', `/incomes/${incomeId}`);
      console.log('✓ Income deletion successful');

      // Delete card
      await authenticatedRequest('delete', `/cards/${cardId}`);
      console.log('✓ Card deletion successful\n');
    } catch (error) {
      await logError(error, 'Delete Operations');
      throw error;
    }

    console.log('All tests completed successfully! 🎉');

  } catch (error) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();