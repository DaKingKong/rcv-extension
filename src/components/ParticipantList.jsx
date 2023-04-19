import React from 'react';
import {
  RcList,
} from '@ringcentral/juno';

import { Participant } from './Participant';

const style = {
  position: 'absolute',
  zIndex: '999999',
  top: '0'
}

export function ParticipantList({
  participants,
  videoTrackMap,
  audioTrackMap
}) {
  return (
    <div style={style}>
      <RcList>
        {participants.map(participant => (
          <Participant
            key={participant.uid}
            participant={participant}
            videoTrack={videoTrackMap[participant.uid]}
            audioTrack={audioTrackMap[participant.uid]}
          />
        ))}
      </RcList>
    </div>
  );
}
