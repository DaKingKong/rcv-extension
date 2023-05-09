import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Mic, MicOff } from '@ringcentral/juno-icon';

const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '8px'
}

export function LocalAudioMuteButton({
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
            <div style={buttonTextStyle}>{localParticipant && localParticipant.isAudioMuted ? 'Unmute' : 'Mute'}</div>
        </div>
    )
}