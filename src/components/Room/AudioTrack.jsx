import { useEffect, useRef } from 'react';

export function AudioTrack({ track }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!track) {
      return;
    }
    const el = ref.current;
    el.muted = false;
    el.srcObject = track;
    el.autoplay = true;
    return () =>
      // This addresses a Chrome issue where the number of WebMediaPlayers is limited.
      // See: https://github.com/twilio/twilio-video.js/issues/1528
      el.srcObject = null;
  }, [track]);

  return <div ref={ref} />;;
}
