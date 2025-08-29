import FirebasePushTest from '@/components/firebase/FirebasePushTest';

export default function TestFirebasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firebase Push Notifications Test
          </h1>
          <p className="text-gray-600">
            Test your Firebase Cloud Messaging integration
          </p>
        </div>

        <FirebasePushTest />

        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What This Tests
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Firebase initialization and configuration</li>
            <li>• Notification permission requests</li>
            <li>• FCM token generation</li>
            <li>• Service worker registration</li>
            <li>• Push notification sending</li>
            <li>• Foreground message handling</li>
          </ul>
        </div>

        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ✅ Setup Complete!
          </h3>
          <p className="text-green-800 text-sm">
            Your Firebase push notifications are now fully configured:
          </p>
          <ul className="mt-2 text-green-700 text-sm space-y-1">
            <li>• ✅ VAPID Key configured</li>
            <li>• ✅ Firebase Admin SDK installed</li>
            <li>• ✅ Service worker configured</li>
            <li>• ✅ API endpoints ready</li>
          </ul>
          <div className="mt-3 p-3 bg-green-100 rounded-lg">
            <p className="text-xs text-green-800 font-mono">
              VAPID Key: BI_fDQvkzkgJVoV8BtNA6tfj7-FCRZ76E4eAfLnHwcMVOxApYSz9Nl8-gwLmJMpx05gyGmPnTbfe2QZ26s-HvtI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
