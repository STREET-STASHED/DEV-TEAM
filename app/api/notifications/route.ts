export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/app/lib/supabase/server';




export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id, read_at } = body;

    if (!notification_id) {
      return NextResponse.json({ error: 'Missing notification_id' }, { status: 400 });
    }

    // Verify notification belongs to user
    const { data: notification, error: fetchError } = await (supabase as any)
      .from('notifications')
      .select('id')
      .eq('id', notification_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Update notification
    const updateData: Record<string, unknown> = {};
    if (read_at !== undefined) {
      updateData.read_at = read_at;
    }

    const { data: updatedNotification, error: updateError } = await (supabase as any)
      .from('notifications')
      .update(updateData)
      .eq('id', notification_id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating notification:', updateError);
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    console.error('Error in PUT /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notification_id = searchParams.get('id');

    if (!notification_id) {
      return NextResponse.json({ error: 'Missing notification_id' }, { status: 400 });
    }

    // Verify notification belongs to user
    const { data: notification, error: fetchError } = await (supabase as any)
      .from('notifications')
      .select('id')
      .eq('id', notification_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Delete notification
    const { error: deleteError } = await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', notification_id);

    if (deleteError) {
      console.error('Error deleting notification:', deleteError);
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
