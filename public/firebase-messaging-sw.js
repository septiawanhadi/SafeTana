// public/firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging (FCM)
// Uses compatibility mode for easy setup in static file

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Configuration dari .env (Karena ini file static di public, kita hardcode atau biarkan browser ambil dari cache)
// Penting: Samakan dengan config di src/firebase.js
firebase.initializeApp({
  apiKey: "AIzaSyAFkPhOZTGPhD0p3CMsHLcZpsEvyrRSHlQ",
  authDomain: "safetana-5d898.firebaseapp.com",
  projectId: "safetana-5d898",
  storageBucket: "safetana-5d898.firebasestorage.app",
  messagingSenderId: "922934871571",
  appId: "1:922934871571:web:7c77211ff2fdd07d77e1e6"
});

const messaging = firebase.messaging();

// Menangani pesan saat aplikasi di background/ditutup
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Menerima pesan background: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png', // Ganti dengan path logo aplikasi Anda
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});