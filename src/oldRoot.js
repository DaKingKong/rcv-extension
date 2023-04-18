import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { RcLoading } from '@ringcentral/juno';
import {
  EngineEvent,
  ErrorCodeType,
  UserEvent,
  StreamEvent,
  AudioEvent,
  VideoEvent,
  StreamType,
  SharingEvent,
  SharingState,
} from './lib/rcv';

import { TabsContainer } from './components/TabsContainer';
import { Login } from './components/Login';
import { JoinMeeting } from './components/JoinMeeting';
import { Room } from './components/Room';

const rootCollapsedStyle = {
  position: 'absolute',
  bottom: '0',
  left: '0',
  zIndex: '99999'
}

function App({
  rcSDK,
  rcvEngine,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const [meetingController, setMeetingController] = useState(null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [localParticipant, setLocalParticipant] = useState(null);
  const [videoTrackMap, setVideoTrackMap] = useState({});
  const videoTrackMapRef = useRef(videoTrackMap);
  const [sharingTrackMap, setSharingTrackMap] = useState({});
  const [audioTrackMap, setAudioTrackMap] = useState({});
  const audioTrackMapRef = useRef(audioTrackMap);
  const sharingTrackMapRef = useRef(sharingTrackMap);

  useEffect(() => {
    videoTrackMapRef.current = videoTrackMap;
    sharingTrackMapRef.current = sharingTrackMap;
    audioTrackMapRef.current = audioTrackMap;
  }, [videoTrackMap, sharingTrackMap, audioTrackMap]);

  useEffect(() => {
    navigate('/app/login');
    const init = async () => {
      const isLogged = await rcSDK.platform().loggedIn();
      setLoggedIn(isLogged);
    };
    init();
  }, []);

  useEffect(() => {
    const onParticipantsUpdated = () => {
      const newMeetingController = rcvEngine.getMeetingController();
      const userController = newMeetingController.getUserController();
      const newParticipants = userController.getMeetingUsers();
      setParticipants(Object.values(newParticipants));
    };
    const onMeetingJoined = async (meetingId, errorCode) => {
      if (errorCode === ErrorCodeType.ERR_OK) {
        const newMeetingController = rcvEngine.getMeetingController();
        setMeetingController(newMeetingController);
        const meetingInfo = await newMeetingController.getMeetingInfo();
        setRoom(meetingInfo);
        const userController = newMeetingController.getUserController();
        setParticipants(Object.values(userController.getMeetingUsers()));
        setLocalParticipant(userController.getMyself());
        userController.on(UserEvent.USER_JOINED, onParticipantsUpdated);
        userController.on(UserEvent.USER_LEFT, onParticipantsUpdated);
        userController.on(UserEvent.USER_UPDATED, onParticipantsUpdated);
        const streamManager = newMeetingController.getStreamManager();
        const onVideoTrackAdded = stream => {
          if (stream.type === StreamType.VIDEO_SCREENSHARING) {
            setSharingTrackMap({
              ...sharingTrackMapRef.current,
              [stream.participantId]: stream,
            });
            return;
          }
          setVideoTrackMap({
            ...videoTrackMapRef.current,
            [stream.participantId]: stream,
          })
        };
        const onVideoTrackRemoved = stream => {
          if (stream.type === StreamType.VIDEO_SCREENSHARING) {
            const newSharingTrackMap = {
              ...sharingTrackMapRef.current,
            };
            delete newSharingTrackMap[stream.participantId];
            setSharingTrackMap(newSharingTrackMap);
            return;
          }
          const newVideoTrackMap = {
            ...videoTrackMapRef.current,
          };
          delete newVideoTrackMap[stream.participantId];
          setVideoTrackMap(newVideoTrackMap)
        };
        const onAudioTrackAdded = stream => {
          const newAudioTrackMap = {
            ...audioTrackMapRef.current,
            [stream.participantId]: stream,
          };
          setAudioTrackMap(newAudioTrackMap)
        };
        const onAudioTrackRemoved = stream => {
          const newAudioTrackMap = {
            ...audioTrackMapRef.current,
          };
          delete newAudioTrackMap[stream.participantId];
          setAudioTrackMap(newAudioTrackMap)
        };
        streamManager.on(StreamEvent.LOCAL_VIDEO_TRACK_ADDED, onVideoTrackAdded);
        streamManager.on(StreamEvent.LOCAL_VIDEO_TRACK_REMOVED, onVideoTrackRemoved);
        streamManager.on(StreamEvent.REMOTE_VIDEO_TRACK_ADDED, onVideoTrackAdded);
        streamManager.on(StreamEvent.REMOTE_VIDEO_TRACK_REMOVED, onVideoTrackRemoved);
        streamManager.on(StreamEvent.LOCAL_AUDIO_TRACK_ADDED, onAudioTrackAdded);
        streamManager.on(StreamEvent.LOCAL_AUDIO_TRACK_REMOVED, onAudioTrackRemoved);
        streamManager.on(StreamEvent.REMOTE_AUDIO_TRACK_ADDED, onAudioTrackAdded);
        streamManager.on(StreamEvent.REMOTE_AUDIO_TRACK_REMOVED, onAudioTrackRemoved);

        const audioController = newMeetingController.getAudioController();
        audioController.enableAudio(true);
        const videoController = newMeetingController.getVideoController();
        audioController.on(AudioEvent.LOCAL_AUDIO_MUTE_CHANGED, (muted) => {
          setLocalParticipant({
            ...userController.getMyself(),
            isAudioMuted: muted,
          });
        });
        videoController.on(VideoEvent.LOCAL_VIDEO_MUTE_CHANGED, (muted) => {
          setLocalParticipant({
            ...userController.getMyself(),
            isVideoMuted: muted,
          });
        });
        const sharingController = newMeetingController.getSharingController();
        sharingController.on(SharingEvent.SHARING_STATE_CHANGED, (sharingState) => {
          if (sharingState === SharingState.SELF_SHARING_BEGIN) {
            setLocalParticipant({
              ...userController.getMyself(),
              isScreenSharing: true,
            });
          } else if (sharingState === SharingState.SELF_SHARING_END) {
            setLocalParticipant({
              ...userController.getMyself(),
              isScreenSharing: false,
            });
          }
        });
        navigate(`/room/${meetingId}`);
        console.log(meetingInfo);
      }
    };
    const onMeetingLeft = () => {
      navigate('/app/join-meeting');
      const userController = meetingController.getUserController();
      userController.off(UserEvent.USER_JOINED, onParticipantsUpdated);
      userController.off(UserEvent.USER_LEFT, onParticipantsUpdated);
      userController.off(UserEvent.USER_UPDATED, onParticipantsUpdated);
      setRoom(null);
      setMeetingController(null);
      setParticipants([]);
    };
    rcvEngine.on(EngineEvent.MEETING_JOINED, onMeetingJoined);
    rcvEngine.on(EngineEvent.MEETING_LEFT, onMeetingLeft);
    return () => {
      rcvEngine.off(EngineEvent.MEETING_JOINED, onMeetingJoined);
      rcvEngine.off(EngineEvent.MEETING_LEFT, onMeetingLeft);
    };
  }, [rcvEngine, navigate]);

  return (
    <div style={rootStyle}>
      <RcLoading loading={loading}>
        <Routes>
          <Route
            path="/app"
            element={<TabsContainer navigate={navigate} />}
            location={location}
          >
            <Route
              path="login"
              element={
                <Login
                  loggedIn={loggedIn}
                  onLogin={async () => {
                    var loginUrl = rcSDK.loginUrl({ usePKCE: true });
                    try {
                      const loginOptions = await rcSDK.loginWindow({ url: loginUrl });
                      await rcSDK.platform().login(loginOptions);
                      setLoggedIn(true);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  onLogout={async () => {
                    await rcSDK.platform().logout();
                    setLoggedIn(false);
                  }}
                />
              }
            />
            <Route
              path="join-meeting"
              element={
                <JoinMeeting
                  meetingId={meetingId}
                  onMeetingIdChange={(e) => setMeetingId(e.target.value)}
                  password={password}
                  onPasswordChange={(e) => setPassword(e.target.value)}
                  onStartMeeting={async () => {
                    setLoading(true);
                    try {
                      await rcvEngine.startInstantMeeting();
                    } catch (e) {
                      console.error(e);
                    }
                    setLoading(false);
                  }}
                  onJoinMeeting={async () => {
                    setLoading(true);
                    try {
                      console.log(password);
                      await rcvEngine.joinMeeting(meetingId, {
                        password: password,
                      });
                    } catch (e) {
                      console.error(e);
                    }
                    setLoading(false);
                  }}
                  room={room}
                  gotoRoom={() => navigate(`/room/${room.meetingId}`)}
                />
              }
            />
          </Route>
          <Route
            path="/room/:roomId"
            element={
              <Room
                room={room}
                participants={participants}
                localParticipant={localParticipant}
                meetingController={meetingController}
                videoTrackMap={videoTrackMap}
                audioTrackMap={audioTrackMap}
                sharingTrackMap={sharingTrackMap}
                navigate={navigate}
                onLeave={async () => {
                  await meetingController.leaveMeeting();
                }}
                onMute={async () => {
                  const audioController = meetingController.getAudioController();
                  await audioController.muteLocalAudioStream(true);
                }}
                onUnmute={async () => {
                  const audioController = meetingController.getAudioController();
                  await audioController.muteLocalAudioStream(false);
                }}
                onStopVideo={async () => {
                  const videoController = meetingController.getVideoController();
                  await videoController.muteLocalVideoStream(true);
                }}
                onStartVideo={async () => {
                  const videoController = meetingController.getVideoController();
                  await videoController.muteLocalVideoStream(false);
                }}
                onStartScreenShare={async () => {
                  const sharingController = meetingController.getSharingController();
                  await sharingController.startSharing();
                }}
                onStopScreenShare={async () => {
                  const sharingController = meetingController.getSharingController();
                  await sharingController.stopSharing();
                }}
              />
            }
          />
        </Routes>
      </RcLoading>
    </div>
  );
}

export default App;
