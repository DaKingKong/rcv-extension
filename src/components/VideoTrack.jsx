import React, { useRef, useEffect } from 'react';

export function VideoTrack({ track }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!track) {
      return;
    }
    const el = ref.current;
    el.muted = true;
    el.srcObject = track;
    el.autoplay = true;
    return () => {

      // This addresses a Chrome issue where the number of WebMediaPlayers is limited.
      // See: https://github.com/twilio/twilio-video.js/issues/1528
      el.srcObject = null;
    };
  }, [track]);

  return <video ref={ref} />;
}
