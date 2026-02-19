const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendOTP = async (email, otp) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = "Your OTP for LifeFlow Verification";
        sendSmtpEmail.htmlContent = `<html><body><p>Your OTP is: <strong>${otp}</strong>. It is valid for 5 minutes.</p></body></html>`;
        // Sender must be a verified email in Brevo. Using your signup email for now.
        sendSmtpEmail.sender = { "name": "LifeFlow", "email": "sahilkumaratwork@gmail.com" };
        sendSmtpEmail.to = [{ "email": email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`OTP sent successfully to ${email} via Brevo. MessageId: ${data.messageId}`);
    } catch (error) {
        console.error('Brevo API Error:', error);
        // Fallback: If email fails, log OTP to console so user can verify
        console.warn(`CRITICAL FALLBACK: OTP for ${email} is ${otp}`);
        console.log('Continuing registration despite email failure.');
        // Do NOT throw error, allow user to proceed to verification step
    }
};

module.exports = { sendOTP };
