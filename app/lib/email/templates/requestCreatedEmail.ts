import { baseEmailTemplate } from './baseTemplate';

interface RequestCreatedEmailData {
  patientName: string;
  bloodGroup: string;
  hospitalName: string;
  locality: string;
  emergencyState: string;
  requestId: string;
}

export function requestCreatedEmail(data: RequestCreatedEmailData): string {
  const urgencyBadge = data.emergencyState === 'critical' 
    ? '<span style="background: #DC143C; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">🚨 CRITICAL</span>'
    : data.emergencyState === 'urgent'
    ? '<span style="background: #FFA500; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">⚠️ URGENT</span>'
    : '<span style="background: #87CEEB; color: white; padding: 8px 16-px; border-radius: 20px; font-weight: 600; font-size: 14px;">📋 NORMAL</span>';

  const content = `
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%); 
                  width: 80px; height: 80px; border-radius: 50%; 
                  display: inline-flex; align-items: center; justify-content: center;
                  box-shadow: 0 10px 30px rgba(220, 20, 60, 0.3);">
        <span style="font-size: 40px;">🩸</span>
      </div>
    </div>

    <h1 style="color: #8B0000; text-align: center; font-size: 28px; margin: 20px 0;">
      Blood Request Created Successfully!
    </h1>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      Dear <strong>${data.patientName}</strong>,
    </p>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      Your blood request has been successfully submitted to our platform. We are now actively 
      connecting you with compatible blood donors in your area.
    </p>

    <div style="background: linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%); 
                border-left: 4px solid #DC143C; 
                padding: 25px; 
                border-radius: 12px; 
                margin: 30px 0;">
      <h3 style="color: #8B0000; margin: 0 0 15px 0; font-size: 18px;">
        📋 Request Details
      </h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600; width: 40%;">Request ID:</td>
          <td style="padding: 10px 0; color: #333; font-weight: 700;">${data.requestId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600;">Blood Group:</td>
          <td style="padding: 10px 0;">
            <span style="background: #DC143C; color: white; padding: 6px 14px; 
                         border-radius: 20px; font-weight: 700; font-size: 16px;">
              ${data.bloodGroup}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600;">Hospital:</td>
          <td style="padding: 10px 0; color: #333; font-weight: 600;">${data.hospitalName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600;">Location:</td>
          <td style="padding: 10px 0; color: #333;">${data.locality}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600;">Priority:</td>
          <td style="padding: 10px 0;">${urgencyBadge}</td>
        </tr>
      </table>
    </div>

    <div style="background: #E8F5E9; 
                border: 2px solid #4CAF50; 
                border-radius: 12px; 
                padding: 20px; 
                margin: 25px 0;">
      <h3 style="color: #2E7D32; margin: 0 0 12px 0; font-size: 16px;">
        ✅ What Happens Next?
      </h3>
      <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Compatible donors in your area will be notified</li>
        <li>You'll receive notifications when donors respond</li>
        <li>Donors can message you directly through the platform</li>
        <li>Check your profile to see donor responses</li>
      </ul>
    </div>

    <div style="background: #FFF3CD; 
                border: 2px solid #FFA500; 
                border-radius: 12px; 
                padding: 20px; 
                margin: 25px 0;">
      <h3 style="color: #FF8C00; margin: 0 0 12px 0; font-size: 16px;">
        📱 Important Information
      </h3>
      <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Keep your phone accessible for donor calls</li>
        <li>Check your email regularly for updates</li>
        <li>Your request is active for 30 days</li>
        <li>You can view and manage messages in your profile</li>
      </ul>
    </div>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
      We're working to connect you with donors as quickly as possible. 
      ${data.emergencyState === 'critical' ? '<strong style="color: #DC143C;">Your critical request will be prioritized.</strong>' : ''}
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://thelifesaviours.org/profile" 
         style="display: inline-block; 
                background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%);
                color: white; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: 600; 
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);">
        View My Request Dashboard
      </a>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <p style="color: #666; font-size: 14px; margin: 10px 0;">
        Need help? Contact our support team
      </p>
      <p style="color: #DC143C; font-size: 16px; font-weight: 600; margin: 5px 0;">
        📧 info@thelifesaviours.org | 📞 Emergency Helpline
      </p>
    </div>

    <p style="color: #8B0000; font-size: 16px; text-align: center; font-weight: 600; margin: 30px 0;">
      Together, we save lives! 💪❤️
    </p>
  `;

  return baseEmailTemplate(content);
}
