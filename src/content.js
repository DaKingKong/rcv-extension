// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RcThemeProvider } from '@ringcentral/juno';
import { HashRouter } from "react-router-dom";
import useGlobalStorage from 'use-global-storage';
import { RcvEngine } from './lib/rcv';
import SDK from './ringcentral';
import App from './Root';
import apiConfig from './config.json';

const rcSDK = new SDK(apiConfig);
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
  const useStorage = useGlobalStorage({
    storageOptions: { name: 'rc-video-demo-db' }
  });
  return (
    <RcThemeProvider>
      <HashRouter>
        <App useStorage={useStorage} rcvEngine={rcvEngine} rcSDK={rcSDK} />
      </HashRouter>
    </RcThemeProvider>
  );
}

root.render(
  <Root />
);

console.log('content script loaded.');