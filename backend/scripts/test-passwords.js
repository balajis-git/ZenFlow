require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const testPasswords = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow';
    await mongoose.connect(dbUri);

    const testCases = [
      { email: 'admin@workflowx.com', pass: 'Admin123' },
      { email: 'hr@workflowx.com', pass: 'Hradmin123' },
      { email: 'pm@workflowx.com', pass: 'Project123' },
      { email: 'employee@workflowx.com', pass: 'Employee123' },
    ];

    console.log('================ TESTING LOGIN PASSWORDS ================');
    for (const tc of testCases) {
      const user = await User.findOne({ email: tc.email }).select('+password');
      if (!user) {
        console.log(`❌ User NOT FOUND: ${tc.email}`);
        continue;
      }
      const isMatch = await user.comparePassword(tc.pass);
      console.log(`User: ${tc.email} | Pass: ${tc.pass} | Match: ${isMatch ? '✅ VALID' : '❌ INVALID'}`);
    }
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
};

testPasswords();
