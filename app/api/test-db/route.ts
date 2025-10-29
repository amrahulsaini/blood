import { NextRequest, NextResponse } from 'next/server';
import { testConnection, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection failed',
          error: 'Unable to connect to database'
        },
        { status: 500 }
      );
    }

    // Get table counts
    const donorCount = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM donor_entries');
    const requestCount = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM blood_requests');
    const messageCount = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM donor_messages');

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful!',
        database: {
          host: process.env.DB_HOST || 'localhost',
          name: process.env.DB_NAME || 'thel_blood',
          port: process.env.DB_PORT || '3306',
        },
        tables: {
          donor_entries: donorCount[0]?.count || 0,
          blood_requests: requestCount[0]?.count || 0,
          donor_messages: messageCount[0]?.count || 0,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database test failed',
        error: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
