import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
 apiKey: "AIzaSyAFkPhOZTGPhD0p3CMsHLcZpsEvyrRSHlQ",
  authDomain: "safetana-5d898.firebaseapp.com",
  projectId: "safetana-5d898",
  storageBucket: "safetana-5d898.firebasestorage.app",
  messagingSenderId: "922934871571",
  appId: "1:922934871571:web:7c77211ff2fdd07d77e1e6",
  measurementId: "G-GDJN7NHW39"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

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