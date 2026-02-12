importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAFkPhOZTGPhD0p3CMsHLcZpsEvyrRSHlQ",
  projectId: "safetana-5d898",
  messagingSenderId: "922934871571",
  appId: "1:922934871571:web:7c77211ff2fdd07d77e1e6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-safetana.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});