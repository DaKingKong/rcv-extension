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
    <div>
      {participants.map((participant, i) => (
        <Participant
          key={participant.uid}
          participant={participant}
          videoTrack={videoTrackMap[participant.uid]}
          meetingController={meetingController}
          index={i}
          isActiveSpeaker={
            localParticipant.uid !== participant.uid && participant.uid === activeSpeakerId && !participant.isAudioMuted ||
            localParticipant.uid === participant.uid && !localParticipant.isAudioMuted
          }
        />
      ))}
    </div>
  );
}
