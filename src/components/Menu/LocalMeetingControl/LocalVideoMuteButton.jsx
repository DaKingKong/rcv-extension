import React, { useState, useEffect } from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Videocam, VideocamOff, ArrowUp2, ArrowDown2 } from '@ringcentral/juno-icon';
import { VideoDevicesList } from './VideoDevicesList';

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

export function LocalVideoMuteButton({
    buttonStyle,
    buttonTextStyle,
    localParticipant,
    meetingController
}) {
    const [showVideoDeviceList, setShowVideoDeviceList] = useState(false);
    const [deviceList, setDeviceList] = useState([]);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);

    useEffect(() => {
        const getVideoDevices = async () => {
            const userPrefDeviceId = await localStorage.getItem('rc-huddle-pref-video-device-id');
            console.log('user pref device id: ', userPrefDeviceId);
            const videoDeviceManager = await rcvEngine.getVideoDeviceManager();
            const videoDevices = await videoDeviceManager.enumerateVideoDevices();
            if (userPrefDeviceId && videoDevices.some(d => d.deviceId === userPrefDeviceId)) {
                setCurrentDeviceId(userPrefDeviceId);
            }
            else {
                setCurrentDeviceId(videoDevices[0].deviceId);
                await localStorage.setItem('rc-huddle-pref-video-device-id', videoDevices[0].deviceId);
            }
            console.log('devices:', videoDevices);
            setDeviceList(videoDevices);
        }
        getVideoDevices();
    }, []);

    return (
        <div style={containerStyle}>
            {showVideoDeviceList && <VideoDevicesList
                deviceList={deviceList}
                currentDeviceId={currentDeviceId}
                setCurrentDeviceId={setCurrentDeviceId}
                localParticipant={localParticipant}
            />}
            <RcIconButton
                size='xxsmall'
                stretchIcon
                color="neutral.f01"
                symbol={showVideoDeviceList ? ArrowDown2 : ArrowUp2}
                style={settingButtonStyle}
                onClick={() => {
                    setShowVideoDeviceList(!showVideoDeviceList);
                }}
            />
            <RcIconButton
                size='xsmall'
                stretchIcon
                color="neutral.f01"
                symbol={localParticipant && !localParticipant.isVideoMuted ? Videocam : VideocamOff}
                onClick={async () => {
                    const videoController = meetingController.getVideoController();
                    if (localParticipant && !localParticipant.isVideoMuted) {
                        await videoController.muteLocalVideoStream();
                        setShowVideoDeviceList(false);
                    } else {
                        await videoController.unmuteLocalVideoStream({ advanced: [{ deviceId: currentDeviceId }] })
                        setShowVideoDeviceList(false);
                    }
                }}
                style={buttonStyle}
            />
            <div style={buttonTextStyle}>{localParticipant && localParticipant.isVideoMuted ? 'Start video' : 'Stop video'}</div>
        </div>
    )
}