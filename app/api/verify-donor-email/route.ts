import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'public', 'aasha.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV (simple parsing - assumes Email ID is 4th column)
    const lines = csvContent.split('\n');
    const emails = lines.slice(1) // Skip header
      .map(line => {
        const columns = line.split(',');
        return columns[3]?.trim().toLowerCase(); // Email ID column (index 3)
      })
      .filter(Boolean); // Remove empty entries

    // Check if email exists in CSV
    const emailLower = email.trim().toLowerCase();
    const isAuthorized = emails.includes(emailLower);

    if (!isAuthorized) {
      return NextResponse.json({ 
        authorized: false, 
        message: 'Email not found in authorized donor list. You are not authorized to generate a certificate.' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      authorized: true, 
      message: 'Email verified successfully!' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ 
      error: 'Failed to verify email', 
      authorized: false 
    }, { status: 500 });
  }
}
