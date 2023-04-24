import React, { useState, useEffect } from 'react';
import { RcLoading, RcIconButton, RcIcon } from '@ringcentral/juno';
import { RcApp, DragableArea } from '@ringcentral/juno-icon';
import { LogInButton } from './LoginButton';
import { StartMeetingButton } from './StartMeetingButton';
import { LocalAudioMuteButton } from './LocalAudioMuteButton';
import { LocalVideoMuteButton } from './LocalVideoMuteButton';
import { LeaveButton } from './LeaveButton';

const menuContainerStyle = {
    background: '#038FC4',
    borderRadius: '4px',
    boxShadow: '0px 0px 5px 1px rgb(0 0 0 / 18%)',
    position: 'fixed',
    bottom: '100px',
    right: '0',
    zIndex: '99999',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
}

const itemStyle = {
    margin: '3px'
}

export function Menu({
    rcSDK,
    room,
    localParticipant,
    meetingController
}) {
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const init = async () => {
            const isLogged = await rcSDK.platform().loggedIn();
            setLoggedIn(isLogged);
        };
        init();
    }, []);

    window.addEventListener("message", async (event) => {
        if (event.data && event.data.callbackUri) {
            console.log(event.data.callbackUri);
            const loginOptions = rcSDK.parseLoginRedirect(event.data.callbackUri);
            loginOptions['code_verifier'] = localStorage.getItem('codeVerifier');
            await rcSDK.login(loginOptions);
            setLoggedIn(true);
        }
    }, false);

    return (
        <div style={menuContainerStyle}>
            <RcLoading loading={loading}>
                <div style={{ cursor: 'grab', display: 'inherit' }}>
                    <RcIcon
                        className="handle"
                        variant="plain"
                        size='large'
                        color="neutral.f01"
                        symbol={DragableArea}
                    />
                </div>
                <RcIconButton
                    variant="plain"
                    size='large'
                    stretchIcon
                    color="neutral.f01"
                    symbol={RcApp}
                    onClick={() => { setCollapsed(!collapsed); }}
                    style={itemStyle}
                />
                {!!!room && !collapsed && loggedIn &&
                    <StartMeetingButton
                        setLoading={setLoading}
                        buttonStyle={itemStyle}
                    />
                }
                {!!!room && !collapsed &&
                    <LogInButton
                        rcSDK={rcSDK}
                        loggedIn={loggedIn}
                        setLoggedIn={setLoggedIn}
                        buttonStyle={itemStyle}
                    />
                }
                {!!room && !collapsed &&
                    <div>
                        <LocalAudioMuteButton
                            buttonStyle={itemStyle}
                            localParticipant={localParticipant}
                            meetingController={meetingController}
                        />
                        <LocalVideoMuteButton
                            buttonStyle={itemStyle}
                            localParticipant={localParticipant}
                            meetingController={meetingController}
                        />
                        <LeaveButton
                            buttonStyle={itemStyle}
                            meetingController={meetingController}
                        />
                    </div>
                }
            </RcLoading>
        </div>
    )
}