const express = require('express');
const { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    changePassword,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/userMiddleware');

const router = express.Router();

// Đăng ký người dùng
router.post('/register', registerUser);

// Đăng nhập người dùng
router.post('/login', loginUser);

// Xem hồ sơ người dùng
router.get('/profile', authMiddleware, getProfile);

// Chỉnh sửa thông tin cá nhân
router.put('/profile', authMiddleware, updateProfile);

// Đổi mật khẩu
router.put('/change-password', authMiddleware, changePassword);

router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;