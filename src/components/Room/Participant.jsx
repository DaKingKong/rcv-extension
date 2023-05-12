import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { AudioTrack } from './AudioTrack';
import { VideoTrack } from './VideoTrack';
import { RemoteAudioMuteButton } from './RemoteAudioMuteButton';
import { RemoteVideoMuteButton } from './RemoteVideoMuteButton';
import { RcIconButton } from '@ringcentral/juno';
import { Expand } from '@ringcentral/juno-icon';
import Crown from '../../images/crown.png';

export function Participant({
  participant,
  videoTrack,
  audioTrack,
  meetingController,
  index,
  isActiveSpeaker
}) {
  const itemStyle = {
    margin: '3px'
  }
  const rotatedItemStyle = {
    transform: 'rotate(90deg)',
    margin: '3px'
  }
  const menuContainerStyle = {
    background: 'rgb(47,47,47)',
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
    top: '0',
    left: `${230 * index}px`
  }

  const [size, setSize] = useState(200);
  const [headshotUrl, setHeadshot] = useState('');
  useEffect(() => {
    const getHeadshot = async () => {
      const headshot = await participant.getHeadshotUrl();
      setHeadshot(headshot);
    }
    getHeadshot();
  }, []);
  function getInitials() {
    if (!!!participant.displayName) {
      return '';
    }
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

  function isParticipantHost() {
    const userController = meetingController.getUserController();
    const user = userController.getMeetingUserById(participant.uid);
    if (user) {
      return user.isHost;
    }
    return false;
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
        {isParticipantHost() && <img src={Crown} style={{
          height: size * 0.15,
          width: size * 0.15,
          position: 'absolute',
          left: '7%',
          top: '7%',
        }}></img>}
        {
          videoTrack && videoTrack.stream && videoTrack.stream.active ?
            (<div className={`rc-huddle-drag-participant-${participant.uid}`} style={{ cursor: 'grab' }}>
              <VideoTrack track={videoTrack.stream} size={size} isActiveSpeaker={isActiveSpeaker} />
            </div>)
            :
            (<div style={{
              cursor: 'grab',
              width: size,
              borderRadius: '50%',
              height: size,
              border: `solid 8px ${(isActiveSpeaker) ? 'rgb(45, 174, 45)' : 'white'}`,
              boxShadow: '0px 0px 5px 1px rgb(0 0 0 / 18%)',
              background: "#2F2F2F",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: "#000000",
            }}
              className={`rc-huddle-drag-participant-${participant.uid}`}
            >
              <div style={{
                fontFamily: 'sans-serif',
                width: size * 0.5,
                borderRadius: '50%',
                height: size * 0.5,
                background: "rgb(6, 111, 172)",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: "#000000",
              }}>
                {headshotUrl === '' ?
                  <div style={{ color: 'white', fontSize: '30px', fontWeight: 'bold' }}>{getInitials()}</div>
                  :
                  <img style={{
                    cursor: 'grab',
                    width: size,
                    borderRadius: '50%',
                    height: size,
                    border: `solid 8px ${(isActiveSpeaker) ? 'rgb(45, 174, 45)' : 'white'}`,
                    boxShadow: '0px 0px 5px 1px rgb(0 0 0 / 18%)',
                    background: "#2F2F2F",
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: "#000000",
                    pointerEvents: 'none'
                  }} src={headshotUrl} />
                }
              </div>
            </div>)
        }
        {
          audioTrack && (<AudioTrack track={audioTrack.stream} />)
        }
        <div style={menuContainerStyle}>
          {!participant.isMe && isHostOrModerator() && !participant.isAudioMuted &&
            <RemoteAudioMuteButton
              buttonStyle={itemStyle}
              participant={participant}
              meetingController={meetingController}
            />}
          {!participant.isMe && isHostOrModerator() && !participant.isVideoMuted &&
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
    </Draggable >
  );
}