import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Videocam, VideocamOff } from '@ringcentral/juno-icon';

export function LocalVideoMuteButton({
    buttonStyle,
    localParticipant,
    meetingController
}) {
    return (
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
    )
}