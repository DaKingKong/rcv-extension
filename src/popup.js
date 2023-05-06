import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { RcThemeProvider } from '@ringcentral/juno';
import SDK from './ringcentral';
import apiConfig from './config.json';
import { Popup } from './components/Popup/index';

import { initializeApp } from "./firebase/firebase-app.js";
import { getMessaging, getToken, onMessage } from "./firebase/firebase-messaging.js";
import { firebaseConfig, vapidKey } from './firebaseConfig.js';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

onMessage(messaging, (payload) => {
    console.log('FCM Message received. ', payload);
});
async function getFcmToken() {
    try {
        const serviceWorkerRegistration = await navigator.serviceWorker.ready;
        const fcmToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration });
        return fcmToken;
    }
    catch (e) {
        console.error(e);
    }
}

const rootElement = window.document.createElement('root');
window.document.body.appendChild(rootElement);
const root = ReactDOM.createRoot(rootElement);

const rcSDK = new SDK({
    clientId: apiConfig.clientId,
    server: apiConfig.rcServer,
    redirectUri: apiConfig.redirectUri
});

function Root() {
    return (
        <RcThemeProvider>
            <Popup rcSDK={rcSDK} getFcmToken={getFcmToken} />
        </RcThemeProvider>
    );
}

root.render(
    <Root />
);