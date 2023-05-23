import React from 'react';
import { RcButton, RcIcon } from '@ringcentral/juno';
import { RcApp } from '@ringcentral/juno-icon';

export function LoginButton({
    setShowState
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
                    chrome.runtime.sendMessage({
                        action: 'openAuthPopup'
                    });
                }}
                style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif' }}
            >
                Login
            </RcButton>
        </div>
    )
}