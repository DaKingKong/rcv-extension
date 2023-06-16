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
import client from './client';

const rcSDK = new SDK({
  clientId: process.env.CLIENT_ID,
  server: process.env.RC_SERVER,
  redirectUri: process.env.REDIRECT_URI
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
      <App rcSDK={rcSDK} />
    </RcThemeProvider>
  );
}

const showUI = client.getDocInfo();
if (showUI) {
  root.render(
    <Root />
  );
  client.checkIn()
}

console.log('content script loaded.');