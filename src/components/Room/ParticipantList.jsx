import React from 'react';

import { Participant } from './Participant';

export function ParticipantList({
  meetingController,
  participants,
  videoTrackMap,
  audioTrackMap
}) {
  return (
    <div>
      {participants.map((participant, i) => (
        <Participant
          key={participant.uid}
          participant={participant}
          videoTrack={videoTrackMap[participant.uid]}
          audioTrack={audioTrackMap[participant.uid]}
          meetingController={meetingController}
          index={i}
        />
      ))}
    </div>
  );
}
