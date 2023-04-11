import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import {
  RcTabs,
  RcTab,
} from '@ringcentral/juno';

export function TabsContainer({
  navigate,
  location,
}) {
  const [currentTab, setCurrentTab] = useState('/app/login');

  return (
    <div>
      <RcTabs
        onChange={(e, value) => {
          setCurrentTab(value);
          navigate(value);
        }}
        value={currentTab}
      >
        <RcTab
          label="Login"
          value="/app/login"
          selected={currentTab === '/app/login'}
        />
        <RcTab
          label="Meeting"
          value="/app/join-meeting"
          selected={currentTab === '/app/join-meeting'}
        />
      </RcTabs>
      <Outlet />
    </div>
  );
}
