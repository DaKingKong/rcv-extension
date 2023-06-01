import React from 'react';
import { RcIcon, RcButton } from '@ringcentral/juno';
import { Videocam } from '@ringcentral/juno-icon';

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

export function VideoDevicesList({
    deviceList,
    currentDeviceId,
    setCurrentDeviceId,
    localParticipant
}) {

    function deviceListRender({ devices }) {
        return devices.map((device, i) => (
            <RcButton
                key={i}
                id={device.deviceId}
                style={listItemContainerStyle}
                variant="plain"
                size="xsmall"
                onClick={async () => {
                    setCurrentDeviceId(device.deviceId);
                    await localStorage.setItem('rc-huddle-pref-video-device-id', device.deviceId);
                    if(!localParticipant.isVideoMuted)
                    {
                        const videoController = rcvEngine.getMeetingController().getVideoController();
                        await videoController.unmuteLocalVideoStream({ advanced: [{ deviceId: device.deviceId }] })
                    }
                    console.log('set pref video device: ', device.deviceId);
                }}
            >
                {device.deviceId === currentDeviceId ?
                    <RcIcon
                        size="xsmall"
                        color="neutral.b01"
                        symbol={Videocam}
                        style={{ marginRight: '7px' }}
                    /> :
                    <RcIcon
                        size="xsmall"
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
            top: `${-7 - 30 * deviceList.length}px`,
            backgroundColor: 'rgb(40, 42, 50)',
            border: 'solid 3px rgb(40, 42, 50)',
            borderRadius: '8px'
        }}>
            {deviceListRender({ devices: deviceList })}
        </div>
    )
}