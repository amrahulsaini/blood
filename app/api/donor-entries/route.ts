import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['fullName', 'batch', 'age', 'bloodGroup', 'donorType', 'address', 'email', 'mobile'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const normalizedEmail = body.email.trim().toLowerCase();
    const normalizedMobile = body.mobile.trim();

    const existing = await query<RowDataPacket[]>(
      'SELECT email, phone FROM donor_entries WHERE email = ? OR phone = ?',
      [normalizedEmail, normalizedMobile]
    );

    if (existing.length > 0) {
      const conflicts: string[] = [];
      if (existing.some((e) => e.email === normalizedEmail)) conflicts.push('email');
      if (existing.some((e) => e.phone === normalizedMobile)) conflicts.push('mobile');
      return NextResponse.json({ error: `Already registered with this ${conflicts.join(' and ')}.`, fields: conflicts }, { status: 409 });
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO donor_entries (full_name, email, phone, blood_group, donor_type, batch, age, gender, address, city, state, pincode, is_available, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.fullName, 
        normalizedEmail, 
        normalizedMobile, 
        body.bloodGroup, 
        body.donorType,
        body.batch || null,
        parseInt(body.age), 
        'Male', 
        body.address, 
        'Delhi', 
        'Delhi', 
        '000000', 
        true, 
        'approved'
      ]
    );

    return NextResponse.json({ message: 'Donor entry saved successfully', data: { id: result.insertId, ...body, timestamp: new Date().toISOString() } }, { status: 200 });
  } catch (error) {
    console.error('Error saving donor entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save donor entry';
    return NextResponse.json({ error: 'Failed to save donor entry', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'blood-requests') {
      const requests = await query<RowDataPacket[]>('SELECT id, patient_name as patientName, requester_email as email, requester_phone as contact, blood_group as bloodGroup, hospital_name as hospitalName, city as locality, urgency as emergencyState, status, created_at as submittedAt FROM blood_requests ORDER BY created_at DESC');
      return NextResponse.json(requests, { status: 200 });
    }
    
    const entries = await query<RowDataPacket[]>('SELECT id, full_name as fullName, email, phone as mobile, blood_group as bloodGroup, age, address, city as batch, status, created_at as timestamp FROM donor_entries WHERE status = "approved" ORDER BY created_at DESC');
    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
