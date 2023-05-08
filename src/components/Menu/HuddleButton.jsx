import React from 'react';
import { RcButton, RcIcon } from '@ringcentral/juno';
import { VideoMeeting } from '@ringcentral/juno-icon';
import { ViewerList } from './ViewerList';

const containerStyle = {
    background: 'rgb(6, 111, 172)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '48px',
    borderRadius: '100vw',
    padding: '0px 6px',
}

export function HuddleButton({
    rcvEngine,
    setLoading,
    setShowHuddle,
    pageViewParticipants
}) {
    return (
        <div
            onPointerLeave={() => { setShowHuddle(false) }}
        >
            {
                pageViewParticipants.length > 1 ?
                    <div style={containerStyle}>
                        <ViewerList
                            viewers={pageViewParticipants}
                        />
                        <RcButton
                            startIcon={<RcIcon size='xlarge' symbol={VideoMeeting} />}
                            radius="round"
                            size='large'
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await rcvEngine.startInstantMeeting();
                                } catch (e) {
                                    console.error(e);
                                }
                                setLoading(false);
                            }}
                            style={{ backgroundColor: '#ffffff5c' }}
                        >
                            Start Huddle
                        </RcButton>
                    </div>
                    :
                    <RcButton
                        startIcon={<RcIcon size='xxlarge' symbol={VideoMeeting} />}
                        radius="round"
                        size='xlarge'
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await rcvEngine.startInstantMeeting();
                            } catch (e) {
                                console.error(e);
                            }
                            setLoading(false);
                        }}
                    >
                        Start Huddle
                    </RcButton>
            }
        </div>
    )
}