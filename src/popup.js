import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { RcThemeProvider } from '@ringcentral/juno';
import SDK from './ringcentral';
import apiConfig from './config.json';
import { Popup } from './components/Popup/index';

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
            <Popup rcSDK={rcSDK} />
        </RcThemeProvider>
    );
}

root.render(
    <Root />
);