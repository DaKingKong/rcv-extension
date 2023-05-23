import React, { useState } from 'react';
import { RcButton, RcLoading } from '@ringcentral/juno';

const textContainerStyle = {
    display: 'flex',
    fontFamily: 'Lato',
    fontSize: '16px',
    fontWeight: 'bold',
    alignItems: 'center',
    flexDirection: 'column'
}

export function LogInButton({
    rcSDK
}) {
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isError, setIsError] = useState(false);
    window.addEventListener("message", async (event) => {
        if (event.data && event.data.callbackUri) {
            setLoading(true);
            const loginOptions = rcSDK.parseLoginRedirect(event.data.callbackUri);
            loginOptions['code_verifier'] = rcSDK.platform()._codeVerifier;

            const { fromTabId } = await chrome.storage.local.get('fromTabId');
            const { isSuccessful } = await chrome.tabs.sendMessage(fromTabId, { loginOptions });
            setLoading(false);
            if (isSuccessful) {
                setLoggedIn(true);
            }
            else {
                setIsError(true);
            }
        }
    }, false);

    return (
        <RcLoading
            loading={loading}
        >
            {isError &&
                <div style={textContainerStyle}>
                    <p>An error occurred.</p>
                    <p>Please try again to log in.</p>
                    <p>Contact da.kong@ringcentral.com if needed.</p>
                </div>
            }
            {!isError && (
                loggedIn ? (
                    <div style={textContainerStyle}>
                        <p>Successfully logged in.</p>
                        <p>You can close this window now.</p>
                    </div>
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
                )
            )}
        </RcLoading>
    )
}