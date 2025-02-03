const axios = require("axios");
const jwt = require("jsonwebtoken"); // Add this for token decoding

class APITestSuite {
  constructor(baseURL = "http://localhost:3000/api") {
    this.baseURL = baseURL;
    this.axios = axios.create({ baseURL });
    this.token = null;
    this.userId = null;
  }

  async runAllTests() {
    console.log("Starting API Test Suite...");
    await this.testUserOperations();
    if (this.token && this.userId) {
      await this.testCardOperations();
      await this.testExpenseOperations();
      await this.testIncomeOperations();
      await this.testReportGeneration();
    } else {
      console.error("Authentication failed. Skipping remaining tests.");
    }
    console.log("API Test Suite Completed.");
  }

  async testUserOperations() {
    console.log("\n--- User Operations Tests ---");
    try {
      // Register User
      const newUser = {
        username: "testuser2",
        email: "testuser@example.com",
        password: "password123",
      };
      const registerResponse = await this.axios.post(
        "/users/register",
        newUser,
      );
      console.log("User Registration ✓", registerResponse.data);

      // Login User - only send email and password
      const loginResponse = await this.axios.post("/users/login", {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      });

      console.log(
        "Login Response Data:",
        JSON.stringify(loginResponse.data, null, 2),
      );

      this.token = loginResponse.data.token;

      // Decode the JWT token to get the user ID
      if (this.token) {
        try {
          const decoded = jwt.decode(this.token);
          this.userId = decoded.id; // JWT contains { id: user._id, role: user.role }
          console.log("Decoded token:", decoded);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }

      if (!this.token || !this.userId) {
        throw new Error(
          `Invalid login response. Token: ${!!this.token}, UserId: ${!!this.userId}`,
        );
      }

      console.log("User Login ✓", { token: this.token, userId: this.userId });
    } catch (error) {
      console.error(
        "User Operations Test Failed:",
        error.response?.data || error.message,
      );
      if (error.response) {
        console.error(
          "Full error response:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
    }
  }

  async testCardOperations() {
    console.log("\n--- Card Operations Tests ---");
    try {
      const cards = [];
      // Create 5 Credit Cards
      for (let i = 1; i <= 5; i++) {
        const newCard = {
          name: `Test Credit Card ${i}`,
          closingDay: 15,
          dueDay: 25,
          cardType: "Credit",
          lastFourDigits: `123${i}`,
          userId: this.userId,
        };
        const createResponse = await this.axios.post("/cards", newCard, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        cards.push(createResponse.data);
        console.log(`Card Creation ${i} ✓`, createResponse.data._id);
      }

      // Get All Cards
      const listResponse = await this.axios.get("/cards", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      console.log("Card Listing ✓", listResponse.data.length);

      // Update Card
      if (cards.length > 0) {
        const updateResponse = await this.axios.put(
          `/cards/${cards[0]._id}`,
          {
            name: "Updated Test Card",
            closingDay: 15,
            dueDay: 25,
            cardType: "Credit",
            lastFourDigits: "1234",
            userId: this.userId,
          },
          {
            headers: { Authorization: `Bearer ${this.token}` },
          },
        );
        console.log("Card Update ✓", updateResponse.data.name);

        // Delete Card
        await this.axios.delete(`/cards/${cards[0]._id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        console.log("Card Deletion ✓");
      }
    } catch (error) {
      console.error(
        "Card Operations Test Failed:",
        error.response?.data || error.message,
      );
      if (error.response) {
        console.error(
          "Full error response:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
    }
  }

  async testExpenseOperations() {
    console.log("\n--- Expense Operations Tests ---");
    try {
      // Create Card for Expense
      const cardResponse = await this.axios.post(
        "/cards",
        {
          name: "Expense Test Card",
          closingDay: 15,
          dueDay: 25,
          cardType: "Credit",
          lastFourDigits: "5678",
          userId: this.userId,
        },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );
      const cardId = cardResponse.data._id;

      // Create Expenses for 2 Months
      const expenses = [];
      for (let month = 0; month < 2; month++) {
        const newExpense = {
          type: "Card",
          amount: 250.5,
          date: new Date(new Date().setMonth(new Date().getMonth() - month)),
          cardId: cardId,
          tag: "Test Expense",
          installments: {
            current: 1,
            total: 3,
          },
          userId: this.userId,
        };
        const createResponse = await this.axios.post("/expenses", newExpense, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        expenses.push(createResponse.data);
        console.log(
          `Expense Creation Month ${month + 1} ✓`,
          createResponse.data._id,
        );
      }

      // Get Expenses
      const listResponse = await this.axios.get("/expenses", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      console.log("Expense Listing ✓", listResponse.data.length);

      // Update Expense
      if (expenses.length > 0) {
        const updateResponse = await this.axios.put(
          `/expenses/${expenses[0]._id}`,
          {
            amount: 300.75,
            userId: this.userId,
          },
          {
            headers: { Authorization: `Bearer ${this.token}` },
          },
        );
        console.log("Expense Update ✓", updateResponse.data.amount);
      }
    } catch (error) {
      console.error(
        "Expense Operations Test Failed:",
        error.response?.data || error.message,
      );
      if (error.response) {
        console.error(
          "Full error response:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
    }
  }

  async testIncomeOperations() {
    console.log("\n--- Income Operations Tests ---");
    try {
      const incomes = [];
      // Create Incomes for 2 Months
      for (let month = 0; month < 2; month++) {
        const newIncome = {
          amount: 5000,
          date: new Date(new Date().setMonth(new Date().getMonth() - month)),
          source: "Salary",
          tag: "Monthly Income",
          recurring: {
            isRecurring: true,
            frequency: "Monthly",
          },
          userId: this.userId,
        };
        const createResponse = await this.axios.post("/incomes", newIncome, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        incomes.push(createResponse.data);
        console.log(
          `Income Creation Month ${month + 1} ✓`,
          createResponse.data._id,
        );
      }

      // Get Incomes
      const listResponse = await this.axios.get("/incomes", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      console.log("Income Listing ✓", listResponse.data.length);

      // Update Income
      if (incomes.length > 0) {
        const updateResponse = await this.axios.put(
          `/incomes/${incomes[0]._id}`,
          {
            amount: 5500,
            userId: this.userId,
          },
          {
            headers: { Authorization: `Bearer ${this.token}` },
          },
        );
        console.log("Income Update ✓", updateResponse.data.amount);
      }
    } catch (error) {
      console.error(
        "Income Operations Test Failed:",
        error.response?.data || error.message,
      );
      if (error.response) {
        console.error(
          "Full error response:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
    }
  }

  async testReportGeneration() {
    console.log("\n--- Report Generation Tests ---");
    try {
      // Generate Expense Report
      const expenseReportResponse = await this.axios.get("/reports/expenses", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      console.log("Expense Report Generation ✓", expenseReportResponse.data);

      // Generate Income Report
      const incomeReportResponse = await this.axios.get("/reports/incomes", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      console.log("Income Report Generation ✓", incomeReportResponse.data);

      // Generate Financial Summary
      const summaryResponse = await this.axios.get("/reports/summary", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      console.log("Financial Summary Generation ✓", summaryResponse.data);
    } catch (error) {
      console.error(
        "Report Generation Test Failed:",
        error.response?.data || error.message,
      );
      if (error.response) {
        console.error(
          "Full error response:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
    }
  }
}

// Run the tests
const testSuite = new APITestSuite();
testSuite.runAllTests().catch(console.error);
