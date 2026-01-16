const sendMail = require("./mailer");

module.exports = async function sendResetPasswordEmail(email, resetUrl) {
  try {
    await sendMail({
      to: email,
      subject: "Đặt lại mật khẩu - MH Shop",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2 style="color:#0065b3">MH Shop</h2>
          <p>Nhấn vào link bên dưới để đặt lại mật khẩu (hiệu lực 15 phút):</p>
          <p>
            <a href="${resetUrl}" target="_blank">
              ${resetUrl}
            </a>
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