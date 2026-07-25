require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');

const updateWhatsAppImage = async () => {
  try {
    const srcPath = `C:\\Users\\Madhu\\OneDrive\\Pictures\\WhatsApp Image 2026-07-25 at 6.06.02 PM.jpeg`;
    const destDir = path.join(__dirname, '../uploads');
    const destPath = path.join(destDir, 'whatsapp_employee_photo.jpeg');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    if (!fs.existsSync(srcPath)) {
      console.error(`Source image file not found at: ${srcPath}`);
      process.exit(1);
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`[Image] Successfully copied WhatsApp image to: ${destPath}`);

    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow';
    await mongoose.connect(dbUri);

    const imageUrl = 'http://localhost:5000/uploads/whatsapp_employee_photo.jpeg';
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
    console.error('Error setting image:', err);
    process.exit(1);
  }
};

updateWhatsAppImage();
