import { useState, useEffect, useCallback } from "react";
import { useGeolocation } from "./use-geolocation";
import { apiRequest } from "@/lib/queryClient";

interface LocationServiceState {
  isTracking: boolean;
  lastUpdate: string | null;
  transmissionError: string | null;
  locationHistory: Array<{
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
  }>;
}

interface UseLocationServiceOptions {
  autoStart?: boolean;
  transmissionInterval?: number;
  enableHistory?: boolean;
  maxHistorySize?: number;
}

export function useLocationService(options: UseLocationServiceOptions = {}) {
  const {
    autoStart = true,
    transmissionInterval = 30000, // Send location every 30 seconds
    enableHistory = true,
    maxHistorySize = 50,
  } = options;

  const [serviceState, setServiceState] = useState<LocationServiceState>({
    isTracking: false,
    lastUpdate: null,
    transmissionError: null,
    locationHistory: [],
  });

  // Get real-time location with enhanced tracking
  const location = useGeolocation({
    watch: true,
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000,
    updateInterval: 15000, // Update every 15 seconds
  });

  // Send location to server
  const transmitLocation = useCallback(async (lat: number, lng: number, accuracy?: number) => {
    try {
      await apiRequest("/api/location/update", {
        method: "POST",
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          accuracy,
          timestamp: new Date().toISOString(),
        }),
      });

      setServiceState(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        transmissionError: null,
      }));

      // Add to history if enabled
      if (enableHistory) {
        setServiceState(prev => ({
          ...prev,
          locationHistory: [
            {
              lat,
              lng,
              timestamp: new Date().toISOString(),
              accuracy,
            },
            ...prev.locationHistory.slice(0, maxHistorySize - 1),
          ],
        }));
      }
    } catch (error) {
      setServiceState(prev => ({
        ...prev,
        transmissionError: error instanceof Error ? error.message : "Failed to send location",
      }));
    }
  }, [enableHistory, maxHistorySize]);

  // Start/stop tracking
  const startTracking = useCallback(() => {
    setServiceState(prev => ({ ...prev, isTracking: true }));
  }, []);

  const stopTracking = useCallback(() => {
    setServiceState(prev => ({ ...prev, isTracking: false }));
  }, []);

  // Auto-transmit location when it changes
  useEffect(() => {
    if (!serviceState.isTracking || !location.latitude || !location.longitude) {
      return;
    }

    const intervalId = setInterval(() => {
      if (location.latitude && location.longitude) {
        transmitLocation(location.latitude, location.longitude, location.accuracy || undefined);
      }
    }, transmissionInterval);

    return () => clearInterval(intervalId);
  }, [serviceState.isTracking, location.latitude, location.longitude, transmissionInterval, transmitLocation]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && location.latitude && location.longitude && !serviceState.isTracking) {
      startTracking();
    }
  }, [autoStart, location.latitude, location.longitude, serviceState.isTracking, startTracking]);

  return {
    // Location data
    currentLocation: {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      error: location.error,
      loading: location.loading,
    },
    
    // Service state
    ...serviceState,
    
    // Controls
    startTracking,
    stopTracking,
    refreshLocation: location.refresh,
    manualTransmit: () => {
      if (location.latitude && location.longitude) {
        transmitLocation(location.latitude, location.longitude, location.accuracy || undefined);
      }
    },
  };
}