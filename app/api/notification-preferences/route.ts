import { createRouteHandlerClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'





export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's notification preferences
    const { data: preferences, error: preferencesError } = await (supabase as any)
      .from('notification_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch notification preferences', details: preferencesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      preferences: preferences || null
    })

  } catch (error) {
    console.error('Get notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const preferenceData = await request.json()

    // Validate the preference data
    const validPreferences = [
      'email_notifications',
      'push_notifications',
      'sms_notifications',
      'marketing_emails',
      'order_updates',
      'new_items',
      'promotions'
    ]

    const updateData: any = {}
    validPreferences.forEach(pref => {
      if (preferenceData[pref] !== undefined) {
        updateData[pref] = preferenceData[pref]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid preferences provided' },
        { status: 400 }
      )
    }

    // Update the notification preferences
    const { data, error } = await (supabase as any)
      .from('notification_preferences')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .select('*')
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update notification preferences', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: data?.[0] || null
    })

  } catch (error) {
    console.error('Update notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const preferenceData = await request.json()

    // Create or update notification preferences
    const { data, error } = await (supabase as any)
      .from('notification_preferences')
      .upsert({
        user_id: session.user.id,
        email_notifications: preferenceData.email_notifications ?? true,
        push_notifications: preferenceData.push_notifications ?? true,
        sms_notifications: preferenceData.sms_notifications ?? false,
        marketing_emails: preferenceData.marketing_emails ?? false,
        order_updates: preferenceData.order_updates ?? true,
        new_items: preferenceData.new_items ?? true,
        promotions: preferenceData.promotions ?? true
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save notification preferences', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences saved successfully',
      preferences: data?.[0] || null
    })

  } catch (error) {
    console.error('Save notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
