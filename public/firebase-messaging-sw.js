/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAThs5HO9Aqr59283hI1THUySeRU01CnH8",
  authDomain: "taskflow-app-de4d2.firebaseapp.com",
  projectId: "taskflow-app-de4d2",
  storageBucket: "taskflow-app-de4d2.firebasestorage.app",
  messagingSenderId: "811773000888",
  appId: "1:811773000888:web:6824496ac75674ff8a084d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || '⏰ Reminder TaskFlow!';
  const options = {
    body: payload.notification?.body || 'Waktunya beresin tugas lu!',
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200, 100, 200], // Getar ala alarm
    requireInteraction: true, // Notif nangkring terus sampai diklik user
    data: payload.data
  };

  self.registration.showNotification(title, options);
});
