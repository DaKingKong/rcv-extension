import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Login, Logout } from '@ringcentral/juno-icon';

export function LogInButton({
    rcSDK,
    loggedIn,
    setLoggedIn,
    buttonStyle
}) {
    return (
        <div>
            {
                loggedIn ? (
                    <RcIconButton
                        size='xsmall'
                        stretchIcon
                        color="danger.b04"
                        onClick={
                            async () => {
                                await rcSDK.platform().logout();
                                setLoggedIn(false);
                            }}
                        symbol={Logout}
                        style={buttonStyle}
                    />
                ) : (
                    <RcIconButton
                        size='xsmall'
                        stretchIcon
                        color="neutral.f01"
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
                        symbol={Login}
                        style={buttonStyle}
                    />
                )}
        </div>
    )
}