import { baseEmailTemplate } from './baseTemplate';

interface WelcomeEmailData {
  name: string;
  email: string;
}

export const welcomeEmail = (data: WelcomeEmailData) => {
  const content = `
    <h1 style="color: #DC143C; margin-bottom: 10px;">
      🌟 Welcome to TheLifeSaviours - Aashayein!
    </h1>
    
    <p style="font-size: 16px;">
      Dear <strong>${data.name}</strong>,
    </p>
    
    <p style="font-size: 16px;">
      Welcome to <strong>TheLifeSaviours - Aashayein</strong>, a community dedicated to saving lives through blood donation! 
      We're thrilled to have you join our mission to bring hope and healing to those in need.
    </p>

    <div class="success-box">
      <p style="margin: 0; font-weight: 700; color: #2E7D32; font-size: 18px;">
        ✓ Your Account is Now Active!
      </p>
      <p style="margin: 8px 0 0 0;">
        Email: <strong>${data.email}</strong>
      </p>
    </div>

    <h2 style="color: #8B0000; font-size: 20px; margin-top: 30px;">What is TheLifeSaviours?</h2>
    
    <p>
      TheLifeSaviours - Aashayein is a platform that connects blood donors with patients in urgent need. 
      We believe that every drop of blood can make a difference, and together, we can save countless lives.
    </p>

    <div class="highlight" style="background-color: #FFF8DC; border-left: 4px solid #DC143C;">
      <h4 style="margin: 0 0 10px 0; color: #DC143C;">🩸 Our Mission</h4>
      <p style="margin: 0;">
        To ensure that no patient suffers due to lack of blood. We're building a network of compassionate individuals 
        who believe in the power of giving and the strength of community.
      </p>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">How Can You Make a Difference?</h3>
    
    <div style="display: table; width: 100%; margin-top: 20px;">
      <div style="display: table-row;">
        <div style="display: table-cell; padding: 15px; background-color: #FFEBEE; border-radius: 8px; margin: 10px; vertical-align: top; width: 48%;">
          <h4 style="margin: 0 0 10px 0; color: #DC143C;">🩸 Donate Blood</h4>
          <p style="margin: 0; color: #5C4033;">
            Register as a donor and receive notifications when someone nearby needs your blood group. 
            One donation can save up to 3 lives!
          </p>
          <center style="margin-top: 15px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/donorentries" 
               class="button" 
               style="font-size: 14px; padding: 10px 20px;">
              Register as Donor
            </a>
          </center>
        </div>
      </div>
    </div>

    <div style="display: table; width: 100%; margin-top: 15px;">
      <div style="display: table-row;">
        <div style="display: table-cell; padding: 15px; background-color: #E3F2FD; border-radius: 8px; margin: 10px; vertical-align: top; width: 48%;">
          <h4 style="margin: 0 0 10px 0; color: #4682B4;">🆘 Request Blood</h4>
          <p style="margin: 0; color: #5C4033;">
            Need blood urgently? Submit a request and we'll instantly notify all nearby donors with matching blood groups.
          </p>
          <center style="margin-top: 15px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/request-blood" 
               class="button" 
               style="background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%); font-size: 14px; padding: 10px 20px;">
              Request Blood
            </a>
          </center>
        </div>
      </div>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">Platform Features:</h3>
    
    <div class="info-box">
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin: 10px 0;">
          <strong>🔔 Real-time Notifications:</strong> Get instant alerts for matching blood requests
        </li>
        <li style="margin: 10px 0;">
          <strong>📍 Location-based Matching:</strong> Connect with donors and patients in your area
        </li>
        <li style="margin: 10px 0;">
          <strong>⚡ Emergency Response:</strong> Priority alerts for critical and urgent cases
        </li>
        <li style="margin: 10px 0;">
          <strong>📊 Track Your Impact:</strong> See how many lives you've touched through your donations
        </li>
        <li style="margin: 10px 0;">
          <strong>🤝 Community Support:</strong> Join a network of caring individuals committed to helping others
        </li>
      </ul>
    </div>

    <div style="background-color: #FFF8DC; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #2E7D32;">
      <h4 style="margin: 0 0 10px 0; color: #2E7D32;">💡 Did You Know?</h4>
      <p style="margin: 0;">
        <strong>Every 2 seconds</strong>, someone in India needs blood. Yet, only <strong>1% of the population</strong> donates blood annually. 
        Your participation can help bridge this critical gap and save lives!
      </p>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">Getting Started:</h3>
    
    <div style="padding-left: 20px;">
      <p style="margin: 10px 0;">
        <strong>Step 1:</strong> Complete your profile with accurate information
      </p>
      <p style="margin: 10px 0;">
        <strong>Step 2:</strong> Register as a donor or submit a blood request
      </p>
      <p style="margin: 10px 0;">
        <strong>Step 3:</strong> Enable notifications to stay updated
      </p>
      <p style="margin: 10px 0;">
        <strong>Step 4:</strong> Share the platform with friends and family
      </p>
    </div>

    <center style="margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
         class="button" 
         style="background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%); font-size: 16px; padding: 12px 30px;">
        Explore TheLifeSaviours
      </a>
    </center>

    <div style="background-color: #FFEBEE; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
      <p style="margin: 0; font-size: 20px; font-weight: 700; color: #DC143C;">
        Together, We Are LifeSaviours! 🦸‍♂️🦸‍♀️
      </p>
      <p style="margin: 10px 0 0 0; color: #5C4033; font-size: 16px;">
        Every act of kindness creates a ripple. Every donation saves a life. Every share spreads hope.
      </p>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">Need Help?</h3>
    
    <p>
      Our support team is here to assist you 24/7. If you have any questions or need guidance, please don't hesitate to reach out:
    </p>
    
    <div class="info-box">
      <p style="margin: 5px 0;">
        📧 Email: <strong>support@thelifesaviours.com</strong>
      </p>
      <p style="margin: 5px 0;">
        📞 Helpline: <strong>+91-XXXX-XXXXXX</strong>
      </p>
      <p style="margin: 5px 0;">
        🌐 Website: <strong>${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}</strong>
      </p>
    </div>

    <p style="margin-top: 30px; font-size: 16px; color: #5C4033;">
      Thank you for joining our community. Together, we can make a difference, one donation at a time! ❤️🩸
    </p>

    <p style="margin-top: 20px; text-align: center; color: #8B0000; font-style: italic;">
      "The greatest gift you can give someone is the gift of life."
    </p>
  `;

  return baseEmailTemplate(content);
};
