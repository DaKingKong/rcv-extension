// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RcThemeProvider } from '@ringcentral/juno';
import { RcvEngine } from '@ringcentral/video-sdk';
import SDK from './ringcentral';
import App from './Root';
import apiConfig from './config.json';
import client from './client';

const rcSDK = new SDK({
  clientId: apiConfig.clientId,
  server: apiConfig.rcServer,
  redirectUri: apiConfig.redirectUri
});
const rcvEngine = RcvEngine.create(
  {
    httpClient: {
      send: options => rcSDK.platform().send(options),
    },
  }
);
window.rcvEngine = rcvEngine;
const rootElement = window.document.createElement('root');
window.document.body.appendChild(rootElement);
const root = ReactDOM.createRoot(rootElement);

function Root() {
  return (
    <RcThemeProvider>
      <App rcvEngine={rcvEngine} rcSDK={rcSDK} />
    </RcThemeProvider>
  );
}

root.render(
  <Root />
);

console.log('content script loaded.');
chrome.runtime.sendMessage(
  {
    type: "onContentInjected"
  }
);
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type === 'receiveFcmMessage') {
      console.log('receive fcm message: ', request.payload);
    }
  })
client.checkIn();

window.addEventListener("beforeunload", function (e) {
  const jwt = localStorage.getItem('rc-huddle-jwt');
  chrome.runtime.sendMessage({
    type: "onPageClosed",
    url: `${apiConfig.server}/session/check-out?jwtToken=${jwt}`,
    platform: 'Figma',
    docId: window.location.pathname.split('/file/')[1].split('/')[0]
  });
  return true;
}, false);