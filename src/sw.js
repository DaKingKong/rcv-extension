import { initializeApp } from "./firebase/firebase-app.js";
import { getMessaging, onBackgroundMessage } from './firebase/firebase-messaging-sw.js';
import { firebaseConfig } from './firebaseConfig.js';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);


onBackgroundMessage(messaging, (payload) => {
  console.log('[background.js] Received background message ', payload);

  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
  });
});