import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import fs from 'fs/promises';
import { Express } from 'express';

const app = require('../src/app'); // Adjust path as needed

interface TestUser {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface ErrorLog {
  timestamp: string;
  context: string;
  error: {
    message: string;
    status?: number;
    statusText?: string;
    data?: any;
  };
}

const MONGODB_URI = "mongodb+srv://vitorhugolana:Wd3VynqCmaJ7QtbB@sos-dindin.ninxu.mongodb.net/?retryWrites=true&w=majority&appName=sos-dindin";

// Test user configuration
const TEST_USER: TestUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
  role: 'user'
};

// Store tokens and IDs
let authToken: string = '';
let cardId: string = '';
let expenseId: string = '';
let incomeId: string = '';

// Error logging function
async function logError(error: any, context: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const errorLog: ErrorLog = {
    timestamp,
    context,
    error: {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
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

describe('API Test Suite', () => {
  before(async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      await mongoose.connection.dropDatabase();
    } catch (error) {
      console.error('Database setup failed:', error);
      throw error;
    }
  });

  after(async () => {
    await mongoose.connection.close();
  });

  // User Registration and Authentication
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(TEST_USER)
        .expect(201);

      expect(res.body).to.have.property('message');
    });

    it('should login user and get token', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password
        })
        .expect(200);

      expect(res.body).to.have.property('token');
      authToken = res.body.token;
    });
  });

  // Card Operations
  describe('Card Operations', () => {
    it('should create a new card', async () => {
      const cardData = {
        name: 'Test Card',
        closingDay: 15,
        dueDay: 22,
        cardType: 'Credit',
        lastFourDigits: '1234',
        limit: 10000,
        availableLimit: 10000
      };

      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cardData)
        .expect(201);

      expect(res.body).to.have.property('_id');
      cardId = res.body._id;
    });

    it('should update a card', async () => {
      const updateData = {
        name: 'Updated Test Card',
        closingDay: 10,
        dueDay: 17,
        cardType: 'Debit'
      };

      await request(app)
        .put(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
    });
  });

  // Income Operations
  describe('Income Operations', () => {
    it('should create a new income', async () => {
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

      const res = await request(app)
        .post('/api/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incomeData)
        .expect(201);

      expect(res.body).to.have.property('_id');
      incomeId = res.body._id;
    });

    it('should update an income', async () => {
      const updateData = {
        date: new Date().toISOString(),
        source: 'bonus',
        amount: 5500.00
      };

      await request(app)
        .put(`/api/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
    });
  });

  // Expense Operations
  describe('Expense Operations', () => {
    it('should create a new expense', async () => {
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

      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);

      expect(res.body).to.have.property('_id');
      expenseId = res.body._id;
    });

    it('should update an expense', async () => {
      const updateData = {
        type: 'Variable',
        amount: 200.50,
        date: new Date().toISOString()
      };

      await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
    });
  });

  // Financial Reports
  describe('Financial Reports', () => {
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();

    it('should get expense report', async () => {
      await request(app)
        .get(`/api/reports/expenses`)
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get income report', async () => {
      await request(app)
        .get(`/api/reports/incomes`)
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get financial summary', async () => {
      await request(app)
        .get(`/api/reports/summary`)
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  // Cleanup Operations
  describe('Cleanup Operations', () => {
    it('should delete expense', async () => {
      await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should delete income', async () => {
      await request(app)
        .delete(`/api/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should delete card', async () => {
      await request(app)
        .delete(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});