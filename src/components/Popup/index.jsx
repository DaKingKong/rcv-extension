import { LogInButton } from './LoginButton';

export function Popup({
    rcSDK,
    getFcmToken
}) {
    return (
        <div><LogInButton
            rcSDK={rcSDK}
        />
            <div
                onClick={getFcmToken}
            >test</div>
        </div>
    )
}