const request = require('supertest');
const { app } = require('../../src/app');
const { connectDB, disconnectDB } = require('../../config/database');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Card = require('../../models/Card');
const Expense = require('../../models/Expense');
const Income = require('../../models/Income');

let server;
let authToken;
let userId;
let cardId;
let expenseId;
let incomeId;

// Setup before all tests
beforeAll(async () => {
  jest.setTimeout(10000);
  try {
    server = app.listen(0);
    await connectDB();
    
    // Wait for connection to be established
    const maxWaitTime = 10000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      if (mongoose.connection.readyState === 1) {
        console.log('Database connected, starting tests...');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection timeout');
    }
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

// Clear database between tests
beforeEach(async () => {
  await User.deleteMany({});
  await Card.deleteMany({});
  await Expense.deleteMany({});
  await Income.deleteMany({});
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await disconnectDB();
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
});

describe('User Authentication Endpoints', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    role: 'user'
  };

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should fail to register with existing email', async () => {
      // First create a user
      await request(app)
        .post('/api/users/register')
        .send(testUser);

      // Try to create the same user again
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser)
        .expect(400);
      
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a user before testing login
      await request(app)
        .post('/api/users/register')
        .send(testUser);
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });
  });
});

describe('Card Management Endpoints', () => {
  const testCard = {
    name: 'Test Card',
    closingDay: 15,
    dueDay: 22,
    cardType: 'credit',
    lastFourDigits: '1234'
  };

  beforeEach(async () => {
    // Create and login user before each card test
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'cardtestuser',
        email: 'cardtest@example.com',
        password: 'Password123!',
        role: 'user'
      });

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'cardtest@example.com',
        password: 'Password123!'
      });

    authToken = loginRes.body.token;
  });

  describe('POST /api/cards', () => {
    it('should create a new card', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCard)
        .expect(201);

      expect(res.body).toHaveProperty('name', testCard.name);
      cardId = res.body._id;
    });
  });

  describe('GET /api/cards', () => {
    beforeEach(async () => {
      // Create a card before testing GET
      const cardRes = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCard);
      cardId = cardRes.body._id;
    });

    it('should get all cards', async () => {
      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});

// Similar patterns for Expense and Income endpoints...

describe('Expense Management Endpoints', () => {
  beforeEach(async () => {
    // Setup user and card before expense tests
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'expensetestuser',
        email: 'expensetest@example.com',
        password: 'Password123!',
        role: 'user'
      });

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'expensetest@example.com',
        password: 'Password123!'
      });

    authToken = loginRes.body.token;

    const cardRes = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Card',
        closingDay: 15,
        dueDay: 22,
        cardType: 'credit',
        lastFourDigits: '1234'
      });

    cardId = cardRes.body._id;
  });

  const testExpense = {
    type: 'Card',
    amount: 150.50,
    date: new Date().toISOString(),
    tag: 'shopping'
  };

  it('should create a new expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...testExpense, card: cardId })
      .expect(201);

    expect(res.body).toHaveProperty('amount', testExpense.amount);
  });

  it('should get all expenses', async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBeTruthy();
  });
});