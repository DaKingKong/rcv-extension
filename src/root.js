import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import {
    EngineEvent,
    ErrorCodeType,
    UserEvent,
    StreamEvent,
    AudioEvent,
    VideoEvent
} from './lib/rcv';

import { ParticipantList } from './components/ParticipantList';
import { Menu } from './components/Menu';

const menuContainerStyle = {
    background: '#038FC4',
    borderRadius: '4px',
    boxShadow: '0px 0px 5px 1px rgb(0 0 0 / 18%)',
    position: 'fixed',
    bottom: '100px',
    right: '0',
    zIndex: '99999',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
}

function App({
    rcSDK,
    rcvEngine
}) {
    const [meetingController, setMeetingController] = useState(null);
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [localParticipant, setLocalParticipant] = useState(null);
    const [videoTrackMap, setVideoTrackMap] = useState({});
    const videoTrackMapRef = useRef(videoTrackMap);
    const [audioTrackMap, setAudioTrackMap] = useState({});
    const audioTrackMapRef = useRef(audioTrackMap);

    useEffect(() => {
        videoTrackMapRef.current = videoTrackMap;
        audioTrackMapRef.current = audioTrackMap;
    }, [videoTrackMap, audioTrackMap]);

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
                console.log(meetingInfo);
            }
        };
        const onMeetingLeft = () => {
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
    }, [rcvEngine]);

    return (
        <div >
            <Draggable axis='y' handle=".handle">
                <div style={menuContainerStyle}>
                    <Menu
                        rcSDK={rcSDK}
                        rcvEngine={rcvEngine}
                        room={room}
                        localParticipant={localParticipant}
                        meetingController={meetingController}
                    />
                </div>
            </Draggable>
            {!!room &&
                <ParticipantList
                    participants={participants}
                    videoTrackMap={videoTrackMap}
                    audioTrackMap={audioTrackMap}
                />
            }
        </div>
    );
}


export default App;