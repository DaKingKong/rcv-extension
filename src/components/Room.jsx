import React from 'react';
import {
  RcTypography,
  RcIconButton,
} from '@ringcentral/juno';
import { ChevronLeft } from '@ringcentral/juno-icon';

import { ParticipantList } from './ParticipantList';
import { MeetingControl } from './MeetingControl';

export function Room({
  room,
  navigate,
  videoTrackMap,
  audioTrackMap,
  sharingTrackMap,
  onLeave,
  participants,
  localParticipant,
  onMute,
  onUnmute,
  onStopVideo,
  onStartVideo,
  onStartScreenShare,
  onStopScreenShare,
}) {
  return (
    <div>
      <div>
        <RcIconButton
          symbol={ChevronLeft}
          onClick={() => {
            navigate('/app/join-meeting');
          }}
        />
        <RcTypography>
          {room.meetingName}
        </RcTypography>
      </div>
      <br />
      <ParticipantList
        participants={participants}
        videoTrackMap={videoTrackMap}
        audioTrackMap={audioTrackMap}
        sharingTrackMap={sharingTrackMap}
      />
      <br />
      <MeetingControl
        room={room}
        muted={localParticipant && localParticipant.isAudioMuted}
        videoEnabled={localParticipant && !localParticipant.isVideoMuted}
        screenShareEnabled={localParticipant && localParticipant.isScreenSharing}
        onLeave={onLeave}
        onMute={onMute}
        onUnmute={onUnmute}
        onStopVideo={onStopVideo}
        onStartVideo={onStartVideo}
        onStartScreenShare={onStartScreenShare}
        onStopScreenShare={onStopScreenShare}
      />
    </div>
  );
}
