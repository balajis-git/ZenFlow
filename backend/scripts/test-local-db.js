const mongoose = require('mongoose');

async function testLocal() {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/zenflow');
    console.log('[Database] Local MongoDB Connected OK:', conn.connection.host);
    process.exit(0);
  } catch (err) {
    console.error('[Database Error]:', err.message);
    process.exit(1);
  }
}

testLocal();
