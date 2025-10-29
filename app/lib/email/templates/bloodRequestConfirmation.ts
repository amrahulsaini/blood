import { baseEmailTemplate } from './baseTemplate';

interface BloodRequestData {
  patientName: string;
  requestId: string;
  bloodGroup: string;
  hospitalName: string;
  locality: string;
  emergencyState: string;
  emergencyContact: string;
}

export const bloodRequestConfirmationEmail = (data: BloodRequestData) => {
  const urgencyColor = data.emergencyState === 'critical' ? '#DC143C' : 
                       data.emergencyState === 'urgent' ? '#FFA500' : '#87CEEB';
  
  const urgencyLabel = data.emergencyState === 'critical' ? 'Critical Emergency' :
                       data.emergencyState === 'urgent' ? 'Urgent' : 'Normal';

  const content = `
    <h1 style="color: #DC143C; margin-bottom: 10px;">
      🩸 Blood Request Submitted Successfully
    </h1>
    
    <p style="font-size: 16px;">
      Dear <strong>${data.patientName}</strong>,
    </p>
    
    <p>
      Your blood request has been successfully submitted to our system. We are actively working to connect you with nearby donors.
    </p>

    <div class="success-box">
      <p style="margin: 0; font-weight: 600; color: #2E7D32;">
        ✓ Request ID: <strong>${data.requestId}</strong>
      </p>
    </div>

    <h2 style="color: #8B0000; font-size: 20px; margin-top: 30px;">Request Details:</h2>
    
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Blood Group Required:</strong></td>
          <td style="padding: 8px 0; color: #DC143C; font-size: 20px; font-weight: 700;">${data.bloodGroup}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Hospital Name:</strong></td>
          <td style="padding: 8px 0;">${data.hospitalName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Location:</strong></td>
          <td style="padding: 8px 0;">${data.locality}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Emergency State:</strong></td>
          <td style="padding: 8px 0;">
            <span style="background-color: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 600;">
              ${urgencyLabel}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Emergency Contact:</strong></td>
          <td style="padding: 8px 0;">${data.emergencyContact}</td>
        </tr>
      </table>
    </div>

    ${data.emergencyState === 'critical' ? `
      <div class="urgent-box">
        <p style="margin: 0; font-weight: 700; color: #DC143C; font-size: 16px;">
          ⚠️ Critical Emergency Alert
        </p>
        <p style="margin: 10px 0 0 0;">
          We understand the urgency of your situation. Our team is prioritizing your request and will contact you as soon as a donor is available.
        </p>
      </div>
    ` : ''}

    <h3 style="color: #8B0000; margin-top: 30px;">What Happens Next?</h3>
    
    <div style="padding-left: 20px;">
      <p style="margin: 10px 0;">
        <strong>1.</strong> We'll search our database for matching donors in your area
      </p>
      <p style="margin: 10px 0;">
        <strong>2.</strong> Nearby donors will be notified about your request
      </p>
      <p style="margin: 10px 0;">
        <strong>3.</strong> You'll receive an email and notification when a donor responds
      </p>
      <p style="margin: 10px 0;">
        <strong>4.</strong> We'll share donor contact details for coordination
      </p>
    </div>

    <div class="highlight">
      <p style="margin: 0; font-weight: 600;">
        💡 Pro Tip: Share your request on social media to reach more potential donors!
      </p>
    </div>

    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/request-status?id=${data.requestId}" 
         class="button">
        Track Request Status
      </a>
    </center>

    <p style="margin-top: 30px; color: #5C4033;">
      If you have any questions or need immediate assistance, please contact us at:
      <br><strong>Emergency Helpline:</strong> +91-XXXX-XXXXXX
    </p>

    <p style="margin-top: 20px;">
      Thank you for trusting TheLifeSaviours. We're working hard to help you! ❤️
    </p>
  `;

  return baseEmailTemplate(content);
};
