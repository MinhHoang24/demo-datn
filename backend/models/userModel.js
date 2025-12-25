const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    diaChi: { type: String, required: true },
    email: { type: String, required: true, unique: true, sparse: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null },
    emailVerifyExpires: { type: Date, default: null },
}, {
    timestamps: true, versionKey :false
});

module.exports = mongoose.model('User', userSchema, 'Users');