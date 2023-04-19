import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { StartMeeting } from '@ringcentral/juno-icon';

export function StartMeetingButton({
    buttonStyle,
    setLoading
}) {
    return (
        <RcIconButton
            onClick={async () => {
                setLoading(true);
                try {
                    await rcvEngine.startInstantMeeting();
                } catch (e) {
                    console.error(e);
                }
                setLoading(false);
            }}
            symbol={StartMeeting}
            variant="plain"
            size='large'
            stretchIcon
            color="neutral.f01"
            style={buttonStyle}
        />
    )
}