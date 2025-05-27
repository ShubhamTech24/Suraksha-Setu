import { useState, useEffect } from "react";
import { MapPin, Search, Navigation, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface LocationOption {
  name: string;
  lat: number;
  lng: number;
  type: 'border' | 'city' | 'district';
  description: string;
  safeZoneCount: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SafeZone {
  id: number;
  name: string;
  type: 'hospital' | 'police' | 'military' | 'shelter' | 'bunker';
  lat: number;
  lng: number;
  capacity: number;
  distance?: number;
}

interface EnhancedLocationSelectorProps {
  onLocationChange: (lat: number, lng: number, name: string) => void;
  currentLocation: { lat: number; lng: number; name: string } | null;
}

const indianLocations: LocationOption[] = [
  // Border Areas - High Priority
  { name: "Srinagar, Kashmir", lat: 34.0837, lng: 74.7973, type: "city", description: "Major city in Kashmir valley", safeZoneCount: 15, threatLevel: "high" },
  { name: "Jammu", lat: 32.7266, lng: 74.8570, type: "city", description: "Winter capital of J&K", safeZoneCount: 12, threatLevel: "medium" },
  { name: "Leh, Ladakh", lat: 34.1526, lng: 77.5770, type: "city", description: "High-altitude border region", safeZoneCount: 8, threatLevel: "high" },
  { name: "Siachen Glacier Area", lat: 35.4215, lng: 77.1025, type: "border", description: "World's highest battlefield", safeZoneCount: 3, threatLevel: "critical" },
  
  // Pakistan Border
  { name: "Amritsar, Punjab", lat: 31.6340, lng: 74.8723, type: "city", description: "Near Pakistan border", safeZoneCount: 18, threatLevel: "medium" },
  { name: "Pathankot, Punjab", lat: 32.2746, lng: 75.6520, type: "city", description: "Strategic border town", safeZoneCount: 10, threatLevel: "high" },
  { name: "Fazilka, Punjab", lat: 30.4028, lng: 74.0286, type: "border", description: "Border district", safeZoneCount: 6, threatLevel: "medium" },
  { name: "Ganganagar, Rajasthan", lat: 29.9417, lng: 73.8784, type: "city", description: "Rajasthan border area", safeZoneCount: 9, threatLevel: "medium" },
  
  // China Border
  { name: "Tawang, Arunachal Pradesh", lat: 27.5860, lng: 91.8590, type: "city", description: "Disputed border region", safeZoneCount: 7, threatLevel: "high" },
  { name: "Itanagar, Arunachal Pradesh", lat: 27.0844, lng: 93.6053, type: "city", description: "Capital near China border", safeZoneCount: 11, threatLevel: "medium" },
  { name: "Nathu La Pass, Sikkim", lat: 27.3910, lng: 88.8420, type: "border", description: "China-India border pass", safeZoneCount: 4, threatLevel: "high" },
  
  // Bangladesh Border
  { name: "Agartala, Tripura", lat: 23.8315, lng: 91.2868, type: "city", description: "Near Bangladesh border", safeZoneCount: 13, threatLevel: "low" },
  { name: "Silchar, Assam", lat: 24.8333, lng: 92.7789, type: "city", description: "Assam border region", safeZoneCount: 8, threatLevel: "low" },
  
  // Major Cities - Lower Threat
  { name: "New Delhi", lat: 28.6139, lng: 77.2090, type: "city", description: "National capital", safeZoneCount: 45, threatLevel: "medium" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, type: "city", description: "Financial capital", safeZoneCount: 38, threatLevel: "low" },
  { name: "Chandigarh", lat: 30.7333, lng: 76.7794, type: "city", description: "Union territory", safeZoneCount: 16, threatLevel: "low" },
  { name: "Pune", lat: 18.5204, lng: 73.8567, type: "city", description: "Maharashtra city", safeZoneCount: 22, threatLevel: "low" },
];

export function EnhancedLocationSelector({ onLocationChange, currentLocation }: EnhancedLocationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [nearbySafeZones, setNearbySafeZones] = useState<SafeZone[]>([]);

  // Filter locations based on search and type
  const filteredLocations = indianLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Mock safe zones data - in real app, this would come from API
  const generateMockSafeZones = (location: LocationOption): SafeZone[] => {
    const safeZoneTypes = ['hospital', 'police', 'military', 'shelter', 'bunker'];
    const zones: SafeZone[] = [];
    
    for (let i = 0; i < location.safeZoneCount; i++) {
      const type = safeZoneTypes[i % safeZoneTypes.length];
      const distance = Math.random() * 10 + 0.5; // 0.5 to 10.5 km
      
      zones.push({
        id: i + 1,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Center ${i + 1}`,
        type: type as any,
        lat: location.lat + (Math.random() - 0.5) * 0.1,
        lng: location.lng + (Math.random() - 0.5) * 0.1,
        capacity: Math.floor(Math.random() * 500) + 50,
        distance: Math.round(distance * 10) / 10
      });
    }
    
    return zones.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  const handleLocationSelect = (location: LocationOption) => {
    onLocationChange(location.lat, location.lng, location.name);
    const mockSafeZones = generateMockSafeZones(location);
    setNearbySafeZones(mockSafeZones);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationChange(latitude, longitude, "Current Location");
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSafeZoneIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'police': return '👮';
      case 'military': return '🪖';
      case 'shelter': return '🏠';
      case 'bunker': return '🛡️';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Safe Zone Finder
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select your location to find nearby safe zones and threat levels
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Location Button */}
          <Button onClick={getCurrentLocation} className="w-full" variant="outline">
            <Navigation className="h-4 w-4 mr-2" />
            Use Current Location
          </Button>
          
          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="border">Border</SelectItem>
                <SelectItem value="city">Cities</SelectItem>
                <SelectItem value="district">Districts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Current Selection */}
          {currentLocation && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Selected: {currentLocation.name}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
              </p>
            </div>
          )}
          
          {/* Location List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredLocations.map((location) => (
              <div
                key={`${location.lat}-${location.lng}`}
                onClick={() => handleLocationSelect(location)}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{location.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {location.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {location.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {location.safeZoneCount} safe zones
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getThreatLevelColor(location.threatLevel)}`} />
                      <span className="text-xs capitalize">{location.threatLevel} threat</span>
                    </div>
                  </div>
                </div>
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nearby Safe Zones */}
      {nearbySafeZones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Nearby Safe Zones
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {nearbySafeZones.length} safe zones found in the area
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {nearbySafeZones.slice(0, 8).map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getSafeZoneIcon(zone.type)}</span>
                    <div>
                      <h4 className="font-medium text-sm">{zone.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span>Capacity: {zone.capacity}</span>
                        {zone.distance && (
                          <span className="text-blue-600 dark:text-blue-400">
                            {zone.distance} km away
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {zone.type}
                  </Badge>
                </div>
              ))}
            </div>
            
            {nearbySafeZones.length > 8 && (
              <div className="mt-3 text-center">
                <Button variant="outline" size="sm">
                  View All {nearbySafeZones.length} Safe Zones
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}