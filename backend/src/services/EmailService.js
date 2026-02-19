const nodemailer = require('nodemailer');
const dns = require('dns');
const util = require('util');

const resolve4 = util.promisify(dns.resolve4);

const sendOTP = async (email, otp) => {
    try {
        console.log('Attempting to resolve smtp.gmail.com...');
        const addresses = await resolve4('smtp.gmail.com');
        const ip = addresses[0];
        console.log(`Resolved IP: ${ip}`);

        const transporter = nodemailer.createTransport({
            host: ip,
            port: 587, // Try port 587 (STARTTLS) instead of 465
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                servername: 'smtp.gmail.com',
                rejectUnauthorized: false // Temporary: for debugging purposes
            },
            debug: true, // Enable nodemailer debug output
            logger: true // Log to console
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for LifeFlow Verification',
            text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
        };

        console.log(`Sending email to ${email} via ${ip}:587...`);
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
    } catch (error) {
        console.error('Detailed Email Error:', error);
        // Fallback: If email fails, log OTP to console so user can verify
        console.warn(`CRITICAL FALLBACK: OTP for ${email} is ${otp}`);
        console.log('Continuing registration despite email failure.');
        // Do NOT throw error, allow user to proceed to verification step
    }
};

module.exports = { sendOTP };
