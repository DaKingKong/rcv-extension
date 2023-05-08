import { initializeApp } from "./firebase/firebase-app.js";
import { getMessaging, onBackgroundMessage } from './firebase/firebase-messaging-sw.js';
import { firebaseConfig } from './firebaseConfig.js';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

let creatorTabId = 0;
onBackgroundMessage(messaging, (payload) => {
  console.log('[background.js] Received background message ', payload);

  chrome.tabs.sendMessage(creatorTabId, { type: 'receiveFcmMessage', payload });
  // self.registration.showNotification(payload.data.title, {
  //   body: payload.data.body,
  // });
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "onContentInjected") {
    creatorTabId = sender.tab.id;
  }
})