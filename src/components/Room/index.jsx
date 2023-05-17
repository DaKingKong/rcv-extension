import React from 'react';
import { ParticipantList } from './ParticipantList';

const style = {
    position: 'absolute',
    zIndex: '999999',
    top: '0'
}

export function Room({
    meetingController,
    participants,
    videoTrackMap,
    activeSpeakerId,
    localParticipant
}) {
    return (
        <div style={style}>
            <ParticipantList
                meetingController={meetingController}
                participants={participants}
                videoTrackMap={videoTrackMap}
                activeSpeakerId={activeSpeakerId}
                localParticipant={localParticipant}
            />
        </div>
    );
}
