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
        <title>Welcome to Foodimetric!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 10px 0;
                background-color: #007bff;
                color: #ffffff;
            }
            .content {
                margin: 20px 0;
            }
            .button {
                display: block;
                width: 200px;
                margin: 0 auto;
                padding: 10px;
                text-align: center;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #888888;
                margin-top: 20px;
            }

            a{
              color: #fff
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Foodimetric!</h1>
            </div>
            <div class="content">
                <p>Thank you for signing up. We are excited to have you on board. To complete your registration, please verify your email address by clicking the link below:</p>
                <a href="https://foodimetric.com/verify?token=${token}" class="button">Verify Your Account</a>
                <p>If you did not sign up for an account, please disregard this email.</p>
                <p>Feel free to explore and let us know if you have any questions or need assistance.</p>
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
      "Folake",
      "Welcome to Foodimetric! Please Verify Your Account",
      registerHtml(token),
      token
    );
  }
}

module.exports = { EmailService };
