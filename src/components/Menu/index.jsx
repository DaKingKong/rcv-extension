import React, { useState, useEffect } from 'react';
import { RcLoading, RcIconButton, RcIcon } from '@ringcentral/juno';
import { RcApp, DragableArea } from '@ringcentral/juno-icon';
import { LogInButton } from './LoginButton';
import { StartMeetingButton } from './StartMeetingButton';
import { MuteButton } from './MuteButton';
import { VideoCamButton } from './VideoCamButton';
import { LeaveButton } from './LeaveButton';

const itemStyle = {
    margin: '3px'
}

export function Menu({
    rcSDK,
    rcvEngine,
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
            {!!!room && !collapsed &&
                <StartMeetingButton
                    setLoading={setLoading}
                    buttonStyle={itemStyle}
                />
            }
            {!!!room && !collapsed &&
                <LogInButton
                    loggedIn={loggedIn}
                    buttonStyle={itemStyle}
                />
            }
            {!!room && !collapsed &&
                <div>
                    <MuteButton
                        buttonStyle={itemStyle}
                        localParticipant={localParticipant}
                        meetingController={meetingController}
                    />
                    <VideoCamButton
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
    )
}