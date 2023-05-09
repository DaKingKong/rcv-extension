import React, { useState, useEffect } from 'react';
import { RcLoading } from '@ringcentral/juno';
import Draggable from 'react-draggable';
import { LocalMeetingControl } from './LocalMeetingControl';
import { ViewControl } from './ViewControl';
import { getHuddle } from '../../client';

const menuContainerStyle = {
    position: 'fixed',
    bottom: '100px',
    right: '0',
    zIndex: '99999'
}

export function Menu({
    room,
    localParticipant,
    meetingController,
}) {
    const [loading, setLoading] = useState(false);
    const [meetingId, setMeetingId] = useState('');
    const [hostname, setHostname] = useState('');

    useEffect(() => {
        getHuddle();
    }, []);
    return (
        <Draggable axis='y' handle=".rc-huddle-menu-handle">
            <div style={menuContainerStyle}>
                <RcLoading loading={loading}>
                    {!!room ?
                        <LocalMeetingControl
                            localParticipant={localParticipant}
                            meetingController={meetingController}
                        />
                        :
                        <ViewControl
                            meetingId={meetingId}
                            setMeetingId={setMeetingId}
                            hostname={hostname}
                            setHostname={setHostname}
                        />
                    }
                </RcLoading>
            </div>
        </Draggable >
    )
}