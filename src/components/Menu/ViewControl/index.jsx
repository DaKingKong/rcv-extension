import React, { useState, useEffect } from 'react';
import { RcButton, RcIconButton } from '@ringcentral/juno';
import DragImage from '../../../images/dragImage_blue.png';
import MenuLogo from '../../../images/menuLogo.png';
import { HuddleButton } from './HuddleButton';
import { JoinButton } from './JoinButton';
import { SettingsPanel } from './SettingsPanel';
import { Settings, Close } from '@ringcentral/juno-icon';

const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
}

const pageViewParticipantCountBadgeStyle = {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#2DAE2D',
    borderRadius: ' 50%',
    height: '18px',
    width: '18px',
    color: 'white',
    border: 'solid 3px white',
}

export function ViewControl({
    meetingId,
    setMeetingId,
    hostname,
    setHostname,
    loggedIn,
    setLoggedIn,
    rcSDK,
    setLoading
}) {
    // show states: 1. none, 2. login, 3. huddle, 4. join
    const [showState, setShowState] = useState('none');
    const [pageViewParticipants, setPageViewParticipants] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        window.addEventListener('message', (event) => {
            if (event.detail && event.detail.type === 'rc-huddle-page-view-change') {
                setPageViewParticipants(event.detail.participants);
                setMeetingId(event.detail.meetingId);
                setHostname(event.detail.hostname);
            }
            if (event.detail && event.detail.type === 'rc-huddle-update-huddle') {
                setHostname(event.detail.hostname);
                setMeetingId(event.detail.meetingId);
            }
        })
    }, []);

    useEffect(() => {
        if (loggedIn) {
            meetingId === '' ? setShowState('huddle') : setShowState('join');
        }
    }, [meetingId]);

    return (
        <div
            style={containerStyle}
            onPointerLeave={() => {
                if (!showSettings && showState !== 'join') {
                    setShowState('none');
                }
            }}
        >
            {showState === 'none' &&
                <RcButton
                    variant="plain"
                    size='large'
                    style={{ padding: '0px' }}
                    onPointerEnter={() => {
                        loggedIn ? setShowState('huddle') : setShowState('login')
                    }}
                >
                    {
                        pageViewParticipants.length > 1 &&
                        <div style={pageViewParticipantCountBadgeStyle}>
                            {pageViewParticipants.length}
                        </div>
                    }
                    <img style={{ height: '48px', width: '48px' }} src={MenuLogo} />
                </RcButton>
            }
            {(showState === 'huddle' || showState === 'login') &&
                <HuddleButton
                    showState={showState}
                    rcSDK={rcSDK}
                    pageViewParticipants={pageViewParticipants}
                    setLoading={setLoading}
                    setShowSettings={setShowSettings}
                />
            }
            {showState === 'huddle' &&
                <div>
                    <RcIconButton
                        size='medium'
                        color="neutral.f01"
                        symbol={showSettings ? Close : Settings}
                        onClick={() => {
                            setShowSettings(!showSettings);
                        }}
                        style={{
                            backgroundColor: 'rgb(6, 111, 172)',
                            height: '48px',
                            width: '48px',
                            marginLeft: '2px'
                        }}
                    >
                    </RcIconButton>
                    {showSettings &&
                        <SettingsPanel
                            setShowState={setShowState}
                            setShowSettings={setShowSettings}
                            setLoggedIn={setLoggedIn}
                        />}
                </div>
            }
            {showState === 'join' &&
                <JoinButton
                    hostname={hostname}
                    meetingId={meetingId}
                    pageViewParticipants={pageViewParticipants}
                />
            }
            <div style={{ cursor: 'grab', display: 'inherit' }}>
                <RcButton
                    className="rc-huddle-menu-handle"
                    variant="plain"
                    size='large'
                    style={{ padding: '0px' }}
                >
                    <img style={{ pointerEvents: 'none', width: '20px', height: '20px' }} src={DragImage} />
                </RcButton>
            </div>
        </div>
    )
}