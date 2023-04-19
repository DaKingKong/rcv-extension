import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Videocam, VideocamOff } from '@ringcentral/juno-icon';

export function VideoCamButton({
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
                if (localParticipant && !localParticipant.isVideoMuted) {
                    const videoController = meetingController.getVideoController();
                    await videoController.muteLocalVideoStream(true);
                    return;
                }
                const videoController = meetingController.getVideoController();
                await videoController.muteLocalVideoStream(false);
            }}
            style={buttonStyle}
        />
    )
}