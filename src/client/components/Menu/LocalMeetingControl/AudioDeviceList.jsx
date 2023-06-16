import React from 'react';
import { RcIcon, RcButton } from '@ringcentral/juno';
import { Mic, SpeakerUp } from '@ringcentral/juno-icon';

const listItemContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    margin: '5px',
    whiteSpace: 'nowrap'
}

const textStyle = {
    color: 'white',
    fontSize: '11px',
    fontFamily: 'Lato, Helvetica, Arial, sans-serif'
}

const dividerContainerStyle = {
    width: '100%',
    textAlign: 'center',
    borderBottom: '1px solid white',
    lineHeight: ' 0.01em',
    margin: '6px 0px 6px',
}

const dividerStyle = {
    fontFamily: 'Lato, Helvetica, Arial, sans-serif',
    fontSize: '11px',
    background: 'rgb(40, 42, 50)',
    color: 'white',
    padding: '0 10px',
}

export function AudioDevicesList({
    playbackDeviceList,
    recordingDeviceList,
    currentPlaybackDeviceId,
    currentRecordingDeviceId,
    setCurrentPlaybackDeviceId,
    setCurrentRecordingDeviceId,
    localParticipant
}) {

    function deviceListRender({ devices, deviceType }) {
        return devices.map((device, i) => (
            <RcButton
                key={i}
                id={device.deviceId}
                style={listItemContainerStyle}
                variant="plain"
                size="xsmall"
                onClick={async () => {
                    switch (deviceType) {
                        case 'playback':
                            setCurrentPlaybackDeviceId(device.deviceId);
                            await localStorage.setItem('rc-huddle-pref-audio-playback-device-id', device.deviceId);
                            console.log('set pref playback audio device: ', device.deviceId);
                            break;
                        case 'recording':
                            setCurrentRecordingDeviceId(device.deviceId);
                            await localStorage.setItem('rc-huddle-pref-audio-recording-device-id', device.deviceId);
                            console.log('set pref recording audio device: ', device.deviceId);
                            break;
                    }
                    if (!localParticipant.isAudioMuted) {
                        const audioController = rcvEngine.getMeetingController().getAudioController();
                        await audioController.enableAudio({ advanced: [{ deviceId: device.deviceId }] })
                    }
                }}
            >
                {deviceType === 'playback' && device.deviceId === currentPlaybackDeviceId &&
                    <RcIcon
                        size="xsmall"
                        color="neutral.b01"
                        symbol={SpeakerUp}
                        style={{ marginRight: '7px' }}
                    />
                }
                {deviceType === 'recording' && device.deviceId === currentRecordingDeviceId &&
                    <RcIcon
                        size="xsmall"
                        color="neutral.b01"
                        symbol={Mic}
                        style={{ marginRight: '7px' }}
                    />
                }
                <div style={textStyle}>{device.label}</div>
            </RcButton>
        ))
    }

    return (
        <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            top: `${-33 - 30 * (playbackDeviceList.length + recordingDeviceList.length)}px`,
            backgroundColor: 'rgb(40, 42, 50)',
            border: 'solid 3px rgb(40, 42, 50)',
            borderRadius: '8px',
            width: '300px'
        }}>
            <div style={dividerContainerStyle}><span style={dividerStyle}>Playback Devices</span></div>
            {deviceListRender({ devices: playbackDeviceList, deviceType: 'playback' })}
            <div style={dividerContainerStyle}><span style={dividerStyle}>Recording Devices</span></div>
            {deviceListRender({ devices: recordingDeviceList, deviceType: 'recording' })}
        </div>
    )
}