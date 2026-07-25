require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');

const setMaleEmployeeImage = async () => {
  try {
    const srcPath = 'C:\\Users\\Madhu\\.gemini\\antigravity\\brain\\a2cc66a3-804c-4b18-848d-e845263fa2f7\\male_employee_profile_1784985969567.jpg';
    const destDir = path.join(__dirname, '../uploads');
    const destPath = path.join(destDir, 'male_employee_photo.jpg');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`[Image] Copied generated photo to: ${destPath}`);

    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow';
    await mongoose.connect(dbUri);

    const imageUrl = 'http://localhost:5000/uploads/male_employee_photo.jpg';
    const firstEmployee = await User.findOne({ email: 'admin@workflowx.com' });
    if (firstEmployee) {
      firstEmployee.profileImage = imageUrl;
      await firstEmployee.save();
      console.log(`[Database] Updated ${firstEmployee.name} (${firstEmployee.email}) profile image to: ${imageUrl}`);
    } else {
      console.log('User admin@workflowx.com not found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error updating image:', err);
    process.exit(1);
  }
};

setMaleEmployeeImage();
