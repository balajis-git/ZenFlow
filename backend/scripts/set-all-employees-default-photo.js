require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const setAllEmployeesDefaultPhoto = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow';
    await mongoose.connect(dbUri);

    const defaultPhotoUrl = 'http://localhost:5000/uploads/male_employee_photo.jpg';

    const result = await User.updateMany(
      {},
      { $set: { profileImage: defaultPhotoUrl } }
    );

    console.log(`[Database] Successfully updated ${result.modifiedCount || result.nModified || 'all'} employee profiles to default photo: ${defaultPhotoUrl}`);

    process.exit(0);
  } catch (err) {
    console.error('Error setting default employee photo:', err);
    process.exit(1);
  }
};

setAllEmployeesDefaultPhoto();
