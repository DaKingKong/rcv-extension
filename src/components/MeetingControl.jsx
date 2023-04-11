import React, { useState, useEffect } from 'react';
import {
  RcAppBar,
  RcButton,
  RcIconButton,
} from '@ringcentral/juno';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  Screenshare,
  ScreenshareBorder,
} from '@ringcentral/juno-icon';

export function MeetingControl({
  room,
  onLeave,
  onMute,
  onUnmute,
  onStopVideo,
  onStartVideo,
  onStartScreenShare,
  onStopScreenShare,
  muted,
  videoEnabled,
  screenShareEnabled,
}) {
  return (
    <RcAppBar position="fixed">
      <RcIconButton
        symbol={muted ? MicOff : Mic}
        onClick={async () => {
          if (muted) {
            await onUnmute();
            return;
          }
          await onMute();
        }}
      />
      <RcIconButton
        symbol={videoEnabled ? Videocam : VideocamOff}
        onClick={async () => {
          if (videoEnabled) {
            await onStopVideo();
            return;
          }
          await onStartVideo();
        }}
      />
      <RcIconButton
        symbol={screenShareEnabled ? ScreenshareBorder : Screenshare}
        onClick={async () => {
          if (screenShareEnabled) {
            await onStopScreenShare();
            return;
          }
          await onStartScreenShare();
        }}
      />
      <RcButton onClick={onLeave} size="small" variant="outlined" color="danger.b04">
        Leave
      </RcButton>
    </RcAppBar>
  );
}