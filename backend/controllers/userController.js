const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../validation/user');

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

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            userName,
            phoneNumber,
            password: hashedPassword,
            diaChi,
            role,
            email
        });

        await newUser.save();
        console.log('User registered successfully');

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

    // Kiểm tra validate identifier và password (có thể dùng Joi hoặc thủ công)

    try {
        let user;
        if (validateEmail(identifier)) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ phoneNumber: identifier });
        }

        if (!user) {
            return res.status(200).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1002h' });

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
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
    }
};
