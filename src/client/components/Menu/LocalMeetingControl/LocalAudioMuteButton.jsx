import React, { useState, useEffect } from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Mic, MicOff, ArrowUp2, ArrowDown2 } from '@ringcentral/juno-icon';
import { AudioDevicesList } from './AudioDeviceList';

const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '8px'
}

const settingButtonStyle = {
    position: 'absolute',
    transform: 'translate(20px, -10px)'
}

export function LocalAudioMuteButton({
    buttonStyle,
    buttonTextStyle,
    localParticipant,
    meetingController
}) {
    const [showAudioDeviceList, setShowAudioDeviceList] = useState(false);
    const [playbackDeviceList, setPlaybackDeviceList] = useState([]);
    const [recordingDeviceList, setRecordingDeviceList] = useState([]);
    const [currentPlaybackDeviceId, setCurrentPlaybackDeviceId] = useState(null);
    const [currentRecordingDeviceId, setCurrentRecordingDeviceId] = useState(null);

    useEffect(() => {
        const getAudioDevices = async () => {
            const userPrefPlaybackDeviceId = await localStorage.getItem('rc-huddle-pref-audio-playback-device-id');
            const userPrefRecordingDeviceId = await localStorage.getItem('rc-huddle-pref-audio-recording-device-id');
            console.log('user pref playback audio id: ', userPrefPlaybackDeviceId);
            console.log('user pref recording audio id: ', userPrefRecordingDeviceId);
            const audioDeviceManager = await rcvEngine.getAudioDeviceManager();
            const audioPlaybackDevices = await audioDeviceManager.enumeratePlaybackDevices();
            console.log('audio playback devices:', audioPlaybackDevices);
            const audioRecordingDevices = await audioDeviceManager.enumerateRecordingDevices();
            console.log('audio recording devices:', audioRecordingDevices);
            // set playback device
            if (userPrefPlaybackDeviceId && audioPlaybackDevices.some(d => d.deviceId === userPrefPlaybackDeviceId)) {
                setCurrentPlaybackDeviceId(userPrefPlaybackDeviceId);
            }
            else {
                setCurrentPlaybackDeviceId(audioPlaybackDevices[0].deviceId);
                await localStorage.setItem('rc-huddle-pref-audio-playback-device-id', audioPlaybackDevices[0].deviceId);
            }
            // set recording device
            if (userPrefRecordingDeviceId && audioRecordingDevices.some(d => d.deviceId === userPrefRecordingDeviceId)) {
                setCurrentRecordingDeviceId(userPrefRecordingDeviceId);
            }
            else {
                setCurrentRecordingDeviceId(audioRecordingDevices[0].deviceId);
                await localStorage.setItem('rc-huddle-pref-audio-recording-device-id', audioRecordingDevices[0].deviceId);
            }
            setPlaybackDeviceList(audioPlaybackDevices);
            setRecordingDeviceList(audioRecordingDevices);
        }
        getAudioDevices();
    }, []);

    return (
        <div style={containerStyle}>
            {showAudioDeviceList && <AudioDevicesList
                playbackDeviceList={playbackDeviceList}
                recordingDeviceList={recordingDeviceList}
                currentPlaybackDeviceId={currentPlaybackDeviceId}
                currentRecordingDeviceId={currentRecordingDeviceId}
                setCurrentPlaybackDeviceId={setCurrentPlaybackDeviceId}
                setCurrentRecordingDeviceId={setCurrentRecordingDeviceId}
                localParticipant={localParticipant}
            />}
            <RcIconButton
                size='xxsmall'
                stretchIcon
                color="neutral.f01"
                symbol={showAudioDeviceList ? ArrowDown2 : ArrowUp2}
                style={settingButtonStyle}
                onClick={() => {
                    setShowAudioDeviceList(!showAudioDeviceList);
                }}
            />
            <RcIconButton
                size='xsmall'
                stretchIcon
                color="neutral.f01"
                symbol={localParticipant && localParticipant.isAudioMuted ? MicOff : Mic}
                onClick={async () => {
                    const audioController = meetingController.getAudioController();
                    if (localParticipant && localParticipant.isAudioMuted) {
                        await audioController.unmuteLocalAudioStream();
                        setShowAudioDeviceList(false);
                    } else {
                        await audioController.muteLocalAudioStream();
                        setShowAudioDeviceList(false);
                    }
                }}
                style={buttonStyle}
            />
            <div style={buttonTextStyle}>{localParticipant && localParticipant.isAudioMuted ? 'Unmute' : 'Mute'}</div>
        </div>
    )
}