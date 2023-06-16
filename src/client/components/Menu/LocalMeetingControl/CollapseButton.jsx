import React from 'react';
import { RcIconButton, RcDivider } from '@ringcentral/juno';
import { ArrowRight1 } from '@ringcentral/juno-icon';

const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
}

const dividerStyle = {
    background: '#6B6F72',
    height: '64px',
    marginRight: '8px'
}

export function CollapseButton({
    setCollapse
}) {
    return (
        <div style={containerStyle}>
            <RcIconButton
                size='xsmall'
                stretchIcon
                color="neutral.f01"
                symbol={ArrowRight1}
                onClick={() => {
                    setCollapse(true)
                }}
            />
            <RcDivider
                vertical
                style={dividerStyle}
            />
        </div>
    )
}