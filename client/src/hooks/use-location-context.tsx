import { createContext, useContext, useState, ReactNode } from "react";

interface LocationContextType {
  selectedLocation: {
    lat: number;
    lng: number;
    name: string;
  } | null;
  setSelectedLocation: (lat: number, lng: number, name: string) => void;
  isManualLocation: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [isManualLocation, setIsManualLocation] = useState(false);

  const setSelectedLocation = (lat: number, lng: number, name: string) => {
    setSelectedLocationState({ lat, lng, name });
    setIsManualLocation(name !== "Your Current Location");
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        isManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
}