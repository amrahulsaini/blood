import { baseEmailTemplate } from './baseTemplate';

interface UrgentReminderData {
  patientName: string;
  requestId: string;
  bloodGroup: string;
  hospitalName: string;
  locality: string;
  emergencyContact: string;
  hoursSinceRequest: number;
  requiredBy?: string;
}

export const urgentReminderEmail = (data: UrgentReminderData) => {
  const content = `
    <div class="urgent-box" style="margin-bottom: 20px;">
      <p style="margin: 0; font-weight: 700; color: #DC143C; font-size: 20px;">
        🚨 URGENT REMINDER - BLOOD NEEDED IMMEDIATELY
      </p>
    </div>

    <h1 style="color: #DC143C; margin-bottom: 10px;">
      Your Blood Request Still Needs Attention
    </h1>
    
    <p style="font-size: 16px;">
      Dear <strong>${data.patientName}</strong>,
    </p>
    
    <p style="font-size: 16px;">
      We're still working to find a suitable donor for your blood request submitted <strong>${data.hoursSinceRequest} hours ago</strong>. 
      We understand the urgency of your situation and want to help you expedite the process.
    </p>

    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Request ID:</strong></td>
          <td style="padding: 8px 0; font-weight: 600;">${data.requestId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Blood Group Needed:</strong></td>
          <td style="padding: 8px 0; color: #DC143C; font-size: 20px; font-weight: 700;">${data.bloodGroup}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Hospital:</strong></td>
          <td style="padding: 8px 0;">${data.hospitalName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Location:</strong></td>
          <td style="padding: 8px 0;">${data.locality}</td>
        </tr>
        ${data.requiredBy ? `
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Required By:</strong></td>
          <td style="padding: 8px 0; font-weight: 700; color: #DC143C;">${data.requiredBy}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <h3 style="color: #8B0000; margin-top: 30px;">Suggested Actions to Speed Up the Process:</h3>
    
    <div style="padding-left: 20px;">
      <p style="margin: 15px 0;">
        <strong>1. 📱 Share on Social Media</strong><br>
        <span style="color: #5C4033;">Post your request on Facebook, WhatsApp groups, and Instagram. Personal networks often yield quick results!</span>
      </p>
      <p style="margin: 15px 0;">
        <strong>2. 📞 Contact Local Blood Banks</strong><br>
        <span style="color: #5C4033;">Reach out to nearby hospitals and blood banks directly. They might have stock or know potential donors.</span>
      </p>
      <p style="margin: 15px 0;">
        <strong>3. 🏥 Check with Hospital Staff</strong><br>
        <span style="color: #5C4033;">Hospital staff often know regular donors or have connections with blood donation camps.</span>
      </p>
      <p style="margin: 15px 0;">
        <strong>4. 👥 Ask Friends & Family</strong><br>
        <span style="color: #5C4033;">Direct appeals to your personal network can be very effective. Someone's friend or relative might be a match!</span>
      </p>
      <p style="margin: 15px 0;">
        <strong>5. 🔍 Expand Location Radius</strong><br>
        <span style="color: #5C4033;">Consider accepting donors from nearby areas. Many are willing to travel for urgent cases.</span>
      </p>
    </div>

    <div class="highlight" style="background-color: #FFF8DC; border-left: 4px solid #DC143C;">
      <h4 style="margin: 0 0 10px 0; color: #DC143C;">💡 Pro Tip: Create a Shareable Post</h4>
      <p style="margin: 0;">
        Click the button below to generate a ready-to-share social media post with all your request details. 
        Share it everywhere to maximize reach!
      </p>
    </div>

    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share-request?id=${data.requestId}" 
         class="button" 
         style="background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%); margin: 10px 5px;">
        📤 Generate Shareable Post
      </a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/update-request?id=${data.requestId}" 
         class="button" 
         style="background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%); margin: 10px 5px;">
        ✏️ Update Request Details
      </a>
    </center>

    <h3 style="color: #8B0000; margin-top: 30px;">Alternative Resources:</h3>
    
    <div class="info-box">
      <p style="margin: 0 0 10px 0; font-weight: 600;">
        📍 Nearby Blood Banks in ${data.locality}:
      </p>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin: 5px 0;">Check Google Maps for "Blood Banks near me"</li>
        <li style="margin: 5px 0;">Contact Red Cross Society in your area</li>
        <li style="margin: 5px 0;">Call 104 (National Health Helpline) for guidance</li>
      </ul>
    </div>

    <div style="background-color: #FFEBEE; padding: 20px; border-radius: 8px; margin-top: 30px; border: 2px solid #DC143C;">
      <p style="margin: 0; font-weight: 700; color: #DC143C; font-size: 16px;">
        ⏰ Emergency Helpline: 
        <a href="tel:${data.emergencyContact}" style="color: #DC143C; text-decoration: none; font-size: 20px;">
          ${data.emergencyContact}
        </a>
      </p>
      <p style="margin: 10px 0 0 0; color: #5C4033;">
        Our support team is available 24/7. Don't hesitate to call for assistance!
      </p>
    </div>

    <p style="margin-top: 30px; font-size: 16px;">
      We're continuously searching our donor database and notifying potential matches. 
      <strong style="color: #DC143C;">We haven't given up on finding a donor for you!</strong>
    </p>

    <div class="success-box" style="margin-top: 20px;">
      <p style="margin: 0; font-weight: 600; color: #2E7D32;">
        ✓ Status: Request is ACTIVE and being monitored
      </p>
      <p style="margin: 8px 0 0 0;">
        You'll receive immediate notification when a donor responds
      </p>
    </div>

    <p style="margin-top: 30px; text-align: center; font-size: 18px; font-weight: 600; color: #8B0000;">
      Stay strong! We're here to help you! 💪❤️
    </p>

    <p style="margin-top: 20px; color: #666; text-align: center; font-size: 14px;">
      Questions or concerns? Reply to this email or call our helpline immediately.
    </p>
  `;

  return baseEmailTemplate(content);
};
