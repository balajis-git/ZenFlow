require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');

const setMaleAvatarAll = async () => {
  try {
    const srcPath = 'C:\\Users\\Madhu\\.gemini\\antigravity\\brain\\a2cc66a3-804c-4b18-848d-e845263fa2f7\\male_employee_avatar_1784987135970.jpg';
    const destDir = path.join(__dirname, '../uploads');
    const destPath = path.join(destDir, 'male_employee_avatar.jpg');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`[Image] Copied generated male avatar to: ${destPath}`);

    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow';
    await mongoose.connect(dbUri);

    const imageUrl = 'http://localhost:5000/uploads/male_employee_avatar.jpg';

    // Update male users: Super Admin, Project Manager, Employee
    const maleEmails = ['admin@workflowx.com', 'pm@workflowx.com', 'employee@workflowx.com'];

    const result = await User.updateMany(
      { email: { $in: maleEmails } },
      { $set: { profileImage: imageUrl } }
    );

    console.log(`[Database] Successfully updated ${result.modifiedCount || result.nModified || 'male'} employee profile images to: ${imageUrl}`);

    process.exit(0);
  } catch (err) {
    console.error('Error updating male avatars:', err);
    process.exit(1);
  }
};

setMaleAvatarAll();
