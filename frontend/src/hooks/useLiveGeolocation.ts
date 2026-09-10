import { useState, useRef, useCallback, useEffect } from 'react';

export interface LiveGeoPosition {
  lat: number;
  lng: number;
  accuracy: number;      // meters, radius of 68% confidence circle
  heading: number | null; // degrees clockwise from true north, null if not moving/unsupported
  speed: number | null;   // m/s
  timestamp: number;
}

interface UseLiveGeolocationResult {
  position: LiveGeoPosition | null;
  isTracking: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
}

// Wraps the browser Geolocation API's watchPosition for the "canvass
// mode" live-location feature (see CadastralMap.tsx / RealCadastreMap.tsx):
// an agent door-knocking a street can see their own live position against
// the cadastral parcels while walking. High accuracy + no aggressive
// caching, since a stale/coarse fix defeats the point of a real-time
// canvassing aid.
export function useLiveGeolocation(): UseLiveGeolocationResult {
  const [position, setPosition] = useState<LiveGeoPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this device/browser.');
      return;
    }
    setError(null);
    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Enable location access for this site to use Canvass Mode.'
            : err.code === err.POSITION_UNAVAILABLE
            ? 'Your location is currently unavailable.'
            : 'Location request timed out. Retrying...';
        setError(message);
        if (err.code === err.PERMISSION_DENIED) {
          setIsTracking(false);
        }
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
  }, []);

  // Stop tracking when the component unmounts (e.g. map closed) so the
  // browser's location indicator doesn't stay active in the background.
  useEffect(() => () => stop(), [stop]);

  return { position, isTracking, error, start, stop };
}
