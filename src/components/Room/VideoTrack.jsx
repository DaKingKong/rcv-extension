import React, { useRef, useEffect } from 'react';

export function VideoTrack({ track }) {
  const ref = useRef(null);

  const vidStyle = {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: 'solid 8px white'
  }

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

  return <video style={vidStyle} ref={ref} />;
}
