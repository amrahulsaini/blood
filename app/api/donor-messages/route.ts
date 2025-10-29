import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { sendEmail } from '@/app/lib/email/mailer';
import { donorMatchedEmail } from '@/app/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['requestId', 'requesterEmail', 'requesterMobile', 'requesterName', 'donorName', 'donorMobile', 'donorBloodGroup', 'message', 'consent'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Get blood request details
    const bloodRequests = await query<RowDataPacket[]>(
      'SELECT patient_name, blood_group, hospital_name, city FROM blood_requests WHERE id = ?',
      [body.requestId]
    );

    if (bloodRequests.length === 0) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    const bloodRequest = bloodRequests[0];

    // Insert donor message
    const result = await query<ResultSetHeader>(
      `INSERT INTO donor_messages (request_id, donor_name, donor_email, donor_phone, message, willing_to_donate, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [body.requestId, body.donorName, body.requesterEmail, body.donorMobile, body.message, body.consent, 'pending']
    );

    // Create notification for the requester
    try {
      await query(
        `INSERT INTO notifications (title, message, type, related_id, related_type, priority, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          `New Donor Response - ${body.donorBloodGroup}`,
          `${body.donorName} has responded to your blood request for ${bloodRequest.patient_name}. Contact: ${body.donorMobile}`,
          'request_match',
          body.requestId,
          'blood_request',
          body.consent ? 'high' : 'medium'
        ]
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // Send email to requester
    try {
      const emailHtml = donorMatchedEmail({
        patientName: bloodRequest.patient_name,
        donorName: body.donorName,
        bloodGroup: body.donorBloodGroup,
        hospitalName: bloodRequest.hospital_name,
        locality: bloodRequest.city,
        emergencyState: 'normal',
        emergencyContact: body.donorMobile,
        patientContact: body.requesterMobile,
        requestId: body.requestId,
      });

      await sendEmail({
        to: body.requesterEmail,
        subject: `Donor Found! ${body.donorBloodGroup} Blood Available`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Failed to send donor matched email:', emailError);
    }

    const newMessage = {
      id: result.insertId,
      requestId: body.requestId,
      requesterEmail: body.requesterEmail,
      requesterMobile: body.requesterMobile,
      requesterName: body.requesterName,
      donorName: body.donorName,
      donorMobile: body.donorMobile,
      donorBloodGroup: body.donorBloodGroup,
      message: body.message,
      consent: body.consent,
      timestamp: new Date().toISOString(),
      status: 'unread'
    };

    return NextResponse.json({ message: 'Message sent successfully', data: newMessage }, { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    let sqlQuery = 'SELECT id, request_id as requestId, donor_name as donorName, donor_email as donorEmail, donor_phone as donorMobile, message, willing_to_donate as consent, status, created_at as timestamp FROM donor_messages';
    const params: any[] = [];

    if (requestId) {
      sqlQuery += ' WHERE request_id = ?';
      params.push(requestId);
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const messages = await query<RowDataPacket[]>(sqlQuery, params);
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    await query('UPDATE donor_messages SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ message: 'Message status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
