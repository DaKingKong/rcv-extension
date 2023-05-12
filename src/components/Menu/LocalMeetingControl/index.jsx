import React, { useState } from 'react';
import { RcButton } from '@ringcentral/juno';
import DragImage from '../../../images/dragImage_grey.png';
import { LocalAudioMuteButton } from './LocalAudioMuteButton';
import { LocalVideoMuteButton } from './LocalVideoMuteButton';
import { LeaveButton } from './LeaveButton';
import { CollapseButton } from './CollapseButton';
import { ExpandButton } from './ExpandButton';

const itemStyle = {
    margin: '3px',
}

const itemTextStyle = {
    color: 'white',
    fontSize: 'small'
}

const containerStyle = {
    background: '#282A32',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '64px',
    borderRadius: '10px'
}

export function LocalMeetingControl({
    localParticipant,
    meetingController
}) {
    const [collapse, setCollapse] = useState(false);

    return (
        <div>
            {collapse ?
                <ExpandButton
                    setCollapse={setCollapse}
                /> :
                <div style={containerStyle}>
                    <CollapseButton
                        setCollapse={setCollapse}
                    />
                    <LocalAudioMuteButton
                        buttonStyle={itemStyle}
                        buttonTextStyle={itemTextStyle}
                        localParticipant={localParticipant}
                        meetingController={meetingController}
                    />
                    <LocalVideoMuteButton
                        buttonStyle={itemStyle}
                        buttonTextStyle={itemTextStyle}
                        localParticipant={localParticipant}
                        meetingController={meetingController}
                    />
                    <LeaveButton
                        buttonStyle={itemStyle}
                        meetingController={meetingController}
                    />
                    <div style={{ cursor: 'grab', display: 'inherit' }}>
                        <RcButton
                            className="rc-huddle-menu-handle"
                            variant="plain"
                            size='large'
                            style={{ padding: '0px' }}
                        >
                            <img style={{ pointerEvents: 'none', width: '20px', height: '20px' }} src={DragImage} />
                        </RcButton>
                    </div>
                </div>
            }

        </div>
    )
}