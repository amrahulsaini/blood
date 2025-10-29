import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { sendEmail } from '@/app/lib/email/mailer';
import { bloodRequestConfirmationEmail } from '@/app/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = ['patientName', 'age', 'contact', 'hospitalName', 'locality', 'bloodGroup', 'email', 'emergencyContact', 'emergencyState'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const urgency = body.emergencyState === 'Critical' ? 'critical' : body.emergencyState === 'High' ? 'high' : body.emergencyState === 'Medium' ? 'medium' : 'low';

    const result = await query<ResultSetHeader>(
      `INSERT INTO blood_requests 
       (patient_name, requester_name, requester_email, requester_phone, blood_group, units_needed, hospital_name, hospital_address, city, state, pincode, urgency, required_date, reason, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.patientName,
        body.patientName,
        body.email,
        body.contact,
        body.bloodGroup,
        1,
        body.hospitalName,
        body.hospitalName,
        body.locality,
        'Unknown',
        '000000',
        urgency,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        body.emergencyContact || '',
        'pending'
      ]
    );

    const newRequest = {
      id: result.insertId,
      patientName: body.patientName,
      age: body.age,
      contact: body.contact,
      hospitalName: body.hospitalName,
      locality: body.locality,
      bloodGroup: body.bloodGroup,
      email: body.email,
      emergencyContact: body.emergencyContact,
      emergencyState: body.emergencyState,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const emailHtml = bloodRequestConfirmationEmail({
        patientName: newRequest.patientName,
        requestId: String(newRequest.id),
        bloodGroup: newRequest.bloodGroup,
        hospitalName: newRequest.hospitalName,
        locality: newRequest.locality,
        emergencyState: newRequest.emergencyState,
        emergencyContact: newRequest.emergencyContact,
      });

      await sendEmail({
        to: newRequest.email,
        subject: `Blood Request Confirmation - ${newRequest.bloodGroup} Needed`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({ message: 'Blood request submitted successfully', data: newRequest }, { status: 200 });
  } catch (error) {
    console.error('Error creating blood request:', error);
    return NextResponse.json({ error: 'Failed to create blood request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const requests = await query<RowDataPacket[]>(
      `SELECT id, patient_name as patientName, requester_email as email, requester_phone as contact, blood_group as bloodGroup, hospital_name as hospitalName, city as locality, urgency as emergencyState, status, created_at as submittedAt 
       FROM blood_requests 
       ORDER BY created_at DESC`
    );
    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    return NextResponse.json({ error: 'Failed to fetch blood requests' }, { status: 500 });
  }
}
