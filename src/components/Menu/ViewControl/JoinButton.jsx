import React, { useState } from 'react';
import { RcButton, RcIcon } from '@ringcentral/juno';
import { VideoMeeting } from '@ringcentral/juno-icon';
import { ViewerList } from './ViewerList';

const containerStyle = {
    background: 'rgb(6, 111, 172)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '48px',
    borderRadius: '100vw',
    padding: '0px 6px',
}

export function JoinButton({
    hostname,
    meetingId,
    pageViewParticipants
}) {
    const [buttonLoading, setButtonLoading] = useState(false);

    const hostAsParticipant = pageViewParticipants.find(p => p.name === hostname);
    return (
        <div style={containerStyle}>
            <ViewerList
                viewers={[hostAsParticipant]}
            />
            <RcButton
                startIcon={<RcIcon size='xlarge' symbol={VideoMeeting} />}
                radius="round"
                size='large'
                onClick={async () => {
                    setButtonLoading(true);
                    try {
                        await rcvEngine.joinMeeting(meetingId);
                    } catch (e) {
                        console.error(e);
                    }
                    setButtonLoading(false);
                }}
                loading={buttonLoading}
                style={{ backgroundColor: '#3C9949' }}
            >
                Join Huddle
            </RcButton>
        </div>
    )
}