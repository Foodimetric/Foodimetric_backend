const nodemailer = require("nodemailer");
require("dotenv").config();

class PartnerInviteEmailService {
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

    async sendInvite(toEmail, referralLink, senderName) {
        const mailOptions = {
            from: `Foodimetric <${process.env.EMAIL_ADDRESS}>`,
            to: toEmail,
            subject: "Join Foodimetric as my accountability partner",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>👋 Hello!</h2>
                    <p><strong>${senderName}</strong> has invited you to become their Foodimetric accountability partner.</p>
                    
                    <p>Foodimetric helps track nutrition, food diaries, and health goals. As accountability partners, you’ll keep each other motivated on your health journey.</p>
                    
                    <p style="margin-top:20px;">
                        <a href="${referralLink}" style="background:#147E03; color:white; padding:12px 20px; text-decoration:none; border-radius:6px;">
                            Accept Invite & Sign Up
                        </a>
                    </p>
                    
                    <p style="margin-top:20px; font-size: 0.9em; color:#666;">
                        Or copy this link into your browser: <br>
                        ${referralLink}
                    </p>
                    
                    <p>Stay healthy,<br>💚 The Foodimetric Team</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Invite email sent:", info.response);
        } catch (err) {
            console.error("Error sending invite email:", err);
            throw err;
        }
    }
}

module.exports = { PartnerInviteEmailService };