import React, { useState } from 'react';
import {
  RcTypography,
  RcListItem,
} from '@ringcentral/juno';

import { AudioTrack } from './AudioTrack';
import { VideoTrack } from './VideoTrack';


export function Participant({ participant, videoTrack, audioTrack, sharingTrack }) {
  return (
    <RcListItem divider>
      <div>
        <RcTypography>{participant.displayName}</RcTypography>
        {
          videoTrack && (<VideoTrack track={videoTrack.stream} />)
        }
        {
          sharingTrack && (<VideoTrack track={sharingTrack.stream} />)
        }
        {
          audioTrack && (<AudioTrack track={audioTrack.stream} />)
        }
      </div>
    </RcListItem>
  );
}