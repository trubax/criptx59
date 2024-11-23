import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  timestamp: number | null;
}

export const useGeolocation = (options: PositionOptions = {}) => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    timestamp: null
  });
  
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const handleSuccess = (position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      timestamp: position.timestamp
    });
  };

  const handleError = (error: GeolocationPositionError) => {
    setLocation(prev => ({
      ...prev,
      error: error.message
    }));
  };

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocalizzazione non supportata'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [options]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocalizzazione non supportata'
      }));
      return;
    }

    setWatching(true);
    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );
    setWatchId(id);
  }, [options]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setWatching(false);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    getPosition,
    startWatching,
    stopWatching,
    watching
  };
}; 