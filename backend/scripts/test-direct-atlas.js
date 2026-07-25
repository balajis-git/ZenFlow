const mongoose = require('mongoose');

async function testDirect() {
  const directUri = 'mongodb://balajisenthil1955_db_user:YtsohyrywohRLhtu@cluster0-shard-00-00.qhrelhs.mongodb.net:27017,cluster0-shard-00-01.qhrelhs.mongodb.net:27017,cluster0-shard-00-02.qhrelhs.mongodb.net:27017/zenflow?ssl=true&authSource=admin&retryWrites=true&w=majority';
  console.log('[Test] Connecting via direct shard endpoints...');
  try {
    const conn = await mongoose.connect(directUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Test Success] Connected to MongoDB Atlas:', conn.connection.host);
    process.exit(0);
  } catch (err) {
    console.error('[Test Error]:', err.message);
    process.exit(1);
  }
}

testDirect();
