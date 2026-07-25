const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow';
    const conn = await mongoose.connect(connString);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
