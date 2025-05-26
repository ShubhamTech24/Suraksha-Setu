import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Shield, Flag, Plus, TriangleAlert, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";

interface MapMarker {
  id: string;
  type: 'safe_zone' | 'military' | 'hospital' | 'warning' | 'user';
  position: { lat: number; lng: number };
  title: string;
  icon: any;
  color: string;
}

export function InteractiveMap() {
  const { toast } = useToast();
  const { latitude, longitude } = useGeolocation();
  const [activeFilters, setActiveFilters] = useState(['safe_zones', 'military', 'hospitals']);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  const { data: safeZones, refetch: refetchSafeZones } = useQuery({
    queryKey: [API_ENDPOINTS.SAFE_ZONES],
  });

  const { data: threats } = useQuery({
    queryKey: [API_ENDPOINTS.THREATS],
  });

  useEffect(() => {
    const markers: MapMarker[] = [];

    // Add user location
    if (latitude && longitude) {
      markers.push({
        id: 'user-location',
        type: 'user',
        position: { lat: latitude, lng: longitude },
        title: 'Your Location',
        icon: User,
        color: 'text-saffron',
      });
    }

    // Add safe zones
    if (safeZones && activeFilters.includes('safe_zones')) {
      safeZones.forEach((zone: any) => {
        markers.push({
          id: `safe-zone-${zone.id}`,
          type: 'safe_zone',
          position: zone.location,
          title: zone.name,
          icon: Shield,
          color: 'text-safe-green',
        });
      });
    }

    // Add threat markers
    if (threats && activeFilters.includes('threats')) {
      threats.forEach((threat: any) => {
        if (threat.location && threat.status === 'active') {
          markers.push({
            id: `threat-${threat.id}`,
            type: 'warning',
            position: threat.location,
            title: threat.title,
            icon: TriangleAlert,
            color: threat.severity === 'critical' ? 'text-alert-red' : 'text-warning-amber',
          });
        }
      });
    }

    setMapMarkers(markers);
  }, [safeZones, threats, activeFilters, latitude, longitude]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const refreshMap = () => {
    refetchSafeZones();
    toast({
      title: "Map Updated",
      description: "Latest security information has been loaded",
    });
  };

  const lastUpdate = new Date().toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Interactive Safety Map</span>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={activeFilters.includes('safe_zones') ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleFilter('safe_zones')}
            >
              Safe Zones
            </Badge>
            <Badge 
              variant={activeFilters.includes('military') ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleFilter('military')}
            >
              Military Posts
            </Badge>
            <Badge 
              variant={activeFilters.includes('threats') ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleFilter('threats')}
            >
              Threats
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Map Container */}
        <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden">
          {/* Satellite-style background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-600 to-green-400 opacity-30"></div>
          
          {/* Terrain overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          {/* Map markers */}
          {mapMarkers.map((marker) => {
            const Icon = marker.icon;
            return (
              <div
                key={marker.id}
                className={`absolute w-6 h-6 ${marker.type === 'user' ? 'bg-saffron' : 
                  marker.type === 'safe_zone' ? 'bg-safe-green' : 
                  marker.type === 'warning' ? 'bg-warning-amber' : 'bg-navy'
                } rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                style={{
                  top: `${Math.random() * 70 + 15}%`,
                  left: `${Math.random() * 70 + 15}%`,
                }}
                title={marker.title}
              >
                <Icon className="text-white" size={12} />
              </div>
            );
          })}
          
          {/* Current location marker (larger, pulsing) */}
          {latitude && longitude && (
            <div
              className="absolute w-8 h-8 bg-saffron rounded-full border-3 border-white shadow-lg flex items-center justify-center animate-pulse"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <User className="text-white" size={16} />
            </div>
          )}
          
          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg max-w-xs">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Legend</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-safe-green rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Safe Zone</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-navy rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Military</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Hospital</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-warning-amber rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Warning</span>
              </div>
            </div>
          </div>
          
          {/* Distance indicator */}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Nearest Safe Zone</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">850m</div>
            <div className="text-xs text-safe-green">2 min walk</div>
          </div>
        </div>
        
        {/* Map controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Last updated: {lastUpdate} IST</span>
          </div>
          <Button onClick={refreshMap} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            RefreshCw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
