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
    showState,
    rcSDK,
    pageViewParticipants,
    setLoading
}) {
    return (
        <div>
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
                                setLoading(true);
                                try {
                                    const meetingController = await rcvEngine.startInstantMeeting();
                                    const meetingInfo = await meetingController.getMeetingInfo();
                                    startHuddle({ meetingId: meetingInfo.meetingId, hostname: meetingInfo.hostName });
                                    setLoading(false);
                                } catch (e) {
                                    setLoading(false);
                                    console.error(e);
                                }
                            }}
                            style={{ backgroundColor: '#ffffff5c', fontFamily: 'Lato, Helvetica, Arial, sans-serif' }}
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
                            if (showState === 'login') {
                                setLoading(true);
                                const oauthUrl = rcSDK.loginUrl({ usePKCE: true });
                                chrome.runtime.sendMessage({
                                    action: 'openOauth',
                                    url: oauthUrl
                                });
                            }
                            if (showState === 'huddle') {
                                setLoading(true);
                                try {
                                    const meetingController = await rcvEngine.startInstantMeeting();
                                    const meetingInfo = await meetingController.getMeetingInfo();
                                    startHuddle({ meetingId: meetingInfo.meetingId, hostname: meetingInfo.hostName });
                                    setLoading(false);
                                } catch (e) {
                                    setLoading(false);
                                    console.error(e);
                                }
                            }
                        }}
                        style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif' }}
                    >
                        Start Huddle
                    </RcButton>
            }
        </div >
    )
}