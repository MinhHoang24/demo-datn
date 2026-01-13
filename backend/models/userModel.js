const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    diaChi: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "user" },

    // OTP VERIFY
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, default: null },
    otpExpires: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('User', userSchema, 'Users');