import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Mic, MicOff } from '@ringcentral/juno-icon';

export function LocalAudioMuteButton({
    buttonStyle,
    localParticipant,
    meetingController
}) {
    return (
        <RcIconButton
            size='xsmall'
            stretchIcon
            color="neutral.f01"
            symbol={localParticipant && localParticipant.isAudioMuted ? MicOff : Mic}
            onClick={async () => {
                const audioController = meetingController.getAudioController();
                if (localParticipant && localParticipant.isAudioMuted) {
                    await audioController.unmuteLocalAudioStream();
                } else {
                    await audioController.muteLocalAudioStream();
                }
            }}
            style={buttonStyle}
        />
    )
}