import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { AudioTrack } from './AudioTrack';
import { VideoTrack } from './VideoTrack';
import { RemoteAudioMuteButton } from './RemoteAudioMuteButton';
import { RemoteVideoMuteButton } from './RemoteVideoMuteButton';
import { RcIconButton } from '@ringcentral/juno';
import { Expand, DragableArea } from '@ringcentral/juno-icon';

export function Participant({
  participant,
  videoTrack,
  audioTrack,
  meetingController
}) {
  const itemStyle = {
    margin: '3px'
  }
  const rotatedItemStyle = {
    transform: 'rotate(90deg)',
    margin: '3px'
  }
  const menuContainerStyle = {
    background: '#038FC4',
    borderRadius: '4px',
    boxShadow: '0px 0px 5px 1px rgb(0 0 0 / 18%)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '4px',
    width: 'fit-content'
  }
  const draggableStyle = {
    width: 'auto',
    height: 'auto',
    placeContent: 'center',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    position: 'absolute',
  }
  const [size, setSize] = useState(200);

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
    return me.isHost || me.isModerator;
  }
  const resizeHandler = (mouseDownEvent) => {
    const startSize = size;
    const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };
    function onMouseMove(mouseMoveEvent) {
      const longEdge =
        (startSize - startPosition.x + mouseMoveEvent.pageX) > (startSize - startPosition.y + mouseMoveEvent.pageY)
          ?
          (startSize - startPosition.x + mouseMoveEvent.pageX) :
          (startSize - startPosition.y + mouseMoveEvent.pageY);
      setSize(longEdge);
    }
    function onMouseUp() {
      document.body.removeEventListener("mousemove", onMouseMove);
    }

    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp, { once: true });
  };

  return (
    <Draggable handle={`.rc-huddle-drag-participant-${participant.uid}`}>
      <div style={draggableStyle}>
        {
          videoTrack && videoTrack.stream && videoTrack.stream.active ?
            (<VideoTrack track={videoTrack.stream} size={size} />)
            :
            (<div style={{
              pointerEvents: 'none',
              fontFamily: 'sans-serif',
              width: size,
              borderRadius: '50%',
              height: size,
              border: "solid 8px white",
              boxShadow: '0px 0px 5px 1px rgb(0 0 0 / 18%)',
              background: "#038FC4",
              fontSize: '60px',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: "#000000",
            }}><div>{getInitials()}</div></div>)
        }
        {
          audioTrack && (<AudioTrack track={audioTrack.stream} />)
        }
        <div style={menuContainerStyle}>
          <RcIconButton
            size='xsmall'
            stretchIcon
            color="neutral.f01"
            symbol={DragableArea}
            className={`rc-huddle-drag-participant-${participant.uid}`}
            style={itemStyle}
          />
          {!participant.isMe && isHostOrModerator() &&
            <RemoteAudioMuteButton
              buttonStyle={itemStyle}
              participant={participant}
              meetingController={meetingController}
            />}
          {!participant.isMe && isHostOrModerator() &&
            <RemoteVideoMuteButton
              buttonStyle={itemStyle}
              participant={participant}
              meetingController={meetingController}
            />}
          <RcIconButton
            size='xsmall'
            stretchIcon
            color="neutral.f01"
            symbol={Expand}
            onMouseDown={resizeHandler}
            style={rotatedItemStyle}
          />
        </div>
      </div>
    </Draggable>
  );
}