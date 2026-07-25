try {
  require('dns').setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb+srv://balajisenthil1955_db_user:YtsohyrywohRLhtu@cluster0.qhrelhs.mongodb.net/zenflow?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(connString);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
