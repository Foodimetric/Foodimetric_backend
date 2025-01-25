const nodemailer = require("nodemailer");
require("dotenv").config();

const registerHtml = (token) => {
  console.log("Token received:", token); // Debugging statement to check token value

  if (!token) {
    console.error("Token is null or undefined!");
    return ''; // Handle the null token case appropriately
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verify Your Email - Foodimetric</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
                line-height: 1.6;
                color: #333333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background-color: #007bff;
                color: #ffffff;
                text-align: center;
                padding: 20px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content p {
                margin: 15px 0;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 20px;
                font-size: 16px;
                border-radius: 5px;
                margin-top: 20px;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                background-color: #f1f1f1;
                padding: 15px;
                text-align: center;
                font-size: 14px;
                color: #666666;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Foodimetric!</h1>
            </div>
            <div class="content">
                <p>Hi there,</p>
                <p>Thank you for signing up with Foodimetric! We're thrilled to have you on board. Please confirm your email address to activate your account.</p>
                <a href="https://foodimetric.com/verify?token=${token}" class="button">Verify Your Email</a>
                <p>If you didn't create this account, you can safely ignore this email.</p>
                <p>Need help? Reach out to us anytime using the details below:</p>
                <p>
                    <strong>Email:</strong> <a href="mailto:foodimetric@gmail.com">foodimetric@gmail.com</a><br>
                    <strong>WhatsApp:</strong> <a href="https://wa.me/2347085056806">+234 708 505 6806</a><br>
                    <strong>Instagram:</strong> <a href="https://www.instagram.com/foodimetric/" target="_blank">Follow us on Instagram</a>
                </p>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Foodimetric Team</p>
            </div>
        </div>
    </body>
    </html>
  `;
};


class EmailService {
  async mail(receiver, sender, subject, html, token) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_TEST_PASSWORD,
      },
    });

    const mailOptions = {
      from: `${sender} <${process.env.EMAIL_ADDRESS}>`,
      to: receiver,
      subject: subject,
      text: `Welcome to Foodimetric! Please verify your account using the following link: https://foodimetric.com/verify?token=${token}`,
      html: html,
    };


    try {
      let info = await transporter.sendMail(mailOptions);
      console.log("Email sent: " + info.response);
    } catch (error) {
      console.error("Error sending email: ", error);
    }
  }

  async sendSignUpDetails(email, token) {
    await this.mail(
      email,
      "Foodimetric",
      "Welcome to Foodimetric! Please Verify Your Account",
      registerHtml(token),
      token
    );
  }
}

module.exports = { EmailService };
