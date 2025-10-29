import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['requestId', 'requesterEmail', 'requesterMobile', 'requesterName', 'donorName', 'donorMobile', 'donorBloodGroup', 'message', 'consent'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO donor_messages (request_id, donor_name, donor_email, donor_phone, message, willing_to_donate, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [body.requestId, body.donorName, body.requesterEmail, body.donorMobile, body.message, body.consent, 'pending']
    );

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
