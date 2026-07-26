require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow');
  console.log('Connected to MongoDB');

  const emp = await User.findOne({ email: 'employee@zenflow.com' }).select('+password');
  if (!emp) {
    console.log('❌ User employee@zenflow.com NOT FOUND in database!');
    process.exit(1);
  }

  console.log('Found User:', {
    id: emp._id,
    name: emp.name,
    email: emp.email,
    role: emp.role,
    status: emp.status,
  });

  const isMatch1 = await emp.comparePassword('Employee@123');
  console.log("Password match for 'Employee@123':", isMatch1);

  const isMatch2 = await emp.comparePassword('Employee123');
  console.log("Password match for 'Employee123':", isMatch2);

  process.exit(0);
}

checkUser();
