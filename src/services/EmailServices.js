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
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Foodimetric!</title>
        <style>
            body {
                font-family: cursive, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
                color: #333;
            }

            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                text-align: center;
            }

            .header {
                background-color: #147e03;
                color: #ffffff;
                padding: 30px 20px;
            }

            .header img {
                max-width: 100px;
                margin-bottom: 10px;
            }

            .header h1 {
                font-size: 24px;
                margin: 0;
                font-weight: bold;
            }

            .content {
                padding: 30px;
            }

            .content h2 {
                color: #ed3300b3;
                font-size: 22px;
                margin-bottom: 10px;
            }

            .content p {
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 20px;
            }

            .button {
                display: inline-block;
                background-color: #ffba08;
                color: #000;
                text-decoration: none;
                padding: 14px 25px;
                font-size: 16px;
                border-radius: 30px;
                font-weight: bold;
                transition: background 0.3s ease-in-out;
            }

            .button:hover {
                background-color: #e0a807;
            }

            .footer {
                background-color: #333;
                color: #ffffff;
                padding: 20px;
                font-size: 14px;
                text-align: center;
            }

            .footer a {
                color: #ffba08;
                text-decoration: none;
                font-weight: bold;
            }

            .footer a:hover {
                text-decoration: underline;
            }
        </style>
    </head>

    <body>
        <div class="container">
            <div class="header">
                <img src="https://foodimetric.com/logo-alt.png" alt="Foodimetric Logo">
                <h1>Welcome to Foodimetric!</h1>
            </div>
            <div class="content">
                <h2>Hi there,</h2>
                <p>Thank you for joining Foodimetric! We're thrilled to have you onboard. To get started, please verify your
                    email address by clicking the button below:</p>
                <p>
                    <a href="https://foodimetric.com/verify?token=${token}"class="button">Verify Your Email</a>
                </p>
                <p>If you didn’t sign up for this account, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>Need help? Contact us at <a href="mailto:foodimetric@gmail.com">foodimetric@gmail.com</a></p>
                <p><a href="https://foodimetric.com">Visit our website</a></p>
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
