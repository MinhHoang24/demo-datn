const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { registerSchema, updateProfileSchema, changePasswordSchema } = require('../validation/user');
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
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mật khẩu",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu cũ không đúng",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Đăng ký người dùng
exports.registerUser = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map(d => d.message).join(', ')
    });
  }

  const { userName, phoneNumber, password, diaChi, role, email } = req.body;

  try {
    if (await User.findOne({ phoneNumber })) {
      return res.status(400).json({ success: false, message: 'Số điện thoại đã được sử dụng' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      userName,
      phoneNumber,
      password: hashedPassword,
      diaChi,
      role,
      email,
      isVerified: false,
      otpCode: otp,
      otpExpires: Date.now() + 1000 * 60 * 10,
    });

    await newUser.save();
    await sendVerifyEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng nhập mã OTP đã gửi về email.',
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Đăng nhập người dùng
exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = identifier.includes('@')
      ? await User.findOne({ email: identifier })
      : await User.findOne({ phoneNumber: identifier });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Vui lòng nhập mã OTP để xác thực tài khoản',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Sai mật khẩu' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      userName: user.userName,
      role: user.role,
      email: user.email,
      userID: user._id,
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
}

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      otpCode: otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Xác thực tài khoản thành công',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Tài khoản đã được xác thực' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otpCode = otp;
    user.otpExpires = Date.now() + 1000 * 60 * 10;
    await user.save();

    await sendVerifyEmail(email, otp);

    return res.json({
      success: true,
      message: 'Đã gửi lại mã OTP',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

