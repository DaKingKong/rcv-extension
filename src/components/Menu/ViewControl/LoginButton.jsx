import React from 'react';
import { RcButton, RcIcon } from '@ringcentral/juno';
import { RcApp } from '@ringcentral/juno-icon';

export function LoginButton({
    setShowState,
    rcSDK,
    setLoading
}) {
    return (
        <div
            onPointerLeave={() => { setShowState('none') }}
        >
            <RcButton
                startIcon={<RcIcon size='xxlarge' symbol={RcApp} />}
                radius="round"
                size='xlarge'
                onClick=
                {() => {
                    setLoading(true);
                    const oauthUrl = rcSDK.loginUrl({ usePKCE: true });
                    chrome.runtime.sendMessage({
                        action: 'openOauth',
                        url: oauthUrl
                    });
                }}
                style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif' }}
            >
                Login
            </RcButton>
        </div>
    )
}