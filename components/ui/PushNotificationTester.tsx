'use client';

import { pushService, requestPermission, sendOrderStatusNotification } from '@/lib/push';
import { AlertCircle, Bell, CheckCircle, TestTube, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PushNotificationTester() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testType, setTestType] = useState<'success' | 'error' | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      // Check if Firebase is available
      const firebaseModule = await import('firebase/app');
      if (firebaseModule) {
        setFirebaseStatus('available');
      }
    } catch (error) {
      setFirebaseStatus('unavailable');
    }
  };

  const checkPermissionStatus = async () => {
    const status = await pushService.getPermissionStatus();
    setPermissionStatus(status);
  };

  const requestNotificationPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        setPermissionStatus('granted');
        setTestResult('Notification permission granted successfully!');
        setTestType('success');
      } else {
        setTestResult('Notification permission denied.');
        setTestType('error');
      }
    } catch (error) {
      setTestResult(`Error requesting permission: ${error}`);
      setTestType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    setIsLoading(true);
    try {
      // Test with a mock user and order
      const success = await sendOrderStatusNotification(
        'test-user-123',
        'test-order-456',
        'picked_up',
        'TEST-001'
      );

      if (success) {
        setTestResult('Test notification sent successfully! Check your notifications.');
        setTestType('success');
      } else {
        setTestResult('Failed to send test notification. Check console for details.');
        setTestType('error');
      }
    } catch (error) {
      setTestResult(`Error sending test notification: ${error}`);
      setTestType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getFirebaseStatusIcon = () => {
    switch (firebaseStatus) {
      case 'available':
        return <Zap className="w-5 h-5 text-green-600" />;
      case 'unavailable':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getFirebaseStatusText = () => {
    switch (firebaseStatus) {
      case 'available':
        return 'Firebase Available';
      case 'unavailable':
        return 'Firebase Not Available';
      default:
        return 'Checking Firebase...';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <TestTube className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Push Notification Tester</h3>
      </div>

      {/* Status Display */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            Permission Status: {permissionStatus.toUpperCase()}
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>• OneSignal App ID: {pushService.getOneSignalAppId()}</p>
          <p>• Push Supported: {pushService.isSupported() ? 'Yes' : 'No'}</p>
          <p>• Service Worker: {'serviceWorker' in navigator ? 'Available' : 'Not Available'}</p>
        </div>
      </div>

      {/* Firebase Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          {getFirebaseStatusIcon()}
          <span className="font-medium text-gray-900">{getFirebaseStatusText()}</span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>• Firebase Config: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not Set'}</p>
          <p>• FCM Server Key: {process.env.FIREBASE_SERVER_KEY ? 'Set' : 'Not Set'}</p>
          <p>• VAPID Key: {process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? 'Set' : 'Not Set'}</p>
        </div>

        {firebaseStatus === 'unavailable' && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Firebase is not available. Run <code className="bg-yellow-100 px-1 rounded">pnpm add firebase</code> to install it.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={checkPermissionStatus}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Check Permission Status
        </button>

        {permissionStatus !== 'granted' && (
          <button
            onClick={requestNotificationPermission}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Requesting...' : 'Request Notification Permission'}
          </button>
        )}

        {permissionStatus === 'granted' && (
          <button
            onClick={testNotification}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Test Notification'}
          </button>
        )}
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`mt-6 p-4 rounded-lg border ${
          testType === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {testType === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{testResult}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Testing Instructions:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Check if push notifications are supported</li>
          <li>Request notification permission if not granted</li>
          <li>Send a test notification to verify OneSignal integration</li>
          <li>Check your browser's notification area for the test message</li>
        </ol>
      </div>

      {/* Troubleshooting */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Troubleshooting:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Ensure you're on HTTPS (required for service workers)</li>
          <li>Check browser console for any errors</li>
          <li>Verify OneSignal REST API key is set in environment variables</li>
          <li>Make sure service worker is registered at `/sw.js`</li>
          <li>For Firebase: Install with <code className="bg-yellow-100 px-1 rounded">pnpm add firebase</code></li>
        </ul>
      </div>
    </div>
  );
}
