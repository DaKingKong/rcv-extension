import React from 'react';
import {
  RcTextField,
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
          <RcButton onClick={onLogout}>Logout</RcButton>
        ) : (
          <RcButton onClick={onLogin}>Login</RcButton>
        )
      }
    </div>
  );
}
