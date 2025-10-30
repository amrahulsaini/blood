// Base Email Template with TheLifeSaviours branding

export const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TheLifeSaviours - Aashayein</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #FFF8DC;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      color: white;
      font-size: 28px;
      font-weight: 800;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .tagline {
      color: rgba(255,255,255,0.9);
      font-size: 14px;
      margin-top: 8px;
      font-style: italic;
    }
    .content {
      padding: 40px 30px;
      color: #2C1810;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3);
    }
    .footer {
      background-color: #FFF8DC;
      padding: 30px;
      text-align: center;
      color: #5C4033;
      font-size: 14px;
      border-top: 3px solid #DC143C;
    }
    .footer p {
      margin: 8px 0;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #DC143C;
      text-decoration: none;
      margin: 0 10px;
      font-weight: 600;
    }
    .highlight {
      background-color: #FFF8DC;
      padding: 20px;
      border-left: 4px solid #DC143C;
      margin: 20px 0;
      border-radius: 8px;
    }
    .info-box {
      background-color: #FFF0F5;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .success-box {
      background-color: #E8F5E9;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #4CAF50;
      margin: 15px 0;
    }
    .urgent-box {
      background-color: #FFEBEE;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #DC143C;
      margin: 15px 0;
    }
    h1, h2, h3 {
      color: #8B0000;
    }
    .blood-drop {
      color: #DC143C;
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">TheLifeSaviours</h1>
      <p class="tagline">Aashayein - Hope for Life 🩸</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>TheLifeSaviours - Aashayein</strong></p>
      <p>Every drop counts. Every life matters.</p>
      <div class="social-links">
        <a href="https://thelifesaviours.org">Visit Our Website</a> | 
        <a href="https://thelifesaviours.org/donate-blood">Become a Donor</a> | 
        <a href="https://thelifesaviours.org/request-blood">Request Blood</a>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">
        This is an automated email. Please do not reply.<br>
        If you have questions, contact us at <a href="mailto:info@thelifesaviours.org" style="color: #DC143C;">info@thelifesaviours.org</a>
      </p>
      <p style="color: #999; font-size: 11px;">
        © ${new Date().getFullYear()} TheLifeSaviours by Aashayein. All rights reserved.<br>
        <a href="https://thelifesaviours.org" style="color: #DC143C; text-decoration: none;">thelifesaviours.org</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
