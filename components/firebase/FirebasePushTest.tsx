'use client';

import { firebasePushService } from '@/lib/firebase/push';
import { useEffect, useState } from 'react';

export default function FirebasePushTest() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Check if Firebase push is supported
    const checkSupport = async () => {
      const supported = await firebasePushService.initialize();
      setIsSupported(supported);

      if (supported) {
        // Check current permission status
        setPermission(Notification.permission);

        // Set up foreground message handler
        const unsubscribe = firebasePushService.onForegroundMessage((payload) => {
          console.log('Foreground message received:', payload);
          setMessage(`Received: ${payload.notification?.title || 'Notification'}`);
        });

        return unsubscribe;
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await firebasePushService.requestPermission();
      if (granted) {
        setPermission('granted');
        setMessage('Notification permission granted!');

        // Get FCM token
        const fcmToken = await firebasePushService.getToken();
        setToken(fcmToken);
      } else {
        setMessage('Notification permission denied');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = async () => {
    setIsLoading(true);
    try {
      const fcmToken = await firebasePushService.getToken();
      setToken(fcmToken);
      if (fcmToken) {
        setMessage('FCM token obtained successfully!');
      } else {
        setMessage('Failed to get FCM token');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    if (!token) {
      setMessage('No FCM token available. Please get a token first.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/firebase/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          payload: {
            title: 'Test Notification',
            body: 'This is a test notification from Firebase!',
            icon: '/icons/icon-192x192.png',
            data: {
              type: 'test',
              timestamp: Date.now().toString()
            }
          }
        })
      });

      if (response.ok) {
        setMessage('Test notification sent successfully!');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error || 'Failed to send notification'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Firebase Push Notifications Not Supported
        </h3>
        <p className="text-red-600">
          Your browser or environment doesn't support Firebase Cloud Messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Firebase Push Notifications Test
      </h3>

      <div className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Permission Status:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            permission === 'granted' ? 'bg-green-100 text-green-800' :
            permission === 'denied' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {permission}
          </span>
        </div>

        {/* FCM Token */}
        {token && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-700">FCM Token:</span>
            <div className="mt-1 text-xs text-blue-600 break-all font-mono">
              {token}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Requesting...' : 'Request Permission'}
            </button>
          )}

          {permission === 'granted' && !token && (
            <button
              onClick={getToken}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Getting Token...' : 'Get FCM Token'}
            </button>
          )}

          {token && (
            <button
              onClick={testNotification}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </button>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">{message}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>1. Request notification permission</p>
          <p>2. Get FCM token</p>
          <p>3. Send test notification</p>
          <p>4. Check browser notifications</p>
        </div>
      </div>
    </div>
  );
}
