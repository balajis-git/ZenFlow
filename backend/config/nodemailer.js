const nodemailer = require('nodemailer');

let transporter;

if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('[Email] Live SMTP Mail Transporter configured.');
} else {
  // Mock transporter for local dev if no SMTP credentials provided
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('================= [MOCK EMAIL] =================');
      console.log(`To:      ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:    ${mailOptions.text || mailOptions.html}`);
      console.log('================================================');
      return { messageId: `mock-id-${Date.now()}` };
    },
  };
  console.log('[Email] Mock Transporter configured (No SMTP env credentials found).');
}

module.exports = transporter;
