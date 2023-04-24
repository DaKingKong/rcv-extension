import React from 'react';
import { ParticipantList } from './ParticipantList';

const style = {
    position: 'absolute',
    zIndex: '999999',
    top: '0'
}

export function Room({
    participants,
    videoTrackMap,
    audioTrackMap
}) {
    return (
        <div style={style}>
            <ParticipantList
                participants={participants}
                videoTrackMap={videoTrackMap}
                audioTrackMap={audioTrackMap}
            />
        </div>
    );
}
