const transporter = require("./mailer");

module.exports = async function sendResetPasswordEmail(email, resetUrl) {
  try {
    await transporter.sendMail({
      from: '"MH Shop" <no-reply@mhshop.vn>',
      to: email,
      subject: "Đặt lại mật khẩu - MH Shop",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2 style="color:#0065b3">MH Shop</h2>
          <p>Xin chào,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <b>MH Shop</b>.</p>
          <p>Nhấn vào link bên dưới để đặt lại mật khẩu (hiệu lực <b>15 phút</b>):</p>
          <p>
            <a href="${resetUrl}" target="_blank" style="color:#0065b3">
              ${resetUrl}
            </a>
          </p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
          <hr/>
          <p style="font-size:12px;color:#888">
            © ${new Date().getFullYear()} MH Shop. All rights reserved.
          </p>
        </div>
      `,
    });

    console.log("✅ Reset password email sent to:", email);
  } catch (err) {
    console.error("❌ SEND RESET MAIL ERROR:", err);
    throw err;
  }
};