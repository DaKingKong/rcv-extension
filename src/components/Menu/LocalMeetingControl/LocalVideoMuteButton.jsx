import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Videocam, VideocamOff } from '@ringcentral/juno-icon';

const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '8px'
}

export function LocalVideoMuteButton({
    buttonStyle,
    buttonTextStyle,
    localParticipant,
    meetingController
}) {
    return (
        <div style={containerStyle}>
            <RcIconButton
                size='xsmall'
                stretchIcon
                color="neutral.f01"
                symbol={localParticipant && !localParticipant.isVideoMuted ? Videocam : VideocamOff}
                onClick={async () => {
                    const videoController = meetingController.getVideoController();
                    if (localParticipant && !localParticipant.isVideoMuted) {
                        await videoController.muteLocalVideoStream();
                    } else {
                        await videoController.unmuteLocalVideoStream();
                    }
                }}
                style={buttonStyle}
            />
            <div style={buttonTextStyle}>{localParticipant && localParticipant.isVideoMuted ? 'Start video' : 'Stop video'}</div>
        </div>
    )
}