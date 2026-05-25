import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});
export const functions = getFunctions(app, 'us-central1'); // Ganti us-central1 dengan region fungsi Anda jika perlu

export const requestForToken = () => {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || import.meta.env.VITE_FIREBASE_VAPID_API_KEY;
  
  if (!vapidKey || vapidKey.includes('PLACEHOLDER')) {
    console.warn('⚠️ FCM VAPID Key tidak valid atau belum dikonfigurasi.');
    return Promise.resolve(null);
  }

  return getToken(messaging, { vapidKey })
    .then((currentToken) => {
      if (currentToken) {
        console.log('✅ FCM Token Perangkat:', currentToken);
        // Tips: Simpan token ini ke Firestore untuk kirim notifikasi ke user spesifik
        return currentToken;
      } else {
        console.warn('⚠️ Tidak ada token FCM. Minta izin notifikasi dulu.');
      }
    })
    .catch((err) => {
      console.error('❌ Gagal ambil token FCM:', err);
    });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });