const nodemailer = require('nodemailer');

module.exports = async function sendVerifyEmail(email, token) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: '"My App" <no-reply@myapp.com>',
        to: email,
        subject: 'Xác nhận email',
        html: `
            <p>Vui lòng click link để xác nhận email:</p>
            <a href="${verifyUrl}">Vui Lòng Click Để Xác Nhận Email</a>
            <p>Link có hiệu lực trong 1 giờ.</p>
        `,
    });
};