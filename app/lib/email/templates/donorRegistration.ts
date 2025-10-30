import { baseEmailTemplate } from './baseTemplate';

interface DonorData {
  name: string;
  donorId: string;
  bloodGroup: string;
  phoneNumber: string;
  locality: string;
  pincode: string;
}

export const donorRegistrationEmail = (data: DonorData) => {
  const content = `
    <h1 style="color: #DC143C; margin-bottom: 10px;">
      🎉 Welcome to TheLifeSaviours Family!
    </h1>
    
    <p style="font-size: 16px;">
      Dear <strong>${data.name}</strong>,
    </p>
    
    <p>
      Thank you for registering as a blood donor with <strong>TheLifeSaviours - Aashayein</strong>! 
      Your decision to become a donor can save lives and bring hope to families in need.
    </p>

    <div class="success-box">
      <p style="margin: 0; font-weight: 600; color: #2E7D32;">
        ✓ Registration Successful!
      </p>
      <p style="margin: 8px 0 0 0; font-size: 14px;">
        Your Donor ID: <strong style="font-size: 16px; color: #DC143C;">${data.donorId}</strong>
      </p>
    </div>

    <h2 style="color: #8B0000; font-size: 20px; margin-top: 30px;">Your Donor Profile:</h2>
    
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Blood Group:</strong></td>
          <td style="padding: 8px 0; color: #DC143C; font-size: 20px; font-weight: 700;">${data.bloodGroup}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Phone Number:</strong></td>
          <td style="padding: 8px 0;">${data.phoneNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Location:</strong></td>
          <td style="padding: 8px 0;">${data.locality}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Pincode:</strong></td>
          <td style="padding: 8px 0;">${data.pincode}</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">What Happens Now?</h3>
    
    <div style="padding-left: 20px;">
      <p style="margin: 10px 0;">
        <strong>📍</strong> You're now part of our active donor network in <strong>${data.locality}</strong>
      </p>
      <p style="margin: 10px 0;">
        <strong>🔔</strong> You'll receive notifications when someone nearby needs <strong>${data.bloodGroup}</strong> blood
      </p>
      <p style="margin: 10px 0;">
        <strong>📞</strong> We'll contact you only when there's an urgent request matching your profile
      </p>
      <p style="margin: 10px 0;">
        <strong>💪</strong> You can update your availability status anytime from your dashboard
      </p>
    </div>

    <div class="highlight" style="background-color: #FFF8DC; border-left: 4px solid #DC143C;">
      <h4 style="margin: 0 0 10px 0; color: #8B0000;">Did You Know?</h4>
      <p style="margin: 0;">
        <strong>One blood donation can save up to 3 lives!</strong> Your single act of kindness creates a ripple effect of hope and healing. 🩸❤️
      </p>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">Important Guidelines:</h3>
    
    <div class="info-box">
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin: 8px 0;">Maintain a gap of at least <strong>3 months</strong> between blood donations</li>
        <li style="margin: 8px 0;">Ensure you're well-rested and have eaten before donating</li>
        <li style="margin: 8px 0;">Stay hydrated before and after donation</li>
        <li style="margin: 8px 0;">Inform us if you have any health changes or concerns</li>
      </ul>
    </div>

    <center>
      <a href="https://thelifesaviours.org/profile" 
         class="button">
        View My Donor Dashboard
      </a>
    </center>

    <p style="margin-top: 30px; color: #5C4033; text-align: center; font-size: 18px; font-weight: 600;">
      You are a <span style="color: #DC143C;">LifeSaviour</span> now! 🦸‍♂️
    </p>

    <p style="margin-top: 20px;">
      Thank you for joining our mission to save lives. Together, we can make a difference! ❤️
    </p>

    <p style="margin-top: 20px; color: #666; font-size: 14px;">
      Questions? Contact us at <strong>info@thelifesaviours.org</strong> or visit <a href="https://thelifesaviours.org" style="color: #DC143C;">thelifesaviours.org</a>
    </p>
  `;

  return baseEmailTemplate(content);
};
