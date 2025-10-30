import { baseEmailTemplate } from './baseTemplate';

interface DonorContactData {
  requesterName: string;
  donorName: string;
  donorPhone: string;
  donorBloodGroup: string;
  bloodGroupNeeded: string;
  hospitalName: string;
  locality: string;
  donorMessage: string;
  willingToDonate: boolean;
}

export const donorContactedYouEmail = (data: DonorContactData) => {
  const content = `
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); 
                  width: 80px; height: 80px; border-radius: 50%; 
                  display: inline-flex; align-items: center; justify-content: center;
                  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);">
        <span style="font-size: 40px;">✅</span>
      </div>
    </div>

    <h1 style="color: #2E7D32; text-align: center; font-size: 28px; margin: 20px 0;">
      Good News! A Donor Has Contacted You! 🎉
    </h1>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      Dear <strong>${data.requesterName}</strong>,
    </p>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      Great news! <strong>${data.donorName}</strong> has responded to your blood request and ${data.willingToDonate ? '<strong style="color: #4CAF50;">is willing to donate</strong>' : 'has sent you a message'}.
    </p>

    ${data.willingToDonate ? `
      <div style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); 
                  border-left: 4px solid #4CAF50; 
                  padding: 25px; 
                  border-radius: 12px; 
                  margin: 30px 0;">
        <h3 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 18px;">
          ✅ Donor Confirmed Availability
        </h3>
        <p style="color: #333; margin: 0; font-size: 16px;">
          This donor is <strong>ready and willing to donate</strong>. Please contact them immediately to coordinate.
        </p>
      </div>
    ` : ''}

    <div style="background: linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%); 
                border-left: 4px solid #DC143C; 
                padding: 25px; 
                border-radius: 12px; 
                margin: 30px 0;">
      <h3 style="color: #8B0000; margin: 0 0 15px 0; font-size: 18px;">
        👤 Donor Details
      </h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600; width: 40%;">Donor Name:</td>
          <td style="padding: 10px 0; color: #333; font-weight: 700; font-size: 18px;">${data.donorName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600;">Contact Number:</td>
          <td style="padding: 10px 0;">
            <a href="tel:${data.donorPhone}" style="color: #DC143C; font-weight: 700; font-size: 18px; text-decoration: none;">
              📞 ${data.donorPhone}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600;">Donor Blood Group:</td>
          <td style="padding: 10px 0;">
            <span style="background: #DC143C; color: white; padding: 6px 14px; 
                         border-radius: 20px; font-weight: 700; font-size: 16px;">
              ${data.donorBloodGroup}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; font-weight: 600;">Blood Group Needed:</td>
          <td style="padding: 10px 0;">
            <span style="background: #DC143C; color: white; padding: 6px 14px; 
                         border-radius: 20px; font-weight: 700; font-size: 16px;">
              ${data.bloodGroupNeeded}
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
      </table>
    </div>

    ${data.donorMessage ? `
      <div style="background: #F5F5F5; 
                  border: 2px solid #DC143C; 
                  border-radius: 12px; 
                  padding: 20px; 
                  margin: 25px 0;">
        <h3 style="color: #8B0000; margin: 0 0 12px 0; font-size: 16px;">
          💬 Message from Donor
        </h3>
        <p style="color: #333; margin: 0; font-style: italic; line-height: 1.6;">
          "${data.donorMessage}"
        </p>
      </div>
    ` : ''}

    <div style="background: #FFF3CD; 
                border: 2px solid #FFA500; 
                border-radius: 12px; 
                padding: 20px; 
                margin: 25px 0;">
      <h3 style="color: #FF8C00; margin: 0 0 12px 0; font-size: 16px;">
        ⚡ Next Steps - Act Quickly!
      </h3>
      <ol style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li><strong>Call the donor immediately</strong> using the phone number above</li>
        <li>Confirm their availability and donation timing</li>
        <li>Share the exact hospital location and room details</li>
        <li>Coordinate pick-up if needed</li>
        <li>Thank them for their life-saving generosity</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="tel:${data.donorPhone}" 
         style="display: inline-block; 
                background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                color: white; 
                padding: 16px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: 700; 
                font-size: 18px;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
        📞 Call Donor Now
      </a>
    </div>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0; text-align: center;">
      <strong style="color: #DC143C;">Time is critical!</strong> Please contact the donor as soon as possible to coordinate the blood donation.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <p style="color: #666; font-size: 14px; margin: 10px 0;">
        Need help coordinating? Contact our support team
      </p>
      <p style="color: #DC143C; font-size: 16px; font-weight: 600; margin: 5px 0;">
        📧 info@thelifesaviours.org
      </p>
    </div>

    <p style="color: #2E7D32; font-size: 16px; text-align: center; font-weight: 600; margin: 30px 0;">
      We're here to help save lives! 💪❤️
    </p>
  `;

  return baseEmailTemplate(content);
};
