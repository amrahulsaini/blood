import { baseEmailTemplate } from './baseTemplate';

export interface DonorDetails {
  fullName: string;
  email: string;
  mobile: string;
  bloodGroup: string;
  donorType?: string;
  batch?: string;
  age?: number | string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface CertificateEmailParams {
  donor: DonorDetails;
  caption: string;
  certificateLink: string; // fallback link to view/download certificate
  inlineImageCid?: string; // if provided, embed inline <img src="cid:...">
}

export const donorCertificateEmail = ({ donor, caption, certificateLink, inlineImageCid }: CertificateEmailParams) => {
  const safe = (s?: string | number) => (s === undefined || s === null ? '' : String(s));

  const detailsTable = `
    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-top: 8px;">
      <tr style="background:#FFF0F5"><td><strong>Name</strong></td><td>${safe(donor.fullName)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${safe(donor.email)}</td></tr>
      <tr style="background:#FFF0F5"><td><strong>Mobile</strong></td><td>${safe(donor.mobile)}</td></tr>
      <tr><td><strong>Blood Group</strong></td><td>${safe(donor.bloodGroup)}</td></tr>
      <tr style="background:#FFF0F5"><td><strong>Donor Type</strong></td><td>${safe(donor.donorType)}</td></tr>
      <tr><td><strong>Batch</strong></td><td>${safe(donor.batch)}</td></tr>
      <tr style="background:#FFF0F5"><td><strong>Age</strong></td><td>${safe(donor.age)}</td></tr>
      <tr><td><strong>Address</strong></td><td>${safe(donor.address)}</td></tr>
      <tr style="background:#FFF0F5"><td><strong>City</strong></td><td>${safe(donor.city)}</td></tr>
      <tr><td><strong>State</strong></td><td>${safe(donor.state)}</td></tr>
      <tr style="background:#FFF0F5"><td><strong>Pincode</strong></td><td>${safe(donor.pincode)}</td></tr>
    </table>
  `;

  const certificateBlock = inlineImageCid
    ? `<div class="info-box" style="text-align:center">
         <p style="margin: 0 0 8px 0; font-weight:700">Your Certificate</p>
         <img src="cid:${inlineImageCid}" alt="Certificate" style="max-width:100%; border-radius:12px; border:1px solid #f3d;" />
         <div>
           <a class="button" href="${certificateLink}" target="_blank" rel="noopener noreferrer">Download Certificate</a>
         </div>
       </div>`
    : `<div class="info-box" style="text-align:center">
         <p style="margin: 0 0 8px 0; font-weight:700">Your Certificate</p>
         <a class="button" href="${certificateLink}" target="_blank" rel="noopener noreferrer">View / Download Certificate</a>
       </div>`;

  const content = `
    <h2>Congratulations, ${safe(donor.fullName)}! 🎉</h2>
    <p>Thank you for registering as a blood donor with <strong>TheLifeSaviours - Aashayein</strong>. Below are your submitted details, your LinkedIn-ready caption, and your certificate.</p>

    <div class="highlight">
      <h3 style="margin-top:0">Your Details</h3>
      ${detailsTable}
    </div>

    ${certificateBlock}

    <div class="highlight">
      <h3 style="margin-top:0">Your LinkedIn Caption</h3>
      <p style="white-space:pre-wrap; line-height:1.6">${safe(caption)}</p>
      <p style="font-size:12px; color:#7a5; margin-top:10px">Tip: Copy the caption above and paste it on LinkedIn along with your certificate image.</p>
    </div>

    <div class="success-box">
      <p>Every donation inspires hope. Thank you for being the reason someone smiles today. 🩸</p>
    </div>
  `;

  return baseEmailTemplate(content);
};
