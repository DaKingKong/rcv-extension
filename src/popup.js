import React from 'react';
import ReactDOM from 'react-dom/client';
import { RcThemeProvider } from '@ringcentral/juno';
import SDK from './ringcentral';
import apiConfig from './config.json';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from './firebaseConfig';
import { Popup } from './components/Popup/index';

const rootElement = window.document.createElement('root');
window.document.body.appendChild(rootElement);
const root = ReactDOM.createRoot(rootElement);

// Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);
// const firebaseMessaging = getMessaging(firebaseApp);
// async function getFirebaseToken() {
//   try {
//     Notification.requestPermission().then(async (permission) => {
//       if (permission === 'granted') {
//         {
//           const token = await getToken(firebaseMessaging, { vapidKey });
//           localStorage.setItem("firebaseToken", token);
//           console.log('set firebase token', token);
//         }
//       }
//     });
//   }
//   catch (e) {
//     console.log('failed to get firebase token.', e);
//   }
// }
// getFirebaseToken();

const rcSDK = new SDK({
    clientId: apiConfig.clientId,
    server: apiConfig.rcServer,
    redirectUri: apiConfig.redirectUri
});

function Root() {
    return (
        <RcThemeProvider>
            <Popup rcSDK={rcSDK} />
        </RcThemeProvider>
    );
}

root.render(
    <Root />
);