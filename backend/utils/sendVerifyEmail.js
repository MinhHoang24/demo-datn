const sendMail = require("./mailer");

module.exports = async function sendVerifyEmail(email, otp) {
  try {
    await sendMail({
      to: email,
      subject: "Mã xác thực tài khoản MH Shop",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2 style="color:#0065b3">MH Shop</h2>
          <p>Xin chào,</p>
          <p>Mã xác thực tài khoản của bạn là:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>Mã có hiệu lực trong <b>10 phút</b>.</p>
        </div>
      `,
    });

    console.log("✅ OTP email sent to:", email);
  } catch (err) {
    console.error("❌ SEND OTP MAIL ERROR:", err);
    throw err;
  }
};