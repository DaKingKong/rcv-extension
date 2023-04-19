import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Mic, MicOff } from '@ringcentral/juno-icon';

export function MuteButton({
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
                if (localParticipant && localParticipant.isAudioMuted) {
                    const audioController = meetingController.getAudioController();
                    await audioController.muteLocalAudioStream(false);
                    return;
                }
                const audioController = meetingController.getAudioController();
                await audioController.muteLocalAudioStream(true);
            }}
            style={buttonStyle}
        />
    )
}