const nodemailer = require("nodemailer");
require("dotenv").config();

const welcomeHtml = (name = "there") => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to Foodimetric</title>
  <style>
    /* Reset & Responsive */
    body,table,td,a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table,td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    table { border-collapse:collapse !important; }
    body { margin:0 !important; padding:0 !important; width:100% !important; background-color:#f0f2f5; }
    @media screen and (max-width:600px) {
      .container { width:100% !important; padding: 0 10px !important; }
      .hero { font-size:24px !important; }
      .section h2 { font-size:18px !important; }
    }
  </style>
</head>
<body style="background-color:#f0f2f5; margin:0; padding:0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding:24px 0; background:#147e03;">
              <img src="https://foodimetric.com/logo-alt.png" width="120" alt="Foodimetric" style="display:block; border:0;" />
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td align="center" style="padding:32px 24px 0;">
              <h1 class="hero" style="margin:0; font-family:'Segoe UI',sans-serif; font-size:28px; color:#147e03;">
                Welcome, ${name}! 🎉
              </h1>
            </td>
          </tr>
          
          <!-- Intro -->
          <tr>
            <td style="padding:16px 24px; font-family:'Segoe UI',sans-serif; font-size:16px; color:#333; line-height:1.5;">
              Thank you for joining <strong>Foodimetric</strong>! We’re excited to help you reach your nutrition goals—whether you’re tracking for yourself or supporting clients professionally.
            </td>
          </tr>
          
          <!-- Credits Section -->
          <tr>
            <td class="section" style="padding:0 24px 24px;">
              <h2 style="margin:16px 0 8px; font-family:'Segoe UI',sans-serif; font-size:20px; color:#147e03;">
                Your Monthly Credits
              </h2>
              <p style="margin:0 0 8px; font-size:15px; color:#555;">
                You get <strong>1,000 free credits</strong> every month for food tracking, health calculations, or client consultations.
              </p>
              <p style="margin:0; font-size:14px; color:#777;">
                <em>Credits don’t roll over—make the most of them before the month ends!</em>
              </p>
            </td>
          </tr>

          <!-- Two-Column Feature Blocks -->
          <tr>
            <td style="padding:0 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td width="50%" valign="top" style="padding-right:12px;">
                        <h3 style="margin:0 0 8px; font-family:'Segoe UI',sans-serif; font-size:16px; color:#333;">🎯 Get Started</h3>
                        <ul style="margin:0; padding-left:20px; font-size:14px; color:#555; line-height:1.5;">
                            <li>Set up your <a href="https://foodimetric.com/dashboard/setting" style="color:#147e03;">profile</a></li>
                            <li>Log meals in your <a href="https://foodimetric.com/dashboard/diary" style="color:#147e03;">Food Diary</a></li>
                            <li>Review past entries in <a href="https://foodimetric.com/dashboard/history" style="color:#147e03;">History</a></li>
                        </ul>
                        </td>
                        <td width="50%" valign="top" style="padding-left:12px;">
                        <h3 style="margin:0 0 8px; font-family:'Segoe UI',sans-serif; font-size:16px; color:#333;">🛠️ Pro Tools</h3>
                        <ul style="margin:0; padding-left:20px; font-size:14px; color:#555; line-height:1.5;">
                            <li><a href="https://foodimetric.com/anthro/BMI" style="color:#147e03;">BMI</a>, <a href="https://foodimetric.com/anthro/IBW" style="color:#147e03;">IBW</a></li>
                            <li><a href="https://foodimetric.com/anthro/WHR" style="color:#147e03;">WHR</a>, <a href="https://foodimetric.com/anthro/BMR" style="color:#147e03;">BMR</a></li>
                            <li><a href="https://foodimetric.com/anthro/EE" style="color:#147e03;">EE</a> calculator</li>
                        </ul>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding-top:24px;">
                        <h3 style="margin:0 0 8px; font-family:'Segoe UI',sans-serif; font-size:16px; color:#333;">🍽️ Explore Our Smart Features</h3>
                        <ul style="margin:0; padding-left:20px; font-size:14px; color:#555; line-height:1.6;">
                            <li><a href="https://foodimetric.com/search/food" style="color:#147e03;">Food Search</a> – Find nutrient info for any food</li>
                            <li><a href="https://foodimetric.com/search/nutrient" style="color:#147e03;">Nutrient Search</a> – Explore foods by nutrient</li>
                            <li><a href="https://foodimetric.com/search/multi-food" style="color:#147e03;">Multi-Food Search</a> – Analyze multiple foods at once</li>
                            <li><a href="https://foodimetric.com/search/multi-nutrient" style="color:#147e03;">Multi-Nutrient Search</a> – Compare nutrient values easily</li>
                            <li><a href="https://foodimetric.com/chat" style="color:#147e03;">Personalized AI</a> – Get food tips tailored to your goals</li>
                        </ul>
                        </td>
                    </tr>
                </table>
            </td>
          </tr>

          <!-- Call to Action Button -->
          <tr>
            <td align="center" style="padding:24px;">
              <a href="https://foodimetric.com/dashboard" style="background-color:#147e03; color:#ffffff; font-family:'Segoe UI',sans-serif; font-size:16px; text-decoration:none; padding:12px 24px; border-radius:6px; display:inline-block;">
                Go to Your Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" style="padding:16px 24px 32px; font-family:'Segoe UI',sans-serif; font-size:13px; color:#777; text-align:center;">
              Need help? <a href="https://foodimetric.com/contact" style="color:#147e03; text-decoration:none;">Contact us</a><br>
              &copy; ${new Date().getFullYear()} Foodimetric. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

class WelcomeEmailService {
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

  async sendWelcomeDetails(toEmail, name) {
    const mailOptions = {
      from: `Foodimetric <${process.env.EMAIL_ADDRESS}>`,
      to: toEmail,
      subject: "Welcome to Foodimetric – Let’s Get Started!",
      html: welcomeHtml(name),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Welcome Email sent:", info.response);
    } catch (err) {
      console.error("Error sending Welcome email:", err);
      throw err;
    }
  }
}

module.exports = { WelcomeEmailService };