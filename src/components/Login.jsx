import React from 'react';
import {
  RcButton,
} from '@ringcentral/juno';

export function Login({
  loggedIn,
  onLogin,
  onLogout,
}) {
  return (
    <div>
      {
        loggedIn ? (
          <RcButton size='small' onClick={onLogout}>Logout</RcButton>
        ) : (
          <RcButton size='small' onClick={onLogin}>Login</RcButton>
        )
      }
    </div>
  );
}
