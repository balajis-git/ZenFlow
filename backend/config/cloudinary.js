const cloudinary = require('cloudinary').v2;

let isCloudinaryConfigured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  isCloudinaryConfigured = true;
  console.log('[Upload] Cloudinary configured successfully.');
} else {
  console.warn('[Upload] Cloudinary credentials missing. File uploads will use local folder fallback.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
