import React, { useState, useEffect } from 'react';
import { RcButton } from '@ringcentral/juno';
import DragImage from '../../../images/dragImage_blue.png';
import MenuLogo from '../../../images/menuLogo.png';
import { HuddleButton } from './HuddleButton';
import { JoinButton } from './JoinButton';
import { LoginButton } from './LoginButton';

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
    loggedIn
}) {
    // show states: 1. none, 2. login, 3. huddle, 4. join
    const [showState, setShowState] = useState('none');
    const [pageViewParticipants, setPageViewParticipants] = useState([]);

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
        if (meetingId !== '' && loggedIn) {
            setShowState('join');
        }
    }, [meetingId]);

    return (
        <div style={containerStyle}>
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
            {showState === 'login' &&
                <LoginButton
                    setShowState={setShowState}
                />
            }
            {showState === 'huddle' &&
                <HuddleButton
                    setShowState={setShowState}
                    pageViewParticipants={pageViewParticipants}
                />
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