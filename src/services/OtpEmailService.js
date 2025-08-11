const nodemailer = require("nodemailer");
require("dotenv").config();

class OtpEmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_TEST_PASSWORD,
            },
        });
    }

    async OtpDetails(toEmail, otp) {
        const mailOptions = {
            from: `Foodimetric <${process.env.EMAIL_ADDRESS}>`,
            to: toEmail,
            subject: "Your Login OTP",
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log("OTP sent:", info.response);
        } catch (err) {
            console.error("Error sending OTP:", err);
            throw err;
        }
    }
}

module.exports = { OtpEmailService };