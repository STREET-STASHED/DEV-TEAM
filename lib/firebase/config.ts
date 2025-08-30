import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4Mx-v5Gv-j-R8q3tv9YZ9F3K9IDilsDI",
  authDomain: "streetstashed-e1b7d.firebaseapp.com",
  projectId: "streetstashed-e1b7d",
  storageBucket: "streetstashed-e1b7d.firebasestorage.app",
  messagingSenderId: "718676028302",
  appId: "1:718676028302:web:1592f15d4f3538b5ecd2df",
  measurementId: "G-W28L26BNMG"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Cloud Messaging
let messaging: any = null;

// Check if messaging is supported
const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      console.log('[Firebase] Messaging initialized successfully');
    } else {
      console.log('[Firebase] Messaging not supported in this environment');
    }
  } catch (error) {
    console.error('[Firebase] Failed to initialize messaging:', error);
  }
};

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      await initializeMessaging();
    }

    if (!messaging) {
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    if (token) {
      console.log('[Firebase] FCM token obtained:', token);
      return token;
    } else {
      console.log('[Firebase] No registration token available');
      return null;
    }
  } catch (error) {
    console.error('[Firebase] Error getting FCM token:', error);
    return null;
  }
};

// Handle foreground messages
export const onForegroundMessage = (callback: (_payload: any) => void) => {
  if (!messaging) {
    console.warn('[Firebase] Messaging not initialized');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('[Firebase] Foreground message received:', payload);
    callback(payload);
  });
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!messaging) {
      await initializeMessaging();
    }

    if (!messaging) {
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('[Firebase] Notification permission granted');
      return true;
    } else {
      console.log('[Firebase] Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('[Firebase] Error requesting permission:', error);
    return false;
  }
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
};

// Get Firebase app instance
export const getFirebaseApp = () => app;

// Get messaging instance
export const getMessagingInstance = () => messaging;

export default app;
