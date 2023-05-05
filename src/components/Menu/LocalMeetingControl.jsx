import React from 'react';
import { LocalAudioMuteButton } from './LocalAudioMuteButton';
import { LocalVideoMuteButton } from './LocalVideoMuteButton';
import { LeaveButton } from './LeaveButton';

const itemStyle = {
    margin: '3px'
}

export function LocalMeetingControl({
    localParticipant,
    meetingController
}) {
    return (
        <div>
            <LocalAudioMuteButton
                buttonStyle={itemStyle}
            />
            <LocalVideoMuteButton
                buttonStyle={itemStyle}
                localParticipant={localParticipant}
                meetingController={meetingController}
            />
            <LeaveButton
                buttonStyle={itemStyle}
                meetingController={meetingController}
            />
        </div>
    )
}