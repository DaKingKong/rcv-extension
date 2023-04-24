import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Mic, MicOff } from '@ringcentral/juno-icon';

export function RemoteAudioMuteButton({
    buttonStyle,
    participant,
    meetingController
}) {
    return (
        <RcIconButton
            size='xsmall'
            stretchIcon
            color="neutral.f01"
            symbol={participant && participant.isAudioMuted ? MicOff : Mic}
            onClick={async () => {
                const audioController = meetingController.getAudioController();
                if (participant && participant.isAudioMuted) {
                    await audioController.unmuteRemoteAudioStream(participant.uid);
                }
                else {
                    await audioController.muteRemoteAudioStream(participant.uid);
                }
            }}
            style={buttonStyle}
        />
    )
}