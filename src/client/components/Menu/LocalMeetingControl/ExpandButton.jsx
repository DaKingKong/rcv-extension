import React from 'react';
import { RcIconButton, RcButton } from '@ringcentral/juno';
import { Videocam } from '@ringcentral/juno-icon';
import DragImage from '../../../images/dragImage_green.png';

const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
}

export function ExpandButton({
    setCollapse
}) {
    return (
        <div style={containerStyle}>
            <RcIconButton
                size='large'
                variant="contained"
                color="success.b03"
                symbol={Videocam}
                onClick={() => {
                    setCollapse(false);
                }}
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
    )
}