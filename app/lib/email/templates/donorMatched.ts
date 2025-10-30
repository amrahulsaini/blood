import { baseEmailTemplate } from './baseTemplate';

interface DonorMatchData {
  donorName: string;
  patientName: string;
  requestId: string;
  bloodGroup: string;
  hospitalName: string;
  locality: string;
  emergencyState: string;
  emergencyContact: string;
  patientContact: string;
  requiredBy?: string;
}

export const donorMatchedEmail = (data: DonorMatchData) => {
  const urgencyColor = data.emergencyState === 'critical' ? '#DC143C' : 
                       data.emergencyState === 'urgent' ? '#FFA500' : '#87CEEB';
  
  const urgencyLabel = data.emergencyState === 'critical' ? 'Critical Emergency' :
                       data.emergencyState === 'urgent' ? 'Urgent' : 'Normal';

  const content = `
    <h1 style="color: #DC143C; margin-bottom: 10px;">
      🚨 You've Been Matched with a Blood Request!
    </h1>
    
    <p style="font-size: 16px;">
      Dear <strong>${data.donorName}</strong>,
    </p>
    
    <p>
      A patient in your area urgently needs <strong style="color: #DC143C; font-size: 18px;">${data.bloodGroup}</strong> blood, 
      and you're a perfect match! Your immediate response can save a life.
    </p>

    ${data.emergencyState === 'critical' ? `
      <div class="urgent-box">
        <p style="margin: 0; font-weight: 700; color: #DC143C; font-size: 18px;">
          ⚠️ CRITICAL EMERGENCY - IMMEDIATE ACTION NEEDED
        </p>
        <p style="margin: 10px 0 0 0;">
          This is a life-threatening situation. Please respond as soon as possible!
        </p>
      </div>
    ` : ''}

    <h2 style="color: #8B0000; font-size: 20px; margin-top: 30px;">Request Details:</h2>
    
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Request ID:</strong></td>
          <td style="padding: 8px 0; font-weight: 600;">${data.requestId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Patient Name:</strong></td>
          <td style="padding: 8px 0;">${data.patientName}</td>
        </tr>
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
          <td style="padding: 8px 0; color: #5C4033;"><strong>Emergency Level:</strong></td>
          <td style="padding: 8px 0;">
            <span style="background-color: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 600;">
              ${urgencyLabel}
            </span>
          </td>
        </tr>
        ${data.requiredBy ? `
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Required By:</strong></td>
          <td style="padding: 8px 0; font-weight: 600; color: #DC143C;">${data.requiredBy}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">Contact Information:</h3>
    
    <div class="success-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #2E7D32;"><strong>Emergency Contact:</strong></td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: 700;">
            <a href="tel:${data.emergencyContact}" style="color: #DC143C; text-decoration: none;">
              📞 ${data.emergencyContact}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #2E7D32;"><strong>Patient Contact:</strong></td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: 700;">
            <a href="tel:${data.patientContact}" style="color: #DC143C; text-decoration: none;">
              📞 ${data.patientContact}
            </a>
          </td>
        </tr>
      </table>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">What Should You Do Next?</h3>
    
    <div style="padding-left: 20px;">
      <p style="margin: 10px 0;">
        <strong>1. Confirm Availability:</strong> Click the button below or call the emergency contact immediately
      </p>
      <p style="margin: 10px 0;">
        <strong>2. Check Eligibility:</strong> Ensure you haven't donated in the last 3 months and are healthy
      </p>
      <p style="margin: 10px 0;">
        <strong>3. Plan Your Visit:</strong> Note the hospital location and plan your travel
      </p>
      <p style="margin: 10px 0;">
        <strong>4. Prepare:</strong> Eat well, stay hydrated, and get adequate rest before donating
      </p>
    </div>

    <center>
      <a href="https://thelifesaviours.org/donorentries" 
         class="button" 
         style="background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%); margin: 10px 5px;">
        ✅ I Can Donate
      </a>
      <a href="tel:${data.emergencyContact}" 
         class="button" 
         style="background: #4CAF50; margin: 10px 5px;">
        📞 Call Now
      </a>
    </center>

    <div class="highlight" style="background-color: #FFF8DC; border-left: 4px solid #DC143C; margin-top: 30px;">
      <p style="margin: 0; font-weight: 600; font-size: 16px;">
        🌟 Your Response Can Save a Life Today!
      </p>
      <p style="margin: 10px 0 0 0;">
        Please call the emergency contact or visit TheLifeSaviours platform to confirm your availability.
      </p>
    </div>

    <p style="margin-top: 30px; color: #5C4033;">
      <strong>Important:</strong> If you're unable to donate, please inform us so we can reach out to other donors immediately.
    </p>

    <p style="margin-top: 20px; text-align: center; font-size: 18px; font-weight: 600; color: #DC143C;">
      Thank you for being a LifeSaviour! ❤️🩸
    </p>
  `;

  return baseEmailTemplate(content);
};
