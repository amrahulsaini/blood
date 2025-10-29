import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Fetch notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const unreadOnly = searchParams.get('unread') === 'true';

    let sqlQuery = `
      SELECT 
        id, 
        title, 
        message, 
        type, 
        related_id as relatedId,
        related_type as relatedType,
        is_read as isRead,
        priority,
        action_url as actionUrl,
        created_at as createdAt
      FROM notifications 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (email) {
      // For now, we'll fetch all notifications since we don't have user_id yet
      // In production, you should link notifications to user accounts
    }

    if (unreadOnly) {
      sqlQuery += ' AND is_read = FALSE';
    }

    sqlQuery += ' ORDER BY created_at DESC LIMIT 50';

    const notifications = await query<RowDataPacket[]>(sqlQuery, params);
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH - Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    await query(
      'UPDATE notifications SET is_read = ?, read_at = NOW() WHERE id = ?',
      [isRead !== false, id]
    );

    return NextResponse.json({ message: 'Notification updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

// POST - Create notification (for internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, relatedId, relatedType, priority } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO notifications (title, message, type, related_id, related_type, priority, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [title, message, type || 'system', relatedId || null, relatedType || null, priority || 'medium']
    );

    return NextResponse.json({ 
      message: 'Notification created successfully', 
      id: result.insertId 
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// DELETE - Clear all notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const readOnly = searchParams.get('readOnly') === 'true';

    if (readOnly) {
      await query('DELETE FROM notifications WHERE is_read = TRUE');
    } else {
      await query('DELETE FROM notifications');
    }

    return NextResponse.json({ message: 'Notifications cleared successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
  }
}
