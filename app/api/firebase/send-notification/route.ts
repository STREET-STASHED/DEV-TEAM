import { NextRequest, NextResponse } from 'next/server';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, string>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  tag?: string;
  renotify?: boolean;
  vibrate?: number[];
}

interface SendNotificationRequest {
  token: string;
  payload: NotificationPayload;
}

export async function POST(request: NextRequest) {
  try {
    const { token, payload }: SendNotificationRequest = await request.json();

    if (!token || !payload) {
      return NextResponse.json(
        { error: 'Token and payload are required' },
        { status: 400 }
      );
    }

    // For now, we'll return a success response
    // In production, you would integrate with Firebase Admin SDK here
    console.log('[Firebase API] Sending notification to token:', token);
    console.log('[Firebase API] Payload:', payload);

            // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[Firebase API] Development mode - simulating notification send');
      console.log('[Firebase API] Would send to token:', token);
      console.log('[Firebase API] With payload:', payload);

      // Simulate successful send in development
      return NextResponse.json({
        success: true,
        message: 'Notification simulated successfully (development mode)',
        token: token,
        payload: payload,
        mode: 'development'
      });
    }

    // Production mode - use Firebase Admin SDK
    const admin = require('firebase-admin');

    // Initialize app if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: 'streetstashed-e1b7d'
      });
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        image: payload.image,
      },
      data: payload.data,
      webpush: {
        notification: {
          actions: payload.actions,
          requireInteraction: payload.requireInteraction,
          tag: payload.tag,
          renotify: payload.renotify,
          vibrate: payload.vibrate,
        },
      },
    };

    const response = await admin.messaging().send({
      token: token,
      ...message,
    });

    console.log('[Firebase API] Message sent successfully:', response);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      token: token,
      payload: payload
    });

  } catch (error) {
    console.error('[Firebase API] Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
