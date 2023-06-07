import React from 'react';
import { RcButton } from '@ringcentral/juno';

const containerStyle = {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column-reverse',
    flexWrap: 'nowrap',
    alignItems: 'center',
    top: '-26px',
}

export function SettingsPanel({
    setShowState,
    setShowSettings,
    setLoggedIn,
}) {
    return (
        <div style={containerStyle}>
            <RcButton
                size='xsmall'
                color="#E6413C"
                radius="round"
                onClick={() => {
                    localStorage.removeItem('rc-huddle-jwt');
                    localStorage.removeItem('rc-platform');
                    setShowSettings(false);
                    setShowState('none');
                    setLoggedIn(false)
                }}
            >
                Logout
            </RcButton>
        </div>
    )
}