import React, { useState, useEffect } from 'react';
import { RcButton } from '@ringcentral/juno';

export function LogInButton({
    rcSDK
}) {
    const [loggedIn, setLoggedIn] = useState(false);
    window.addEventListener("message", async (event) => {
        if (event.data && event.data.callbackUri) {
            const loginOptions = rcSDK.parseLoginRedirect(event.data.callbackUri);
            loginOptions['code_verifier'] = rcSDK.platform()._codeVerifier;

            const { fromTabId } = await chrome.storage.local.get('fromTabId');
            chrome.tabs.sendMessage(fromTabId, { loginOptions });
            window.close();
        }
    }, false);

    return (
        <div>
            {
                loggedIn ? (
                    <RcButton
                        color="danger.b04"
                        onClick={
                            async () => {
                                await rcSDK.platform().logout();
                                setLoggedIn(false);
                            }}
                    >
                        Logout
                    </RcButton>
                ) : (
                    <RcButton
                        color="action.primary"
                        onClick=
                        {async () => {
                            var loginUrl = rcSDK.loginUrl({ usePKCE: true });
                            try {
                                await rcSDK.loginWindow({ url: loginUrl });
                                setLoggedIn(true);
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                    >
                        Login
                    </RcButton>
                )}
        </div>
    )
}