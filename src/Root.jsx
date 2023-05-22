import React, { useState, useEffect, useRef } from 'react';
import {
    EngineEvent,
    ErrorCodeType,
    UserEvent,
    StreamEvent,
    AudioEvent,
    VideoEvent,
} from '@ringcentral/video-sdk';
import { login } from './client';

import { Room } from './components/Room';
import { Menu } from './components/Menu';
import { AudioTrack } from './components/Room/AudioTrack';
import { joinHuddle, leaveHuddle } from './client';

function App({
    rcSDK
}) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [meetingController, setMeetingController] = useState(null);
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [activeSpeakerId, setActiveSpeakerId] = useState('');
    const [localParticipant, setLocalParticipant] = useState(null);
    const [videoTrackMap, setVideoTrackMap] = useState({});
    const videoTrackMapRef = useRef(videoTrackMap);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);

    function refreshParticipants() {
        const newMeetingController = rcvEngine.getMeetingController();
        const userController = newMeetingController.getUserController();
        const newParticipants = userController.getMeetingUsers();
        setParticipants(Object.values(newParticipants).filter(p => !p.isDeleted));
    }
    useEffect(() => {
        const checkUserLogin = async () => {
            const isLoggedIn = await rcSDK.platform().loggedIn();
            setLoggedIn(isLoggedIn);
        }
        checkUserLogin();

        chrome.runtime.onMessage.addListener(async (message) => {
            if (message.loginOptions) {
                const rcLoginResponse = await rcSDK.login(message.loginOptions);
                const rcLoginResponseJson = await rcLoginResponse.json();
                setLoggedIn(true);
                await login({ rcAccessToken: rcLoginResponseJson.access_token })
            }
        });

    }, []);

    useEffect(() => {
        videoTrackMapRef.current = videoTrackMap;
    }, [videoTrackMap]);

    useEffect(() => {
        const onParticipantsUpdated = () => {
            refreshParticipants();
        };
        const onActiveSpeakerChanged = (activeSpeaker) => {
            setActiveSpeakerId(activeSpeaker.uid);
        }
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
                userController.on(UserEvent.ACTIVE_SPEAKER_USER_CHANGED, onActiveSpeakerChanged);
                const streamManager = newMeetingController.getStreamManager();
                const onVideoTrackAdded = stream => {
                    setVideoTrackMap({
                        ...videoTrackMapRef.current,
                        [stream.participantId]: stream,
                    })
                };
                const onVideoTrackRemoved = stream => {
                    const newVideoTrackMap = {
                        ...videoTrackMapRef.current,
                    };
                    delete newVideoTrackMap[stream.participantId];
                    setVideoTrackMap(newVideoTrackMap)
                };
                const onLocalAudioTrackAdded = stream => {
                    console.log('add local: ', stream);
                    setLocalAudioTrack(stream);
                };
                const onLocalAudioTrackRemoved = stream => {
                    console.log('remove local: ', stream);
                    setLocalAudioTrack(null);
                };
                const onRemoteAudioTrackAdded = stream => {
                    console.log('add remote: ', stream);
                    setRemoteAudioTrack(stream);
                };
                const onRemoteAudioTrackRemoved = stream => {
                    console.log('remove remote: ', stream);
                    setRemoteAudioTrack(null);
                };
                streamManager.on(StreamEvent.LOCAL_VIDEO_TRACK_ADDED, onVideoTrackAdded);
                streamManager.on(StreamEvent.LOCAL_VIDEO_TRACK_REMOVED, onVideoTrackRemoved);
                streamManager.on(StreamEvent.REMOTE_VIDEO_TRACK_ADDED, onVideoTrackAdded);
                streamManager.on(StreamEvent.REMOTE_VIDEO_TRACK_REMOVED, onVideoTrackRemoved);
                streamManager.on(StreamEvent.LOCAL_AUDIO_TRACK_ADDED, onLocalAudioTrackAdded);
                streamManager.on(StreamEvent.LOCAL_AUDIO_TRACK_REMOVED, onLocalAudioTrackRemoved);
                streamManager.on(StreamEvent.REMOTE_AUDIO_TRACK_ADDED, onRemoteAudioTrackAdded);
                streamManager.on(StreamEvent.REMOTE_AUDIO_TRACK_REMOVED, onRemoteAudioTrackRemoved);

                const audioController = newMeetingController.getAudioController();
                const videoController = newMeetingController.getVideoController();
                audioController.on(AudioEvent.LOCAL_AUDIO_MUTE_CHANGED, (muted) => {
                    setLocalParticipant({
                        ...userController.getMyself(),
                        isAudioMuted: muted,
                    });
                });
                audioController.on(AudioEvent.REMOTE_AUDIO_MUTE_CHANGED, (uid, muted) => {
                    refreshParticipants();
                });
                audioController.on(AudioEvent.AUDIO_UNMUTE_DEMAND, () => {
                    setLocalParticipant({
                        ...userController.getMyself(),
                        isAudioMuted: false,
                    });
                });
                videoController.on(VideoEvent.LOCAL_VIDEO_MUTE_CHANGED, (muted) => {
                    setLocalParticipant({
                        ...userController.getMyself(),
                        isVideoMuted: muted,
                    });
                });
                videoController.on(VideoEvent.REMOTE_VIDEO_MUTE_CHANGED, (uid, muted) => {
                    refreshParticipants();
                });

                await audioController.enableAudio(true);
                console.log(meetingInfo);
                if (!userController.getMyself().isHost) {
                    joinHuddle();
                }
                await audioController.unmuteLocalAudioStream();
            }
        };
        const onMeetingLeft = () => {
            setRoom(null);
            setMeetingController(null);
            setParticipants([]);
            leaveHuddle();
        };
        rcvEngine.on(EngineEvent.MEETING_JOINED, onMeetingJoined);
        rcvEngine.on(EngineEvent.MEETING_LEFT, onMeetingLeft);
        return () => {
            rcvEngine.off(EngineEvent.MEETING_JOINED, onMeetingJoined);
            rcvEngine.off(EngineEvent.MEETING_LEFT, onMeetingLeft);
        };
    }, [rcvEngine]);

    return (
        <div >
            {loggedIn &&
                <div>
                    <Menu
                        room={room}
                        localParticipant={localParticipant}
                        meetingController={meetingController}
                    />
                    {!!room &&
                        <Room
                            meetingController={meetingController}
                            participants={participants}
                            videoTrackMap={videoTrackMap}
                            activeSpeakerId={activeSpeakerId}
                            localParticipant={localParticipant}
                        />
                    }
                    {/* {localAudioTrack && <AudioTrack track={localAudioTrack.stream} />} */}
                    {remoteAudioTrack && <AudioTrack track={remoteAudioTrack.stream} />}
                </div>}
        </div>
    );
}


export default App;