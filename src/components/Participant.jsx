import React from 'react';
import Draggable from 'react-draggable';
import { AudioTrack } from './AudioTrack';
import { VideoTrack } from './VideoTrack';

export function Participant({ participant, videoTrack, audioTrack }) {
  return (
    <Draggable>
      <div>
        {
          videoTrack && (<VideoTrack track={videoTrack.stream} />)
        }
        {
          audioTrack && (<AudioTrack track={audioTrack.stream} />)
        }
      </div>
    </Draggable>
  );
}