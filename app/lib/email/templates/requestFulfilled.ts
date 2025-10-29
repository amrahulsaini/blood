import { baseEmailTemplate } from './baseTemplate';

interface RequestFulfilledData {
  patientName: string;
  requestId: string;
  bloodGroup: string;
  donorName?: string;
  hospitalName: string;
  donationDate?: string;
}

export const requestFulfilledEmail = (data: RequestFulfilledData) => {
  const content = `
    <h1 style="color: #2E7D32; margin-bottom: 10px;">
      ✅ Blood Request Successfully Fulfilled!
    </h1>
    
    <p style="font-size: 16px;">
      Dear <strong>${data.patientName}</strong>,
    </p>
    
    <p style="font-size: 16px;">
      We have wonderful news! Your blood request has been successfully fulfilled. 
      A generous donor has come forward to help you in your time of need.
    </p>

    <div class="success-box">
      <p style="margin: 0; font-weight: 700; color: #2E7D32; font-size: 18px;">
        🎉 Request Status: FULFILLED
      </p>
      <p style="margin: 8px 0 0 0;">
        Request ID: <strong>${data.requestId}</strong>
      </p>
    </div>

    <h2 style="color: #8B0000; font-size: 20px; margin-top: 30px;">Fulfillment Details:</h2>
    
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Blood Group:</strong></td>
          <td style="padding: 8px 0; color: #DC143C; font-size: 20px; font-weight: 700;">${data.bloodGroup}</td>
        </tr>
        ${data.donorName ? `
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Donor Name:</strong></td>
          <td style="padding: 8px 0; font-weight: 600;">${data.donorName}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Hospital:</strong></td>
          <td style="padding: 8px 0;">${data.hospitalName}</td>
        </tr>
        ${data.donationDate ? `
        <tr>
          <td style="padding: 8px 0; color: #5C4033;"><strong>Donation Date:</strong></td>
          <td style="padding: 8px 0;">${data.donationDate}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div class="highlight" style="background-color: #FFF8DC; border-left: 4px solid #2E7D32;">
      <h4 style="margin: 0 0 10px 0; color: #2E7D32;">🌟 A Life Saved Through Community!</h4>
      <p style="margin: 0;">
        This donation was made possible by the kindness of a stranger who chose to be a LifeSaviour. 
        Their selfless act has given hope and healing to you and your loved ones.
      </p>
    </div>

    ${data.donorName ? `
    <h3 style="color: #8B0000; margin-top: 30px;">Express Your Gratitude:</h3>
    
    <p>
      We encourage you to thank <strong>${data.donorName}</strong> for their generous donation. 
      A simple message of gratitude can mean the world to someone who has helped save a life.
    </p>

    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/thank-donor?requestId=${data.requestId}" 
         class="button">
        Send Thank You Message
      </a>
    </center>
    ` : ''}

    <h3 style="color: #8B0000; margin-top: 30px;">Consider Giving Back:</h3>
    
    <p>
      Now that you've experienced the power of blood donation firsthand, we invite you to consider becoming a donor yourself when you're healthy and eligible. 
      Your future donation could save someone else's life, just as this one saved yours.
    </p>

    <div class="info-box">
      <p style="margin: 0; font-weight: 600; color: #8B0000;">
        💡 Share Your Story
      </p>
      <p style="margin: 10px 0 0 0;">
        Help us spread awareness about the importance of blood donation. Share your experience on social media and encourage others to register as donors.
      </p>
    </div>

    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/become-donor" 
         class="button" 
         style="background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%);">
        Register as a Donor
      </a>
    </center>

    <div style="background-color: #FFF8DC; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #8B0000;">
        We wish you a speedy recovery! 🙏
      </p>
      <p style="margin: 10px 0 0 0; color: #5C4033;">
        May you return to good health soon, surrounded by the love and support of your family.
      </p>
    </div>

    <p style="margin-top: 30px; text-align: center; font-size: 20px; font-weight: 700; color: #DC143C;">
      Together, We Save Lives! ❤️🩸
    </p>

    <p style="margin-top: 20px; color: #666; text-align: center;">
      Questions or need assistance? Contact us at <strong>support@thelifesaviours.com</strong>
    </p>
  `;

  return baseEmailTemplate(content);
};
