const nodemailer = require('nodemailer');

module.exports = async function sendVerifyEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // bắt buộc false cho 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  
    await transporter.sendMail({
      from: '"MH Shop" <no-reply@mhshop.vn>',
      to: email,
      subject: 'Mã xác thực tài khoản MH Shop',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2 style="color:#0065b3">MH Shop</h2>
          <p>Xin chào,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại <b>MH Shop</b>.</p>
          <p>Mã xác thực tài khoản của bạn là:</p>
          <h1 style="letter-spacing:4px;color:#333">${otp}</h1>
          <p>Mã có hiệu lực trong <b>10 phút</b>.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
          <hr/>
          <p style="font-size:12px;color:#888">
            © ${new Date().getFullYear()} MH Shop. All rights reserved.
          </p>
        </div>
      `,
    });
    console.log("✅ OTP email sent to:", email);
  } catch (err) {
    console.error("❌ SEND MAIL ERROR:", err);
    throw err;
  }
};