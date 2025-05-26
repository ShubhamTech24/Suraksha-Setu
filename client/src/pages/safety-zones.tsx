import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, MapPin, Phone, Navigation, Users, Clock, Search, Filter, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";

interface SafeZone {
  id: number;
  name: string;
  type: 'bunker' | 'hospital' | 'military_post' | 'evacuation_center';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  capacity?: number;
  facilities?: string[];
  contact?: string;
  isActive: boolean;
  distance?: number; // in meters
}

export default function SafetyZones() {
  const { toast } = useToast();
  const { latitude, longitude, loading: locationLoading, refresh: refreshLocation } = useGeolocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("distance");

  const { data: safeZones, isLoading, refetch } = useQuery({
    queryKey: [API_ENDPOINTS.SAFE_ZONES, latitude, longitude],
    queryFn: async () => {
      const url = new URL(API_ENDPOINTS.SAFE_ZONES, window.location.origin);
      if (latitude && longitude) {
        url.searchParams.append('lat', latitude.toString());
        url.searchParams.append('lng', longitude.toString());
      }
      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch safe zones');
      return response.json();
    },
  });

  // Calculate distances and sort safe zones
  const processedSafeZones = safeZones?.map((zone: SafeZone) => {
    if (latitude && longitude) {
      // Haversine formula for distance calculation
      const R = 6371e3; // Earth's radius in meters
      const φ1 = latitude * Math.PI / 180;
      const φ2 = zone.location.lat * Math.PI / 180;
      const Δφ = (zone.location.lat - latitude) * Math.PI / 180;
      const Δλ = (zone.location.lng - longitude) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      zone.distance = Math.round(R * c);
    }
    return zone;
  }) || [];

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'bunker':
        return {
          icon: Shield,
          color: 'text-safe-green',
          bgColor: 'bg-safe-green',
          label: 'Bunker',
          description: 'Protected shelter facility',
        };
      case 'hospital':
        return {
          icon: Users,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500',
          label: 'Hospital',
          description: 'Medical facility',
        };
      case 'military_post':
        return {
          icon: Shield,
          color: 'text-navy',
          bgColor: 'bg-navy',
          label: 'Military Post',
          description: 'Military installation',
        };
      case 'evacuation_center':
        return {
          icon: Users,
          color: 'text-warning-amber',
          bgColor: 'bg-warning-amber',
          label: 'Evacuation Center',
          description: 'Emergency assembly point',
        };
      default:
        return {
          icon: MapPin,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500',
          label: 'Safe Zone',
          description: 'General safe area',
        };
    }
  };

  const filteredAndSortedZones = processedSafeZones
    .filter((zone: SafeZone) => {
      const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           zone.location.address?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || zone.type === typeFilter;
      return matchesSearch && matchesType && zone.isActive;
    })
    .sort((a: SafeZone, b: SafeZone) => {
      if (sortBy === "distance" && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "capacity" && a.capacity && b.capacity) {
        return b.capacity - a.capacity;
      }
      return 0;
    });

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown';
    if (distance < 1000) return `${distance}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getDirections = (zone: SafeZone) => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${zone.location.lat},${zone.location.lng}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "Location Required",
        description: "Please enable location services to get directions",
        variant: "destructive",
      });
    }
  };

  const callContact = (contact?: string) => {
    if (contact) {
      window.open(`tel:${contact}`, '_self');
    }
  };

  const nearestZone = filteredAndSortedZones[0];
  const totalCapacity = safeZones?.reduce((sum: number, zone: SafeZone) => sum + (zone.capacity || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Safety Zones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find the nearest safe zones and evacuation points in your area
          </p>
        </div>

        {/* Location Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <MapPin className="h-8 w-8 text-saffron" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Your Current Location
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locationLoading 
                      ? "Getting location..." 
                      : latitude && longitude 
                        ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                        : "Location access required for distance calculations"
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={refreshLocation}
                variant="outline"
                size="sm"
                disabled={locationLoading}
              >
                <RefreshCw className={`mr-2 ${locationLoading ? 'animate-spin' : ''}`} size={16} />
                Refresh Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-safe-green">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available Safe Zones
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {safeZones?.filter((z: SafeZone) => z.isActive).length || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-safe-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-saffron">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nearest Zone
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {nearestZone ? formatDistance(nearestZone.distance) : 'N/A'}
                  </p>
                </div>
                <Navigation className="h-8 w-8 text-saffron" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Capacity
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalCapacity.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter size={20} />
              <span>Filter Safe Zones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search safe zones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bunker">Bunkers</SelectItem>
                    <SelectItem value="hospital">Hospitals</SelectItem>
                    <SelectItem value="military_post">Military Posts</SelectItem>
                    <SelectItem value="evacuation_center">Evacuation Centers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="capacity">Capacity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safe Zones List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredAndSortedZones.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Safe Zones Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {safeZones?.length === 0 
                  ? "No safe zones are currently available in your area" 
                  : "No safe zones match your current filters"
                }
              </p>
            </div>
          ) : (
            filteredAndSortedZones.map((zone: SafeZone) => {
              const config = getTypeConfig(zone.type);
              const Icon = config.icon;
              
              return (
                <Card key={zone.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${config.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {zone.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {config.description}
                            </p>
                          </div>
                          
                          {zone.distance && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-saffron">
                                {formatDistance(zone.distance)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.round(zone.distance / 80)} min walk
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline">{config.label}</Badge>
                          
                          {zone.capacity && (
                            <Badge variant="secondary">
                              Capacity: {zone.capacity.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        
                        {zone.location.address && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <MapPin size={14} className="mr-1" />
                            <span>{zone.location.address}</span>
                          </div>
                        )}
                        
                        {zone.facilities && zone.facilities.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Facilities:</p>
                            <div className="flex flex-wrap gap-1">
                              {zone.facilities.slice(0, 3).map((facility, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                              {zone.facilities.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{zone.facilities.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => getDirections(zone)}
                            className="bg-saffron hover:bg-orange-600 text-white"
                          >
                            <Navigation size={14} className="mr-1" />
                            Directions
                          </Button>
                          
                          {zone.contact && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => callContact(zone.contact)}
                            >
                              <Phone size={14} className="mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Emergency Information */}
        <Card className="mt-8 bg-gradient-to-r from-saffron to-indian-green text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Emergency Evacuation</h3>
                <p className="text-sm opacity-90">
                  In case of immediate threat, proceed to the nearest safe zone immediately. 
                  Follow designated evacuation routes and listen to official instructions.
                </p>
              </div>
              <Button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white/20"
                variant="outline"
                onClick={() => window.open("tel:112", "_self")}
              >
                Call 112
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
