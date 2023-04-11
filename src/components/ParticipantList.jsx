import React from 'react';
import {
  RcTypography,
  RcList,
} from '@ringcentral/juno';

import { Participant } from './Participant';

export function ParticipantList({
  participants,
  videoTrackMap,
  audioTrackMap,
  sharingTrackMap,
}) {
  return (
    <div>
      <RcTypography variant="body2">Participants:</RcTypography>
      <RcList>
        {participants.map(participant => (
          <Participant
            key={participant.uid}
            participant={participant}
            videoTrack={videoTrackMap[participant.uid]}
            audioTrack={audioTrackMap[participant.uid]}
            sharingTrack={sharingTrackMap[participant.uid]}
          />
        ))}
      </RcList>
    </div>
  );
}
