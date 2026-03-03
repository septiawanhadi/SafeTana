import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore, initializeFirestore } from "firebase/firestore";

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
  return getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY' })
    .then((currentToken) => {
      if (currentToken) {
        console.log('Token Perangkat:', currentToken);
        // Di Laravel, simpan token ini ke database user
      }
    })
    .catch((err) => console.log('Gagal ambil token', err));
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });