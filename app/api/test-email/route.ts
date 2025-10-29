import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, verifyEmailConnection } from '@/app/lib/email/mailer';
import { bloodRequestConfirmationEmail } from '@/app/lib/email/templates';

export async function GET(request: NextRequest) {
  try {
    // First verify SMTP connection
    const isConnected = await verifyEmailConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          error: 'SMTP connection failed',
          details: 'Please check your .env.local SMTP configuration'
        },
        { status: 500 }
      );
    }

    // Get test email from query params
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email') || 'test@example.com';

    // Send test email
    const emailHtml = bloodRequestConfirmationEmail({
      patientName: 'Test Patient',
      requestId: 'REQ-TEST-12345',
      bloodGroup: 'O+',
      hospitalName: 'Test Hospital',
      locality: 'Test City',
      emergencyState: 'urgent',
      emergencyContact: '+91-9999999999',
    });

    const result = await sendEmail({
      to: testEmail,
      subject: '🩸 Test Email - Blood Request Confirmation | TheLifeSaviours',
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        messageId: result.messageId,
        sentTo: testEmail,
        smtpConfig: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          from: process.env.SMTP_FROM_EMAIL,
        }
      }
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
