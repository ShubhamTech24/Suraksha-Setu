import { useState, useEffect } from "react";
import { MapPin, Search, Target, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";

interface LocationOption {
  name: string;
  lat: number;
  lng: number;
  type: 'border' | 'city' | 'district';
  description: string;
}

interface LocationSelectorProps {
  onLocationChange: (lat: number, lng: number, name: string) => void;
  currentLocation: { lat: number; lng: number; name: string } | null;
}

const PREDEFINED_LOCATIONS: LocationOption[] = [
  // Border Areas
  { name: "Srinagar", lat: 34.0837, lng: 74.7973, type: "border", description: "Kashmir Valley - High security zone" },
  { name: "Jammu", lat: 32.7266, lng: 74.8570, type: "border", description: "Jammu region - Border district" },
  { name: "Pathankot", lat: 32.2746, lng: 75.6520, type: "border", description: "Punjab border - Strategic location" },
  { name: "Amritsar", lat: 31.6340, lng: 74.8723, type: "border", description: "Punjab - Near international border" },
  { name: "Jaisalmer", lat: 26.9157, lng: 70.9083, type: "border", description: "Rajasthan - Desert border area" },
  { name: "Ganganagar", lat: 29.9167, lng: 73.8667, type: "border", description: "Rajasthan - Border district" },
  
  // Major Cities
  { name: "New Delhi", lat: 28.6139, lng: 77.2090, type: "city", description: "National Capital - Command center" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, type: "city", description: "Financial capital - Safe zone" },
  { name: "Chandigarh", lat: 30.7333, lng: 76.7794, type: "city", description: "Regional headquarters" },
  { name: "Ludhiana", lat: 30.9010, lng: 75.8573, type: "city", description: "Punjab - Industrial center" },
  
  // Strategic Districts
  { name: "Kupwara", lat: 34.5267, lng: 74.2567, type: "district", description: "Kashmir - Sensitive border district" },
  { name: "Poonch", lat: 33.7782, lng: 74.0947, type: "district", description: "J&K - Active monitoring zone" },
  { name: "Rajouri", lat: 33.3775, lng: 74.3122, type: "district", description: "J&K - Border surveillance area" },
  { name: "Fazilka", lat: 30.4028, lng: 74.0286, type: "district", description: "Punjab - Border outpost area" },
];

export function LocationSelector({ onLocationChange, currentLocation }: LocationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUsingGPS, setIsUsingGPS] = useState(true);
  const { latitude, longitude, error } = useGeolocation({ watch: true });
  const { toast } = useToast();

  const filteredLocations = PREDEFINED_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use GPS location by default
  useEffect(() => {
    if (isUsingGPS && latitude && longitude) {
      onLocationChange(latitude, longitude, "Your Current Location");
    }
  }, [latitude, longitude, isUsingGPS, onLocationChange]);

  const handleLocationSelect = (location: LocationOption) => {
    setIsUsingGPS(false);
    onLocationChange(location.lat, location.lng, location.name);
    setShowDropdown(false);
    setSearchTerm("");
    
    toast({
      title: "Location Updated",
      description: `Now viewing alerts for ${location.name}`,
    });
  };

  const handleUseCurrentLocation = () => {
    if (latitude && longitude) {
      setIsUsingGPS(true);
      onLocationChange(latitude, longitude, "Your Current Location");
      setShowDropdown(false);
      
      toast({
        title: "Using GPS Location",
        description: "Switched back to your current location",
      });
    } else {
      toast({
        title: "GPS Unavailable",
        description: "Please enable location services or select a location manually",
        variant: "destructive",
      });
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'border': return 'bg-alert-red text-white';
      case 'city': return 'bg-safe-green text-white';
      case 'district': return 'bg-warning-amber text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'border': return '🛡️';
      case 'city': return '🏙️';
      case 'district': return '📍';
      default: return '📌';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="text-navy" size={20} />
          <span>Location Monitor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Display */}
        <div className="p-3 bg-navy bg-opacity-10 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="text-navy" size={16} />
              <span className="font-medium text-navy">
                {currentLocation?.name || "Loading location..."}
              </span>
            </div>
            <Badge variant="secondary" className="bg-navy text-white">
              {isUsingGPS ? "GPS" : "Manual"}
            </Badge>
          </div>
          {currentLocation && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Location Search */}
        <div className="relative">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(e.target.value.length > 0);
                }}
                onFocus={() => setShowDropdown(searchTerm.length > 0)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleUseCurrentLocation}
              variant="outline"
              size="sm"
              className="px-3"
              disabled={!latitude || !longitude}
            >
              <Target size={16} />
            </Button>
          </div>

          {/* Dropdown Results */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location, index) => (
                  <div
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getLocationTypeIcon(location.type)}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {location.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {location.description}
                          </div>
                        </div>
                      </div>
                      <Badge className={getLocationTypeColor(location.type)}>
                        {location.type}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  No locations found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Location Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Access:</p>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_LOCATIONS.slice(0, 6).map((location, index) => (
              <Button
                key={index}
                onClick={() => handleLocationSelect(location)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {getLocationTypeIcon(location.type)} {location.name}
              </Button>
            ))}
          </div>
        </div>

        {/* GPS Status */}
        {error && (
          <div className="p-2 bg-alert-red bg-opacity-10 rounded text-sm text-alert-red">
            GPS Error: {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}