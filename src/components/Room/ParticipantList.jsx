import React from 'react';

import { Participant } from './Participant';

export function ParticipantList({
  meetingController,
  participants,
  videoTrackMap,
  activeSpeakerId,
  localParticipant
}) {
  return (
    <div style={{ position: 'absolute' }}>
      {participants.map((participant, i) => (
        <Participant
          key={participant.uid}
          participant={participant}
          videoTrack={videoTrackMap[participant.uid]}
          meetingController={meetingController}
          isActiveSpeaker={
            localParticipant.uid !== participant.uid && participant.uid === activeSpeakerId && !participant.isAudioMuted ||
            localParticipant.uid === participant.uid && !localParticipant.isAudioMuted
          }
        />
      ))}
    </div>
  );
}
