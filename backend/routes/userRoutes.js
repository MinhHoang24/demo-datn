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
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Đăng ký người dùng
router.post('/register', registerUser);

// Đăng nhập người dùng
router.post('/login', loginUser);

// Xem hồ sơ người dùng
router.get('/profile', protect, getProfile);

// Chỉnh sửa thông tin cá nhân
router.put('/profile', protect, updateProfile);

// Đổi mật khẩu
router.put('/change-password', protect, changePassword);

router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;