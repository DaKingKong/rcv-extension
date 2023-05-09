import React, { useState } from 'react';
import { RcButton, RcIcon } from '@ringcentral/juno';
import { VideoMeeting } from '@ringcentral/juno-icon';
import { ViewerList } from './ViewerList';
import { startHuddle } from '../../../client';

const containerStyle = {
    background: 'rgb(6, 111, 172)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '48px',
    borderRadius: '100vw',
    padding: '0px 6px',
}

export function HuddleButton({
    setShowHuddle,
    pageViewParticipants,
}) {
    const [buttonLoading, setButtonLoading] = useState(false);
    return (
        <div
            onPointerLeave={() => {
                if (!buttonLoading) { setShowHuddle(false) }
            }}
        >
            {
                pageViewParticipants.length > 1 ?
                    <div style={containerStyle}>
                        <ViewerList
                            viewers={pageViewParticipants}
                        />
                        <RcButton
                            startIcon={<RcIcon size='xlarge' symbol={VideoMeeting} />}
                            radius="round"
                            size='large'
                            onClick={async () => {
                                setButtonLoading(true);
                                try {
                                    const meetingController = await rcvEngine.startInstantMeeting();
                                    const meetingInfo = await meetingController.getMeetingInfo();
                                    startHuddle({ meetingId: meetingInfo.meetingId, hostname: meetingInfo.hostName });
                                } catch (e) {
                                    console.error(e);
                                }
                                setButtonLoading(false);
                            }}
                            loading={buttonLoading}
                            style={{ backgroundColor: '#ffffff5c' }}
                        >
                            Start Huddle
                        </RcButton>
                    </div>
                    :
                    <RcButton
                        startIcon={<RcIcon size='xxlarge' symbol={VideoMeeting} />}
                        radius="round"
                        size='xlarge'
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const meetingController = await rcvEngine.startInstantMeeting();
                                const meetingInfo = await meetingController.getMeetingInfo();
                                startHuddle({ meetingId: meetingInfo.meetingId, hostname: meetingInfo.hostName });
                            } catch (e) {
                                console.error(e);
                            }
                            setLoading(false);
                        }}
                    >
                        Start Huddle
                    </RcButton>
            }
        </div>
    )
}