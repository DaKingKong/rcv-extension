import React, { useState, useEffect } from 'react';
import { RcLoading, RcIcon, RcButton } from '@ringcentral/juno';
import { VideoMeeting } from '@ringcentral/juno-icon';
import Draggable from 'react-draggable';
import MenuLogo from '../../images/menuLogo.png';
import DragImage from '../../images/dragImage.png';
import { LocalMeetingControl } from './LocalMeetingControl';

const menuContainerStyle = {
    position: 'fixed',
    bottom: '100px',
    right: '0',
    zIndex: '99999',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
}

export function Menu({
    room,
    localParticipant,
    meetingController
}) {
    const [loading, setLoading] = useState(false);
    const [showHuddle, setShowHuddle] = useState(false);


    return (
        <Draggable axis='y' handle=".rc-huddle-menu-handle">
            <div style={menuContainerStyle}>
                <RcLoading loading={loading}>
                    {showHuddle ?
                        <RcButton
                            startIcon={<RcIcon size='xxlarge' symbol={VideoMeeting} />}
                            onPointerLeave={() => { setShowHuddle(false) }}
                            radius="round"
                            size='xlarge'
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await rcvEngine.startInstantMeeting();
                                } catch (e) {
                                    console.error(e);
                                }
                                setLoading(false);
                            }}
                        >
                            Start Huddle
                        </RcButton>
                        :
                        <RcButton
                            variant="plain"
                            size='large'
                            style={{ padding: '0px' }}
                            onPointerEnter={() => { setShowHuddle(true) }}
                        >
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