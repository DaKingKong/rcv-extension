import React, { useState, useEffect } from 'react';
import { RcLoading, RcButton } from '@ringcentral/juno';
import Draggable from 'react-draggable';
import MenuLogo from '../../images/menuLogo.png';
import DragImage from '../../images/dragImage.png';
import { LocalMeetingControl } from './LocalMeetingControl';
import { HuddleButton } from './HuddleButton';

const menuContainerStyle = {
    position: 'fixed',
    bottom: '100px',
    right: '0',
    zIndex: '99999',
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

export function Menu({
    room,
    localParticipant,
    meetingController
}) {
    const [loading, setLoading] = useState(false);
    const [showHuddle, setShowHuddle] = useState(false);
    const [pageViewParticipants, setPageViewParticipants] = useState([]);

    useEffect(() => {
        window.addEventListener('message', (event) => {
            if (event.detail && event.detail.type === 'rc-huddle-page-view-change') {
                setPageViewParticipants(event.detail.participants);
            }
        })
    }, []);

    return (
        <Draggable axis='y' handle=".rc-huddle-menu-handle">
            <div style={menuContainerStyle}>
                <RcLoading loading={loading}>
                    {showHuddle ?
                        <HuddleButton
                            rcvEngine={rcvEngine}
                            setLoading={setLoading}
                            setShowHuddle={setShowHuddle}
                            pageViewParticipants={pageViewParticipants}
                        />
                        :
                        <RcButton
                            variant="plain"
                            size='large'
                            style={{ padding: '0px' }}
                            onPointerEnter={() => { setShowHuddle(true) }}
                        >
                            {
                                pageViewParticipants.length > 1 &&
                                <div style={pageViewParticipantCountBadgeStyle}>
                                    {pageViewParticipants.length}
                                </div>
                            }
                            <img src={MenuLogo} />
                        </RcButton>}
                    {!!room ?
                        <LocalMeetingControl
                            localParticipant={localParticipant}
                            meetingController={meetingController}
                        />
                        :
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
                    }
                </RcLoading>
            </div>
        </Draggable >
    )
}