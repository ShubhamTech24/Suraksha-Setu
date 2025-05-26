import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  updateInterval?: number; // Interval for continuous updates in milliseconds
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 5000, // 5 seconds for fresh location data
    watch = true, // Enable continuous tracking by default
    updateInterval = 10000, // Update every 10 seconds
  } = options;

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: "Geolocation is not supported by this browser",
        loading: false,
      }));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = "Unknown error occurred";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied. Please enable location permissions for SurakshaSetu to receive area-specific alerts.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable. Please check your device's GPS settings.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out. Trying again...";
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    let watchId: number | undefined;
    let intervalId: NodeJS.Timeout | undefined;

    // Start real-time location tracking
    if (watch) {
      // Use watchPosition for continuous GPS tracking
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
      
      // Add interval backup for enhanced real-time updates
      if (updateInterval > 0) {
        intervalId = setInterval(() => {
          navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            ...options,
            maximumAge: 0, // Force fresh location
          });
        }, updateInterval);
      }
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enableHighAccuracy, timeout, maximumAge, watch, updateInterval]);

  const refresh = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = "Unknown error occurred";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  };

  return {
    ...state,
    refresh,
  };
}
