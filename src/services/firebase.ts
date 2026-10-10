import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAThs5HO9Aqr59283hI1THUySeRU01CnH8",
  authDomain: "taskflow-app-de4d2.firebaseapp.com",
  projectId: "taskflow-app-de4d2",
  storageBucket: "taskflow-app-de4d2.firebasestorage.app",
  messagingSenderId: "811773000888",
  appId: "1:811773000888:web:6824496ac75674ff8a084d"
};

const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Fungsi minta izin notifikasi dan ambil token
export const requestFcmToken = async (): Promise<string | null> => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Izin notifikasi ditolak oleh user.');
      return null;
    }

    // Registrasi service worker manual biar pasti kebaca
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      console.log('FCM Token didapat:', currentToken);
      return currentToken;
    } else {
      console.warn('Gagal dapet token. Cek VAPID Key atau izin browser.');
      return null;
    }
  } catch (error) {
    console.error('Error saat request FCM Token:', error);
    return null;
  }
};

// Listener notifikasi saat web lagi dibuka (Foreground)
export const onMessageListener = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};
