import { useState, useEffect } from "react";

interface LocationInfo {
  city: string | null;
  state: string | null;
  country: string | null;
  district: string | null;
  formatted: string | null;
  loading: boolean;
  error: string | null;
}

export function useReverseGeocoding(latitude: number | null, longitude: number | null) {
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    city: null,
    state: null,
    country: null,
    district: null,
    formatted: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!latitude || !longitude) {
      setLocationInfo(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchLocationInfo = async () => {
      setLocationInfo(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Using OpenStreetMap Nominatim service for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location information');
        }

        const data = await response.json();
        
        const address = data.address || {};
        
        // Extract relevant location information
        const city = address.city || address.town || address.village || address.hamlet || null;
        const state = address.state || address.province || null;
        const country = address.country || null;
        const district = address.state_district || address.county || null;

        // Create formatted address
        let formatted = '';
        if (city) formatted += city;
        if (district && district !== city) formatted += (formatted ? ', ' : '') + district;
        if (state && state !== district && state !== city) formatted += (formatted ? ', ' : '') + state;
        if (country) formatted += (formatted ? ', ' : '') + country;

        setLocationInfo({
          city,
          state,
          country,
          district,
          formatted: formatted || 'Location not found',
          loading: false,
          error: null,
        });
      } catch (error) {
        setLocationInfo(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get location info',
        }));
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchLocationInfo, 1000);
    return () => clearTimeout(timeoutId);
  }, [latitude, longitude]);

  return locationInfo;
}