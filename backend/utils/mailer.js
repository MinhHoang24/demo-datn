const { Resend } = require("resend");

// Khởi tạo Resend với API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Gửi email qua Resend
 * @param {string} to - email người nhận
 * @param {string} subject - tiêu đề
 * @param {string} html - nội dung HTML
 */
module.exports = async function sendMail({ to, subject, html }) {
  const result = await resend.emails.send({
    from: "MH Shop <onboarding@resend.dev>", // ⚠️ BẮT BUỘC khi chưa verify domain
    to: [to], // ⚠️ BẮT BUỘC là array
    subject,
    html,
  });

  return result;
};