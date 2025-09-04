require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary với thông tin API của bạn
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Cloud Name từ .env
  api_key: process.env.CLOUDINARY_API_KEY,       // API Key từ .env
  api_secret: process.env.CLOUDINARY_API_SECRET, // API Secret từ .env
});

module.exports = cloudinary;