import { LogInButton } from './LoginButton';

const popupStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
}

export function Popup({
    rcSDK
}) {
    return (
        <div style={popupStyle}>
            <div style={{ margin: '10px', fontSize: '22px' }} >Authorize</div>
            <LogInButton
                rcSDK={rcSDK}
            />
        </div>
    )
}