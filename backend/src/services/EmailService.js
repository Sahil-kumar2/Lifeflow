const nodemailer = require('nodemailer');
const dns = require('dns');
const util = require('util');

const resolve4 = util.promisify(dns.resolve4);

const sendOTP = async (email, otp) => {
    try {
        // Manually resolve 'smtp.gmail.com' to get an IPv4 address
        // This bypasses the environment's tendency to use IPv6 which fails on Render
        const addresses = await resolve4('smtp.gmail.com');
        const ip = addresses[0];

        const transporter = nodemailer.createTransport({
            host: ip, // Use the resolved IPv4 address
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                servername: 'smtp.gmail.com' // Required for SSL validation when using IP
            }
        });

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
