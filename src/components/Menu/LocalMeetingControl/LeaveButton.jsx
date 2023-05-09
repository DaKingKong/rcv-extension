import React from 'react';
import { RcButton } from '@ringcentral/juno';
export function LeaveButton({
    buttonStyle,
    meetingController
}) {
    return (
        <RcButton
            size='small'
            color="#E6413C"
            radius="round"
            onClick={async () => {
                await meetingController.leaveMeeting();
            }}
            style={buttonStyle}
        >
            End
        </RcButton>
    )
}