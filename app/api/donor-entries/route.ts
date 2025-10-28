import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'donor-entries.json');

interface DonorEntry {
  fullName: string;
  batch: string;
  age: string;
  bloodGroup: string;
  donorType: string;
  address: string;
  email: string;
  mobile: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DonorEntry = await request.json();

    // Validate required fields
    const requiredFields = ['fullName', 'batch', 'age', 'bloodGroup', 'donorType', 'address', 'email', 'mobile'];
    for (const field of requiredFields) {
      if (!body[field as keyof DonorEntry]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Read existing data or create new array
    let entries: DonorEntry[] = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      entries = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      entries = [];
    }

    // Normalize for comparison
    const normalizedEmail = body.email.trim().toLowerCase();
    const normalizedMobile = body.mobile.trim();

    // Uniqueness checks for email and mobile
    const existingByEmail = entries.find(
      (e) => e.email.trim().toLowerCase() === normalizedEmail
    );
    const existingByMobile = entries.find(
      (e) => e.mobile.trim() === normalizedMobile
    );

    if (existingByEmail || existingByMobile) {
      const conflicts: string[] = [];
      if (existingByEmail) conflicts.push('email');
      if (existingByMobile) conflicts.push('mobile');
      return NextResponse.json(
        {
          error: `Already registered with this ${conflicts.join(' and ')}.`,
          fields: conflicts,
        },
        { status: 409 }
      );
    }

    // Add new entry
    entries.push(body);

    // Write back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(entries, null, 2), 'utf-8');

    return NextResponse.json(
      { message: 'Donor entry saved successfully', data: body },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving donor entry:', error);
    return NextResponse.json(
      { error: 'Failed to save donor entry' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const entries = JSON.parse(fileContent);
    
    return NextResponse.json(
      { entries, count: entries.length },
      { status: 200 }
    );
  } catch (error) {
    // If file doesn't exist, return empty array
    return NextResponse.json(
      { entries: [], count: 0 },
      { status: 200 }
    );
  }
}
