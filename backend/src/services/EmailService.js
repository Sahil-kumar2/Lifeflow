const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family: 4 // Force IPv4 to avoid ENETUNREACH on Render
});

const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for LifeFlow Verification',
            text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email functionality failed');
    }
};

module.exports = { sendOTP };
