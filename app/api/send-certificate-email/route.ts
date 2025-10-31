import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/email/mailer';
import { donorCertificateEmail } from '@/app/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      to,
      donor, // { fullName, email, mobile, bloodGroup, donorType, batch, age, address, city, state, pincode }
      caption,
      certificateBase64, // optional: 'data:image/png;base64,....' or pure base64
      certificateLink, // optional; if not provided, we'll build from name
    } = body || {};

    if (!to || !donor?.fullName || !donor?.email) {
      return NextResponse.json({ error: 'Missing required fields: to, donor.fullName, donor.email' }, { status: 400 });
    }

    const name = donor.fullName;
    const link = certificateLink || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/donorcertificates?name=${encodeURIComponent(name)}`;

    // Prepare optional attachment from base64
    let attachments: any[] | undefined = undefined;
    let inlineCid: string | undefined = undefined;

    if (certificateBase64 && typeof certificateBase64 === 'string') {
      try {
        let base64Data = certificateBase64;
        const match = base64Data.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          base64Data = match[2];
        }
        const buf = Buffer.from(base64Data, 'base64');
        inlineCid = 'certificate-image';
        attachments = [
          {
            filename: `${name.replace(/\s+/g, '_')}_certificate.png`,
            content: buf,
            contentType: 'image/png',
            cid: inlineCid,
          },
        ];
      } catch (err) {
        console.error('Failed to decode certificate base64:', err);
      }
    }

    const html = donorCertificateEmail({ donor, caption: caption || '', certificateLink: link, inlineImageCid: inlineCid });

    await sendEmail({
      to,
      subject: `Your Aashayein Certificate & LinkedIn Caption`,
      html,
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error sending certificate email:', err);
    return NextResponse.json({ error: 'Failed to send certificate email', details: String(err?.message || err) }, { status: 500 });
  }
}
