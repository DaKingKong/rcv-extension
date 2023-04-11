import React from 'react';
import {
  RcTextField,
  RcButton,
} from '@ringcentral/juno';

export function JoinMeeting({
  meetingId,
  onMeetingIdChange,
  password,
  onPasswordChange,
  onJoinMeeting,
  onStartMeeting,
  gotoRoom,
  room,
}) {
  return (
    <div>
      <RcTextField
        label="Meeting room"
        placeholder="Enter room id"
        fullWidth
        value={meetingId}
        onChange={onMeetingIdChange}
        name="meetingId"
        id="meetingId"
      />
      <br />
      <RcTextField
        label="Meeting password"
        placeholder="Enter password"
        fullWidth
        value={password}
        onChange={onPasswordChange}
        name="meetingPassword"
        id="meetingPassword"
      />
      <br />
      <RcButton onClick={onJoinMeeting} disabled={!!room}>Join meeting</RcButton>
      <br />
      <RcButton onClick={onStartMeeting} disabled={!!room}>Start instant meeting</RcButton>
      <br />
      <RcButton onClick={gotoRoom} disabled={!room}>Go to active room</RcButton>
    </div>
  );
}
