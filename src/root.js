import React, { useState, useEffect, useRef } from 'react';
import { RcLoading, RcSlide, RcIconButton, RcIcon } from '@ringcentral/juno';
import { RcApp, DragableArea } from '@ringcentral/juno-icon';
import Draggable from 'react-draggable';
import {
    EngineEvent,
    ErrorCodeType,
    UserEvent,
    StreamEvent,
    AudioEvent,
    VideoEvent,
    StreamType
} from './lib/rcv';

import { TabsContainer } from './components/TabsContainer';
import { Login } from './components/Login';
import { JoinMeeting } from './components/JoinMeeting';
import { Room } from './components/Room';

const containerStyle = {
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

function App({
    rcSDK,
    rcvEngine
}) {
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [meetingController, setMeetingController] = useState(null);
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [localParticipant, setLocalParticipant] = useState(null);
    const [videoTrackMap, setVideoTrackMap] = useState({});
    const videoTrackMapRef = useRef(videoTrackMap);
    const [audioTrackMap, setAudioTrackMap] = useState({});
    const audioTrackMapRef = useRef(audioTrackMap);

    window.addEventListener("message", async (event) => {
        if (event.data && event.data.callbackUri) {
            console.log(event.data.callbackUri);
            const loginOptions = rcSDK.parseLoginRedirect(event.data.callbackUri);
            loginOptions['code_verifier'] = localStorage.getItem('codeVerifier');
            await rcSDK.login(loginOptions);
            setLoggedIn(true);
        }
    }, false);

    useEffect(() => {
        videoTrackMapRef.current = videoTrackMap;
        audioTrackMapRef.current = audioTrackMap;
    }, [videoTrackMap, audioTrackMap]);

    useEffect(() => {
        const init = async () => {
            const isLogged = await rcSDK.platform().loggedIn();
            setLoggedIn(isLogged);
        };
        init();
    }, []);

    return (
        <div >
            <Draggable axis='y' handle=".handle">
                <div style={containerStyle}>
                    <RcLoading loading={loading}>
                        <RcIcon
                         className="handle"
                            variant="plain"
                            size='large'
                            color='neutral.f01'
                            symbol={DragableArea}
                        />
                        <RcIconButton
                            variant="plain"
                            size='large'
                            stretchIcon
                            color='neutral.f01'
                            symbol={RcApp}
                            onClick={() => { setCollapsed(!collapsed); }}
                            style={itemStyle}
                        />
                        {!collapsed && <div style={itemStyle}>
                            <Login
                                loggedIn={loggedIn}
                                onLogin={async () => {
                                    var loginUrl = rcSDK.loginUrl({ usePKCE: true });
                                    try {
                                        const loginOptions = await rcSDK.loginWindow({ url: loginUrl });
                                        setLoggedIn(true);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                onLogout={async () => {
                                    await rcSDK.platform().logout();
                                    setLoggedIn(false);
                                }}
                            />
                        </div>}
                    </RcLoading>
                </div>
            </Draggable>
        </div>
    );
}


export default App;