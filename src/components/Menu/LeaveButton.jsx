import React from 'react';
import { RcIconButton } from '@ringcentral/juno';
import { Leave } from '@ringcentral/juno-icon';
export function LeaveButton({
    buttonStyle,
    meetingController
}) {
    return (
        <RcIconButton
            size='xsmall'
            stretchIcon
            color="danger.b04"
            symbol={Leave}
            onClick={async () => {
                await meetingController.leaveMeeting();
            }}
            style={buttonStyle}
        />
    )
}