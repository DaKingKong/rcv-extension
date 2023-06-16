import React, { useState } from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Logout } from '@ringcentral/juno-icon';

const containerStyle = {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column-reverse',
    flexWrap: 'nowrap',
    alignItems: 'center',
    top: '-50px',
    marginLeft: '2px'
}

export function SettingsPanel({
    setShowState,
    setShowSettings,
    setLoggedIn,
}) {
    const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);
    return (
        <div style={containerStyle}>
            <RcIconButton
                size='medium'
                color="danger.b03"
                symbol={Logout}
                onClick={() => {
                    localStorage.removeItem('rc-huddle-jwt');
                    localStorage.removeItem('rc-platform');
                    setShowSettings(false);
                    setShowState('none');
                    setLoggedIn(false)
                }}
                style={{
                    backgroundColor: '#E6413C',
                    height: '48px',
                    width: '48px',
                }}
                variant='contained'
                onPointerEnter={() => { setShowLogoutTooltip(true); }}
                onPointerLeave={() => { setShowLogoutTooltip(false); }}
            >
                {showLogoutTooltip && <div
                    style={{
                        fontFamily: 'Lato, Helvetica, Arial, sans-serif',
                        fontSize: '12px',
                        backgroundColor: '#212121',
                        position: 'absolute',
                        borderRadius: '6px',
                        right: '54px',
                        width: '70px',
                        padding: '4px'
                    }}
                >Logout</div>}
            </RcIconButton >
        </div >
    )
}