const mongoose = require("mongoose");
const winston = require("winston");

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "database.log" }),
  ],
});

// MongoDB connection configuration
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DBNAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Optional connection options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Log successful connection
    logger.info("MongoDB connected successfully");

    // Optional: Setup connection event listeners
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    // Exit process with failure
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  } catch (error) {
    logger.error("Error closing MongoDB connection:", error);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
