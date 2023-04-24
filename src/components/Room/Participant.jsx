import React from 'react';
import Draggable from 'react-draggable';
import { AudioTrack } from './AudioTrack';
import { VideoTrack } from './VideoTrack';
import { RemoteAudioMuteButton } from './RemoteAudioMuteButton';
import { RemoteVideoMuteButton } from './RemoteVideoMuteButton';

export function Participant({
  participant,
  videoTrack,
  audioTrack,
  meetingController
}) {
  const itemStyle = {
    margin: '3px'
  }
  const initialsStyle = {
    pointerEvents: 'none',
    fontFamily: 'sans-serif',
    width: '200px',
    borderRadius: '50%',
    height: '200px',
    border: "solid 8px white",
    boxShadow: '0px 0px 5px 1px rgb(0 0 0 / 18%)',
    background: "#038FC4",
    fontSize: '60px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: "#000000",
  }
  const menuContainerStyle = {
    background: '#038FC4',
    borderRadius: '4px',
    boxShadow: '0px 0px 5px 1px rgb(0 0 0 / 18%)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '2px auto',
    width: 'fit-content'
  }

  function getInitials() {
    const nameSegments = participant.displayName.split(' ');
    let initials = '';
    for (const seg of nameSegments) {
      initials += seg[0];
    }
    return initials;
  }

  function isHostOrModerator() {
    const userController = meetingController.getUserController();
    const me = userController.getMyself();
    console.log('is host: ' + me.isHost)
    console.log('is moderator: ' + me.isModerator)
    return me.isHost || me.isModerator;
  }

  return (
    <Draggable>
      <div>
        {
          videoTrack && videoTrack.stream && videoTrack.stream.active ?
            (<VideoTrack track={videoTrack.stream} />)
            :
            (<div style={initialsStyle}><div>{getInitials()}</div></div>)
        }
        {
          audioTrack && (<AudioTrack track={audioTrack.stream} />)
        }
        {!participant.isMe && isHostOrModerator() && <div style={menuContainerStyle}>
          <RemoteAudioMuteButton
            buttonStyle={itemStyle}
            participant={participant}
            meetingController={meetingController}
          />
          <RemoteVideoMuteButton
            buttonStyle={itemStyle}
            participant={participant}
            meetingController={meetingController}
          />
        </div>}
      </div>
    </Draggable>
  );
}