import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Videocam, VideocamOff } from '@ringcentral/juno-icon';

export function RemoteVideoMuteButton({
    buttonStyle,
    participant,
    meetingController
}) {
    return (
        <RcIconButton
            size='xsmall'
            stretchIcon
            color="neutral.f01"
            symbol={participant && !participant.isVideoMuted ? Videocam : VideocamOff}
            onClick={async () => {
                const videoController = meetingController.getVideoController();
                // if (participant && participant.isVideoMuted) {
                //     await videoController.unmuteRemoteVideoStream(participant.uid);
                // }
                // else {
                await videoController.muteRemoteVideoStream(participant.uid);
                // }
            }}
            style={buttonStyle}
        />
    )
}