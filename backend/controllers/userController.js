const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../validation/user');
const crypto = require('crypto');
const sendVerifyEmail = require('../utils/sendVerifyEmail');

// Xem hồ sơ người dùng
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id; // ID người dùng từ token
        const user = await User.findById(userId).select('-password'); // Không trả về mật khẩu

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Chỉnh sửa thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userName, diaChi, email } = req.body;

        const { error } = updateProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details.map(detail => detail.message).join(', ')
            });
        }

        const updateFields = {};
        if (userName !== undefined) updateFields.userName = userName;
        if (diaChi !== undefined) updateFields.diaChi = diaChi;

        if (email !== undefined) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email đã được sử dụng bởi người dùng khác.' });
            }
            updateFields.email = email;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
        console.log(`User ${userName} cập nhật thông tin thành công.`);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        // Validate input data
        const { error } = changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details.map(detail => detail.message).join(', ')
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect old password' });
        }

        // Băm mật khẩu mới và cập nhật
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Đăng ký người dùng
exports.registerUser = async (req, res) => {
    console.log('Received registration request:', req.body); // Log request body

    // Validate input data
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            success: false, 
            message: error.details.map(detail => detail.message).join(', ') 
        });
    }

    const { userName, phoneNumber, password, diaChi = "", role, email } = req.body;

    try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            console.log('User with this phone number already exists');
            return res.status(200).json({ // HTTP 409 Conflict
                success: false, 
                message: 'Số điện thoại đã được sử dụng!'
            });
        }

        // Kiểm tra xem người dùng đã tồn tại với email chưa
        const existingUserEmail = await User.findOne({ email });
        if (existingUserEmail) {
            console.log('User with this email already exists');
            return res.status(200).json({ // HTTP 409 Conflict
                success: false, 
                message: 'Email đã được sử dụng!'
            });
        }
        const emailVerifyToken = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            userName,
            phoneNumber,
            password: hashedPassword,
            diaChi,
            role,
            email,
            isVerified: false,
            emailVerifyToken,
            emailVerifyExpires: Date.now() + 1000 * 60 * 60
        });

        await newUser.save();
        console.log('User registered successfully');
        await sendVerifyEmail(email, emailVerifyToken);

        // Trả về thông tin người dùng mới đăng ký
        res.status(201).json({ 
            success: true, 
            message: 'Đăng ký thành công!',
            user: {
                id: newUser._id,
                userName: newUser.userName,
                phoneNumber: newUser.phoneNumber,
                diaChi: newUser.diaChi,
                role: newUser.role,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Error during user registration:', error);

        // Xử lý lỗi MongoDB trùng khóa
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false, 
                message: 'Email đã được sử dụng!'
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ!' 
        });
    }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Đăng nhập người dùng
exports.loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        let user; // ✅ KHAI BÁO RÕ RÀNG

        // 1️⃣ TÌM USER
        if (validateEmail(identifier)) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ phoneNumber: identifier });
        }

        // 2️⃣ KHÔNG TÌM THẤY USER
        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'User not found'
            });
        }

        // 3️⃣ 🔒 CHẶN LOGIN NẾU CHƯA VERIFY
        // ⚠️ DÙNG === false (KHÔNG dùng !user.isVerified)
        if (user.isVerified === false) {
            console.log('[LOGIN BLOCKED] Email not verified:', user.email);
            return res.status(403).json({
                success: false,
                message: 'Vui lòng xác nhận email trước khi đăng nhập'
            });
        }

        // 4️⃣ CHECK PASSWORD
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // 5️⃣ TẠO TOKEN
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1002h' }
        );

        return res.json({
            success: true,
            token,
            userName: user.userName,
            role: user.role,
            phoneNumber: user.phoneNumber,
            email: user.email,
            userID: user._id,
        });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ!'
        });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({
            emailVerifyToken: token,
            emailVerifyExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Link xác nhận không hợp lệ hoặc đã hết hạn'
            });
        }

        user.isVerified = true;
        user.emailVerifyToken = null;
        user.emailVerifyExpires = null;
        await user.save();

        return res.json({
            success: true,
            message: 'Xác nhận email thành công'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        });
    }
};

exports.resendVerifyEmail = async (req, res) => {
    const { email } = req.body;

    console.log('[RESEND VERIFY] Request received:', email);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('[RESEND VERIFY] User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            console.log('[RESEND VERIFY] Email already verified');
            return res.status(400).json({
                success: false,
                message: 'Email đã được xác nhận'
            });
        }

        const crypto = require('crypto');
        const sendVerifyEmail = require('../utils/sendVerifyEmail');

        const newToken = crypto.randomBytes(32).toString('hex');

        user.emailVerifyToken = newToken;
        user.emailVerifyExpires = Date.now() + 1000 * 60 * 60;
        await user.save();

        await sendVerifyEmail(email, newToken);

        console.log('[RESEND VERIFY] Verification email resent successfully');

        return res.json({
            success: true,
            message: 'Đã gửi lại email xác nhận'
        });
    } catch (error) {
        console.error('[RESEND VERIFY] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        });
    }
};