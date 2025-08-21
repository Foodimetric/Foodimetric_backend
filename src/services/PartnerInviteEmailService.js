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
            subject: `You've been invited to Foodimetric by ${senderName}!`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f9fafb; padding: 24px; text-align: center;">
                    <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 32px;">
                        <tr>
                            <td align="center">
                                <h1 style="color: #147E03; font-size: 24px; font-weight: 700; margin: 0 0 16px;">Foodimetric</h1>
                                <h2 style="color: #1a202c; font-size: 20px; font-weight: 600; line-height: 1.4; margin: 0 0 24px;">
                                    You have a new partner invite!
                                </h2>
                                
                                <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 24px;">
                                    Hey there! Your friend <strong style="color: #1a202c;">${senderName}</strong> wants you to join them on their health journey with Foodimetric.
                                </p>
                                
                                <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 24px;">
                                    Foodimetric is the perfect app to track nutrition, log meals, and stay on top of your health goals. And what's better than doing it together? As accountability partners, you can motivate each other to stay consistent and hit your milestones.
                                </p>

                                <a href="${referralLink}" style="display: inline-block; padding: 14px 28px; background-color: #147E03; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 0 24px;">
                                    Accept Invite & Join
                                </a>

                                <p style="font-size: 14px; color: #718096; margin: 0;">
                                    Can't click the button? Copy and paste this link into your browser:
                                </p>
                                <p style="font-size: 12px; color: #147E03; word-break: break-all;">
                                    ${referralLink}
                                </p>
                                
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 14px; color: #718096; margin-top: 24px;">
                        Stay healthy,<br>The Foodimetric Team
                    </p>
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